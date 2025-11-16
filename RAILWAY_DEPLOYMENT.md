# Despliegue de Diálogos en Railway.app

Railway es una plataforma moderna para desplegar aplicaciones Node.js. A diferencia de Vercel, Railway soporta servidores Express corriendo continuamente, lo que es perfecto para Diálogos.

## Pasos para desplegar en Railway

### 1. Crear cuenta en Railway
1. Ve a https://railway.app
2. Haz clic en **"Start Free"**
3. Regístrate con tu cuenta de GitHub (recomendado)
4. Autoriza Railway para acceder a tu cuenta de GitHub

### 2. Conectar tu repositorio
1. En el dashboard de Railway, haz clic en **"New Project"**
2. Selecciona **"Deploy from GitHub"**
3. Busca y selecciona el repositorio `dialogosbaru/dialogos`
4. Haz clic en **"Deploy"**

Railway detectará automáticamente que es un proyecto Node.js y comenzará el build.

### 3. Configurar variables de entorno
Una vez que el build comience, necesitas agregar las variables de entorno:

1. En el dashboard de Railway, ve a tu proyecto
2. Haz clic en **"Variables"** (o en la sección de configuración)
3. Agrega las siguientes variables:

```
GEMINI_API_KEY=AIzaSyDReAxc6FsvbM76HeYAjgciLxbzQszVxYo
JWT_SECRET=tu-secreto-jwt-aqui
NODE_ENV=production
DATABASE_URL=mysql://usuario:contraseña@host:puerto/base_datos
```

**Nota:** Si no tienes una base de datos MySQL, Railway puede crear una automáticamente. Haz clic en **"Add Service"** y selecciona **"MySQL"**.

### 4. Obtener la URL de tu aplicación
Una vez que el deploy se complete:

1. Ve a la sección **"Deployments"**
2. Busca la URL pública (algo como `https://dialogos-production.up.railway.app`)
3. Esa es tu URL de producción

### 5. Conectar tu dominio personalizado (opcional)
Si tienes un dominio personalizado:

1. En Railway, ve a **"Settings"** → **"Domains"**
2. Haz clic en **"Add Domain"**
3. Ingresa tu dominio personalizado
4. Sigue las instrucciones para configurar los registros DNS

## Redepliegue automático

Railway redesplegará automáticamente tu aplicación cada vez que hagas push a la rama `main` de GitHub.

## Monitoreo y logs

Para ver los logs de tu aplicación:

1. En el dashboard de Railway, haz clic en tu proyecto
2. Ve a **"Deployments"**
3. Haz clic en el deployment más reciente
4. Los logs aparecerán en tiempo real

## Solución de problemas

### El build falla
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el script `build` en `package.json` funciona localmente: `pnpm build`

### La aplicación no inicia
- Revisa los logs en Railway para ver el error específico
- Asegúrate de que `NODE_ENV=production` está configurado
- Verifica que todas las variables de entorno requeridas estén presentes

### La base de datos no se conecta
- Verifica que `DATABASE_URL` es correcto
- Si usas MySQL en Railway, obtén la URL de conexión desde los detalles del servicio MySQL
- Asegúrate de que el puerto 3306 (MySQL) está abierto

## Próximos pasos

1. Crea una cuenta en Railway (https://railway.app)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno
4. ¡Listo! Tu aplicación estará en vivo

¿Necesitas ayuda con algo específico?
