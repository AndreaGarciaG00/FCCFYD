-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.codigo_acceso (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  codigo text NOT NULL UNIQUE,
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['ALUMNOS'::text, 'MAESTROS'::text, 'INVITADO'::text])),
  dominio_permitido text,
  email_especifico text,
  descripcion text,
  uso_maximo integer NOT NULL DEFAULT '-1'::integer,
  usos_actuales integer NOT NULL DEFAULT 0 CHECK (usos_actuales >= 0),
  es_activo boolean NOT NULL DEFAULT true,
  fecha_expiracion timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  rol_a_asignar text CHECK (rol_a_asignar = ANY (ARRAY['alumno'::text, 'maestro'::text])),
  CONSTRAINT codigo_acceso_pkey PRIMARY KEY (id)
);
CREATE TABLE public.comentarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  publicacion_id uuid NOT NULL,
  perfil_id uuid NOT NULL,
  contenido text NOT NULL,
  es_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comentarios_pkey PRIMARY KEY (id),
  CONSTRAINT comentarios_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicaciones(id),
  CONSTRAINT comentarios_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.docentes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  grado_academico text NOT NULL,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  slug text NOT NULL UNIQUE,
  cargo text,
  area_trabajo text,
  descripcion_breve text,
  correo text NOT NULL UNIQUE,
  telefono text,
  ubicacion_fisica text,
  foto_url text,
  foto_path text,
  cv_url text,
  cv_path text,
  redes_sociales jsonb NOT NULL DEFAULT '{}'::jsonb,
  datos_adicionales jsonb NOT NULL DEFAULT '{}'::jsonb,
  es_activo boolean NOT NULL DEFAULT true,
  orden smallint NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT docentes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.evaluaciones_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nombre text NOT NULL,
  descripcion text,
  instrucciones text,
  categoria text NOT NULL CHECK (categoria = ANY (ARRAY['Física'::text, 'Mental'::text])),
  campos_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  logica_calculo jsonb NOT NULL DEFAULT '{}'::jsonb,
  pdf_url text,
  pdf_path text,
  es_visible boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluaciones_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.evaluaciones_rangos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  evaluacion_id uuid NOT NULL,
  puntaje_min numeric NOT NULL,
  puntaje_max numeric NOT NULL,
  titulo_resultado text NOT NULL,
  descripcion_resultado text,
  color_alerta text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluaciones_rangos_pkey PRIMARY KEY (id),
  CONSTRAINT evaluaciones_rangos_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones_config(id)
);
CREATE TABLE public.evaluaciones_resultados (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  evaluacion_id uuid NOT NULL,
  perfil_id uuid,
  respuestas jsonb NOT NULL DEFAULT '{}'::jsonb,
  puntaje_final numeric,
  interpretacion text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT evaluaciones_resultados_pkey PRIMARY KEY (id),
  CONSTRAINT evaluaciones_resultados_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.evaluaciones_config(id),
  CONSTRAINT evaluaciones_resultados_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.inscripcion_proyectos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descripcion text,
  categoria text NOT NULL DEFAULT 'General'::text,
  file_url text,
  file_size text,
  file_path text,
  orden smallint NOT NULL DEFAULT 0,
  es_descargable boolean NOT NULL DEFAULT false,
  es_visible boolean NOT NULL DEFAULT true,
  datos_adicionales jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inscripcion_proyectos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.perfiles (
  id uuid NOT NULL,
  nombres text NOT NULL,
  apellidos text NOT NULL,
  matricula text UNIQUE,
  rol text NOT NULL DEFAULT 'alumno'::text CHECK (rol = ANY (ARRAY['alumno'::text, 'maestro'::text, 'admin'::text, 'invitado'::text])),
  email_capsula text,
  avatar_url text,
  avatar_path text,
  datos_adicionales jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT perfiles_pkey PRIMARY KEY (id),
  CONSTRAINT perfiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.proyectos_investigacion (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  investigador_responsable text NOT NULL,
  estado text NOT NULL CHECK (estado = ANY (ARRAY['Vigente'::text, 'Concluido'::text])),
  fechas jsonb NOT NULL,
  informacion_institucional jsonb NOT NULL DEFAULT '{}'::jsonb,
  financiamiento jsonb NOT NULL DEFAULT '{}'::jsonb,
  colaboradores jsonb NOT NULL DEFAULT '[]'::jsonb,
  contenido_dinamico jsonb NOT NULL DEFAULT '[]'::jsonb,
  config_visibilidad jsonb NOT NULL DEFAULT '{}'::jsonb,
  datos_adicionales jsonb NOT NULL DEFAULT '{}'::jsonb,
  galeria jsonb DEFAULT '[]'::jsonb,
  es_publicado boolean NOT NULL DEFAULT false,
  orden smallint NOT NULL DEFAULT 0,
  busqueda_vector tsvector DEFAULT to_tsvector('spanish'::regconfig, ((COALESCE(titulo, ''::text) || ' '::text) || COALESCE(investigador_responsable, ''::text))),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT proyectos_investigacion_pkey PRIMARY KEY (id)
);
CREATE TABLE public.publicaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tipo text NOT NULL CHECK (tipo = ANY (ARRAY['Noticia'::text, 'Evento'::text])),
  slug text NOT NULL UNIQUE,
  titulo text NOT NULL,
  cuerpo_texto text NOT NULL,
  galeria jsonb NOT NULL DEFAULT '[]'::jsonb,
  adjuntos jsonb NOT NULL DEFAULT '[]'::jsonb,
  links jsonb NOT NULL DEFAULT '{}'::jsonb,
  datos_adicionales jsonb NOT NULL DEFAULT '{}'::jsonb,
  config_ui jsonb NOT NULL DEFAULT '{"mostrar_links": true, "mostrar_galeria": true, "mostrar_adjuntos": true}'::jsonb,
  es_publicado boolean NOT NULL DEFAULT false,
  fecha_publicacion timestamp with time zone NOT NULL DEFAULT now(),
  busqueda_vector tsvector,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT publicaciones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.reacciones (
  publicacion_id uuid NOT NULL,
  perfil_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reacciones_pkey PRIMARY KEY (publicacion_id, perfil_id),
  CONSTRAINT reacciones_publicacion_id_fkey FOREIGN KEY (publicacion_id) REFERENCES public.publicaciones(id),
  CONSTRAINT reacciones_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id)
);
CREATE TABLE public.servicio_social_config (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_campo text NOT NULL UNIQUE,
  etiqueta text NOT NULL,
  tipo_campo text NOT NULL CHECK (tipo_campo = ANY (ARRAY['text'::text, 'textarea'::text, 'number'::text, 'email'::text, 'tel'::text, 'select'::text, 'date'::text, 'checkbox'::text])),
  es_obligatorio boolean NOT NULL DEFAULT false,
  es_visible boolean NOT NULL DEFAULT true,
  opciones jsonb NOT NULL DEFAULT '[]'::jsonb,
  orden smallint NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT servicio_social_config_pkey PRIMARY KEY (id)
);
CREATE TABLE public.servicio_social_registros (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  perfil_id uuid NOT NULL,
  semestre smallint NOT NULL CHECK (semestre > 0 AND semestre < 13),
  grupo text NOT NULL,
  datos_extra jsonb NOT NULL DEFAULT '{}'::jsonb,
  observaciones_admin text,
  estado text NOT NULL DEFAULT 'Pendiente'::text CHECK (estado = ANY (ARRAY['Pendiente'::text, 'Aceptado'::text, 'Rechazado'::text, 'Corregir'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT servicio_social_registros_pkey PRIMARY KEY (id),
  CONSTRAINT servicio_social_registros_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES public.perfiles(id)
);