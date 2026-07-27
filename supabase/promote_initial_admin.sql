-- Run after creating alvinrustia@azzurrohotels.com in Authentication > Users.
update public.user_profiles
set role='Admin', account_status='Active', full_name='Alvin Rustia', updated_at=now()
where lower(email)='alvinrustia@azzurrohotels.com';
