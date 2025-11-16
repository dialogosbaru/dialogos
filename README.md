# 🧠 Diálogos - Fase 1

Una aplicación conversacional bilingüe (español/inglés) con interfaz profesional y calmada, diseñada para mantener conversaciones naturales con Leo, una IA conversacional empática.

## 🎯 Características de la Fase 1

### Interfaz Gráfica
- **Diseño minimalista y profesional** con paleta de colores beige/crema que transmite calma y tranquilidad
- **Responsive design** optimizado para mobile, tablet y desktop
- **Chat conversacional** con burbujas de mensajes animadas
- **Header profesional** con selector de idioma y opciones de gestión

### Funcionalidad Conversacional
- **Conversación bilingüe** (español e inglés)
- **Respuestas inteligentes** basadas en la detección de emociones del usuario
- **Historial de conversación** almacenado localmente en localStorage
- **Memoria persistente** que se carga automáticamente al iniciar

### Funcionalidad de Voz
- **STT (Speech-to-Text)** usando Web Speech API
- **TTS (Text-to-Speech)** para que Leo hable sus respuestas
- **Controles de micrófono** integrados en la interfaz
- **Indicadores visuales** de grabación y reproducción

### Bilingüismo
- **Soporte completo** para español e inglés
- **Selector de idioma** en el header
- **Almacenamiento de preferencia** de idioma en localStorage

## 🚀 Instalación y Desarrollo

### Requisitos
- Node.js 18+ 
- pnpm (recomendado) o npm

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd dialogos

# Instalar dependencias
pnpm install
# o
npm install
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
pnpm dev
# o
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Build para producción
```bash
# Compilar para producción
pnpm build
# o
npm run build

# Previsualizar build
pnpm preview
# o
npm run preview
```

## 📁 Estructura del Proyecto

```
dialogos/
├── client/
│   ├── src/
│   │   ├── components/        # Componentes React reutilizables
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ui/            # Componentes shadcn/ui
│   │   ├── contexts/          # Contextos de React
│   │   │   ├── LanguageContext.tsx
│   │   │   └── ThemeContext.tsx
│   │   ├── hooks/             # Hooks personalizados
│   │   │   ├── useConversationHistory.ts
│   │   │   ├── useLeoResponses.ts
│   │   │   └── useSpeech.ts
│   │   ├── pages/             # Páginas de la aplicación
│   │   │   └── Home.tsx
│   │   ├── App.tsx            # Componente raíz
│   │   ├── main.tsx           # Punto de entrada
│   │   └── index.css          # Estilos globales y paleta de colores
│   ├── index.html             # HTML principal
│   └── public/                # Activos estáticos
├── vite.config.ts            # Configuración de Vite
├── tailwind.config.ts         # Configuración de Tailwind CSS
└── README.md                  # Este archivo
```

## 🎨 Paleta de Colores

La aplicación utiliza una paleta de colores beige/crema profesional que transmite calma:

- **Fondo principal:** Crema muy claro (oklch(0.98 0.005 70))
- **Primario:** Beige cálido (oklch(0.72 0.08 70))
- **Secundario:** Beige claro (oklch(0.88 0.01 70))
- **Bordes:** Beige sutil (oklch(0.88 0.003 70))

## 🌐 Idiomas Soportados

- **Español (es):** Interfaz y respuestas completamente en español
- **Inglés (en):** Interfaz y respuestas completamente en inglés

El idioma se selecciona desde el dropdown en el header y se guarda en localStorage.

## 🎤 Funcionalidad de Voz

### Speech-to-Text (STT)
- Presiona el botón del micrófono para iniciar la grabación
- Habla claramente en el idioma seleccionado
- El texto se transcribe automáticamente en el campo de entrada
- Presiona el botón de detener (cuadrado rojo) para finalizar

### Text-to-Speech (TTS)
- Leo habla automáticamente sus respuestas
- Puedes hacer clic en el icono de volumen para reproducir nuevamente
- El volumen y velocidad se ajustan automáticamente

## 💾 Almacenamiento Local

La aplicación almacena automáticamente:
- **Historial de conversación:** En `dialogos-conversation-history`
- **Preferencia de idioma:** En `dialogos-language`

Estos datos se guardan en localStorage y se cargan automáticamente al iniciar.

## 🚀 Despliegue en Vercel

### Pasos para desplegar

1. **Crear un repositorio en GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Diálogos Phase 1"
   git remote add origin <your-github-url>
   git push -u origin main
   ```

2. **Conectar a Vercel:**
   - Ir a [vercel.com](https://vercel.com)
   - Importar el repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Vite
   - Hacer clic en "Deploy"

3. **Configuración automática:**
   - Build Command: `pnpm build` (detectado automáticamente)
   - Output Directory: `dist/public` (configurado en vite.config.ts)
   - Environment Variables: Ninguna requerida para la Fase 1

## 📝 Notas para Futuras Fases

- **Fase 2:** Integración con backend para motor emocional avanzado
- **Fase 3:** Implementación de avatar 3D expresivo
- **Fase 4:** Reconocimiento facial y microexpresiones
- **Fase 5:** Sistema de suscripción y monetización

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👤 Autor

Desarrollado con ❤️ por el equipo de Diálogos

## 📞 Soporte

Para reportar bugs o sugerir features, por favor abre un issue en el repositorio de GitHub.

---

**Versión:** 1.0.0  
**Última actualización:** Noviembre 2025
