import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { UserPreferences } from '@/lib/supabase';

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Load preferences from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadPreferences();
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        return;
      }

      setPreferences(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  return {
    preferences,
    loading,
    updatePreferences,
    refreshPreferences: loadPreferences,
  };
}
