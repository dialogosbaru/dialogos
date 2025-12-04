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
- [x] Inicializar repositorio Git local
- [x] Crear repositorio en GitHub
- [x] Subir código a GitHub
- [x] Conectar repositorio a Vercel
- [x] Configurar variables de entorno en Vercel
- [ ] Corregir configuración de build en Vercel para Vite + Express

## Bugs Reportados - Fase Gemini
- [x] Corregir error de autenticación en Gemini API (clave API no se pasa correctamente)

## Panel de Opciones (Fase 8)
- [x] Diseñar 8 paletas de colores amigables y profesionales
- [x] Crear componente OptionsPanel con selector de idioma
- [x] Implementar selector de paleta de colores con vista previa
- [x] Crear sistema de persistencia de preferencias (localStorage)
- [x] Integrar panel de Opciones en la interfaz principal
- [x] Aplicar cambios de paleta dinámicamente con CSS variables

## Bugs Reportados - Panel de Opciones
- [x] Eliminar completamente el overlay oscuro del diálogo (usamos backdrop-blur en lugar de bg oscuro)
- [x] Mejorar contraste y visibilidad de colores en las paletas (bordes oscuros, tamaño 10x10)
- [x] Agregar animaciones suaves al cambiar de paleta (transiciones CSS de 0.5s)

## Bug Crítico - Paletas de Colores
- [x] Convertir paletas de HSL a OKLCH (Tailwind CSS 4 usa OKLCH)
- [x] Actualizar función applyColorPalette para OKLCH
- [x] Verificar que la paleta predeterminada se cargue al inicio

## Bug - Paleta Predeterminada No Se Carga
- [x] Agregar useEffect en App.tsx para aplicar paleta predeterminada al cargar la página
- [x] Verificar que funcione en Vercel (no solo en desarrollo)

## Bug Crítico - Variables de Entorno Vite en Vercel
- [x] Investigar por qué las variables VITE_ no se reemplazan en el build de Vercel
- [x] Las CSS variables no se están aplicando (todo aparece en blanco) - solucionado con valores estáticos
- [x] El título muestra %VITE_APP_TITLE% en lugar del nombre real - cambiado a "Diálogos"
- [x] Configurar correctamente el build command en vercel.json - usando valores estáticos en const.ts e index.html

## Bug Crítico - Paletas No Se Visualizan en Vercel
- [x] Investigar por qué applyColorPalette no inyecta las CSS variables en el DOM
- [x] Verificar que el useEffect en App.tsx se esté ejecutando correctamente
- [x] Asegurar que las CSS variables OKLCH se apliquen al :root del documento (agregado prefijo oklch())

## Mejoras de Voz Natural y Lenguaje Urbano (Fase 9)
- [x] Actualizar prompt de Leo para usar lenguaje urbano y coloquial
- [x] Incorporar expresiones modernas y jerga natural
- [x] Mejorar detección de emociones en contexto de conversación
- [x] Ajustar parámetros de voz dinámicamente según estado de ánimo
- [x] Implementar pausas naturales en la síntesis de voz
- [x] Agregar énfasis en palabras clave con procesamiento de texto
- [x] Seleccionar voces más expresivas del navegador
- [x] Probar diferentes escenarios de conversación (feliz, triste)
- [x] Ajustar tonos para conversaciones alegres, tristes, motivacionales

## Control de Intensidad de Lenguaje Urbano (Fase 10)
- [x] Agregar slider en OptionsPanel para controlar intensidad urbana (0-100%)
- [x] Crear sistema de niveles de lenguaje en el prompt (formal, moderado, urbano, muy urbano)
- [x] Implementar persistencia del nivel en localStorage
- [x] Pasar el nivel de intensidad al backend en cada mensaje
- [x] Ajustar el prompt de Leo dinámicamente según el nivel seleccionado
- [x] Probar diferentes niveles (0% formal, 50% moderado)
- [x] Establecer 50% como valor predeterminado

## Bug Reportado - Slider de Intensidad Urbana No Funciona en Vercel
- [x] Investigar por qué el slider no afecta las respuestas de Leo (funciona correctamente, requiere recargar página)
- [x] Verificar que el urbanLevel se esté leyendo correctamente del localStorage
- [x] Confirmar que el valor se envíe al backend en cada mensaje
- [x] Validar que el prompt se ajuste dinámicamente en el servidor

## Lenguaje Urbano Colombiano (Fase 11)
- [x] Actualizar prompt de Leo con expresiones colombianas auténticas
- [x] Incorporar palabras como "parce", "chimba", "bacano", "berraco", "gonorrea", "parcero", "llave", "camello"
- [x] Actualizar detección de emociones con palabras colombianas
- [x] Ajustar todos los niveles de intensidad (0-100%) con jerga colombiana
- [x] Probar diferentes escenarios con nivel 45-50% (moderado colombiano)
- [x] Verificar que el tono sea natural y auténtico

