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
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        setLoading(false);
        return;
      }

      // If no preferences exist, create default ones
      if (!data) {
        const defaultPrefs = {
          user_id: user.id,
          urban_level: 50,
          voice_name: 'es-CO-Standard-A',
          voice_region: 'es-CO',
          language: 'es',
          color_palette: 'beige',
        };

        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPrefs)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating preferences:', insertError);
        } else {
          setPreferences(newPrefs);
        }
      } else {
        setPreferences(data);
      }
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
