# Guía de Despliegue de Diálogos en Vercel

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Repositorio en GitHub: `https://github.com/dialogosbaru/dialogos`
- Variables de entorno necesarias (ver sección de configuración)

## 🚀 Pasos para Desplegar en Vercel

### Paso 1: Conectar Vercel con GitHub

1. Ve a [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Haz clic en **"Add New..."** → **"Project"**
3. Selecciona **"Import Git Repository"**
4. Busca el repositorio **`dialogosbaru/dialogos`**
5. Haz clic en **"Import"**

### Paso 2: Configurar el Proyecto

En la pantalla de configuración del proyecto:

1. **Project Name:** `dialogos` (o el nombre que prefieras)
2. **Framework Preset:** Vercel debería detectar automáticamente **Next.js**
3. **Root Directory:** Dejar en blanco (raíz del proyecto)
4. **Build Command:** Dejar por defecto
5. **Output Directory:** Dejar por defecto

### Paso 3: Configurar Variables de Entorno

Antes de desplegar, debes agregar las variables de entorno. En la pantalla de configuración:

1. Haz clic en **"Environment Variables"**
2. Agrega las siguientes variables:

#### Variables Requeridas:

```
GEMINI_API_KEY = tu_clave_api_de_gemini
```

**Obtener la clave:**
- Ve a [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- Copia tu clave API

#### Variables Opcionales (Vercel las proporciona automáticamente):

```
VITE_APP_TITLE = Diálogos
VITE_APP_LOGO = /logo.png
VITE_ANALYTICS_ENDPOINT = (proporcionado por Vercel)
VITE_ANALYTICS_WEBSITE_ID = (proporcionado por Vercel)
VITE_FRONTEND_FORGE_API_URL = (proporcionado por Vercel)
VITE_FRONTEND_FORGE_API_KEY = (proporcionado por Vercel)
VITE_OAUTH_PORTAL_URL = (proporcionado por Vercel)
JWT_SECRET = (generado automáticamente)
OWNER_NAME = Tu Nombre
OWNER_OPEN_ID = (generado automáticamente)
```

### Paso 4: Desplegar

1. Después de agregar las variables de entorno, haz clic en **"Deploy"**
2. Vercel comenzará a construir y desplegar tu aplicación
3. Espera a que el despliegue se complete (generalmente toma 2-5 minutos)

### Paso 5: Acceder a tu Aplicación

Una vez completado el despliegue:

1. Vercel te mostrará una URL como: `https://dialogos-xxx.vercel.app`
2. Haz clic en la URL para acceder a tu aplicación
3. ¡Tu Diálogos está en vivo! 🎉

## 🔧 Configuración Avanzada

### Agregar Dominio Personalizado

1. En el dashboard de Vercel, ve a **Settings** → **Domains**
2. Haz clic en **"Add Domain"**
3. Ingresa tu dominio personalizado
4. Sigue las instrucciones para configurar los registros DNS

### Actualizar Variables de Entorno

Para actualizar variables de entorno después del despliegue:

1. Ve a **Settings** → **Environment Variables**
2. Edita la variable que desees cambiar
3. Los cambios se aplicarán en el próximo despliegue

### Redeploy Manual

Si necesitas redeplegar sin cambios en el código:

1. Ve al dashboard del proyecto
2. Haz clic en **"Redeploy"**

## 📊 Monitoreo

### Ver Logs de Despliegue

1. En el dashboard, haz clic en el despliegue más reciente
2. Ve a la pestaña **"Logs"** para ver los detalles

### Monitorear Rendimiento

1. Ve a **Analytics** para ver métricas de tu aplicación
2. Vercel proporciona información sobre:
   - Tiempo de respuesta
   - Errores
   - Uso de recursos

## 🆘 Solución de Problemas

### Error: "GEMINI_API_KEY is not configured"

**Solución:** Verifica que agregaste la variable `GEMINI_API_KEY` en las variables de entorno de Vercel.

### Error: "Build failed"

**Solución:** 
1. Revisa los logs de despliegue
2. Asegúrate de que todas las dependencias están instaladas
3. Verifica que el código está compilando correctamente localmente

### La aplicación se carga pero no funciona

**Solución:**
1. Abre la consola del navegador (F12)
2. Revisa los errores en la pestaña "Console"
3. Verifica que las variables de entorno están configuradas correctamente

## 📝 Notas Importantes

- **Seguridad:** Nunca compartas tus claves API en el código. Siempre usa variables de entorno.
- **Actualizaciones:** Cada push a la rama `main` en GitHub desencadenará un nuevo despliegue automático.
- **Base de Datos:** Vercel proporciona una base de datos integrada para el almacenamiento de conversaciones.

## 🔐 Variables de Entorno Detalladas

### GEMINI_API_KEY
- **Descripción:** Clave API de Google Gemini para procesamiento de lenguaje natural
- **Dónde obtenerla:** [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Requerida:** Sí
- **Ejemplo:** `AIzaSyDReAxc6FsvbM76HeYAjgciLxbzQszVxYo`

### JWT_SECRET
- **Descripción:** Clave secreta para firmar tokens JWT
- **Generada por:** Vercel automáticamente
- **Requerida:** Sí (para autenticación)

### OWNER_NAME
- **Descripción:** Nombre del propietario de la aplicación
- **Ejemplo:** `Dialogos Baru`
- **Requerida:** No

## 📞 Soporte

Si tienes problemas con el despliegue:

1. Revisa la [documentación de Vercel](https://vercel.com/docs)
2. Consulta los [logs de despliegue](https://vercel.com/docs/deployments/logs)
3. Abre un issue en GitHub

---

**¡Felicidades! Tu Diálogos está listo para el mundo.** 🌍
