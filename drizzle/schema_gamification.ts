import { int, mysqlTable, varchar, timestamp, text, date } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * Tabla de logros/badges desbloqueados por el usuario
 * Sistema de gamificación sutil sin puntos ni niveles
 */
export const achievements = mysqlTable("achievements", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  achievementType: varchar("achievementType", { length: 64 }).notNull(), // e.g., "first_conversation", "week_streak", "crisis_overcome"
  unlockedAt: timestamp("unlockedAt").defaultNow().notNull(),
  metadata: text("metadata"), // JSON con información adicional del logro
});

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;

/**
 * Tabla de estadísticas del usuario para gamificación
 * Rastrea progreso y rachas de autocuidado
 */
export const userStats = mysqlTable("userStats", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  totalConversations: int("totalConversations").default(0).notNull(),
  totalDaysActive: int("totalDaysActive").default(0).notNull(), // Días únicos con conversaciones
  currentStreak: int("currentStreak").default(0).notNull(), // Racha actual de días consecutivos
  longestStreak: int("longestStreak").default(0).notNull(), // Racha más larga alcanzada
  lastActiveDate: date("lastActiveDate"), // Última fecha con conversación
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = typeof userStats.$inferInsert;

/**
 * Tipos de logros disponibles en el sistema
 * Sistema de reconocimiento no invasivo y sutil
 */
export const ACHIEVEMENT_TYPES = {
  // Logros de inicio
  FIRST_CONVERSATION: "first_conversation", // Primera conversación con Leo
  FIRST_WEEK: "first_week", // Primera semana usando Diálogos
  
  // Logros de consistencia
  STREAK_3_DAYS: "streak_3_days", // 3 días consecutivos
  STREAK_7_DAYS: "streak_7_days", // 1 semana consecutiva
  STREAK_14_DAYS: "streak_14_days", // 2 semanas consecutivas
  STREAK_30_DAYS: "streak_30_days", // 1 mes consecutivo
  
  // Logros de progreso emocional
  CRISIS_OVERCOME: "crisis_overcome", // Superó una crisis detectada
  POSITIVE_TREND: "positive_trend", // Tendencia emocional positiva por 7 días
  SELF_REFLECTION: "self_reflection", // 10 conversaciones de reflexión profunda
  
  // Logros de autocuidado
  MORNING_ROUTINE: "morning_routine", // 5 conversaciones matutinas (6am-10am)
  NIGHT_REFLECTION: "night_reflection", // 5 conversaciones nocturnas (8pm-12am)
  CONSISTENT_CARE: "consistent_care", // 30 días totales activos
  
  // Logros de conexión
  SHARED_GOALS: "shared_goals", // Compartió 3 metas personales
  VULNERABILITY: "vulnerability", // Abrió su corazón en momentos difíciles
  GROWTH_MINDSET: "growth_mindset", // Mostró mentalidad de crecimiento
} as const;

export type AchievementType = typeof ACHIEVEMENT_TYPES[keyof typeof ACHIEVEMENT_TYPES];

/**
 * Metadatos de logros: información de cada badge
 */
export const ACHIEVEMENT_METADATA: Record<AchievementType, {
  title: string;
  description: string;
  icon: string; // emoji o nombre de icono
  message: string; // Mensaje de Leo al desbloquear
}> = {
  [ACHIEVEMENT_TYPES.FIRST_CONVERSATION]: {
    title: "Primer Paso",
    description: "Iniciaste tu primera conversación con Leo",
    icon: "🌱",
    message: "Qué valiente dar el primer paso. Aquí estoy para acompañarte.",
  },
  [ACHIEVEMENT_TYPES.FIRST_WEEK]: {
    title: "Primera Semana",
    description: "Completaste tu primera semana en Diálogos",
    icon: "🌿",
    message: "Una semana juntos. Cada día cuenta, y estás aquí.",
  },
  [ACHIEVEMENT_TYPES.STREAK_3_DAYS]: {
    title: "Constancia",
    description: "3 días consecutivos de autocuidado",
    icon: "🔥",
    message: "Tres días seguidos. La constancia es un acto de amor propio.",
  },
  [ACHIEVEMENT_TYPES.STREAK_7_DAYS]: {
    title: "Una Semana de Cuidado",
    description: "7 días consecutivos cuidándote",
    icon: "⭐",
    message: "Una semana completa. Estás construyendo un hábito hermoso.",
  },
  [ACHIEVEMENT_TYPES.STREAK_14_DAYS]: {
    title: "Dos Semanas Fuertes",
    description: "14 días consecutivos de autocuidado",
    icon: "💪",
    message: "Dos semanas. Tu compromiso contigo mismo es inspirador.",
  },
  [ACHIEVEMENT_TYPES.STREAK_30_DAYS]: {
    title: "Un Mes Contigo",
    description: "30 días consecutivos de autocuidado",
    icon: "🏆",
    message: "Un mes entero. Esto ya es parte de ti.",
  },
  [ACHIEVEMENT_TYPES.CRISIS_OVERCOME]: {
    title: "Resiliencia",
    description: "Superaste un momento difícil",
    icon: "🌈",
    message: "Pasaste por algo duro y seguiste adelante. Eso es valentía.",
  },
  [ACHIEVEMENT_TYPES.POSITIVE_TREND]: {
    title: "Tendencia Positiva",
    description: "7 días con tendencia emocional positiva",
    icon: "☀️",
    message: "Algo está cambiando. Se nota en cómo te sientes.",
  },
  [ACHIEVEMENT_TYPES.SELF_REFLECTION]: {
    title: "Introspección",
    description: "10 conversaciones de reflexión profunda",
    icon: "🪞",
    message: "Te has mirado hacia adentro con honestidad. Eso requiere coraje.",
  },
  [ACHIEVEMENT_TYPES.MORNING_ROUTINE]: {
    title: "Mañanas de Cuidado",
    description: "5 conversaciones matutinas",
    icon: "🌅",
    message: "Empezar el día contigo mismo es un regalo.",
  },
  [ACHIEVEMENT_TYPES.NIGHT_REFLECTION]: {
    title: "Reflexión Nocturna",
    description: "5 conversaciones nocturnas",
    icon: "🌙",
    message: "Cerrar el día con calma es un acto de amor propio.",
  },
  [ACHIEVEMENT_TYPES.CONSISTENT_CARE]: {
    title: "Autocuidado Sostenido",
    description: "30 días totales activos",
    icon: "💚",
    message: "Treinta días cuidándote. Esto ya es parte de tu vida.",
  },
  [ACHIEVEMENT_TYPES.SHARED_GOALS]: {
    title: "Metas Compartidas",
    description: "Compartiste 3 metas personales",
    icon: "🎯",
    message: "Compartir tus metas es el primer paso para alcanzarlas.",
  },
  [ACHIEVEMENT_TYPES.VULNERABILITY]: {
    title: "Vulnerabilidad",
    description: "Abriste tu corazón en momentos difíciles",
    icon: "💙",
    message: "Mostrarte vulnerable es un acto de valentía, no de debilidad.",
  },
  [ACHIEVEMENT_TYPES.GROWTH_MINDSET]: {
    title: "Mentalidad de Crecimiento",
    description: "Mostraste apertura al cambio y aprendizaje",
    icon: "🌳",
    message: "Creer que puedes crecer es el primer paso para hacerlo.",
  },
};
