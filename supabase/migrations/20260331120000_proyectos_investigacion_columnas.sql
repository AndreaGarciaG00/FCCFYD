-- Migración opcional: renombra columnas del esquema antiguo al esquema actual (cuaderno / schema.sql).
-- Ejecutá en Supabase solo si tu tabla todavía tiene informacion_institucional, galeria, es_publicado, etc.
-- Si ya tenés informacion_general, imagenes, es_visible, omití este archivo.

ALTER TABLE public.proyectos_investigacion RENAME COLUMN informacion_institucional TO informacion_general;
ALTER TABLE public.proyectos_investigacion RENAME COLUMN contenido_dinamico TO contenido_protocolo;
ALTER TABLE public.proyectos_investigacion RENAME COLUMN es_publicado TO es_visible;
ALTER TABLE public.proyectos_investigacion RENAME COLUMN galeria TO imagenes;

ALTER TABLE public.proyectos_investigacion
  ADD COLUMN IF NOT EXISTS imagenes_paths jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Actualizá políticas RLS que usen es_publicado → es_visible (ver schema_logic.sql en el repo).
