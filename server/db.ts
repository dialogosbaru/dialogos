import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema.js";
import { ENV } from './_core/env.js';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// TODO: add feature queries here as your schema grows.

// Funciones para conversaciones
export async function saveMessage(
  conversationId: number,
  sender: "user" | "leo",
  text: string,
  emotion?: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save message: database not available");
    return;
  }

  try {
    const { messages } = await import("../drizzle/schema");
    await db.insert(messages).values({
      conversationId,
      sender,
      text,
      emotion,
    });
  } catch (error) {
    console.error("[Database] Failed to save message:", error);
    throw error;
  }
}

export async function getConversationHistory(conversationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversation: database not available");
    return [];
  }

  try {
    const { messages } = await import("../drizzle/schema");
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get conversation history:", error);
    return [];
  }
}

export async function createConversation(userId: number, title?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create conversation: database not available");
    return null;
  }

  try {
    const { conversations } = await import("../drizzle/schema");
    const result = await db.insert(conversations).values({
      userId,
      title: title || `Conversation ${new Date().toLocaleDateString()}`,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create conversation:", error);
    throw error;
  }
}

export async function getUserConversations(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversations: database not available");
    return [];
  }

  try {
    const { conversations } = await import("../drizzle/schema");
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(conversations.updatedAt);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get user conversations:", error);
    return [];
  }
}

// Funciones para perfiles de usuario
export async function saveUserProfile(userId: number, profileData: any): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save user profile: database not available");
    return;
  }

  try {
    const { userProfiles } = await import("../drizzle/schema");
    const existingProfile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (existingProfile.length > 0) {
      // Update existing profile
      await db
        .update(userProfiles)
        .set({
          ...profileData,
          hobbies: profileData.hobbies ? JSON.stringify(profileData.hobbies) : null,
          motivations: profileData.motivations ? JSON.stringify(profileData.motivations) : null,
          interests: profileData.interests ? JSON.stringify(profileData.interests) : null,
        })
        .where(eq(userProfiles.userId, userId));
    } else {
      // Create new profile
      await db.insert(userProfiles).values({
        userId,
        ...profileData,
        hobbies: profileData.hobbies ? JSON.stringify(profileData.hobbies) : null,
        motivations: profileData.motivations ? JSON.stringify(profileData.motivations) : null,
        interests: profileData.interests ? JSON.stringify(profileData.interests) : null,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to save user profile:", error);
    throw error;
  }
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user profile: database not available");
    return null;
  }

  try {
    const { userProfiles } = await import("../drizzle/schema");
    const result = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (result.length > 0) {
      const profile = result[0];
      return {
        ...profile,
        hobbies: profile.hobbies ? JSON.parse(profile.hobbies) : [],
        motivations: profile.motivations ? JSON.parse(profile.motivations) : [],
        interests: profile.interests ? JSON.parse(profile.interests) : [],
      };
    }
    return null;
  } catch (error) {
    console.error("[Database] Failed to get user profile:", error);
    return null;
  }
}
