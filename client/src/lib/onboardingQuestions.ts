export const ONBOARDING_QUESTIONS = [
  {
    id: 1,
    question: '¡Hola! Soy Leo, tu amigo conversacional. Antes de empezar, me gustaría conocerte mejor. ¿Cómo te llamas?',
    infoType: 'name' as const,
    key: 'nombre',
  },
  {
    id: 2,
    question: '¡Mucho gusto, {nombre}! ¿Qué te gusta hacer en tu tiempo libre? ¿Tienes algún hobby o pasión?',
    infoType: 'interest' as const,
    key: 'hobbies',
  },
  {
    id: 3,
    question: 'Interesante. ¿Hay algo en particular que te preocupe o en lo que estés trabajando actualmente? Puede ser un proyecto, un objetivo personal, o simplemente algo que tengas en mente.',
    infoType: 'goal' as const,
    key: 'objetivo_actual',
  },
  {
    id: 4,
    question: '¿Cómo prefieres que te hable? ¿Más formal y profesional, o más relajado y coloquial? Puedes ajustar esto en cualquier momento desde las opciones.',
    infoType: 'preference' as const,
    key: 'estilo_comunicacion',
  },
  {
    id: 5,
    question: 'Última pregunta: ¿Hay algo más que quieras que sepa sobre ti? Cualquier cosa que consideres importante para que nuestras conversaciones sean más significativas.',
    infoType: 'other' as const,
    key: 'informacion_adicional',
  },
];

export const ONBOARDING_COMPLETE_MESSAGE = '¡Perfecto! Ya te conozco un poco mejor. A partir de ahora, recordaré todo lo que me cuentes y nuestras conversaciones serán cada vez más personales. ¿De qué quieres hablar hoy?';
