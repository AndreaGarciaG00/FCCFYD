import { SENIOR_FITNESS_DETAIL } from './seniorFitnessDetail.js'

/** Lista única de instrumentos de test (menú lateral + página instrumentos) */
export const INSTRUMENTOS_LIST = [
  { key: 'calculadoraIMC', label: 'Calculadora IMC', desc: 'Índice de Masa Corporal (kg/m²)' },
  {
    key: 'moca',
    label: 'Montreal Cognitive Assessment Test (Evaluación Cognitiva de Montreal)',
    desc: 'MoCA — screening cognitivo breve',
    detail: {
      lead:
        'La Evaluación Cognitiva de Montreal (MoCA) es una herramienta diseñada para detectar deterioro cognitivo leve y demencia mediante la evaluación de varias funciones cognitivas.',
      sections: [
        {
          title: '¿Qué es el MoCA?',
          paragraphs: [
            'Es un test neuropsicológico para identificar alteraciones cognitivas leves. Resulta especialmente útil en la detección temprana del Alzheimer y de otros trastornos neurodegenerativos. Evalúa, entre otras, las siguientes áreas:',
          ],
          list: [
            'Atención y concentración',
            'Memoria',
            'Lenguaje',
            'Habilidades visuoespaciales',
            'Funciones ejecutivas',
            'Cálculo y razonamiento',
            'Orientación',
          ],
          listStyle: 'chips',
        },
        {
          title: 'Aplicación y puntuación',
          paragraphs: [
            'El instrumento consta de 30 ítems. Su aplicación sigue un protocolo estandarizado: se requiere el formato impreso del test, bolígrafo y cronómetro.',
            'La puntuación máxima es de 30 puntos. Una puntuación inferior a 26 orienta a un posible deterioro cognitivo. Se puede sumar un punto adicional cuando la persona evaluada cuenta con menos de 12 años de educación formal, para ajustar el resultado al nivel escolar.',
          ],
        },
        {
          title: 'Contexto de uso',
          paragraphs: [
            'El MoCA se utiliza en diversos entornos clínicos, incluyendo neurología, geriatría y psiquiatría. Es particularmente valioso para evaluar a adultos mayores que presentan síntomas iniciales de deterioro cognitivo. Su alta sensibilidad y especificidad lo hacen adecuado para detectar cambios sutiles en la función cognitiva que pueden no ser evidentes en pruebas más convencionales.',
          ],
        },
        {
          title: 'Recursos adicionales',
          paragraphs: [
            'Para una correcta aplicación y puntuación del MoCA, se recomienda consultar el manual del test en español, así como guías para la interpretación de resultados. Estos recursos suelen encontrarse en formato PDF en plataformas en línea especializadas.',
          ],
        },
      ],
      closing:
        'La Evaluación Cognitiva de Montreal es una herramienta confiable y ampliamente utilizada que contribuye a la detección temprana de problemas cognitivos, facilitando intervenciones clínicas adecuadas.',
      sources: [
        { label: 'Herramientas Clínicas', url: 'https://www.herramientasclinicas.com' },
        { label: 'PsicoActiva', url: 'https://www.psicoactiva.com' },
      ],
    },
  },
  {
    key: 'seniorFitness',
    label: 'Senior Fitness Test (SFT)',
    desc: 'Batería Rikli y Jones para valorar la condición física en personas mayores (60–94 años)',
    detail: SENIOR_FITNESS_DETAIL,
  },
]
