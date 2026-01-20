import { supabase } from './supabase';
import type { Conversation, Message, UserMemory, PersonalInfo } from './supabase';

export const memoryService = {
  // Conversations
  async createConversation(userId: string, title?: string): Promise<Conversation | null> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ user_id: userId, title })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  },

  async getConversationCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting conversation count:', error);
      return 0;
    }
  },

  async getOrCreateMainConversation(userId: string): Promise<Conversation | null> {
    try {
      // Try to get the most recent conversation
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      // If conversation exists, return it
      if (conversations && conversations.length > 0) {
        return conversations[0];
      }

      // Otherwise create a new one
      return await this.createConversation(userId, 'Conversación con Leo');
    } catch (error) {
      console.error('Error getting or creating main conversation:', error);
      return null;
    }
  },

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await this.getMessages(conversationId);
  },

  // Messages
  async saveMessage(conversationId: string, role: 'user' | 'assistant', content: string, emotion?: string): Promise<Message | null> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({ conversation_id: conversationId, role, content, emotion })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  // User Memory
  async saveMemory(
    userId: string,
    memoryType: 'short_term' | 'long_term',
    key: string,
    value: string,
    context?: string,
    importance: number = 5,
    expiresAt?: string
  ): Promise<UserMemory | null> {
    try {
      const { data, error } = await supabase
        .from('user_memory')
        .insert({
          user_id: userId,
          memory_type: memoryType,
          key,
          value,
          context,
          importance,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving memory:', error);
      return null;
    }
  },

  async getMemories(userId: string, memoryType?: 'short_term' | 'long_term'): Promise<UserMemory[]> {
    try {
      let query = supabase
        .from('user_memory')
        .select('*')
        .eq('user_id', userId);

      if (memoryType) {
        query = query.eq('memory_type', memoryType);
      }

      const { data, error } = await query.order('importance', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting memories:', error);
      return [];
    }
  },

  // Personal Info
  async savePersonalInfo(
    userId: string,
    infoType: 'name' | 'interest' | 'preference' | 'goal' | 'emotion' | 'other',
    key: string,
    value: string,
    confidence: number = 0.8,
    sourceConversationId?: string
  ): Promise<PersonalInfo | null> {
    try {
      // Check if this info already exists
      const { data: existing } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .eq('key', key)
        .single();

      if (existing) {
        // Update existing info
        const { data, error } = await supabase
          .from('personal_info')
          .update({ value, confidence, info_type: infoType })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new info
        const { data, error } = await supabase
          .from('personal_info')
          .insert({
            user_id: userId,
            info_type: infoType,
            key,
            value,
            confidence,
            source_conversation_id: sourceConversationId,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving personal info:', error);
      return null;
    }
  },

  async getPersonalInfo(userId: string, infoType?: string): Promise<PersonalInfo[]> {
    try {
      let query = supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId);

      if (infoType) {
        query = query.eq('info_type', infoType);
      }

      const { data, error } = await query.order('confidence', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting personal info:', error);
      return [];
    }
  },

  // Build context for Leo from user's memory
  async buildUserContext(userId: string): Promise<string> {
    try {
      const [personalInfo, longTermMemories] = await Promise.all([
        this.getPersonalInfo(userId),
        this.getMemories(userId, 'long_term'),
      ]);

      let context = '';

      if (personalInfo.length > 0) {
        context += '\n\n**Información personal del usuario:**\n';
        personalInfo.forEach(info => {
          context += `- ${info.key}: ${info.value}\n`;
        });
      }

      if (longTermMemories.length > 0) {
        context += '\n\n**Memoria a largo plazo:**\n';
        longTermMemories.forEach(memory => {
          context += `- ${memory.key}: ${memory.value}`;
          if (memory.context) {
            context += ` (contexto: ${memory.context})`;
          }
          context += '\n';
        });
      }

      return context;
    } catch (error) {
      console.error('Error building user context:', error);
      return '';
    }
  },
};
