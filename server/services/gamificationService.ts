import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "../db.js";
import {
  achievements,
  userStats,
  emotionalLogs,
  InsertAchievement,
  InsertUserStats,
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_METADATA,
  type AchievementType,
} from "../../drizzle/schema.js";

/**
 * Servicio de gamificación
 * Maneja logros, rachas y reconocimiento sutil
 */

/**
 * Inicializar estadísticas de usuario si no existen
 */
export async function initializeUserStats(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Gamification] Cannot initialize user stats: database not available");
    return;
  }

  try {
    // Verificar si ya existen estadísticas
    const existing = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(userStats).values({
        userId,
        totalConversations: 0,
        totalDaysActive: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      });
      console.log(`[Gamification] Initialized stats for user ${userId}`);
    }
  } catch (error) {
    console.error("[Gamification] Failed to initialize user stats:", error);
  }
}

/**
 * Actualizar estadísticas del usuario después de una conversación
 */
export async function updateUserStats(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Gamification] Cannot update user stats: database not available");
    return;
  }

  try {
    // Obtener estadísticas actuales
    const stats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) {
      await initializeUserStats(userId);
      return;
    }

    const currentStats = stats[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActiveDate = currentStats.lastActiveDate
      ? new Date(currentStats.lastActiveDate)
      : null;

    let newStreak = currentStats.currentStreak;
    let newTotalDays = currentStats.totalDaysActive;

    // Calcular racha
    if (lastActiveDate) {
      const daysDiff = Math.floor(
        (today.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Mismo día, no cambiar racha
      } else if (daysDiff === 1) {
        // Día consecutivo, aumentar racha
        newStreak = currentStats.currentStreak + 1;
        newTotalDays = currentStats.totalDaysActive + 1;
      } else {
        // Racha rota, reiniciar
        newStreak = 1;
        newTotalDays = currentStats.totalDaysActive + 1;
      }
    } else {
      // Primera vez
      newStreak = 1;
      newTotalDays = 1;
    }

    const newLongestStreak = Math.max(newStreak, currentStats.longestStreak);

    // Actualizar estadísticas
    await db
      .update(userStats)
      .set({
        totalConversations: currentStats.totalConversations + 1,
        totalDaysActive: newTotalDays,
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveDate: today,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, userId));

    console.log(
      `[Gamification] Updated stats for user ${userId}: streak=${newStreak}, totalDays=${newTotalDays}`
    );

    // Verificar logros después de actualizar estadísticas
    await checkAndUnlockAchievements(userId);
  } catch (error) {
    console.error("[Gamification] Failed to update user stats:", error);
  }
}

/**
 * Verificar y desbloquear logros basados en estadísticas actuales
 */
export async function checkAndUnlockAchievements(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Obtener estadísticas actuales
    const stats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) return;

    const currentStats = stats[0];

    // Obtener logros ya desbloqueados
    const unlockedAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId));

    const unlockedTypes = new Set(unlockedAchievements.map((a) => a.achievementType));

    // Verificar logros de inicio
    if (
      currentStats.totalConversations >= 1 &&
      !unlockedTypes.has(ACHIEVEMENT_TYPES.FIRST_CONVERSATION)
    ) {
      await unlockAchievement(userId, ACHIEVEMENT_TYPES.FIRST_CONVERSATION);
    }

    if (
      currentStats.totalDaysActive >= 7 &&
      !unlockedTypes.has(ACHIEVEMENT_TYPES.FIRST_WEEK)
    ) {
      await unlockAchievement(userId, ACHIEVEMENT_TYPES.FIRST_WEEK);
    }

    // Verificar logros de racha
    if (
      currentStats.currentStreak >= 3 &&
      !unlockedTypes.has(ACHIEVEMENT_TYPES.STREAK_3_DAYS)
    ) {
      await unlockAchievement(userId, ACHIEVEMENT_TYPES.STREAK_3_DAYS);
    }

    if (
      currentStats.currentStreak >= 7 &&
      !unlockedTypes.has(ACHIEVEMENT_TYPES.STREAK_7_DAYS)
    ) {
      await unlockAchievement(userId, ACHIEVEMENT_TYPES.STREAK_7_DAYS);
    }

    if (
      currentStats.currentStreak >= 14 &&
      !unlockedTypes.has(ACHIEVEMENT_TYPES.STREAK_14_DAYS)
    ) {
      await unlockAchievement(userId, ACHIEVEMENT_TYPES.STREAK_14_DAYS);
    }

    if (
      currentStats.currentStreak >= 30 &&
      !unlockedTypes.has(ACHIEVEMENT_TYPES.STREAK_30_DAYS)
    ) {
      await unlockAchievement(userId, ACHIEVEMENT_TYPES.STREAK_30_DAYS);
    }

    // Verificar logro de autocuidado sostenido
    if (
      currentStats.totalDaysActive >= 30 &&
      !unlockedTypes.has(ACHIEVEMENT_TYPES.CONSISTENT_CARE)
    ) {
      await unlockAchievement(userId, ACHIEVEMENT_TYPES.CONSISTENT_CARE);
    }

    // Verificar logros emocionales (requiere datos de emotional_logs)
    await checkEmotionalAchievements(userId, unlockedTypes);
  } catch (error) {
    console.error("[Gamification] Failed to check achievements:", error);
  }
}

