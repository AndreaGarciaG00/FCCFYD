/** Contenido extenso Senior Fitness Test (Rikli & Jones) — tablas y secciones para InstrumentoDetail */

const AGE_COLS = ['Prueba / test', '60–64', '65–69', '70–74', '75–79', '80–84', '85–89', '90–94']

const NORMATIVE_WOMEN = [
  ['Sentarse y levantarse de una silla (nº rep.)', '12–17', '11–16', '10–15', '10–15', '9–14', '8–13', '4–11'],
  ['Flexiones de brazo (nº rep.)', '13–19', '12–18', '12–17', '11–17', '10–16', '10–15', '8–13'],
  ['Caminar 6 minutos (yardas)', '545–660', '500–635', '480–615', '435–585', '385–540', '340–510', '275–440'],
  ['2 minutos marcha (pasos)', '75–107', '73–107', '68–101', '68–100', '60–90', '55–85', '44–72'],
  [
    'Flexión del tronco en silla (pulgadas)',
    '−0,5 a +5,0',
    '−0,5 a +4,5',
    '−1,0 a +4,0',
    '−1,5 a +3,5',
    '−2,0 a +3,0',
    '−2,5 a +2,5',
    '−4,5 a +1,0',
  ],
  [
    'Juntar las manos tras la espalda (pulgadas)',
    '−3,0 a +1,5',
    '−3,5 a +1,5',
    '−4,0 a +1,0',
    '−5,0 a +0,5',
    '−5,5 a 0,0',
    '−7,0 a −1,0',
    '−8,0 a −1,0',
  ],
  [
    'Levantarse, caminar y volverse a sentar (seg.)',
    '6,0–4,4',
    '6,4–4,8',
    '7,1–4,9',
    '7,4–5,2',
    '8,7–5,7',
    '9,6–6,2',
    '11,5–7,3',
  ],
]

const NORMATIVE_MEN = [
  ['Sentarse y levantarse de una silla (nº rep.)', '14–19', '12–18', '12–17', '11–17', '10–15', '8–14', '7–12'],
  ['Flexiones de brazo (nº rep.)', '16–22', '15–21', '14–21', '13–19', '13–19', '11–17', '10–14'],
  ['Caminar 6 minutos (yardas)', '610–735', '560–700', '545–680', '470–640', '445–605', '380–570', '305–500'],
  ['2 minutos marcha (pasos)', '87–115', '86–116', '80–110', '73–109', '71–103', '59–91', '52–86'],
  [
    'Flexión del tronco en silla (pulgadas)',
    '−2,5 a +4,0',
    '−3,0 a +3,0',
    '−3,0 a +3,0',
    '−4,0 a +2,0',
    '−5,5 a +1,5',
    '−5,5 a +0,5',
    '−6,5 a −0,5',
  ],
  [
    'Juntar las manos tras la espalda (pulgadas)',
    '−6,5 a 0,0',
    '−7,5 a −1,0',
    '−8,0 a −1,0',
    '−9,0 a −2,0',
    '−9,5 a −2,0',
    '−9,5 a −3,0',
    '−10,5 a −4,0',
  ],
  [
    'Levantarse, caminar y volverse a sentar (seg.)',
    '5,6–3,8',
    '5,9–4,3',
    '6,2–4,4',
    '7,2–4,6',
    '7,6–5,2',
    '8,9–5,5',
    '10,0–6,2',
  ],
]

const HOJA_REGISTRO_ROWS = [
  ['1. Sentarse y levantarse de una silla', '', '', ''],
  ['2. Flexiones del brazo', '', '', ''],
  ['3. 2 minutos marcha', '', '', ''],
  ['4. Flexión del tronco en silla', '', '', ''],
  ['5. Juntar las manos tras la espalda', '', '', ''],
  ['6. Levantarse, caminar y volverse a sentar', '', '', ''],
]

