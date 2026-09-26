-- Nyumba property image storage.
-- Run once in Supabase SQL Editor after 001_init.sql and 002_production_hardening.sql.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket objects can be displayed by the consumer app. Uploads themselves
-- are performed only by the authenticated agency dashboard server using the
-- service-role credential; clients never receive that credential.
drop policy if exists "property_images_public_read" on storage.objects;
create policy "property_images_public_read"
on storage.objects for select
to public
using (bucket_id = 'property-images');
