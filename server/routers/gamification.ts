import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import {
  getUserAchievements,
  getUserStatsData,
  getRecentAchievements,
  updateUserStats,
} from '../services/gamificationService.js';

/**
 * Router para gamificación
 * Expone logros, estadísticas y rachas al frontend
 */
export const gamificationRouter = router({
  /**
   * Obtener todos los logros de un usuario
   */
  getAchievements: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = parseInt(input.userId);
      const achievements = await getUserAchievements(userId);

      return {
        achievements,
        count: achievements.length,
      };
    }),

  /**
   * Obtener estadísticas del usuario
   */
  getStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = parseInt(input.userId);
      const stats = await getUserStatsData(userId);

      if (!stats) {
        return {
          totalConversations: 0,
          totalDaysActive: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastActiveDate: null,
        };
      }

      return stats;
    }),

  /**
   * Obtener logros recientes (últimos 3)
   */
  getRecentAchievements: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = parseInt(input.userId);
      const recent = await getRecentAchievements(userId);

      return {
        achievements: recent,
        count: recent.length,
      };
    }),

  /**
   * Actualizar estadísticas manualmente (para testing)
   */
  updateStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const userId = parseInt(input.userId);
      await updateUserStats(userId);

      return {
        success: true,
        message: 'Stats updated successfully',
      };
    }),
});
