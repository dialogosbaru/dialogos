# Diálogos - TODO

## Correcciones Críticas

### 1. Error 500 al recargar página
- [x] Investigar causa del error 500 en endpoint de chat después de recargar
- [x] Revisar cómo se maneja conversationId después de recargar
- [x] Corregir manejo de contexto de memoria en servidor
- [ ] Probar envío de mensajes después de recargar

### 2. Sistema de conversación única
- [x] Modificar lógica para usar una sola conversación continua por usuario
- [x] Eliminar creación de nuevas conversaciones al cambiar de pestaña
- [x] Cargar conversación existente al iniciar sesión
- [ ] Probar continuidad de conversación entre sesiones

### 3. TTS no funciona
- [x] Revisar implementación de text-to-speech
- [x] Verificar que el audio se reproduzca correctamente
- [ ] Probar con diferentes navegadores
- [ ] Agregar indicador visual de reproducción de audio

### 4. STT duplica texto
- [x] Revisar implementación de speech-to-text
- [x] Corregir duplicación de texto durante reconocimiento
- [x] Implementar lógica de reemplazo en lugar de append
- [ ] Probar reconocimiento de voz con diferentes frases

### 5. Opción de borrar cuenta
- [x] Agregar botón "Borrar cuenta" en página de perfil
- [x] Implementar endpoint para borrar todos los datos del usuario
- [x] Agregar confirmación antes de borrar
- [ ] Probar borrado completo de datos

### 6. Despliegue final
- [x] Crear checkpoint con todas las correcciones
- [x] Hacer push a GitHub
- [x] Verificar despliegue en Vercel
- [ ] Probar todas las funcionalidades en producción

## Error Crítico en Producción

### 7. Error de JSON inválido en servidor (URGENTE)
- [x] Identificar dónde el servidor devuelve texto plano en lugar de JSON
- [x] Corregir manejo de errores para que siempre devuelva JSON válido
- [x] Probar localmente la corrección
- [x] Desplegar y verificar en producción

### 8. Error ERR_MODULE_NOT_FOUND en producción (CRÍTICO)
- [x] Identificar todos los imports sin extensión .js
- [x] Agregar extensiones .js a imports en api/trpc.ts
- [x] Agregar extensiones .js a imports en server/
- [x] Desplegar y verificar en producción

## Problemas Reportados por Usuario

### 9. Conversaciones múltiples al cambiar de pestaña
- [x] Revisar useConversationHistory para asegurar que cargue conversación existente
- [x] Verificar que no se creen nuevas conversaciones al recargar
- [x] Probar cambio de pestañas y recarga de página

### 10. Memoria no se usa en conversaciones
- [x] Revisar cómo se construye el contexto en el chat router
- [x] Integrar memoria del usuario en el prompt del LLM
- [x] Probar que Leo recuerde información guardada

### 11. Error al borrar cuenta
- [x] Verificar que userRouter esté registrado correctamente
- [x] Corregir path del procedure deleteAccount
- [x] Probar borrado de cuenta en producción

## Problemas Urgentes Reportados

### 12. Conversación se borra al actualizar página (CRÍTICO)
- [x] Modificar cliente para usar endpoint tRPC conversations.getOrCreateMainConversation
- [x] Eliminar llamadas directas a memoryService desde el cliente
- [ ] Probar que la conversación persista al recargar

### 13. Leo no recuerda información de la base de datos (CRÍTICO)
- [x] Depurar por qué userMemoryContext no se incluye en el prompt
- [x] Verificar que serverMemoryService.buildUserContext() funcione correctamente
- [ ] Probar que Leo recuerde hobbies guardados en personal_info

### 14. Agregar indicadores visuales
- [x] Agregar indicador "Leo está escribiendo..." cuando está generando respuesta
- [x] Agregar badge "Escuchando" cuando STT está activo
- [x] Agregar indicador cuando TTS está reproduciendo
