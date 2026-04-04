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



Excelente.
Ahora ayudame a subir, actualizar y borrar el pdf del formato de inscripccion de proyectos especificamente al bucket inscripcion_proyectos
Mi bucket se llama inscripcion_proyectos, es publico, por el momento no tiene policies RLS, tiene un limite de 10 MB y los MIME types permitidos son application/pdf
En la base de datos tengo una tabla llamada inscripcion_proyectos y esta tabla tiene dos campos que se llaman file_url y file_path. Checa esta tabla en @schema.sql y en @types/supabase.ts 
--1. file_url (La Dirección Pública)
Es la URL completa (el link) que usas en el atributo src de tus etiquetas <img> en React.

Propósito: Mostrar la imagen al usuario.

Ejemplo: https://fce...supabase.co/storage/v1/object/public/avatars/mario_123.png

Uso en el Front: ```javascript
<--img src={perfil.avatar_url} alt="Foto de perfil" />


--2. file_path (La Ruta del Archivo)
Es el nombre o ruta interna del archivo dentro del "Bucket" de Supabase. No tiene el dominio ni protocolos, solo la ubicación del objeto.

Propósito: Gestión administrativa (Borrar, Reemplazar, Mover).

Ejemplo: avatars/mario_123.png

Y dame el trigger o lo que se necesite para que supabase guarde el avatar en el bucket perfiles de supabase
