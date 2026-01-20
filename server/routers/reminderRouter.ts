import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import { reminderService } from '../reminderService.js';

export const reminderRouter = router({
  // Create a new reminder
  create: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        title: z.string().min(1).max(200),
        reminderDate: z.string(), // ISO date string
        description: z.string().optional(),
        reminderType: z.enum(['goal', 'conversation', 'custom']).optional(),
        relatedGoalId: z.string().uuid().optional(),
        relatedConversationId: z.string().uuid().optional(),
        frequency: z.enum(['once', 'daily', 'weekly', 'monthly']).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const reminder = await reminderService.createReminder(
        input.userId,
        input.title,
        input.reminderDate,
        {
          description: input.description,
          reminderType: input.reminderType,
          relatedGoalId: input.relatedGoalId,
          relatedConversationId: input.relatedConversationId,
          frequency: input.frequency,
        }
      );

      if (!reminder) {
        throw new Error('Failed to create reminder');
      }

      return reminder;
    }),

  // Get all reminders for a user
  getUserReminders: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
        status: z.enum(['active', 'completed', 'cancelled']).optional(),
      })
    )
    .query(async ({ input }) => {
      return await reminderService.getUserReminders(input.userId, input.status);
    }),

  // Get upcoming reminders (next 7 days)
  getUpcoming: publicProcedure
    .input(
      z.object({
        userId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      return await reminderService.getUpcomingReminders(input.userId);
    }),

  // Update reminder status
  updateStatus: publicProcedure
    .input(
      z.object({
        reminderId: z.string().uuid(),
        status: z.enum(['active', 'completed', 'cancelled']),
      })
    )
    .mutation(async ({ input }) => {
      const reminder = await reminderService.updateReminderStatus(
        input.reminderId,
        input.status
      );

      if (!reminder) {
        throw new Error('Failed to update reminder status');
      }

      return reminder;
    }),

  // Delete a reminder
  delete: publicProcedure
    .input(
      z.object({
        reminderId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const success = await reminderService.deleteReminder(input.reminderId);

      if (!success) {
        throw new Error('Failed to delete reminder');
      }

      return { success: true };
    }),

  // Get due reminders (for background job)
  getDue: publicProcedure.query(async () => {
    return await reminderService.getDueReminders();
  }),
});
