import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { getDb } from "./db.js";
import { emotionalLogs, dailyEmotionalSummary, InsertEmotionalLog } from "../drizzle/schema.js";

/**
 * Registrar un log emocional en la base de datos
 */
export async function logEmotionalState(log: InsertEmotionalLog): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[EmotionalAnalytics] Cannot log emotional state: database not available");
    return;
  }

  try {
    await db.insert(emotionalLogs).values(log);
    console.log(`[EmotionalAnalytics] Logged emotional state for user ${log.userId}: ${log.primaryEmotion} (intensity: ${log.intensity})`);
  } catch (error) {
    console.error("[EmotionalAnalytics] Failed to log emotional state:", error);
    throw error;
  }
}

/**
 * Obtener logs emocionales de un usuario en un rango de fechas
 */
export async function getEmotionalLogs(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) {
    console.warn("[EmotionalAnalytics] Cannot get emotional logs: database not available");
    return [];
  }

  try {
    const logs = await db
      .select()
      .from(emotionalLogs)
      .where(
        and(
          eq(emotionalLogs.userId, userId),
          gte(emotionalLogs.createdAt, startDate),
          lte(emotionalLogs.createdAt, endDate)
        )
      )
      .orderBy(desc(emotionalLogs.createdAt));

    return logs;
  } catch (error) {
    console.error("[EmotionalAnalytics] Failed to get emotional logs:", error);
    return [];
  }
}

/**
 * Obtener resumen diario de emociones
 */
export async function getDailySummary(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) {
    console.warn("[EmotionalAnalytics] Cannot get daily summary: database not available");
    return [];
  }

  try {
    const summaries = await db
      .select()
      .from(dailyEmotionalSummary)
      .where(
        and(
          eq(dailyEmotionalSummary.userId, userId),
          gte(dailyEmotionalSummary.date, startDate),
          lte(dailyEmotionalSummary.date, endDate)
        )
      )
      .orderBy(desc(dailyEmotionalSummary.date));

    return summaries;
  } catch (error) {
    console.error("[EmotionalAnalytics] Failed to get daily summary:", error);
    return [];
  }
}

/**
 * Calcular estadísticas agregadas de emociones
 */
export async function getEmotionalStats(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) {
    console.warn("[EmotionalAnalytics] Cannot get emotional stats: database not available");
    return null;
  }

  try {
    // Obtener todos los logs en el rango
    const logs = await getEmotionalLogs(userId, startDate, endDate);

    if (logs.length === 0) {
      return {
        totalMessages: 0,
        avgIntensity: 0,
        avgValence: 0,
        emotionDistribution: {},
        modeDistribution: {},
        crisisCount: 0,
      };
    }

    // Calcular estadísticas
    const totalMessages = logs.length;
    const avgIntensity = logs.reduce((sum, log) => sum + log.intensity, 0) / totalMessages;
    const avgValence = logs.reduce((sum, log) => sum + log.valence, 0) / totalMessages;

    // Distribución de emociones
    const emotionDistribution: Record<string, number> = {};
    logs.forEach((log) => {
      emotionDistribution[log.primaryEmotion] = (emotionDistribution[log.primaryEmotion] || 0) + 1;
    });

    // Distribución de modos
    const modeDistribution: Record<string, number> = {};
    logs.forEach((log) => {
      if (log.conversationalMode) {
        modeDistribution[log.conversationalMode] = (modeDistribution[log.conversationalMode] || 0) + 1;
      }
    });

    // Contar crisis
    const crisisCount = logs.filter((log) => log.crisisDetected === 1).length;

    return {
      totalMessages,
      avgIntensity,
      avgValence,
      emotionDistribution,
      modeDistribution,
      crisisCount,
    };
  } catch (error) {
    console.error("[EmotionalAnalytics] Failed to get emotional stats:", error);
    return null;
  }
}

/**
 * Generar o actualizar resumen diario
 * Debe ejecutarse al final del día o bajo demanda
 */
export async function generateDailySummary(userId: number, date: Date): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[EmotionalAnalytics] Cannot generate daily summary: database not available");
    return;
  }

  try {
    // Obtener logs del día
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await getEmotionalLogs(userId, startOfDay, endOfDay);

    if (logs.length === 0) {
      console.log(`[EmotionalAnalytics] No logs found for user ${userId} on ${date.toISOString().split('T')[0]}`);
      return;
    }

    // Calcular estadísticas del día
    const stats = await getEmotionalStats(userId, startOfDay, endOfDay);
    if (!stats) return;

    // Encontrar modo dominante
    const dominantMode = Object.entries(stats.modeDistribution).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    // Insertar o actualizar resumen
    await db
      .insert(dailyEmotionalSummary)
      .values({
        userId,
        date: startOfDay,
        emotionCounts: JSON.stringify(stats.emotionDistribution),
        avgIntensity: stats.avgIntensity,
        avgValence: stats.avgValence,
        dominantMode,
        crisisCount: stats.crisisCount,
        messageCount: stats.totalMessages,
      })
      .onDuplicateKeyUpdate({
        set: {
          emotionCounts: JSON.stringify(stats.emotionDistribution),
          avgIntensity: stats.avgIntensity,
          avgValence: stats.avgValence,
          dominantMode,
          crisisCount: stats.crisisCount,
          messageCount: stats.totalMessages,
        },
      });

    console.log(`[EmotionalAnalytics] Generated daily summary for user ${userId} on ${date.toISOString().split('T')[0]}`);
  } catch (error) {
    console.error("[EmotionalAnalytics] Failed to generate daily summary:", error);
    throw error;
  }
}
