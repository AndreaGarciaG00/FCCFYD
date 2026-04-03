-- Bucket: perfiles (publico)
-- Permitir lectura publica
create policy "Public can read avatars"
on storage.objects
for select
to public
using (bucket_id = 'perfiles');

-- Permitir que usuario autenticado suba en su carpeta: {uid}/...
create policy "Authenticated can upload own avatar"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'perfiles'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir actualizar solo sus propios archivos
create policy "Authenticated can update own avatar"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'perfiles'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'perfiles'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir borrar solo sus propios archivos
create policy "Authenticated can delete own avatar"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'perfiles'
  and (storage.foldername(name))[1] = auth.uid()::text
);




-- Lectura publica del bucket docentes (porque el bucket es publico)
create policy "Public read docentes fotos"
on storage.objects
for select
to public
using (bucket_id = 'docentes');

-- Solo admin puede subir en carpeta fotos/
create policy "Admin upload docentes fotos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'docentes'
  and (storage.foldername(name))[1] = 'fotos'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);

-- Solo admin puede actualizar archivos en fotos/
create policy "Admin update docentes fotos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'docentes'
  and (storage.foldername(name))[1] = 'fotos'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
)
with check (
  bucket_id = 'docentes'
  and (storage.foldername(name))[1] = 'fotos'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);

-- Solo admin puede borrar archivos en fotos/
create policy "Admin delete docentes fotos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'docentes'
  and (storage.foldername(name))[1] = 'fotos'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);


-- Solo admin puede subir en carpeta cv/
create policy "Admin upload docentes cv"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'docentes'
  and (storage.foldername(name))[1] = 'cv'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);

-- Solo admin puede actualizar en carpeta cv/
create policy "Admin update docentes cv"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'docentes'
  and (storage.foldername(name))[1] = 'cv'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
)
with check (
  bucket_id = 'docentes'
  and (storage.foldername(name))[1] = 'cv'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);

-- Solo admin puede borrar en carpeta cv/
create policy "Admin delete docentes cv"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'docentes'
  and (storage.foldername(name))[1] = 'cv'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);






-- Lectura publica (bucket publico)
create policy "Public read inscripcion_proyectos pdf"
on storage.objects
for select
to public
using (bucket_id = 'inscripcion_proyectos');

-- Solo admin puede subir en carpeta pdf/
create policy "Admin upload inscripcion_proyectos pdf"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'inscripcion_proyectos'
  and (storage.foldername(name))[1] = 'pdf'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);

-- Solo admin puede actualizar en carpeta pdf/
create policy "Admin update inscripcion_proyectos pdf"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'inscripcion_proyectos'
  and (storage.foldername(name))[1] = 'pdf'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
)
with check (
  bucket_id = 'inscripcion_proyectos'
  and (storage.foldername(name))[1] = 'pdf'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);

-- Solo admin puede borrar en carpeta pdf/
create policy "Admin delete inscripcion_proyectos pdf"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'inscripcion_proyectos'
  and (storage.foldername(name))[1] = 'pdf'
  and exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.rol = 'admin'
  )
);


Cursor, basándote en @schema.sql, @schema_logic.sql y @types/supabase.ts crea una función en TypeScript para el admin, los usuarios logueados como mestros y alumnos y tambien los que no estan logueados puedan todos ver los formatos de inscripcion de proyectos cuando estos sean visible. Después, dame el comando Bash para probar esto siendo Admin. Quiero que las funciones se guarden en la carpeta @src/services en el archivo  @src/services/projectsInscriptionService.js 




