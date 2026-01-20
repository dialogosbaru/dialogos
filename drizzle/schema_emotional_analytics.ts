import { int, mysqlTable, text, timestamp, varchar, float } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * Tabla para registrar el estado emocional detectado en cada mensaje
 * Permite análisis temporal de emociones y generación de gráficos
 */
export const emotionalLogs = mysqlTable("emotional_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Información del mensaje
  messageId: int("message_id"), // Opcional: referencia al mensaje específico
  messagePreview: text("message_preview"), // Primeras 100 caracteres del mensaje para contexto
  
  // Análisis emocional
  primaryEmotion: varchar("primary_emotion", { length: 50 }).notNull(), // tristeza, ansiedad, alegría, etc.
  secondaryEmotions: text("secondary_emotions"), // JSON array de emociones secundarias
  intensity: float("intensity").notNull(), // 0.0 - 1.0
  valence: float("valence").notNull(), // -1.0 (negativo) a 1.0 (positivo)
  
  // Modo conversacional usado
  conversationalMode: varchar("conversational_mode", { length: 50 }), // CONTENCIÓN, ACOMPAÑAMIENTO, ORIENTACIÓN, INFORMATIVO
  
  // Contexto adicional
  crisisDetected: int("crisis_detected").default(0), // 0 o 1 (boolean)
  crisisCategory: varchar("crisis_category", { length: 50 }), // suicide, self_harm, etc.
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmotionalLog = typeof emotionalLogs.$inferSelect;
export type InsertEmotionalLog = typeof emotionalLogs.$inferInsert;

/**
 * Tabla para almacenar estadísticas agregadas por día
 * Optimiza consultas de análisis temporal
 */
export const dailyEmotionalSummary = mysqlTable("daily_emotional_summary", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  
  // Fecha del resumen
  date: timestamp("date").notNull(), // Solo fecha, sin hora
  
  // Contadores de emociones
  emotionCounts: text("emotion_counts").notNull(), // JSON: { "tristeza": 5, "ansiedad": 3, ... }
  
  // Promedios del día
  avgIntensity: float("avg_intensity").notNull(),
  avgValence: float("avg_valence").notNull(),
  
  // Modo más usado
  dominantMode: varchar("dominant_mode", { length: 50 }),
  
  // Contadores de crisis
  crisisCount: int("crisis_count").default(0),
  
  // Total de mensajes
  messageCount: int("message_count").notNull(),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type DailyEmotionalSummary = typeof dailyEmotionalSummary.$inferSelect;
export type InsertDailyEmotionalSummary = typeof dailyEmotionalSummary.$inferInsert;
