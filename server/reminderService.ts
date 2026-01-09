import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://araehtauuglwrtzlfmiw.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyYWVodGF1dWdsd3J0emxmbWl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyOTQyOTIsImV4cCI6MjA4Mjg3MDI5Mn0.JmOYJ_LkFvyaIMceHBvk0goa8TmNS28pUNiypzEbXsI';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Reminder {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_type: 'goal' | 'conversation' | 'custom';
  related_goal_id?: string;
  related_conversation_id?: string;
  reminder_date: string;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export const reminderService = {
  // Create a new reminder
  async createReminder(
    userId: string,
    title: string,
    reminderDate: string,
    options: {
      description?: string;
      reminderType?: 'goal' | 'conversation' | 'custom';
      relatedGoalId?: string;
      relatedConversationId?: string;
      frequency?: 'once' | 'daily' | 'weekly' | 'monthly';
    } = {}
  ): Promise<Reminder | null> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert({
          user_id: userId,
          title,
          description: options.description,
          reminder_type: options.reminderType || 'custom',
          related_goal_id: options.relatedGoalId,
          related_conversation_id: options.relatedConversationId,
          reminder_date: reminderDate,
          frequency: options.frequency || 'once',
          status: 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reminder:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      return null;
    }
  },

  // Get all reminders for a user
  async getUserReminders(userId: string, status?: 'active' | 'completed' | 'cancelled'): Promise<Reminder[]> {
    try {
      let query = supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('reminder_date', { ascending: true });

      if (error) {
        console.error('Error getting reminders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  },

  // Get upcoming reminders (next 7 days)
  async getUpcomingReminders(userId: string): Promise<Reminder[]> {
    try {
      const now = new Date();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('reminder_date', now.toISOString())
        .lte('reminder_date', sevenDaysFromNow.toISOString())
        .order('reminder_date', { ascending: true });

      if (error) {
        console.error('Error getting upcoming reminders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  },

  // Update reminder status
  async updateReminderStatus(
    reminderId: string,
    status: 'active' | 'completed' | 'cancelled'
  ): Promise<Reminder | null> {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) {
        console.error('Error updating reminder status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error updating reminder status:', error);
      return null;
    }
  },

  // Delete a reminder
  async deleteReminder(reminderId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', reminderId);

      if (error) {
        console.error('Error deleting reminder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  },

  // Get reminders that need to be sent now
  async getDueReminders(): Promise<Reminder[]> {
    try {
      const now = new Date();

      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('status', 'active')
        .lte('reminder_date', now.toISOString())
        .order('reminder_date', { ascending: true });

      if (error) {
        console.error('Error getting due reminders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting due reminders:', error);
      return [];
    }
  },

  // Detect goals in message and create automatic reminders
  async detectAndCreateGoalReminders(
    userId: string,
    message: string,
    conversationId: string
  ): Promise<Reminder[]> {
    const createdReminders: Reminder[] = [];

    try {
      // Goal detection keywords
      const goalKeywords = [
        { pattern: /quiero\s+(\w+)/gi, type: 'goal' as const },
        { pattern: /voy\s+a\s+(\w+)/gi, type: 'goal' as const },
        { pattern: /mi\s+meta\s+es\s+(\w+)/gi, type: 'goal' as const },
        { pattern: /mi\s+objetivo\s+es\s+(\w+)/gi, type: 'goal' as const },
        { pattern: /planeo\s+(\w+)/gi, type: 'goal' as const },
      ];

      for (const { pattern } of goalKeywords) {
        const matches = message.match(pattern);
        if (matches && matches.length > 0) {
          // Create reminder for 3 days from now
          const reminderDate = new Date();
          reminderDate.setDate(reminderDate.getDate() + 3);

          const reminder = await this.createReminder(
            userId,
            `¿Cómo va tu meta?`,
            reminderDate.toISOString(),
            {
              description: `Leo te pregunta: ¿Cómo va tu meta de "${matches[0]}"?`,
              reminderType: 'goal',
              relatedConversationId: conversationId,
              frequency: 'once',
            }
          );

          if (reminder) {
            createdReminders.push(reminder);
          }
          break; // Only create one reminder per message
        }
      }
    } catch (error) {
      console.error('Error detecting goals:', error);
    }

    return createdReminders;
  },
};
