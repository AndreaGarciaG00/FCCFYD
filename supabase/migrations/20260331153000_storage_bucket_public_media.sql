-- Bucket de archivos del sitio (coincide con VITE_SUPABASE_STORAGE_BUCKET por defecto: public-media).
-- Ejecutá migraciones con `supabase db push` o pegá este SQL en Supabase → SQL Editor.

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('public-media', 'public-media', true, 52428800)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_media_authenticated_all" ON storage.objects;
CREATE POLICY "public_media_authenticated_all"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'public-media')
WITH CHECK (bucket_id = 'public-media');
