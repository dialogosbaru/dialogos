import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc.js';
import { getEmotionalLogs, getDailySummary, getEmotionalStats } from '../db_emotional_analytics.js';

/**
 * Router para análisis emocional
 * Expone estadísticas y gráficos de emociones al frontend
 */
export const analyticsRouter = router({
  /**
   * Obtener logs emocionales en un rango de fechas
   */
  getLogs: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.string(), // ISO 8601
        endDate: z.string(), // ISO 8601
      })
    )
    .query(async ({ input }) => {
      const userId = parseInt(input.userId);
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      const logs = await getEmotionalLogs(userId, startDate, endDate);

      return {
        logs,
        count: logs.length,
      };
    }),

  /**
   * Obtener resumen diario de emociones
   */
  getDailySummary: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.string(), // ISO 8601
        endDate: z.string(), // ISO 8601
      })
    )
    .query(async ({ input }) => {
      const userId = parseInt(input.userId);
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      const summaries = await getDailySummary(userId, startDate, endDate);

      return {
        summaries,
        count: summaries.length,
      };
    }),

  /**
   * Obtener estadísticas agregadas de emociones
   */
  getStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        startDate: z.string(), // ISO 8601
        endDate: z.string(), // ISO 8601
      })
    )
    .query(async ({ input }) => {
      const userId = parseInt(input.userId);
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      const stats = await getEmotionalStats(userId, startDate, endDate);

      if (!stats) {
        return {
          totalMessages: 0,
          avgIntensity: 0,
          avgValence: 0,
          emotionDistribution: {},
          modeDistribution: {},
          crisisCount: 0,
        };
      }

      return stats;
    }),

  /**
   * Obtener estadísticas de la última semana (helper)
   */
  getWeeklyStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = parseInt(input.userId);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const stats = await getEmotionalStats(userId, startDate, endDate);

      if (!stats) {
        return {
          totalMessages: 0,
          avgIntensity: 0,
          avgValence: 0,
          emotionDistribution: {},
          modeDistribution: {},
          crisisCount: 0,
        };
      }

      return stats;
    }),

  /**
   * Obtener estadísticas del último mes (helper)
   */
  getMonthlyStats: publicProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const userId = parseInt(input.userId);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);

      const stats = await getEmotionalStats(userId, startDate, endDate);

      if (!stats) {
        return {
          totalMessages: 0,
          avgIntensity: 0,
          avgValence: 0,
          emotionDistribution: {},
          modeDistribution: {},
          crisisCount: 0,
        };
      }

      return stats;
    }),
});
