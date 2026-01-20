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
      
      // Obtener información personal con filtro de caducidad y ordenamiento por relevancia
      const { data: personalInfo, error: personalError } = await supabase
        .from('personal_info')
        .select('*')
        .eq('user_id', userId)
        // Nota: expires_at y emotional_relevance removidos temporalmente hasta que se agreguen en producción
        .limit(20); // Limitar a 20 memorias más relevantes
      
      if (personalError) {
        console.error('[buildUserContext] Error fetching personal info:', personalError);
      }
      
      const longTermMemories = await this.getMemories(userId, 'long_term');

      console.log('[buildUserContext] Personal info count:', personalInfo?.length || 0);
      console.log('[buildUserContext] Long term memories count:', longTermMemories.length);

      let context = '';

      // Agrupar por tipo de memoria
      const memoryByType = {
        identitaria: [] as any[],
        proceso: [] as any[],
        contextual: [] as any[],
        vinculo: [] as any[],
        other: [] as any[],
      };
      
      if (personalInfo && personalInfo.length > 0) {
        personalInfo.forEach((info: any) => {
          const type = info.memory_type || 'other';
          if (type in memoryByType) {
            memoryByType[type as keyof typeof memoryByType].push(info);
          } else {
            memoryByType.other.push(info);
          }
        });
      }
      
      // Construir contexto por capas (de más estable a menos estable)
      if (memoryByType.identitaria.length > 0) {
        context += '\n\n**Identidad y proyectos importantes:**\n';
        memoryByType.identitaria.forEach(info => {
          context += `- ${info.value}\n`;
        });
      }
      
      if (memoryByType.proceso.length > 0) {
        context += '\n\n**Procesos y metas en curso:**\n';
        memoryByType.proceso.forEach(info => {
          context += `- ${info.value}\n`;
        });
      }
      
      if (memoryByType.contextual.length > 0) {
        context += '\n\n**Contexto reciente:**\n';
        memoryByType.contextual.forEach(info => {
          context += `- ${info.value}\n`;
        });
      }
      
      // Memoria de vínculo NO se muestra explícitamente (es implícita)
      // Solo se usa para influir en el tono
      
      if (memoryByType.other.length > 0) {
        context += '\n\n**Otra información:**\n';
        memoryByType.other.forEach(info => {
          if (!info.is_implicit) { // Solo mostrar si no es implícita
            context += `- ${info.value}\n`;
          }
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
    sourceConversationId?: string,
    metadata?: {
      memory_type?: 'identitaria' | 'proceso' | 'contextual' | 'vinculo';
      emotional_relevance?: number;
      emotional_impact?: string;
      is_implicit?: boolean;
      expires_at?: string | null;
    }
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
        const insertData: any = {
          user_id: userId,
          info_type: infoType,
          key,
          value,
          confidence,
          source_conversation_id: sourceConversationId,
        };
        
        // Nota: Metadata fields removidos temporalmente hasta que se agreguen las columnas en producción
        // Add metadata fields if provided
        // if (metadata) {
        //   if (metadata.memory_type) insertData.memory_type = metadata.memory_type;
        //   if (metadata.emotional_relevance !== undefined) insertData.emotional_relevance = metadata.emotional_relevance;
        //   if (metadata.emotional_impact) insertData.emotional_impact = metadata.emotional_impact;
        //   if (metadata.is_implicit !== undefined) insertData.is_implicit = metadata.is_implicit;
        //   if (metadata.expires_at !== undefined) insertData.expires_at = metadata.expires_at;
        // }
        
        const { data, error } = await supabase
          .from('personal_info')
          .insert(insertData)
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
