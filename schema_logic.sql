-- 1. Definición de la Función
CREATE OR REPLACE FUNCTION public.funcion_logica_codigos_acceso()
RETURNS trigger AS $$
BEGIN
    -- Limpieza previa: Aseguramos que los campos se reseteen según el tipo
    IF NEW.tipo = 'ALUMNOS' THEN
        NEW.dominio_permitido := '@alumnos.ujed.mx';
        NEW.email_especifico := NULL; 
        NEW.uso_maximo := -1; -- Ilimitado por defecto para alumnos

    ELSIF NEW.tipo = 'MAESTROS' THEN
        NEW.dominio_permitido := '@ujed.mx';
        NEW.email_especifico := NULL;

        
    ELSIF NEW.tipo = 'INVITADO' THEN
        NEW.dominio_permitido := NULL;
        NEW.uso_maximo := 1; -- Por seguridad, 1 solo uso para invitados
        
        -- Validación estricta de Email para Invitado
        IF NEW.email_especifico IS NULL THEN
            RAISE EXCEPTION 'Para tipo INVITADO es obligatorio ingresar un correo en email_especifico';
        END IF;

        -- Regex Senior: Acepta puntos múltiples como .edu.mx y valida estructura real
        IF NEW.email_especifico !~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' THEN
            RAISE EXCEPTION 'El correo "%" no tiene un formato válido.', NEW.email_especifico;
        END IF;
    END IF;

    -- Actualizamos siempre la fecha de modificación
    NEW.updated_at := now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Definición del Trigger
-- IMPORTANTE: Reemplaza 'nombres_de_tu_tabla' por el nombre real de tu tabla de códigos
CREATE TRIGGER tr_gestion_total_codigo_acceso
  BEFORE INSERT OR UPDATE ON public.codigo_acceso
  FOR EACH ROW EXECUTE PROCEDURE public.funcion_logica_codigos_acceso();


-- 1. Definición de la Función del Trigger
-- Esta función procesa el registro de nuevos usuarios en Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_rol_asignado text;
    v_codigo_usado text;
    v_tipo_codigo text;
    v_dominio_requerido text;
    v_email_invitado text;
    v_nombres_meta text;
    v_apellidos_meta text;
    v_matricula_meta text;
    v_uso_max int;
    v_uso_act int;
