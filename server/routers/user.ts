import { publicProcedure, router } from "../_core/trpc.js";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const userRouter = router({
  deleteAccount: publicProcedure.mutation(async ({ ctx }) => {
    try {
      // Obtener el usuario autenticado desde el contexto de Supabase Auth
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        throw new Error('Usuario no autenticado');
      }

      const userId = session.user.id;

      // Borrar todos los datos del usuario en orden (respetando foreign keys)
      // 1. Borrar mensajes
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', userId);

      if (messagesError) {
        console.error('Error borrando mensajes:', messagesError);
      }

      // 2. Borrar conversaciones
      const { error: conversationsError } = await supabase
        .from('conversations')
        .delete()
        .eq('user_id', userId);

      if (conversationsError) {
        console.error('Error borrando conversaciones:', conversationsError);
      }

      // 3. Borrar memoria del usuario
      const { error: memoryError } = await supabase
        .from('user_memory')
        .delete()
        .eq('user_id', userId);

      if (memoryError) {
        console.error('Error borrando memoria:', memoryError);
      }

      // 4. Borrar información personal
      const { error: personalInfoError } = await supabase
        .from('personal_info')
        .delete()
        .eq('user_id', userId);

      if (personalInfoError) {
        console.error('Error borrando información personal:', personalInfoError);
      }

      // 5. Borrar preferencias
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', userId);

      if (preferencesError) {
        console.error('Error borrando preferencias:', preferencesError);
      }

      // 6. Borrar perfil
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) {
        console.error('Error borrando perfil:', profileError);
      }

      // 7. Finalmente, borrar el usuario de Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('Error borrando usuario de Auth:', authError);
        // Nota: Este paso requiere permisos de admin, puede que no funcione con anon key
        // En ese caso, el usuario deberá borrar su cuenta desde el panel de Supabase
        throw new Error('No se pudo borrar la cuenta de autenticación. Por favor contacta al administrador.');
      }

      return {
        success: true,
        message: 'Cuenta borrada exitosamente'
      };
    } catch (error) {
      console.error('Error borrando cuenta:', error);
      throw new Error('Error al borrar la cuenta: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  }),
});
