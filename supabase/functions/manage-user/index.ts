import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') || '';
    const callerClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const adminClient = createClient(url, service);
    const { data: { user }, error: userError } = await callerClient.auth.getUser();
    if (userError || !user) throw new Error('Authentication required.');
    const { data: caller } = await adminClient.from('user_profiles').select('role,account_status').eq('auth_user_id', user.id).single();
    if (!caller || caller.role !== 'Admin' || caller.account_status !== 'Active') throw new Error('Admin access required.');
    const body = await req.json();
    const action = String(body.action || '');
    const protectedEmail = 'alvinrustia@azzurrohotels.com';
    if (action === 'create') {
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');
      const role = body.role === 'Admin' ? 'Admin' : 'Manager';
      if (!email || password.length < 8) throw new Error('A valid email and password of at least 8 characters are required.');
      const { data, error } = await adminClient.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: String(body.full_name || '').trim(), role } });
      if (error) throw error;
      await adminClient.from('user_profiles').update({ full_name: String(body.full_name || '').trim(), role, account_status: body.account_status === 'Inactive' ? 'Inactive' : 'Active' }).eq('auth_user_id', data.user.id);
      const { data: profile } = await adminClient.from('user_profiles').select('*').eq('auth_user_id', data.user.id).single();
      return Response.json(profile, { headers: cors });
    }
    const { data: target, error: targetError } = await adminClient.from('user_profiles').select('*').eq('id', body.id).single();
    if (targetError || !target) throw new Error('User account not found.');
    if (String(target.email).toLowerCase() === protectedEmail) throw new Error('The protected admin account cannot be changed or deleted.');
    const { count: activeAdmins } = await adminClient.from('user_profiles').select('*', { count: 'exact', head: true }).eq('role', 'Admin').eq('account_status', 'Active');
    if (action === 'delete') {
      if (target.role === 'Admin' && target.account_status === 'Active' && (activeAdmins || 0) <= 1) throw new Error('At least one active admin account must remain.');
      const { error } = await adminClient.auth.admin.deleteUser(target.auth_user_id);
      if (error) throw error;
      return Response.json({ deleted: true }, { headers: cors });
    }
    if (action === 'update') {
      const role = body.role === 'Admin' ? 'Admin' : 'Manager';
      const status = body.account_status === 'Inactive' ? 'Inactive' : 'Active';
      if (target.role === 'Admin' && target.account_status === 'Active' && (role !== 'Admin' || status !== 'Active') && (activeAdmins || 0) <= 1) throw new Error('At least one active admin account must remain.');
      const updatedEmail = String(body.email || target.email).trim().toLowerCase();
      const attributes: Record<string, unknown> = { email: updatedEmail, user_metadata: { full_name: String(body.full_name || target.full_name).trim(), role } };
      if (body.password) attributes.password = String(body.password);
      const { error } = await adminClient.auth.admin.updateUserById(target.auth_user_id, attributes);
      if (error) throw error;
      const { data: profile, error: profileError } = await adminClient.from('user_profiles').update({ full_name: String(body.full_name || target.full_name).trim(), email: updatedEmail, role, account_status: status }).eq('id', target.id).select('*').single();
      if (profileError) throw profileError;
      return Response.json(profile, { headers: cors });
    }
    throw new Error('Unsupported action.');
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 400, headers: cors });
  }
});
