(function () {
  'use strict';
  const config = window.CBIT_CONFIG;
  if (!config?.mainSystem?.url || !config?.mainSystem?.anonKey) throw new Error('CBIT Supabase configuration is missing.');
  if (!window.supabase?.createClient) throw new Error('Supabase client library could not load.');

  const sb = window.supabase.createClient(config.mainSystem.url, config.mainSystem.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const normalizeQuery = query => Object.fromEntries(new URLSearchParams(query || '').entries());
  const tableFor = resource => resource;

  async function requireData(promise, fallback) {
    const { data, error } = await promise;
    if (error) throw new Error(error.message || fallback);
    return data;
  }
  async function profileForSession(session) {
    if (!session?.user) return null;
    const rows = await requireData(sb.from('user_profiles').select('*').eq('auth_user_id', session.user.id).limit(1), 'Could not load user profile.');
    return rows?.[0] || null;
  }
  async function invoke(name, options = {}) {
    const { data, error } = await sb.functions.invoke(name, options);
    if (error) throw new Error(error.message || `Function ${name} failed.`);
    if (data?.error) throw new Error(data.error);
    return data;
  }
  async function enrichAssignments(rows) {
    if (!rows?.length) return [];
    const [staff, rosterRows] = await Promise.all([
      requireData(sb.from('staff_members').select('id,full_name,primary_department,department,account_status,status'), 'Could not load staff.'),
      requireData(sb.from('roster_rows').select('*'), 'Could not load roster rows.')
    ]);
    const staffMap = new Map(staff.map(x => [String(x.id), x]));
    const rowMap = new Map(rosterRows.map(x => [String(x.id), x]));
    return rows.map(item => {
      const person = staffMap.get(String(item.staff_member_id)) || {};
      const row = rowMap.get(String(item.roster_row_id)) || {};
      return { ...item, staff_name: person.full_name || '', staff_department: person.primary_department || person.department || '', staff_status: person.account_status || person.status || 'Active', staff_type: row.staff_type || person.primary_department || person.department || '', shift_hours: row.shift_hours || 0, paid_hours: row.paid_hours || 0 };
    });
  }

  const DB = {
    client: sb,
    async request(path, options = {}) {
      if (path === '/auth/session') {
        const { data, error } = await sb.auth.getSession();
        if (error) throw error;
        if (!data.session) return null;
        const profile = await profileForSession(data.session);
        if (!profile || (profile.account_status || 'Active') !== 'Active') {
          await sb.auth.signOut();
          return null;
        }
        return { user: profile };
      }
      if (path === '/auth/login' && String(options.method || 'GET').toUpperCase() === 'POST') {
        const payload = JSON.parse(options.body || '{}');
        const { data, error } = await sb.auth.signInWithPassword({ email: String(payload.email || '').trim(), password: String(payload.password || '') });
        if (error) throw error;
        const profile = await profileForSession(data.session);
        if (!profile) { await sb.auth.signOut(); throw new Error('This account does not have a CBIT user profile.'); }
        if ((profile.account_status || 'Active') !== 'Active') { await sb.auth.signOut(); throw new Error('This account is inactive.'); }
        await sb.from('user_profiles').update({ last_login_at: new Date().toISOString() }).eq('id', profile.id);
        return { user: profile };
      }
      if (path === '/auth/logout' && String(options.method || 'GET').toUpperCase() === 'POST') {
        const { error } = await sb.auth.signOut();
        if (error) throw error;
        return null;
      }
      throw new Error(`Unsupported request: ${path}`);
    },
    async list(resource, query = '') {
      if (resource === 'public/published-rosters') {
        return requireData(sb.from('published_rosters').select('*').eq('status', 'Published').order('week_start_date', { ascending: false }), 'Could not load published rosters.');
      }
      const filters = normalizeQuery(query);
      let request = sb.from(tableFor(resource)).select('*');
      for (const [key, value] of Object.entries(filters)) {
        if (resource === 'staff_members' && key === 'department') request = request.eq('primary_department', value);
        else if (resource === 'staff_members' && key === 'status') request = request.eq('account_status', value);
        else request = request.eq(key, value);
      }
      if (resource === 'staff_members') request = request.order('full_name', { ascending: true });
      else if (resource === 'receptionist_evaluations') request = request.order('evaluation_date', { ascending: false }).order('created_at', { ascending: false });
      else if (resource === 'project_task_updates') request = request.order('created_at', { ascending: false });
      else if (resource === 'roster_rows') request = request.order('display_order', { ascending: true });
      else request = request.order('created_at', { ascending: true });
      const data = await requireData(request, `Could not load ${resource}.`);
      return resource === 'roster_assignments' ? enrichAssignments(data) : data;
    },
    async get(resource, id) {
      const data = await requireData(sb.from(tableFor(resource)).select('*').eq('id', id).single(), 'Record not found.');
      return resource === 'roster_assignments' ? (await enrichAssignments([data]))[0] : data;
    },
    async create(resource, payload) {
      if (resource === 'roster_copy') return requireData(sb.rpc('copy_roster_week', { source_week: payload.source_week_start_date, destination_week: payload.destination_week_start_date }), 'Could not copy roster.');
      if (resource === 'published_rosters') {
        const snapshots = Array.isArray(payload.rosters) ? payload.rosters : [payload];
        for (const snapshot of snapshots) {
          await requireData(sb.from('published_rosters').upsert({ ...snapshot, status: 'Published', published_at: snapshot.published_at || payload.published_at || new Date().toISOString() }, { onConflict: 'week_start_date,roster_type' }), 'Could not publish roster.');
        }
        return snapshots;
      }
      const normalized = { ...clone(payload) };
      if (resource === 'staff_members') {
        normalized.account_status = normalized.account_status || normalized.status || 'Active';
        normalized.status = normalized.account_status;
      }
      const data = await requireData(sb.from(tableFor(resource)).insert(normalized).select('*').single(), `Could not create ${resource}.`);
      return resource === 'roster_assignments' ? (await enrichAssignments([data]))[0] : data;
    },
    async update(resource, id, payload) {
      const normalized = { ...clone(payload) };
      if (resource === 'staff_members') {
        normalized.account_status = normalized.account_status || normalized.status;
        normalized.status = normalized.account_status;
      }
      const data = await requireData(sb.from(tableFor(resource)).update(normalized).eq('id', id).select('*').single(), `Could not update ${resource}.`);
      return resource === 'roster_assignments' ? (await enrichAssignments([data]))[0] : data;
    },
    async remove(resource, id) {
      return requireData(sb.from(tableFor(resource)).delete().eq('id', id).select('*').maybeSingle(), `Could not delete ${resource}.`);
    },
    async createUserAccount(payload) { return invoke(config.functions.manageUser, { body: { action: 'create', ...payload } }); },
    async updateUserAccount(id, payload) { return invoke(config.functions.manageUser, { body: { action: 'update', id, ...payload } }); },
    async deleteUserAccount(id) { return invoke(config.functions.manageUser, { body: { action: 'delete', id } }); }
  };

  const EvidenceStore = {
    async save(file) {
      if (!(file instanceof File)) throw new Error('Select a valid file.');
      if (file.size > 100 * 1024 * 1024) throw new Error('Each evidence file must be 100 MB or smaller.');
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) throw new Error('Only image and video files are supported.');
      const form = new FormData(); form.append('file', file);
      const session = (await sb.auth.getSession()).data.session;
      const response = await fetch(`${config.mainSystem.url}/functions/v1/${config.functions.evidence}?action=upload`, { method: 'POST', headers: { apikey: config.mainSystem.anonKey, Authorization: `Bearer ${session?.access_token || ''}` }, body: form });
      const result = await response.json();
      if (!response.ok || result.error) throw new Error(result.error || 'Upload failed.');
      return {
        id: result.id || result.path,
        path: result.path || result.id,
        name: result.name || result.filename || file.name,
        type: result.type || result.mime_type || file.type,
        size: Number(result.size ?? result.size_bytes ?? file.size ?? 0)
      };
    },
    async request(action, payload = {}) {
      const session = (await sb.auth.getSession()).data.session;
      if (!session?.access_token) throw new Error('Your login session has expired. Please sign in again.');
      const response = await fetch(`${config.mainSystem.url}/functions/v1/${config.functions.evidence}?action=${encodeURIComponent(action)}`, {
        method: 'POST',
        headers: {
          apikey: config.mainSystem.anonKey,
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      let result = null;
      try { result = await response.json(); } catch (_) { result = null; }
      if (!response.ok || result?.error) throw new Error(result?.error || `Evidence ${action} request failed.`);
      return result || {};
    },
    async remove(id) { return this.request('delete', { path: id }); },
    async signedUrl(id, download = false) {
      const result = await this.request('signed-url', { path: id, download });
      return result.url || result.signed_url || result.signedUrl;
    },
    async open(id) { window.open(await this.signedUrl(id, false), '_blank', 'noopener'); },
    async download(id) { const a = document.createElement('a'); a.href = await this.signedUrl(id, true); a.download = ''; document.body.appendChild(a); a.click(); a.remove(); }
  };
  window.DB = DB;
  window.EvidenceStore = EvidenceStore;
})();
