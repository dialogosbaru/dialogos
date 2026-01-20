import { eq } from "drizzle-orm";
import { emergencyActivations, type InsertEmergencyActivation } from "../drizzle/schema.js";
import { getDb } from "./db.js";

/**
 * Log an emergency activation to the database
 */
export async function logEmergencyActivation(
  activation: InsertEmergencyActivation
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Emergency] Cannot log activation: database not available");
    return;
  }

  try {
    await db.insert(emergencyActivations).values(activation);
    console.log(`[Emergency] Logged activation: ${activation.category} (${activation.severity})`);
  } catch (error) {
    console.error("[Emergency] Failed to log activation:", error);
  }
}

/**
 * Mark an emergency activation as responded
 */
export async function markEmergencyResponded(activationId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Emergency] Cannot mark as responded: database not available");
    return;
  }

  try {
    await db
      .update(emergencyActivations)
      .set({ responded: 1 })
      .where(eq(emergencyActivations.id, activationId));
    console.log(`[Emergency] Marked activation ${activationId} as responded`);
  } catch (error) {
    console.error("[Emergency] Failed to mark as responded:", error);
  }
}

/**
 * Get emergency activations for a user
 */
export async function getEmergencyActivations(userId: string | null, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Emergency] Cannot get activations: database not available");
    return [];
  }

  try {
    if (userId) {
      return await db
        .select()
        .from(emergencyActivations)
        .where(eq(emergencyActivations.userId, userId))
        .orderBy(emergencyActivations.createdAt)
        .limit(limit);
    } else {
      // For anonymous users, return empty array
      return [];
    }
  } catch (error) {
    console.error("[Emergency] Failed to get activations:", error);
    return [];
  }
}
