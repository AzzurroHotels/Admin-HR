-- Run in the File Storage project SQL Editor.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('evaluation-evidence','evaluation-evidence',false,104857600,array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif','video/mp4','video/webm','video/quicktime'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
-- No browser policies are intentionally created. The Main System evidence Edge Function uses the File Storage service-role key.
