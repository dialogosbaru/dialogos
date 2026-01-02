# Diálogos - TODO

## Migración a Supabase Auth
- [x] Reescribir AuthContext para usar Supabase Auth (signUp, signIn, signOut)
- [x] Actualizar AuthModal para usar los métodos de Supabase Auth
- [x] Actualizar hooks (useUserPreferences, useConversationHistory) para usar user de Supabase
- [x] Actualizar Home.tsx para obtener userId de Supabase Auth
- [x] Actualizar ChatHeader para usar signOut de Supabase
- [ ] Configurar email templates en Supabase
- [x] Probar registro, login y logout
- [x] Probar que las políticas RLS funcionen correctamente
- [ ] Hacer push y desplegar a producción
