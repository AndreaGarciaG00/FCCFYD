Mira te voy a explicar mi proyecto pasito a pasito para que esto sea más fácil tanto para mí como para ti
FUNCIONES DEL PRODUCTO:
1. Informar sobre procesos de inscripción de proyectos y permitir descarga de formatos.
2. Mostrar perfiles docentes y sus respectivos currículos.
3. Mostrar y gestionar un catálogo dinámico de proyectos de investigación
4. Administrar registros de interesados a colaborar haciendo su servicio social en el área de coordinación de investigación.
5. Administrar evaluaciones de salud física y mental.
6. Publicar noticias y eventos relevantes e interactuar con las publicaciones.

ROLES:
admin: Usuario con privilegios totales para la gestión de contenidos y descarga de datos estadísticos.
anon: Usuarios que consultan información, descargan archivos y realizan evaluaciones de salud.
alumno: Usuarios que inician sesión y pueden darle me gusta, comentar y compartir las publicaciones de noticias y eventos. Usuarios que pueden registrarse al servicio social. Usuarios que consultan información, descargan archivos y realizan evaluaciones de salud.
maestro: Usuarios que inician sesión y pueden darle me gusta, comentar y compartir las publicaciones de noticias y eventos. Usuarios que consultan información, descargan archivos y realizan evaluaciones de salud.

Requerimientos Funcionales:
1. Inscripción de proyectos
Objetivo: Guiar al estudiante en el proceso administrativo para registrar proyectos de investigación.
RF-01: Mostrar una sección informativa con los pasos para realizar el trámite de inscripción de proyectos de investigación.
RF-02: Permitir la visualización y descarga de los formatos necesarios: Formato 1,2, Anexo1, Formato 3,4 y 5.
RF-03: Permitir al administrador gestionar los formatos (CRUD).
RF-04: Incluir una opción para compartir el enlace de la sección inscripción de proyectos.

2. Cuerpo Académico
Objetivo: Presentar a los docentes que son integrantes del cuerpo académico UJED-138.
RF-05: Mostrar el perfil individual de los profesores incluyendo:
Fotografía, nombre, apellidos, cargo, área de trabajo, descripción breve, teléfono(opcional), correo electrónico y ubicación física en la facultad.
RF-06: Permitir la visualización y descargar el currículo de cada profesor en formato PDF.
RF-07: Permitir al administrador gestionar la información y currículos de los profesores (CRUD).
RF-08: Permitir compartir el enlace de la seccion de cuerpo academico y compartir el enlace de cada perfil individual.

3. Proyectos de Investigación
Objetivo: Mostrar los proyectos de investigación vigentes y concluidos.
RF-09: Mostrar los proyectos de investigación mostrando: Titulo del proyecto, nombre completo del investigador responsable, nombre de la red de colaboración, nombre del cuerpo académico, investigadores participantes (nombre, apellidos, rol, institución), área de conocimiento, disciplina, fecha de inicio, fecha de termino, tipo de financiamiento, fuente de financiamiento, nombre de la convocatoria mediante la cual se obtuvo el apoyo (nombre, tipo, año), protocolo, objetivo general, objetivos específicos, metas propuestas, fuente de la información, descripción del proyecto, instituciones asociadas, imágenes.
RF-10: Permitir al administrador gestionar la información de los proyectos (CRUD).
RF-11: Permitir compartir la sección de proyectos de investigación y compartir individualmente cada proyecto de investigación.

4. Registro de Servicio Social
Objetivo: Mostrar un formulario de captación para los alumnos interesados en realizar su servicio social en el área de coordinación de investigación.
RF-12: Disponer de un formulario de registro que recabe: matricula, nombre, apellidos, semestre, grupo, teléfono, correo electrónico.
RF-13: Permitir al administrador configurar los campos del formulario de registro (CRUD).
RF-14: Compartir el enlace del formulario.

5. Evaluaciones y Pruebas
Objetivo: Mostrar y aplicar herramientas de evaluación de salud física y mental.
RF-15: Realizar evaluaciones en línea: IMC, MoCA, SFT, RSES, Test de Cooper.
RF-16: Almacenar las respuestas de las pruebas en una base de datos.
RF-17: Permitir al administrador exportar la información recolectada en formato CSV.
RF-18 Permitir al administrador gestionar los formatos de evaluacion en pdf y gestionar los campos de los formularios de evaluación (CRUD).
RF-19: Ofrecer opciones para descargar las pruebas, su información descriptiva y los resultados de las pruebas.
RF-20: Compartir la sección de evaluaciones y pruebas y compartir individualmente cada evaluación.

6. Eventos y Noticias
Objetivo: Difundir y mostrar los acontecimientos relevantes de la facultad.
RF-21: Permitir la publicación de eventos y noticias que incluyan:
fecha de publicación, autor de quien lo escribió, título de la publicación, texto, imágenes, archivos adjuntos y enlaces.
RF-22: Permitir al administrador gestionar las publicaciones del blog (CRUD).
RF-23: Permitir la sección del blog y compartir cada publicación individualmente.

Requerimientos No Funcionales:
1. Seguridad
RNF-01: Control de acceso basado en roles.
RNF-02: Protección de datos, la información recolectada del registro a servicio social debe almacenarse de forma segura para proteger la privacidad del alumno.
RNF-03: Integridad de BD, se debe garantizar que los datos de las evaluaciones se guarden sin alteraciones para su posterior análisis.
2. Usabilidad
RNF-04: Interfaz intuitiva.
RNF-05: Claridad informativa.
RNF-06: Experiencia de usuario en evaluaciones, las pruebas deben estar diseñadas para realizarse de manera rápida y eficiente, evitando formularios tediosos o confusos.
3. Rendimiento y capacidad:
RNF-07: Eficiencia de procesamiento, el cálculo de resultados y la recolección de respuestas deben ser instantáneos.
RNF-08: Exportación de datos en formato CSV de manera fluida y rápida.
RNF-09: Los formatos de descarga deben estar disponibles el 99.9% del tiempo.
4. Calidad y mantenibilidad
RNF-10: Permitir al administrador gestionar los contenidos del sitio a través de una interfaz de gestión.
RNF-11: Soportar y gestionar diversos tipos de archivos, incluyendo pdf e imágenes.