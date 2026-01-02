import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// Use SUPABASE_URL and SUPABASE_ANON_KEY for server-side (not VITE_ prefixed)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://araehtauuglwrtzlfmiw.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYWVodGF1dWdsd3J0emxmbWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTQyOTIsImV4cCI6MjA4Mjg3MDI5Mn0.JmOYJ_LkFvyaIMceHBvk0goa8TmNS28pUNiypzEbXsI';

// Create Supabase client with service key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const serverMemoryService = {
  // Build context for Leo from user's memory
  async buildUserContext(userId: string): Promise<string> {
    try {
      console.log('[buildUserContext] Building context for userId:', userId);
      const [personalInfo, longTermMemories] = await Promise.all([
        this.getPersonalInfo(userId),
        this.getMemories(userId, 'long_term'),
      ]);

      console.log('[buildUserContext] Personal info count:', personalInfo.length);
      console.log('[buildUserContext] Personal info:', JSON.stringify(personalInfo, null, 2));
      console.log('[buildUserContext] Long term memories count:', longTermMemories.length);

      let context = '';

      if (personalInfo.length > 0) {
        context += '\n\n**Información que sabes sobre el usuario:**\n';
        personalInfo.forEach(info => {
          context += `- ${info.key}: ${info.value}\n`;
        });
      }

      if (longTermMemories.length > 0) {
        context += '\n\n**Memoria de conversaciones anteriores:**\n';
        longTermMemories.forEach(memory => {
          context += `- ${memory.key}: ${memory.value}`;
          if (memory.context) {
            context += ` (contexto: ${memory.context})`;
          }
          context += '\n';
        });
      }

      console.log('[buildUserContext] Final context:', context);
      return context;
    } catch (error) {
      console.error('Error building user context:', error);
      return '';
    }
  },

  async getPersonalInfo(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        .order('confidence', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting personal info:', error);
      return [];
    }
  },

  async getMemories(userId: string, memoryType?: 'short_term' | 'long_term'): Promise<any[]> {
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

  // Save memory from conversation
  async saveMemory(
    userId: string,
    memoryType: 'short_term' | 'long_term',
    key: string,
    value: string,
    context?: string,
    importance: number = 5
  ): Promise<any> {
    try {
      const { data, error} = await supabase
        .from('user_memory')
        .insert({
          user_id: userId,
          memory_type: memoryType,
          key,
          value,
          context,
          importance,
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

  // Extract and save personal info from conversation
  async extractAndSaveInfo(
    userId: string,
    message: string,
    conversationId?: string
  ): Promise<void> {
    try {
      // Simple keyword-based extraction (can be enhanced with AI later)
      const lowerMessage = message.toLowerCase();

      // Extract interests/hobbies
      const hobbyKeywords = ['me gusta', 'disfruto', 'hobby', 'pasatiempo', 'juego', 'practico'];
      if (hobbyKeywords.some(keyword => lowerMessage.includes(keyword))) {
        await this.savePersonalInfo(
          userId,
          'interest',
          'hobby_mencionado',
          message,
          0.7,
          conversationId
        );
      }

      // Extract goals
      const goalKeywords = ['quiero', 'objetivo', 'meta', 'proyecto', 'trabajando en'];
      if (goalKeywords.some(keyword => lowerMessage.includes(keyword))) {
        await this.savePersonalInfo(
          userId,
          'goal',
          'objetivo_mencionado',
          message,
          0.7,
          conversationId
        );
      }

      // Extract emotions
      const emotionKeywords = {
        feliz: ['feliz', 'alegre', 'contento', 'genial', 'bien'],
        triste: ['triste', 'mal', 'deprimido', 'desmotivado'],
        estresado: ['estresado', 'ansioso', 'preocupado', 'nervioso'],
        motivado: ['motivado', 'emocionado', 'entusiasmado'],
      };

      for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
          await this.savePersonalInfo(
            userId,
            'emotion',
            'estado_emocional',
            emotion,
            0.6,
            conversationId
          );
          break;
        }
      }
    } catch (error) {
      console.error('Error extracting info:', error);
    }
  },

  async savePersonalInfo(
    userId: string,
    infoType: 'name' | 'interest' | 'preference' | 'goal' | 'emotion' | 'other',
    key: string,
    value: string,
    confidence: number = 0.8,
    sourceConversationId?: string
  ): Promise<any> {
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
};
