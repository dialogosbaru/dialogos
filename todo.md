# Diálogos - Fase 1: TODO

## Interfaz de Usuario
- [x] Configurar paleta de colores beige/crema profesional en index.css
- [x] Implementar layout principal calmado y minimalista
- [x] Crear componente de entrada de texto (input conversacional)
- [x] Crear componente de visualización de mensajes (chat bubble)
- [x] Implementar área de conversación con scroll
- [x] Diseñar header/navbar profesional

## Funcionalidad Conversacional
- [x] Implementar lógica de respuesta básica (mock responses)
- [x] Crear sistema de historial de conversación (memoria local)
- [x] Implementar almacenamiento local (localStorage)

## Bilingüismo
- [x] Implementar sistema de cambio de idioma (español/inglés)
- [x] Crear archivos de traducción (i18n)
- [x] Integrar selector de idioma en la interfaz

## Funcionalidad de Voz (Web Speech API)
- [x] Implementar STT (Speech-to-Text) con Web Speech API
- [x] Implementar TTS (Text-to-Speech) con Web Speech API
- [x] Crear botones/controles para activar micrófono
- [x] Crear botones/controles para reproducir audio
- [x] Integrar indicadores visuales de grabación/reproducción

## Pulido y Despliegue
- [ ] Revisar responsividad (mobile, tablet, desktop)
- [ ] Verificar accesibilidad (WCAG)
- [ ] Optimizar rendimiento
- [ ] Preparar para despliegue en Vercel
- [ ] Crear archivo .gitignore y configuración de GitHub


## Bugs Reportados
- [x] Corregir error de refs en DropdownMenuTrigger con Button component
- [x] Corregir error de TTS en useSpeech hook


## Integración de Google Gemini (Fase 2)
- [x] Configurar servidor backend con soporte para API calls
- [x] Integrar Google Gemini API (gemini-2.5-flash)
- [x] Crear endpoint para procesar mensajes con contexto
- [x] Implementar historial de conversación para contexto
- [x] Resolver problemas de autenticación y modelos disponibles
- [ ] Mejorar detección de emociones con análisis de IA
- [ ] Implementar preguntas de seguimiento inteligentes
- [ ] Agregar memoria persistente mejorada
- [ ] Pruebas de integración y optimización

## Mejora de Personalizacion y Preguntas Inteligentes (Fase 3)
- [x] Mejorar el prompt de Leo para hacer preguntas sobre gustos personales
- [x] Implementar sistema de perfil de usuario (deportes, equipos, motivaciones, etc.)
- [x] Crear logica de preguntas contextuales y estrategicas
- [ ] Agregar memoria persistente de informacion personal del usuario
- [ ] Implementar seguimiento de temas de interes del usuario
- [ ] Crear respuestas personalizadas basadas en el perfil del usuario

## Persistencia de Conversaciones en Base de Datos (Fase 4)
- [x] Crear esquema de base de datos para conversaciones y perfiles
- [x] Implementar guardado automatico de mensajes
- [x] Crear sistema de recuperacion de historial completo
- [x] Mejorar analisis de perfil usando historial historico
- [x] Implementar seguimiento de preferencias del usuario
- [ ] Agregar sincronizacion entre dispositivos

## Sistema de Preguntas Iniciales (Fase 5)
- [x] Crear 5 preguntas iniciales para perfilar usuarios nuevos
- [x] Implementar flujo de preguntas iniciales
- [x] Guardar respuestas en el perfil del usuario
- [x] Usar respuestas para personalizar conversaciones futuras

## Ajuste de Voz Segun Estado Emocional (Fase 6)
- [x] Mejorar deteccion de emociones del usuario
- [x] Crear perfiles de voz para cada emocion
- [x] Implementar ajuste dinamico de parametros de voz (velocidad, tono)
- [x] Guardar estado emocional en la base de datos
- [x] Adaptar respuestas de Leo segun el estado emocional

## Despliegue en GitHub y Vercel (Fase 7)
- [ ] Inicializar repositorio Git local
- [ ] Crear repositorio en GitHub
- [ ] Subir código a GitHub
- [ ] Conectar repositorio a Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Desplegar en Vercel

## Bugs Reportados - Fase Gemini
- [x] Corregir error de autenticación en Gemini API (clave API no se pasa correctamente)
