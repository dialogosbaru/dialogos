import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import { getUserProfile, saveUserProfile } from '../db.js';

// Definir las 5 preguntas iniciales
export const INITIAL_QUESTIONS = [
  {
    id: 'name',
    question: '¿Cuál es tu nombre?',
    questionEn: 'What is your name?',
    category: 'personal',
    description: 'Personalización básica y crear conexión emocional',
  },
  {
    id: 'sport',
    question: '¿Cuál es tu deporte favorito o actividad física que disfrutas?',
    questionEn: 'What is your favorite sport or physical activity that you enjoy?',
    category: 'interests',
    description: 'Entender intereses deportivos y estilo de vida activo',
  },
  {
    id: 'team',
    question: '¿Tienes algún equipo o jugador favorito?',
    questionEn: 'Do you have a favorite team or player?',
    category: 'interests',
    description: 'Identificar pasiones y temas de conversación',
  },
  {
    id: 'motivation',
    question: '¿Qué es lo que más te motiva en la vida en este momento?',
    questionEn: 'What motivates you the most in life right now?',
    category: 'values',
    description: 'Entender valores, metas y estado emocional actual',
  },
  {
    id: 'hobbies',
    question: '¿Cuáles son tus hobbies o actividades favoritas en tu tiempo libre?',
    questionEn: 'What are your hobbies or favorite activities in your free time?',
    category: 'interests',
    description: 'Identificar intereses, pasiones y personalidad',
  },
];

export const onboardingRouter = router({
  // Obtener las preguntas iniciales
  getInitialQuestions: publicProcedure
    .input(
      z.object({
        language: z.enum(['es', 'en']).default('es'),
      })
    )
    .query(({ input }) => {
      return INITIAL_QUESTIONS.map((q) => ({
        id: q.id,
        question: input.language === 'es' ? q.question : q.questionEn,
        category: q.category,
      }));
    }),

  // Verificar si un usuario es nuevo (no ha respondido las preguntas iniciales)
  isNewUser: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const profile = await getUserProfile(input.userId);
        
        // Un usuario es "nuevo" si no tiene nombre guardado
        // (indicando que no ha completado las preguntas iniciales)
        const isNew = !profile || !profile.name;
        
        return {
          isNew,
          completedQuestions: profile ? Object.keys(profile).length : 0,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error checking if user is new:', errorMessage);
        throw new Error(`Failed to check user status: ${errorMessage}`);
      }
    }),

  // Guardar respuestas de las preguntas iniciales
  saveOnboardingAnswers: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        answers: z.object({
          name: z.string().optional(),
          sport: z.string().optional(),
          team: z.string().optional(),
          motivation: z.string().optional(),
          hobbies: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, answers } = input;
        
        // Procesar las respuestas
        const profileData: any = {
          name: answers.name || undefined,
          favoriteSport: answers.sport || undefined,
          favoriteTeam: answers.team || undefined,
        };

        // Procesar motivaciones (puede haber múltiples)
        if (answers.motivation) {
          profileData.motivations = [answers.motivation];
        }

        // Procesar hobbies (puede haber múltiples separados por comas)
        if (answers.hobbies) {
          profileData.hobbies = answers.hobbies
            .split(',')
            .map((h) => h.trim())
            .filter((h) => h.length > 0);
        }

        // Guardar el perfil actualizado
        await saveUserProfile(userId, profileData);

        return {
          success: true,
          message: 'Onboarding answers saved successfully',
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error saving onboarding answers:', errorMessage);
        throw new Error(`Failed to save onboarding answers: ${errorMessage}`);
      }
    }),

  // Obtener el estado del onboarding
  getOnboardingStatus: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const profile = await getUserProfile(input.userId);

        const status = {
          completed: false,
          questionsAnswered: 0,
          answers: {
            name: profile?.name || null,
            sport: profile?.favoriteSport || null,
            team: profile?.favoriteTeam || null,
            motivation: profile?.motivations?.[0] || null,
            hobbies: profile?.hobbies || [],
          },
        };

        // Contar cuántas preguntas han sido respondidas
        const answeredCount = Object.values(status.answers).filter(
          (v) => v !== null && (Array.isArray(v) ? v.length > 0 : true)
        ).length;

        status.questionsAnswered = answeredCount;
        status.completed = answeredCount === 5;

        return status;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error getting onboarding status:', errorMessage);
        throw new Error(`Failed to get onboarding status: ${errorMessage}`);
      }
    }),
});
