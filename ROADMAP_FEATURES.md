# Roadmap de Nuevas Funcionalidades - Dialogos 3.x

## 🎯 Objetivo General
Implementar 6 funcionalidades principales que transforman Dialogos de un chatbot emocional a una **plataforma integral de bienestar emocional** con análisis, prevención de crisis, apoyo comunitario privado, y colaboración profesional.

---

## 📋 Funcionalidades Seleccionadas

### 1. Panel de Análisis Emocional
**Prioridad:** ALTA | **Complejidad:** MEDIA | **Tiempo estimado:** 4-6 horas

**Descripción:**
Dashboard visual que muestra el estado emocional del usuario a lo largo del tiempo, patrones detectados, y métricas de bienestar.

**Componentes:**
- Gráfico de línea temporal de emociones (últimos 7/30 días)
- Indicadores de frecuencia por tipo de emoción (tristeza, ansiedad, alegría, etc.)
- Detección de patrones (ej: "Tiendes a sentirte ansioso los lunes")
- Palabras clave más mencionadas
- Contador de conversaciones y tiempo total de acompañamiento

**Valor:**
- Alto impacto visual inmediato
- Ayuda al usuario a tomar conciencia de sus patrones emocionales
- Base de datos para funcionalidades posteriores (informes para terapeutas)

---

### 2. Frases de Emergencia
**Prioridad:** CRÍTICA | **Complejidad:** BAJA | **Tiempo estimado:** 2-3 horas

**Descripción:**
Sistema de detección de crisis que muestra recursos de ayuda profesional cuando detecta lenguaje de alto riesgo (suicidio, autolesión, violencia).

**Componentes:**
- Detector de palabras/frases de alto riesgo
- Modal de emergencia con números de ayuda (líneas de crisis locales)
- Opción de "Necesito ayuda ahora" siempre visible en el chat
- Registro de activaciones de emergencia (para análisis posterior)

**Valor:**
- Responsabilidad ética crítica
- Protección legal del proyecto
- Puede salvar vidas

**Números de Emergencia (Colombia):**
- Línea Nacional de Prevención del Suicidio: 01 800 113 113
- Línea 106 (Línea de la Vida - Bogotá)
- Línea 123 (Emergencias generales)

---

### 3. Check-ins Proactivos
**Prioridad:** ALTA | **Complejidad:** MEDIA-ALTA | **Tiempo estimado:** 6-8 horas

**Descripción:**
Leo envía notificaciones proactivas para verificar el estado emocional del usuario en momentos estratégicos, basándose en patrones detectados.

**Componentes:**
- Sistema de notificaciones push (usando Manus Notification API)
- Algoritmo de decisión de cuándo hacer check-in:
  * Si el usuario no ha conversado en 3+ días
  * Si se detectó un patrón de crisis reciente
  * En momentos del día donde históricamente el usuario está más vulnerable
- Mensajes personalizados según el contexto
- Opción de configurar frecuencia de check-ins

**Valor:**
- Diferenciador clave vs otras apps de IA
- Convierte a Leo en un "amigo que se preocupa"
- Prevención proactiva de crisis

---

### 4. Exportación de Informes para Terapeutas
**Prioridad:** ALTA | **Complejidad:** MEDIA | **Tiempo estimado:** 5-7 horas

**Descripción:**
El usuario puede generar un informe PDF estructurado con su historial emocional, conversaciones clave, y patrones detectados para compartir con su terapeuta.

**Componentes:**
- Generador de PDF con diseño profesional
- Secciones del informe:
  * Resumen ejecutivo (estado emocional general)
  * Gráficos de evolución emocional
  * Conversaciones destacadas (seleccionadas por el usuario o por relevancia)
  * Patrones y tendencias detectadas
  * Recomendaciones de Leo
- Opción de anonimizar información sensible
- Selector de rango de fechas

**Valor:**
- Integración con terapia profesional
- Posibilidad de alianzas con clínicas y terapeutas
- Monetización futura (planes premium para terapeutas)

---

### 5. Gamificación Sutil
**Prioridad:** MEDIA | **Complejidad:** MEDIA | **Tiempo estimado:** 4-6 horas

**Descripción:**
Sistema de reconocimiento no invasivo que celebra hitos emocionales sin trivializar el proceso.

**Componentes:**
- Badges/logros sutiles:
  * "Primera conversación"
  * "7 días de acompañamiento"
  * "Compartiste algo difícil"
  * "Identificaste un patrón"
- Contador de "días de autocuidado" (conversaciones consecutivas)
- Frases de reconocimiento de Leo en momentos clave
- **SIN puntos, niveles, o competencia** (no es un juego)

**Valor:**
- Refuerzo positivo sin trivializar
- Aumenta engagement sin ser manipulativo
- Celebra el progreso emocional

---

### 6. Círculos de Confianza Privados
**Prioridad:** ALTA | **Complejidad:** ALTA | **Tiempo estimado:** 10-12 horas

**Descripción:**
El usuario puede crear "círculos" privados (grupos) e invitar a personas de confianza (amigos, familia) para compartir actualizaciones emocionales opcionales y recibir apoyo mutuo.

**Componentes:**
- Creación de círculo con nombre personalizado
- Generación de código de invitación único (6 caracteres alfanuméricos)
- Sistema de unirse a círculo mediante código
- Chat grupal dentro del círculo
- Opción de compartir "actualizaciones de estado" (ej: "Hoy me siento mejor")
- **NO se comparten conversaciones privadas con Leo** (solo lo que el usuario decide compartir)
- Notificaciones cuando alguien comparte en el círculo
- Límite de 10 personas por círculo

**Valor:**
- Diferenciador único vs otras apps de salud mental
- Fomenta apoyo social real (no anónimo)
- Reduce estigma al normalizar conversaciones sobre emociones

**Arquitectura técnica:**
- Tabla `circles` (id, name, created_by, created_at, invite_code)
- Tabla `circle_members` (circle_id, user_id, joined_at, role)
- Tabla `circle_messages` (id, circle_id, user_id, content, created_at)
- Socket.io para chat en tiempo real

---

## 🗓️ Orden de Implementación Propuesto

### Fase 1: Frases de Emergencia (2-3h)
**Por qué primero:** Responsabilidad ética crítica. Debe estar antes de escalar el uso.

### Fase 2: Panel de Análisis Emocional (4-6h)
**Por qué segundo:** Base de datos para otras funcionalidades. Alto impacto visual.

### Fase 3: Gamificación Sutil (4-6h)
**Por qué tercero:** Usa datos del Panel de Análisis. Aumenta engagement para funcionalidades posteriores.

### Fase 4: Exportación de Informes para Terapeutas (5-7h)
**Por qué cuarto:** Depende del Panel de Análisis. Abre oportunidades de alianzas.

### Fase 5: Check-ins Proactivos (6-8h)
**Por qué quinto:** Requiere datos históricos robustos. Usa patrones del Panel de Análisis.

### Fase 6: Círculos de Confianza Privados (10-12h)
**Por qué último:** Mayor complejidad técnica (chat en tiempo real). Funcionalidad independiente que no bloquea otras.

---

## 📊 Estimación Total
- **Tiempo total:** 31-42 horas de desarrollo
- **Checkpoints sugeridos:** Uno después de cada fase
- **Testing:** 2-3 horas adicionales por funcionalidad

---

## 🚀 Próximos Pasos Inmediatos
1. ¿Aprobación del orden de implementación?
2. ¿Empezamos con Frases de Emergencia?
3. ¿Alguna modificación a las especificaciones?