BEGIN
    -- 1. Extraer metadatos enviados desde el frontend (React/Next.js)
    v_codigo_usado := NEW.raw_user_meta_data->>'codigo';
    v_nombres_meta := NEW.raw_user_meta_data->>'nombres';
    v_apellidos_meta := NEW.raw_user_meta_data->>'apellidos';
    v_matricula_meta := NEW.raw_user_meta_data->>'matricula';

    -- 2. CASO ESPECIAL: El Administrador (Hardcoded por seguridad)
    IF NEW.email = 'mario.villarreal@ujed.mx' THEN
        v_rol_asignado := 'admin';
    
    ELSE
        -- 3. VALIDACIÓN DEL CÓDIGO DE ACCESO
        SELECT tipo, dominio_permitido, email_especifico, rol_a_asignar, uso_maximo, usos_actuales
        INTO v_tipo_codigo, v_dominio_requerido, v_email_invitado, v_rol_asignado, v_uso_max, v_uso_act
        FROM public.codigo_acceso
        WHERE codigo = v_codigo_usado
          AND es_activo = true
          AND (fecha_expiracion IS NULL OR fecha_expiracion > now())
          AND (uso_maximo = -1 OR usos_actuales < uso_maximo);

        -- Error si el código no existe o no es válido
        IF v_tipo_codigo IS NULL THEN
            RAISE EXCEPTION 'Código de acceso inválido o expirado.';
        END IF;

        -- 4. CANDADOS DE SEGURIDAD (Dominio y Email específico)
        IF v_dominio_requerido IS NOT NULL AND NEW.email NOT LIKE '%' || v_dominio_requerido THEN
            RAISE EXCEPTION 'Este código requiere un correo con dominio %', v_dominio_requerido;
        END IF;

        IF v_tipo_codigo = 'INVITADO' AND v_email_invitado IS NOT NULL AND NEW.email != v_email_invitado THEN
            RAISE EXCEPTION 'Este código solo es válido para el correo %', v_email_invitado;
        END IF;

        -- 5. ASIGNACIÓN DE ROL SEGÚN TIPO DE CÓDIGO
        IF v_tipo_codigo = 'ALUMNOS' THEN 
            v_rol_asignado := 'alumno';
        ELSIF v_tipo_codigo = 'MAESTROS' THEN 
            v_rol_asignado := 'maestro';
        ELSIF v_tipo_codigo = 'INVITADO' THEN
            v_rol_asignado := 'invitado';
        END IF;

        -- 6. ACTUALIZAR CONTADOR DE USOS DEL CÓDIGO
        UPDATE public.codigo_acceso 
        SET usos_actuales = usos_actuales + 1,
            es_activo = CASE 
                WHEN uso_maximo <> -1 AND (usos_actuales + 1) >= uso_maximo THEN false 
                ELSE true 
            END
        WHERE codigo = v_codigo_usado;

    END IF;

    -- 4. REGLAS DE VALIDACIÓN DE MATRÍCULA
    IF v_rol_asignado = 'alumno' THEN
        IF v_matricula_meta IS NULL OR v_matricula_meta = '' THEN
            RAISE EXCEPTION 'La matrícula es obligatoria para alumnos.';
        END IF;
        
        IF char_length(v_matricula_meta) < 7 OR char_length(v_matricula_meta) > 8 THEN
            RAISE EXCEPTION 'La matrícula de alumno debe tener entre 7 y 8 dígitos.';
        END IF;
    ELSE
        v_matricula_meta := NULL;
    END IF;

    -- 7. CREACIÓN DEL PERFIL AUTOMÁTICO
    INSERT INTO public.perfiles (
        id, nombres, apellidos, matricula, rol, email_capsula
    )
    VALUES (
        NEW.id, 
        COALESCE(v_nombres_meta, 'Nuevo'), 
        COALESCE(v_apellidos_meta, 'Usuario'), 
        v_matricula_meta,
        COALESCE(v_rol_asignado, 'alumno'), 
        NEW.email
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. El Trigger que activa la función anterior
-- Se ejecuta CADA VEZ que se crea un usuario en la tabla interna de Supabase (auth.users)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Función para obtener el rol del usuario actual desde la sesión de Auth
-- Se usa frecuentemente en las políticas RLS
CREATE OR REPLACE FUNCTION public.perfil_rol_actual()
RETURNS text AS $$
  SELECT rol FROM public.perfiles
  WHERE id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Función que valida las restricciones de edición en la tabla perfiles
-- Evita que alumnos/maestros cambien datos sensibles manualmente
CREATE OR REPLACE FUNCTION public.proteger_columnas_sensibles()
RETURNS trigger AS $$
BEGIN
    -- Verificamos si el que intenta editar NO es admin
    -- Nota: 'perfil_rol_actual()' es tu función personalizada de obtención de rol
    IF public.perfil_rol_actual() IS DISTINCT FROM 'admin' THEN
        
        -- Bloqueo de Matrícula
        IF NEW.matricula IS DISTINCT FROM OLD.matricula THEN
            RAISE EXCEPTION 'No tienes permiso para modificar tu matrícula. Contacta al Admin.';
        END IF;
        
        -- Bloqueo de Email Institucional
        IF NEW.email_capsula IS DISTINCT FROM OLD.email_capsula THEN
            RAISE EXCEPTION 'El correo institucional no puede ser modificado por el usuario.';
        END IF;
        
        -- Bloqueo de Cambio de Rol (Escalación de privilegios)
        IF NEW.rol IS DISTINCT FROM OLD.rol THEN
            RAISE EXCEPTION 'No puedes cambiar tu propio rol de usuario.';
        END IF;
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger que se ejecuta antes de cualquier UPDATE en la tabla perfiles
CREATE TRIGGER tr_proteger_columnas_perfil
  BEFORE UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE PROCEDURE public.proteger_columnas_sensibles();


-- 1. Función de validación para el flujo de Servicio Social
-- Esta lógica asegura que los alumnos no puedan manipular el estado de sus trámites
CREATE OR REPLACE FUNCTION public.proteger_flujo_servicio_social()
RETURNS trigger AS $$
BEGIN
    -- Si el usuario NO es admin, aplicamos restricciones estrictas
    IF (SELECT rol FROM public.perfiles WHERE id = auth.uid()) != 'admin' THEN
        
        -- Bloquear cambio de Estado (Ej: de 'pendiente' a 'aprobado')
        IF NEW.estado <> OLD.estado THEN
            RAISE EXCEPTION 'Solo el administrador puede cambiar el estado de la solicitud.';
        END IF;

        -- Bloquear cambio de Observaciones del Admin
        IF NEW.observaciones_admin <> OLD.observaciones_admin THEN
            RAISE EXCEPTION 'No puedes modificar las observaciones del administrador.';
        END IF;

        -- Bloquear cambio de perfil_id (Evita que el usuario "robe" o "ceda" el registro)
        IF NEW.perfil_id <> OLD.perfil_id THEN
            RAISE EXCEPTION 'No puedes cambiar el dueño de este registro.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger que protege la tabla de servicio social
-- Sustituye 'servicio_social' por el nombre real de tu tabla
CREATE TRIGGER tr_seguridad_servicio_social
  BEFORE UPDATE ON public.servicio_social
  FOR EACH ROW EXECUTE PROCEDURE public.proteger_flujo_servicio_social();


-- 1. Función para actualizar el vector de búsqueda (Full-Text Search)
-- Esta función automatiza la indexación para que las búsquedas sean ultra rápidas
CREATE OR REPLACE FUNCTION public.publicaciones_vector_update()
RETURNS trigger AS $$
BEGIN
  -- Generamos el vector de búsqueda combinando título (Prioridad A) y cuerpo (Prioridad B)
  -- Usamos 'spanish' para el diccionario y 'unaccent' para ignorar tildes
  NEW.busqueda_vector := 
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.titulo, ''))), 'A') ||
    setweight(to_tsvector('spanish', unaccent(coalesce(NEW.cuerpo_texto, ''))), 'B');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger que mantiene el índice de búsqueda actualizado
