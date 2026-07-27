import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
const allowedTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
  'video/mp4', 'video/webm', 'video/quicktime'
]);
const clean = (name: string) => name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-120);
const pathReferenced = (faults: unknown, path: string) => {
  if (!Array.isArray(faults)) return false;
  return faults.some((fault) => {
    if (!fault || typeof fault !== 'object') return false;
    const attachments = (fault as { attachments?: unknown }).attachments;
    return Array.isArray(attachments) && attachments.some((item) =>
      item && typeof item === 'object' && String((item as { id?: unknown }).id || '') === path
    );
  });
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const mainUrl = Deno.env.get('SUPABASE_URL')!;
    const mainAnon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const mainService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const storageUrl = Deno.env.get('FILE_STORAGE_URL')!;
    const storageService = Deno.env.get('FILE_STORAGE_SERVICE_ROLE_KEY')!;
    if (!storageUrl || !storageService) throw new Error('File Storage secrets are not configured.');

    const authHeader = req.headers.get('Authorization') || '';
    const main = createClient(mainUrl, mainAnon, { global: { headers: { Authorization: authHeader } } });
    const mainAdmin = createClient(mainUrl, mainService);
    const { data: { user }, error } = await main.auth.getUser();
    if (error || !user) throw new Error('Authentication required.');

    const { data: profile, error: profileError } = await mainAdmin
      .from('user_profiles')
      .select('role,account_status')
      .eq('auth_user_id', user.id)
      .single();
    if (profileError || !profile || profile.account_status !== 'Active' || !['Admin', 'Manager'].includes(profile.role)) {
      throw new Error('Active CBIT account required.');
    }

    const storage = createClient(storageUrl, storageService);
    const contentType = req.headers.get('content-type') || '';
    const jsonBody = contentType.includes('application/json') ? await req.clone().json() : null;
    const action = new URL(req.url).searchParams.get('action') || jsonBody?.action || 'upload';

    if (action === 'upload') {
      const form = await req.formData();
      const file = form.get('file');
      if (!(file instanceof File)) throw new Error('A file is required.');
      if (file.size > 100 * 1024 * 1024) throw new Error('Each file must be 100 MB or smaller.');
      if (!allowedTypes.has(file.type)) throw new Error('Supported evidence formats are JPG, PNG, WebP, GIF, HEIC, MP4, WebM and MOV.');
      const path = `${user.id}/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${clean(file.name || 'evidence')}`;
      const { error: uploadError } = await storage.storage.from('evaluation-evidence').upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      return Response.json({ id: path, path, name: file.name || 'Evidence file', type: file.type, size: file.size, created_at: new Date().toISOString() }, { headers: cors });
    }

    const body = jsonBody || await req.json();
    const path = String(body.path || '');
    if (!path) throw new Error('File path is required.');

    if (action === 'delete') {
      const isOwner = path.split('/')[0] === user.id;
      if (profile.role !== 'Admin' && !isOwner) throw new Error('You can only remove evidence that you uploaded.');
      if (profile.role !== 'Admin') {
        const { data: evaluations, error: evaluationError } = await mainAdmin.from('receptionist_evaluations').select('faults');
        if (evaluationError) throw evaluationError;
        if ((evaluations || []).some((row) => pathReferenced(row.faults, path))) {
          throw new Error('Saved evaluation evidence can only be removed by an Admin.');
        }
      }
      const { error: removeError } = await storage.storage.from('evaluation-evidence').remove([path]);
      if (removeError) throw removeError;
      return Response.json({ deleted: true }, { headers: cors });
    }

    if (action === 'signed-url') {
      const { data, error: signedError } = await storage.storage.from('evaluation-evidence').createSignedUrl(path, 300, { download: Boolean(body.download) });
      if (signedError) throw signedError;
      return Response.json({ url: data.signedUrl }, { headers: cors });
    }
    throw new Error('Unsupported action.');
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400, headers: cors });
  }
});