## Bug Cr\u00edtico - ## Bug Crítico - Vercel No Aplica Lenguaje Colombiano
- [x] Diagnosticar por qué Vercel no usa el código actualizado de GitHub (código está en build)
- [x] Verificar si hay problemas de caché en el build de Vercel (sí, caché agresivo)
- [ ] Forzar rebuild completo limpiando caché (agregado .vercelignore)
- [ ] Confirmar que el backend procesa correctamente urbanLevel en produccióni\u00f3n

## Voz Más Humana y Expresiva (Fase 12)
- [x] Implementar análisis emocional avanzado del texto de Leo (detecta 7 emociones)
- [x] Crear sistema de variación dinámica de velocidad según emoción (0.8-1.3x)
- [x] Implementar cambios de tono que reflejen emociones (0.9-1.2x pitch)
- [x] Agregar pausas naturales más sofisticadas (antes de puntos clave, después de preguntas)
- [x] Simular respiraciones con pausas cortas para mayor naturalidad
- [x] Implementar énfasis en palabras clave usando variación de pitch
- [x] Probar voz en diferentes escenarios: alegría, tristeza, motivación, empatía
- [ ] Resolver error synthesis-failed en algunos navegadores (limitación de Web Speech API)

## Motor de Voz Avanzado (Fase 13)
- [x] Investigar opciones de TTS avanzados: Google Cloud TTS (WaveNet/Neural2), ElevenLabs, Azure Neural TTS, Amazon Polly Neural
- [x] Comparar planes gratuitos y límites de cada servicio (Google: 4M gratis/mes, ElevenLabs: 10k/mes)
- [x] Evaluar calidad de voz y naturalidad de cada opción (Google WaveNet: 4/5, ElevenLabs: 5/5)
- [x] Seleccionar la mejor opción según costo/beneficio (Google Cloud TTS con WaveNet)
- [x] Configurar API key y credenciales del servicio seleccionado (cuenta de servicio creada, 7 voces WaveNet disponibles)
- [x] Implementar integración en el backend (endpoint para TTS con router tts.ts)
- [x] Actualizar frontend para usar el nuevo motor TTS (hook useSpeech.ts actualizado)
- [x] Probar calidad de voz con diferentes emociones y textos (5/5 tests pasados)
- [x] Documentar costos y límites del plan gratuito vs. producción (4M caracteres gratis/mes, $4/1M en producción)

## Selector de Nacionalidad y Tipo de Voz (Fase 14)
- [x] Investigar voces latinoamericanas disponibles en Google Cloud TTS (Colombia, México, Argentina, etc.)
- [x] Listar todas las voces WaveNet/Neural2 disponibles con sus características (97 voces en español, 2 regiones)
- [x] Crear selector de nacionalidad de voz en el panel de Opciones (Latinoamérica vs España)
- [x] Crear selector de tipo de voz (masculina/femenina)
- [x] Implementar persistencia de preferencias de voz en localStorage
- [x] Actualizar backend para usar la voz seleccionada por el usuario (voiceName en lugar de languageCode)
- [x] Probar diferentes combinaciones de nacionalidad y género (es-US-Neural2-B funcionando)
- [x] Establecer voz latinoamericana como predeterminada para Colombia (es-US-Neural2-B)

## Sistema de Caché de Audio (Fase 15)
- [x] Diseñar estrategia de caché (localStorage, IndexedDB, o memoria) - IndexedDB seleccionado
- [x] Implementar sistema de caché con clave basada en texto + emoción + voz (audioCache.ts)
- [x] Agregar lógica para verificar caché antes de llamar a la API (integrado en useSpeech.ts)
- [x] Implementar límite de tamaño de caché (evitar llenar almacenamiento) - 50 MB máximo
- [x] Agregar sistema de expiración de caché (TTL) - 7 días
- [x] Probar rendimiento con y sin caché (primera llamada: API, segunda: caché)
- [x] Medir reducción de llamadas a la API (100% de reducción en repeticiones)

## Despliegue a Vercel con Google Cloud TTS (Fase 16)
- [ ] Configurar variable de entorno GOOGLE_CLOUD_TTS_API_KEY en Vercel
- [ ] Verificar que las credenciales de cuenta de servicio funcionen en producción
- [ ] Probar la voz en Vercel con diferentes nacionalidades
- [ ] Verificar que el caché funcione correctamente en producción
- [ ] Monitorear uso de caracteres de Google Cloud TTS
- [ ] Documentar límites y costos para el usuario final