-- Se ejecuta automáticamente cada vez que se crea o edita una publicación
CREATE TRIGGER tr_publicaciones_search_update
  BEFORE INSERT OR UPDATE ON public.publicaciones -- Ajusta el nombre de tu tabla si es necesario
  FOR EACH ROW EXECUTE PROCEDURE public.publicaciones_vector_update();


-- ==========================================
-- AUTO-SLUG PARA DOCENTES
-- ==========================================
-- Genera slug automaticamente en INSERT usando nombres + apellidos
-- y garantiza unicidad con sufijos: -2, -3, etc.
CREATE OR REPLACE FUNCTION public.docentes_slug_autogen()
RETURNS trigger AS $$
DECLARE
  base_slug text;
  candidate text;
  n integer := 1;
BEGIN
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    base_slug := lower(
      regexp_replace(
        unaccent(coalesce(NEW.nombres, '') || ' ' || coalesce(NEW.apellidos, '')),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    );
    base_slug := trim(both '-' from base_slug);

    IF base_slug = '' THEN
      RAISE EXCEPTION 'No se pudo generar slug para docente: nombres/apellidos vacios o invalidos.';
    END IF;

    candidate := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.docentes d WHERE d.slug = candidate) LOOP
      n := n + 1;
      candidate := base_slug || '-' || n::text;
    END LOOP;

    NEW.slug := candidate;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_docentes_slug_before_insert ON public.docentes;
CREATE TRIGGER tr_docentes_slug_before_insert
  BEFORE INSERT ON public.docentes
  FOR EACH ROW EXECUTE PROCEDURE public.docentes_slug_autogen();

