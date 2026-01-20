import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Emergency activations log
 * Records when crisis detection is triggered
 */
export const emergencyActivations = mysqlTable("emergency_activations", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("user_id", { length: 64 }), // Can be null for anonymous users
  triggerPhrase: text("trigger_phrase").notNull(), // The phrase that triggered detection
  category: varchar("category", { length: 50 }).notNull(), // suicide, self_harm, violence, severe_distress
  severity: varchar("severity", { length: 20 }).notNull(), // critical, high, medium
  confidence: int("confidence").notNull(), // 0-100
  userMessage: text("user_message").notNull(), // Full message from user
  responded: int("responded").default(0).notNull(), // 0 = not responded, 1 = user clicked resource
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type EmergencyActivation = typeof emergencyActivations.$inferSelect;
export type InsertEmergencyActivation = typeof emergencyActivations.$inferInsert;