export const SENIOR_FITNESS_DETAIL = {
  lead:
    'La batería SFT, diseñada por Rikli y Jones, surgió por la necesidad de crear una herramienta que permita valorar la condición física de las personas mayores con seguridad y de forma práctica.',
  sections: [
    {
      paragraphs: [
        'Muchos de los tests utilizados para valorar la condición física en mayores fueron diseñados para jóvenes: no siempre cumplen las normas de seguridad adecuadas para este grupo y suelen resultar complejos.',
        'Por otro lado, existen pruebas específicas para personas muy mayores o frágiles que no serían adecuadas para mayores sanos, porque valoran sobre todo el nivel de independencia.',
        'La SFT reúne características que, como se resume a continuación, la hacen más completa y práctica que muchas baterías empleadas anteriormente.',
      ],
    },
    {
      title: 'Cualidades de la SFT (Rikli y Jones, 2001)',
      paragraphs: [
        'La SFT es muy completa: los tests que componen la batería recogen un amplio número de componentes del fitness asociados con la independencia funcional, mientras que otras baterías se centran a menudo en un solo componente.',
        'Puede aplicarse a personas de entre 60 y 94 años y distintos niveles de capacidad física y funcional, cubriendo un rango amplio: desde quienes son más frágiles hasta perfiles más entrenados.',
        'Es de fácil aplicación en cuanto a equipamiento y espacio, por lo que puede realizarse fuera del laboratorio.',
        'Cuenta con valores de referencia en percentiles para cada prueba (estudio con más de 7.000 personas), lo que permite comparar resultados con individuos del mismo sexo y edad.',
        'Todas estas cualidades permiten usar la batería tanto en investigación como en la práctica. La SFT tiene múltiples aplicaciones (Rikli y Jones, 2001):',
      ],
      orderedList: [
        'Investigar, por su fiabilidad y validez, especialmente fuera del laboratorio.',
        'Evaluar a las personas e identificar factores de riesgo: las normas permiten comparar la capacidad con rangos normativos por sexo y edad y detectar áreas débiles para prevenir la pérdida de independencia.',
        'Planificar programas al revelar necesidades individuales y mejorar la efectividad de los planes de ejercicio.',
        'Educar a los participantes: una interpretación cuidadosa ayuda a comprender la relación entre fitness y movilidad funcional; fijar objetivos aumenta la motivación y da sentido al programa.',
        'Evaluar programas para valorar la efectividad de las intervenciones propuestas.',
        'Motivar: muchas personas quieren conocer su capacidad y cómo se sitúan respecto a otras similares; quienes son competitivas se motivan al buscar puntuaciones altas en las tablas.',
        'Mejorar la relación con los estamentos públicos: documentar resultados puede respaldar la eficacia de un programa y facilitar el apoyo institucional en la comunidad.',
      ],
    },
    {
      title: 'Procedimientos y consideraciones para la administración de la batería SFT',
      paragraphs: [
        'La SFT fue diseñada como herramienta sencilla, pero debe aplicarse siguiendo normas de seguridad y estandarización para obtener una valoración fiable, segura y eficaz (Rikli y Jones, 2001).',
      ],
    },
    {
      title: 'Pautas a seguir',
      listStyle: 'bullets',
      list: [
        'Los examinadores deben familiarizarse con cada prueba (administración y registro de datos) y adquirir experiencia antes de aplicarla con personas mayores.',
        'Antes de la batería, los participantes deben firmar un consentimiento informado por escrito donde se expliquen objetivos y riesgos.',
        'Seleccionar participantes: no deben realizarla quienes tengan contraindicación médica al ejercicio, antecedente de insuficiencia cardiaca congestiva, dolor articular actual, dolor torácico, vértigos o angina durante el ejercicio, ni quienes tengan presión arterial alta (160/100) no controlada.',
        'El día previo a la evaluación: evitar actividad física extenuante uno o dos días antes; no beber alcohol en exceso en las 24 h previas; comer algo ligero una hora antes; llevar ropa y calzado cómodos; en calor extremo, gafas de sol y gorra; en frío, abrigo adecuado; informar al examinador de cualquier condición médica relevante. Las pruebas de resistencia aeróbica (6 minutos caminando o marcha 2 minutos) pueden practicarse el día anterior para fijar ritmo.',
        'Preparar el material con antelación: silla, cronómetro, mancuernas de 5 y 8 libras, báscula, cinta adhesiva, cuerda o cordón, cinta métrica (5–10 m), 4 conos, palillos, regla, contador de pasos, lapiceros, etiquetas de identificación.',
        'Tener lista la hoja de registro para anotar puntuaciones (modelo siguiente).',
      ],
    },
    {
      title: 'Hoja de registro (modelo)',
      paragraphs: [
        'Traducido y adaptado de Rikli y Jones (2001). Campos superiores: día, hora, peso, edad, altura y nombre.',
      ],
      tables: [
        {
          caption: 'Senior Fitness Test — registro',
          columns: ['Tests', '1.º intento', '2.º intento', 'Observaciones'],
          rows: HOJA_REGISTRO_ROWS,
        },
      ],
      paragraphsAfterTable: [
        '* Test de caminar 6 minutos: omitir el test de 2 minutos marcha si se aplica este.',
      ],
    },
    {
      title: 'Orden, condiciones y seguridad durante la sesión',
      listStyle: 'bullets',
      list: [
        'El orden de las pruebas es el de la ficha. Si se hace marcha de 2 minutos, omitir caminar 6 minutos el mismo día; si se desean ambas, programar los 6 minutos en otro día. Peso y altura pueden medirse en cualquier momento.',
        'Las condiciones ambientales deben ser seguras y cómodas (temperatura y humedad). Ante síntomas de sobrecalentamiento o sobreesfuerzo, el participante debe detenerse.',
        'Parar de inmediato si aparecen: fatiga inusual o dificultad para respirar, vértigo, dolor torácico, latidos irregulares, dolor de cualquier tipo, entumecimiento, pérdida de control muscular o de equilibrio, náuseas o vómitos, confusión o desorientación, visión borrosa.',
        'Antes de comenzar, tener claro el protocolo de emergencia, ubicación del teléfono y número de urgencias; en caso de lesión, recoger toda la información pertinente.',
      ],
    },
    {
      title: 'Descripción de las pruebas de la batería',
      paragraphs: [
        'A continuación se resume cada test: objetivo, procedimiento, puntuación y normas de seguridad. El examinador demostrará cada tarea antes de la ejecución; en pruebas con componente de velocidad, la demostración debe reflejar el ritmo esperado (Rikli y Jones, 2001).',
        'Las pruebas de flexiones de brazo, flexión del tronco en silla y juntar las manos tras la espalda forman parte de la batería completa; su protocolo detallado figura en el manual original.',
      ],
      subsections: [
        {
          title: 'Chair stand test (sentarse y levantarse de una silla)',
          objective: 'Evaluar la fuerza del tren inferior.',
          procedure: [
            'La persona comienza sentada al centro de la silla, espalda recta, pies en el suelo y brazos cruzados sobre el pecho.',
            'A la señal de «ya», debe levantarse por completo y volver a sentarse el mayor número de veces posible en 30 segundos.',
            'Demostrar primero lento para la técnica y después más rápido para transmitir el objetivo, siempre dentro de límites seguros.',
            'Antes del test, practicar una o dos repeticiones para comprobar la ejecución.',
          ],
          scoring: [
            'Puntuación: número total de veces que se completa el ciclo levantarse-sentarse en 30 s.',
            'Si al finalizar queda a mitad o más del movimiento, cuenta como repetición completa.',
            'Se realiza una sola vez.',
          ],
          safety: [
            'El respaldo de la silla debe estar contra la pared o sujeto de forma estable.',
            'Vigilar el equilibrio. Interrumpir de inmediato si hay dolor.',
          ],
        },
        {
          title: '6-minute walk test (caminar 6 minutos)',
          objective: 'Evaluar la resistencia aeróbica.',
          preparation:
            'Circuito rectangular de 20 yardas (18,8 m) por 5 yardas (4,57 m), con conos en los extremos y marcas cada 5 yardas (4,57 m).',
          procedure: [
            'Suele realizarse al finalizar las demás pruebas de la sesión.',
            'Salidas escalonadas (p. ej., cada 10 s) si hay varios participantes.',
            'A la señal de «ya», caminar lo más rápido posible durante 6 minutos siguiendo el circuito.',
            'Registrar vueltas con un palillo por vuelta o marcas en la hoja (grupos de cinco).',
            'Avisar a los 3 min y a los 2 min del tiempo restante.',
            'Al terminar los 6 minutos, apartarse a la derecha en la marca más cercana y mantener piernas en movimiento alterno suave.',
          ],
          scoring: [
            'Calcular la distancia cuando todos hayan terminado: cada vuelta equivale a 50 yardas (45,7 m); multiplicar vueltas × 45,7 m (o × 50 yardas).',
            'Un solo intento el día del test; el día anterior se puede practicar el ritmo.',
          ],
          safety: [
            'Superficie lisa y antideslizante.',
            'Colocar sillas fuera del recorrido pero a lo largo del circuito por si hicieran falta.',
          ],
        },
        {
          title: '2-minute step test (2 minutos marcha en el sitio)',
          objective: 'Evaluar la resistencia aeróbica.',
          preparation:
            'Medir la altura de elevación de rodilla con cordón desde la cresta ilíaca hasta la mitad de la rótula; doblar el cordón por la mitad y marcar en el muslo el punto que define la altura mínima del paso. Trasladar la referencia a la pared para que el participante la vea durante la marcha.',
          procedure: [
            'A la señal de «ya», marchar en el sitio el mayor número de veces posible durante 2 minutos.',
            'Ambas rodillas deben alcanzar la altura marcada; el conteo suele hacerse con la rodilla derecha.',
            'Si no alcanza la marca, reducir el ritmo sin detener el cronómetro para mantener validez.',
          ],
          scoring: [
            'Puntuación: número de pasos completos (derecha-izquierda) en 2 minutos, según el conteo de la rodilla derecha en la altura fijada.',
            'Un solo intento el día del test; practicar el día anterior.',
          ],
          safety: [
            'Quienes tengan problemas de equilibrio pueden situarse junto a pared o silla de apoyo.',
            'Supervisar signos de esfuerzo excesivo.',
            'Al finalizar, caminar despacio al menos 1 minuto de recuperación.',
          ],
        },
        {
          title: '8-foot up-and-go (levantarse, caminar y volverse a sentar)',
          objective: 'Evaluar la agilidad y el equilibrio dinámico.',
          preparation:
            'Silla pegada a la pared y cono a 8 pies (2,44 m), medidos desde la parte posterior del cono hasta el borde anterior del asiento.',
          procedure: [
            'Sentado al centro, espalda recta, pies en el suelo, manos sobre los muslos; un pie ligeramente adelantado y tronco algo inclinado hacia delante.',
            'A la señal de «ya», levantarse, rodear el cono caminando lo más rápido posible y volver a sentarse.',
            'El tiempo empieza en «ya» aunque aún no se mueva.',
            'El tiempo termina al contacto al sentarse de nuevo.',
          ],
          scoring: [
            'Demostración previa y una prueba de práctica.',
            'Dos intentos registrados; marcar la mejor puntuación (menor tiempo).',
          ],
          safety: [
            'El examinador puede situarse entre cono y silla para ayudar si pierde el equilibrio.',
            'En personas más débiles, valorar previamente si se levantan y se sientan con seguridad.',
          ],
        },
      ],
    },
    {
      title: 'Valores de referencia',
      paragraphs: [
        'Los valores normativos permiten interpretar resultados y motivar: muchas personas quieren saber qué significa su puntuación y cómo mejorarla, además de orientar el trabajo sobre la capacidad funcional.',
        'Las tablas se basaron en un estudio nacional con más de 7.000 mayores independientes de 60 a 94 años en 267 lugares de Estados Unidos (Rikli y Jones).',
        'A continuación se muestra el intervalo «normal» aproximado (entre percentil 25 y percentil 75) por sexo y grupo de edad.',
      ],
      tables: [
        {
          caption: 'Intervalo normal en mujeres (P25–P75)',
          columns: AGE_COLS,
          rows: NORMATIVE_WOMEN,
        },
        {
          caption: 'Intervalo normal en hombres (P25–P75)',
          columns: AGE_COLS,
          rows: NORMATIVE_MEN,
        },
      ],
    },
  ],
  closing:
    'La Senior Fitness Test es una batería reconocida internacionalmente para valorar de forma práctica y segura la condición física en personas mayores, apoyando tanto la práctica clínica como la investigación.',
  sources: [{ label: 'Rikli, R. E., & Jones, C. J. (2001). Senior Fitness Test Manual. Human Kinetics.' }],
}