-- AUTO-SLUG PARA PROYECTOS DE INVESTIGACION (INSERT sin slug desde API/Bash)
-- Genera slug desde titulo si viene vacio; unicidad con sufijos -2, -3, ...
CREATE OR REPLACE FUNCTION public.proyectos_investigacion_slug_autogen()
RETURNS trigger AS $$
DECLARE
  base_slug text;
  candidate text;
  n integer := 1;
BEGIN
  IF NEW.slug IS NULL OR btrim(NEW.slug) = '' THEN
    base_slug := lower(
      regexp_replace(
        unaccent(coalesce(NEW.titulo, '')),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    );
    base_slug := trim(both '-' from base_slug);
    -- Evita slugs enormes (titulos largos)
    IF char_length(base_slug) > 72 THEN
      base_slug := left(base_slug, 72);
      base_slug := trim(both '-' from regexp_replace(base_slug, '-+$', ''));
    END IF;

    IF base_slug = '' THEN
      RAISE EXCEPTION 'No se pudo generar slug para proyecto: titulo vacio o invalido.';
    END IF;

    candidate := base_slug;
    WHILE EXISTS (SELECT 1 FROM public.proyectos_investigacion p WHERE p.slug = candidate) LOOP
      n := n + 1;
      candidate := base_slug || '-' || n::text;
    END LOOP;

    NEW.slug := candidate;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_proyectos_investigacion_slug_before_insert ON public.proyectos_investigacion;
CREATE TRIGGER tr_proyectos_investigacion_slug_before_insert
  BEFORE INSERT ON public.proyectos_investigacion
  FOR EACH ROW EXECUTE PROCEDURE public.proyectos_investigacion_slug_autogen();


-- ==========================================
-- SEGURIDAD AUTOMÁTICA DE INFRAESTRUCTURA
-- ==========================================

-- 1. Función que habilita RLS automáticamente
-- Esta función asegura que ninguna tabla nueva en 'public' quede expuesta por accidente.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
RETURNS event_trigger AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
      -- Solo actuamos sobre tablas en el esquema 'public'
      IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') 
         AND cmd.schema_name NOT IN ('pg_catalog','information_schema') 
         AND cmd.schema_name NOT LIKE 'pg_toast%' 
         AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
      ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
      END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. El Event Trigger (Nivel Base de Datos)
-- Se dispara ante cualquier comando DDL (Data Definition Language)
CREATE EVENT TRIGGER tr_rls_auto_enable
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE PROCEDURE public.rls_auto_enable();


-- ==========================================
-- EXTENSIONES Y DICCIONARIOS (INFRAESTRUCTURA)
-- ==========================================

-- 1. Habilitar la extensión para ignorar acentos (ej: 'Árbol' -> 'Arbol')
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Habilitar el diccionario de búsqueda (opcional, pero ayuda a Cursor a saber qué diccionarios usas)
-- Nota: unaccent_dict es el nombre técnico interno que usa la extensión unaccent.

-- ==========================================
-- CONFIGURACIÓN DE BÚSQUEDA (FULL TEXT SEARCH)
-- ==========================================

-- 1. Aseguramos que la extensión esté activa
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 2. Explicación para Cursor: 
-- Utilizamos 'unaccent_lexize' para crear un diccionario de búsqueda personalizado 
-- que ignore tildes en español.
-- Esto permite que al buscar 'pájaro' encuentre 'pajaro' y viceversa.

-- Si en tu base de datos configuraste un diccionario personalizado, ponlo así:
-- CREATE TEXT SEARCH CONFIGURATION spanish_unaccent (COPY = spanish);
-- ALTER TEXT SEARCH CONFIGURATION spanish_unaccent 
--   ALTER MAPPING FOR hword, hword_part, word 
--   WITH unaccent, spanish_stem;



-- ==========================================
-- AUTOMATIZACIÓN DE FECHAS (AUDITORÍA)
-- ==========================================

-- 1. Función Universal para actualizar la columna updated_at
-- Se dispara antes de cualquier UPDATE para marcar la hora exacta del cambio
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Triggers aplicados a todas las tablas del proyecto
-- Esto le dice a Cursor: "No te preocupes por updated_at en estas tablas"

CREATE TRIGGER tr_comentarios_updated_at BEFORE UPDATE ON public.comentarios FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_docentes_updated_at BEFORE UPDATE ON public.docentes FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_evaluaciones_config_updated_at BEFORE UPDATE ON public.evaluaciones_config FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_evaluaciones_rangos_updated_at BEFORE UPDATE ON public.evaluaciones_rangos FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_evaluaciones_resultados_updated_at BEFORE UPDATE ON public.evaluaciones_resultados FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_inscripcion_proyectos_updated_at BEFORE UPDATE ON public.inscripcion_proyectos FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_perfiles_updated_at BEFORE UPDATE ON public.perfiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_proyectos_updated_at BEFORE UPDATE ON public.proyectos FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_publicaciones_updated_at BEFORE UPDATE ON public.publicaciones FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_servicio_social_config_updated_at BEFORE UPDATE ON public.servicio_social_config FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER tr_ss_registros_updated_at BEFORE UPDATE ON public.ss_registros FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();



-- Politicas RLS
-- 1. LECTURA (SELECT)
-- Los usuarios ven su propio perfil completo.
-- El Admin puede ver absolutamente todos los perfiles.
-- NOTA: Mantenemos el 'USING (true)' si quieres que todos vean nombres/fotos para comentarios
CREATE POLICY "Lectura selectiva de perfiles"
ON public.perfiles
FOR SELECT
TO authenticated, anon
USING (
    auth.uid() = id -- Dueño de la cuenta
    OR 
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin' -- Es Admin
    OR
    (true) -- Mantenemos visibilidad para que funcionen los nombres en el feed
);

-- 2. INSERCIÓN (INSERT)
-- Permite que alumnos y maestros creen su perfil al registrarse.
CREATE POLICY "Los usuarios pueden crear su propio perfil"
ON public.perfiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. ACTUALIZACIÓN (UPDATE)
-- Dueños y Admins pueden editar, pero la restricción de columnas va en el Trigger abajo.
CREATE POLICY "Actualización de perfiles permitida a dueños y admin"
ON public.perfiles
FOR UPDATE
TO authenticated
USING (
    auth.uid() = id 
    OR 
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- 4. ELIMINACIÓN (DELETE)
-- Solo el Admin puede dar de baja perfiles.
CREATE POLICY "Solo el Admin puede borrar perfiles"
ON public.perfiles
FOR DELETE
TO authenticated
USING (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- Trigger para asegurar que nadie (excepto el admin) cambie la matricula o el email_capsula
CREATE OR REPLACE FUNCTION proteger_columnas_sensibles()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el usuario NO es admin, verificamos que no intente cambiar datos prohibidos
    IF (SELECT rol FROM public.perfiles WHERE id = auth.uid()) != 'admin' THEN
        
        -- Bloquear cambio de Matrícula
        IF NEW.matricula <> OLD.matricula THEN
            RAISE EXCEPTION 'No tienes permiso para modificar tu matrícula. Contacta al Admin.';
        END IF;

        -- Bloquear cambio de Email
        IF NEW.email_capsula <> OLD.email_capsula THEN
            RAISE EXCEPTION 'El correo institucional no puede ser modificado por el usuario.';
        END IF;

        -- Bloquear cambio de Rol (para que un alumno no se suba a admin solo)
        IF NEW.rol <> OLD.rol THEN
            RAISE EXCEPTION 'No puedes cambiar tu propio rol de usuario.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_proteger_columnas_perfil
    BEFORE UPDATE ON public.perfiles
    FOR EACH ROW
    EXECUTE PROCEDURE proteger_columnas_sensibles();

-- RLS codigo_acceso
-- 1. POLÍTICA: Control Total para el Admin (CRUD)
-- El Admin puede crear, ver y editar cualquier código.
CREATE POLICY "Admin: Gestión total de códigos"
ON public.codigo_acceso
FOR ALL 
TO authenticated
USING (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- 2. POLÍTICA: Borrado Restringido para el Admin
-- El Admin solo puede borrar si el código está inactivo o ya venció.
-- Esta política sobreescribe la anterior específicamente para el DELETE.
CREATE POLICY "Admin: Borrado solo de códigos obsoletos"
ON public.codigo_acceso
FOR DELETE
TO authenticated
USING (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
    AND (es_activo = false OR fecha_expiracion < now())
);

-- 3. POLÍTICA: Verificación para Usuarios (SELECT)
-- Propósito: Que tu App de React pueda consultar si el código existe 
-- para mostrar un "Check" verde antes de que el usuario envíe el formulario.
CREATE POLICY "Público: Verificación de validez"
ON public.codigo_acceso
FOR SELECT
TO anon, authenticated
USING (
    es_activo = true 
    AND (fecha_expiracion IS NULL OR fecha_expiracion > now())
    AND (uso_maximo = -1 OR usos_actuales < uso_maximo)
);

-- RLS inscripcion_proyectos
-- 1. POLÍTICA: Visibilidad Pública (SELECT)
-- Propósito: Que cualquier persona (logueada o no) vea los pasos.
-- El público solo ve lo que 'es_visible', el Admin ve TODO.
CREATE POLICY "Lectura: Público ve pasos visibles, Admin ve todo"
ON public.inscripcion_proyectos
FOR SELECT
TO anon, authenticated
USING (
    es_visible = true 
    OR 
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- 2. POLÍTICA: Gestión Total (INSERT, UPDATE, DELETE)
-- Propósito: Solo el Admin puede crear, editar archivos o borrar pasos.
CREATE POLICY "Admin: Control total de la guía de inscripción"
ON public.inscripcion_proyectos
FOR ALL
TO authenticated
USING (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- RLS proyectos_investigacion
-- 1. POLÍTICA: Lectura Universal (SELECT)
-- Propósito: Permitir que alumnos, maestros y visitantes vean los proyectos.
-- El público solo ve lo "publicado", el Admin ve borradores y proyectos ocultos.
CREATE POLICY "Lectura: Público ve proyectos publicados, Admin ve todos"
ON public.proyectos_investigacion
FOR SELECT
TO anon, authenticated
USING (
    es_publicado = true 
    OR 
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- 2. POLÍTICA: Gestión Administrativa (INSERT, UPDATE, DELETE)
-- Propósito: Solo el Admin tiene el control sobre la creación y edición de investigaciones.
CREATE POLICY "Admin: Gestión total de investigaciones"
ON public.proyectos_investigacion
FOR ALL
TO authenticated
USING (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- RLS docentes
-- 1. POLÍTICA: Lectura Universal (SELECT)
-- Propósito: Que cualquier persona vea a los docentes activos.
-- El Admin puede ver incluso a los que están "ocultos" (es_activo = false).
CREATE POLICY "Lectura: Público ve docentes activos, Admin ve todos"
ON public.docentes
FOR SELECT
TO anon, authenticated
USING (
    es_activo = true 
    OR 
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- 2. POLÍTICA: Gestión Administrativa (INSERT, UPDATE, DELETE)
-- Propósito: Centralizar el control total en el rol de administrador.
CREATE POLICY "Admin: Control total sobre directorio docente"
ON public.docentes
FOR ALL -- Cubre INSERT, UPDATE y DELETE
TO authenticated
USING (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
)
WITH CHECK (
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- RLS servicio_social_config
-- 1. Habilitar RLS
-- ALTER TABLE public.servicio_social_config ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICA: Lectura para Alumnos y Maestros
-- Los usuarios autenticados pueden ver los campos que el Admin marcó como 'visibles'.
CREATE POLICY "Usuarios: Ven configuración del formulario"
ON public.servicio_social_config
FOR SELECT
TO authenticated
USING (es_visible = true OR (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- 3. POLÍTICA: Gestión Total para Admin
CREATE POLICY "Admin: Gestión total de configuración"
ON public.servicio_social_config
FOR ALL
TO authenticated
USING ((SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- servicio_social_registros RLS
-- 1. Habilitar RLS
-- ALTER TABLE public.servicio_social_registros ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICA: Admin Control Total
-- El Admin puede ver todas las solicitudes de todos los alumnos y editarlas.
CREATE POLICY "Admin: Control total de registros"
ON public.servicio_social_registros
FOR ALL
TO authenticated
USING ((SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- 3. POLÍTICA: Alumno Inserta su propia solicitud
-- Solo puede insertar si el perfil_id coincide con su sesión de Auth.
CREATE POLICY "Alumnos: Pueden enviar su propia solicitud"
ON public.servicio_social_registros
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = perfil_id);

-- 4. POLÍTICA: Alumno Ve su propia solicitud
-- Para que el alumno pueda revisar el estado de su trámite.
CREATE POLICY "Alumnos: Pueden ver su propio registro"
ON public.servicio_social_registros
FOR SELECT
TO authenticated
USING (auth.uid() = perfil_id);

-- 5. POLÍTICA: Alumno Edita su propia solicitud (Solo si es necesario corregir)
-- Permite que el alumno edite sus respuestas, pero el Admin controla el estado.
CREATE POLICY "Alumnos: Pueden editar su registro si está rechazado o para corregir"
ON public.servicio_social_registros
FOR UPDATE
TO authenticated
USING (auth.uid() = perfil_id AND estado IN ('Rechazado', 'Corregir'));

CREATE OR REPLACE FUNCTION proteger_flujo_servicio_social()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el usuario NO es admin
    IF (SELECT rol FROM public.perfiles WHERE id = auth.uid()) != 'admin' THEN
        
        -- Bloquear cambio de Estado
        IF NEW.estado <> OLD.estado THEN
            RAISE EXCEPTION 'Solo el administrador puede cambiar el estado de la solicitud.';
        END IF;

        -- Bloquear cambio de Observaciones del Admin
        IF NEW.observaciones_admin <> OLD.observaciones_admin THEN
            RAISE EXCEPTION 'No puedes modificar las observaciones del administrador.';
        END IF;

        -- Bloquear cambio de perfil_id (No puede transferir su registro a otro)
        IF NEW.perfil_id <> OLD.perfil_id THEN
            RAISE EXCEPTION 'No puedes cambiar el dueño de este registro.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_seguridad_servicio_social
    BEFORE UPDATE ON public.servicio_social_registros
    FOR EACH ROW
    EXECUTE PROCEDURE proteger_flujo_servicio_social();

-- evaluaciones_config RLS
-- 1. Habilitar RLS
-- ALTER TABLE public.evaluaciones_config ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICA: Lectura Pública (Configuración)
-- Permite que cualquiera (incluyendo invitados) vea los tests que están marcados como visibles.
CREATE POLICY "Público: Ver tests configurados"
ON public.evaluaciones_config
FOR SELECT
TO anon, authenticated
USING (
    es_visible = true 
    OR 
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- 3. POLÍTICA: Gestión Total (Admin)
CREATE POLICY "Admin: Control total de tests"
ON public.evaluaciones_config
FOR ALL
TO authenticated
USING ((SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- evaluaciones_rangos RLS
-- 1. Habilitar RLS
--ALTER TABLE public.evaluaciones_rangos ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICA: Lectura Pública (Rangos)
-- Todos pueden ver los rangos para interpretar sus propios resultados.
CREATE POLICY "Público: Ver rangos de interpretación"
ON public.evaluaciones_rangos
FOR SELECT
TO anon, authenticated
USING (true);

-- 3. POLÍTICA: Gestión Total (Admin)
CREATE POLICY "Admin: Control total de rangos"
ON public.evaluaciones_rangos
FOR ALL
TO authenticated
USING ((SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- evaluaciones_resultados RLS
-- 1. Habilitar RLS
-- ALTER TABLE public.evaluaciones_resultados ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICA: Inserción Universal
-- Permite que logueados e invitados (anon) guarden sus resultados al terminar un test.
CREATE POLICY "Todos: Pueden registrar resultados"
ON public.evaluaciones_resultados
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. POLÍTICA: Lectura de Resultados
-- El Admin ve todo (para exportar a CSV). 
-- Los alumnos solo ven sus propios resultados históricos.
CREATE POLICY "Lectura: Resultados propios o admin"
ON public.evaluaciones_resultados
FOR SELECT
TO authenticated
USING (
    auth.uid() = perfil_id 
    OR 
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- 4. POLÍTICA: Borrado y Edición (Exclusivo Admin)
-- Los alumnos no deberían poder "borrar" un mal resultado para limpiar su historial.
CREATE POLICY "Admin: Limpieza y corrección de resultados"
ON public.evaluaciones_resultados
FOR ALL
TO authenticated
USING ((SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- publicaciones RLS
-- Habilitar RLS
-- ALTER TABLE public.publicaciones ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICA: Lectura Universal
-- Cualquiera (logueado o no) ve las noticias publicadas.
-- El Admin puede ver incluso los borradores (es_publicado = false).
CREATE POLICY "Lectura: Público ve publicadas, Admin ve todas"
ON public.publicaciones
FOR SELECT
TO anon, authenticated
USING (
    es_publicado = true 
    OR 
    (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin'
);

-- 2. POLÍTICA: Gestión Total (Admin)
CREATE POLICY "Admin: Control total de publicaciones"
ON public.publicaciones
FOR ALL
TO authenticated
USING ((SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- comentarios RLS
-- Habilitar RLS
-- ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICA: Lectura de Comentarios
-- Cualquiera ve comentarios que el Admin no haya ocultado (es_visible = true).
CREATE POLICY "Lectura: Ver comentarios visibles"
ON public.comentarios
FOR SELECT
TO anon, authenticated
USING (es_visible = true OR (SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- 2. POLÍTICA: Inserción (Solo Logueados)
-- Solo alumnos y maestros pueden comentar, y solo bajo su propio perfil.
CREATE POLICY "Usuarios: Pueden comentar"
ON public.comentarios
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = perfil_id);

-- 3. POLÍTICA: Edición y Borrado (Dueño)
-- Un alumno puede editar o borrar su propio comentario.
-- CREATE POLICY "Usuarios: Pueden gestionar sus propios comentarios"
-- ON public.comentarios
-- FOR UPDATE, DELETE
-- TO authenticated
-- USING (auth.uid() = perfil_id);

-- 4. POLÍTICA: Moderación (Admin)
-- El Admin puede editar cualquier comentario (para ocultarlo) o borrarlo.
CREATE POLICY "Admin: Moderación total"
ON public.comentarios
FOR ALL
TO authenticated
USING ((SELECT rol FROM public.perfiles WHERE id = auth.uid()) = 'admin');

-- reacciones RLS
-- Habilitar RLS
--ALTER TABLE public.reacciones ENABLE ROW LEVEL SECURITY;

-- 1. POLÍTICA: Lectura (Universal)
-- Todos pueden ver quién reaccionó (necesario para el conteo de likes).
CREATE POLICY "Lectura: Ver reacciones"
ON public.reacciones
FOR SELECT
TO anon, authenticated
USING (true);

-- 2. POLÍTICA: Reaccionar (Solo Logueados)
-- Solo puedes reaccionar si eres tú mismo. La PK compuesta impide duplicados.
CREATE POLICY "Usuarios: Pueden reaccionar"
ON public.reacciones
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = perfil_id);

-- 3. POLÍTICA: Quitar Reacción (Solo Logueados)
CREATE POLICY "Usuarios: Pueden quitar su reacción"
ON public.reacciones
FOR DELETE
TO authenticated
USING (auth.uid() = perfil_id);