/**
 * Verificar logros basados en datos emocionales
 */
async function checkEmotionalAchievements(
  userId: number,
  unlockedTypes: Set<string>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Verificar tendencia positiva (7 días con valence > 0)
    if (!unlockedTypes.has(ACHIEVEMENT_TYPES.POSITIVE_TREND)) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentLogs = await db
        .select()
        .from(emotionalLogs)
        .where(
          and(
            eq(emotionalLogs.userId, userId),
            sql`${emotionalLogs.createdAt} >= ${sevenDaysAgo}`
          )
        )
        .orderBy(desc(emotionalLogs.createdAt));

      if (recentLogs.length >= 7) {
        const avgValence =
          recentLogs.reduce((sum, log) => sum + log.valence, 0) / recentLogs.length;
        if (avgValence > 0.2) {
          await unlockAchievement(userId, ACHIEVEMENT_TYPES.POSITIVE_TREND);
        }
      }
    }

    // Verificar crisis superada
    if (!unlockedTypes.has(ACHIEVEMENT_TYPES.CRISIS_OVERCOME)) {
      const crisisLogs = await db
        .select()
        .from(emotionalLogs)
        .where(
          and(eq(emotionalLogs.userId, userId), eq(emotionalLogs.crisisDetected, 1))
        )
        .orderBy(desc(emotionalLogs.createdAt))
        .limit(1);

      if (crisisLogs.length > 0) {
        // Verificar si hay logs posteriores con mejor estado emocional
        const afterCrisis = await db
          .select()
          .from(emotionalLogs)
          .where(
            and(
              eq(emotionalLogs.userId, userId),
              sql`${emotionalLogs.createdAt} > ${crisisLogs[0].createdAt}`
            )
          )
          .limit(5);

        if (afterCrisis.length >= 3) {
          const avgValenceAfter =
            afterCrisis.reduce((sum, log) => sum + log.valence, 0) / afterCrisis.length;
          if (avgValenceAfter > -0.3) {
            await unlockAchievement(userId, ACHIEVEMENT_TYPES.CRISIS_OVERCOME);
          }
        }
      }
    }

    // Verificar reflexión profunda (10 conversaciones con modo ACOMPAÑAMIENTO o ORIENTACIÓN)
    if (!unlockedTypes.has(ACHIEVEMENT_TYPES.SELF_REFLECTION)) {
      const reflectionLogs = await db
        .select()
        .from(emotionalLogs)
        .where(
          and(
            eq(emotionalLogs.userId, userId),
            sql`${emotionalLogs.conversationalMode} IN ('ACOMPAÑAMIENTO', 'ORIENTACIÓN')`
          )
        );

      if (reflectionLogs.length >= 10) {
        await unlockAchievement(userId, ACHIEVEMENT_TYPES.SELF_REFLECTION);
      }
    }
  } catch (error) {
    console.error("[Gamification] Failed to check emotional achievements:", error);
  }
}

/**
 * Desbloquear un logro específico
 */
export async function unlockAchievement(
  userId: number,
  achievementType: AchievementType,
  metadata?: Record<string, any>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Verificar si ya está desbloqueado
    const existing = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, userId),
          eq(achievements.achievementType, achievementType)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      console.log(`[Gamification] Achievement ${achievementType} already unlocked for user ${userId}`);
      return;
    }

    // Desbloquear logro
    await db.insert(achievements).values({
      userId,
      achievementType,
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    const achievementInfo = ACHIEVEMENT_METADATA[achievementType];
    console.log(
      `[Gamification] 🎉 Unlocked achievement for user ${userId}: ${achievementInfo.title}`
    );
  } catch (error) {
    console.error("[Gamification] Failed to unlock achievement:", error);
  }
}

/**
 * Obtener todos los logros de un usuario
 */
export async function getUserAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const userAchievements = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt));

    return userAchievements.map((achievement) => ({
      ...achievement,
      ...ACHIEVEMENT_METADATA[achievement.achievementType as AchievementType],
    }));
  } catch (error) {
    console.error("[Gamification] Failed to get user achievements:", error);
    return [];
  }
}

/**
 * Obtener estadísticas de un usuario
 */
export async function getUserStatsData(userId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const stats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) {
      await initializeUserStats(userId);
      return {
        totalConversations: 0,
        totalDaysActive: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastActiveDate: null,
      };
    }

    return stats[0];
  } catch (error) {
    console.error("[Gamification] Failed to get user stats:", error);
    return null;
  }
}

/**
 * Obtener logros recientes (últimos 3)
 */
export async function getRecentAchievements(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const recent = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(desc(achievements.unlockedAt))
      .limit(3);

    return recent.map((achievement) => ({
      ...achievement,
      ...ACHIEVEMENT_METADATA[achievement.achievementType as AchievementType],
    }));
  } catch (error) {
    console.error("[Gamification] Failed to get recent achievements:", error);
    return [];
  }
}
