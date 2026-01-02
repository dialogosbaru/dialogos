import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import {
  createConversation,
  getUserConversations,
  getConversationHistory,
  saveMessage,
  saveUserProfile,
  getUserProfile,
} from '../db.js';

export const conversationsRouter = router({
  // Crear una nueva conversación
  create: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        title: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const result = await createConversation(input.userId, input.title);
        return {
          success: true,
          conversationId: (result as any)?.insertId || 0,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error creating conversation:', errorMessage);
        throw new Error(`Failed to create conversation: ${errorMessage}`);
      }
    }),

  // Obtener o crear la conversación principal del usuario
  getOrCreateMainConversation: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Buscar conversación principal existente
        const conversations = await getUserConversations(input.userId);
        
        // Si ya existe una conversación, devolver la primera (la principal)
        if (conversations && conversations.length > 0) {
          return conversations[0];
        }
        
        // Si no existe, crear una nueva conversación principal
        const result = await createConversation(input.userId, 'Conversación Principal');
        const conversationId = (result as any)?.insertId || 0;
        
        return {
          id: conversationId,
          userId: input.userId,
          title: 'Conversación Principal',
          createdAt: new Date(),
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error getting or creating main conversation:', errorMessage);
        throw new Error(`Failed to get or create main conversation: ${errorMessage}`);
      }
    }),

  // Obtener todas las conversaciones de un usuario
  getAll: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const conversations = await getUserConversations(input.userId);
        return conversations;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error getting conversations:', errorMessage);
        throw new Error(`Failed to get conversations: ${errorMessage}`);
      }
    }),

  // Obtener el historial de una conversación específica
  getHistory: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const history = await getConversationHistory(input.conversationId);
        return history.map((msg) => ({
          id: msg.id?.toString() || '',
          sender: msg.sender as 'user' | 'leo',
          text: msg.text,
          timestamp: msg.createdAt?.getTime() || 0,
          emotion: msg.emotion,
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error getting conversation history:', errorMessage);
        throw new Error(`Failed to get conversation history: ${errorMessage}`);
      }
    }),

  // Guardar un mensaje en una conversación
  saveMessage: publicProcedure
    .input(
      z.object({
        conversationId: z.number(),
        sender: z.enum(['user', 'leo']),
        text: z.string(),
        emotion: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await saveMessage(
          input.conversationId,
          input.sender,
          input.text,
          input.emotion
        );
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error saving message:', errorMessage);
        throw new Error(`Failed to save message: ${errorMessage}`);
      }
    }),

  // Obtener o crear el perfil del usuario
  getProfile: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const profile = await getUserProfile(input.userId);
        return profile || {
          userId: input.userId,
          hobbies: [],
          motivations: [],
          interests: [],
          conversationCount: 0,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error getting user profile:', errorMessage);
        throw new Error(`Failed to get user profile: ${errorMessage}`);
      }
    }),

  // Actualizar el perfil del usuario
  updateProfile: publicProcedure
    .input(
      z.object({
        userId: z.number(),
        name: z.string().optional(),
        favoriteTeam: z.string().optional(),
        favoriteSport: z.string().optional(),
        hobbies: z.array(z.string()).optional(),
        motivations: z.array(z.string()).optional(),
        interests: z.array(z.string()).optional(),
        personalNotes: z.string().optional(),
        conversationCount: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { userId, ...profileData } = input;
        await saveUserProfile(userId, profileData);
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('Error updating user profile:', errorMessage);
        throw new Error(`Failed to update user profile: ${errorMessage}`);
      }
    }),
});
