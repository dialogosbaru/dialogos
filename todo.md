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
- [ ] Desplegar y verificar en producción
