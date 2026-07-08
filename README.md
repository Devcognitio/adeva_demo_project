# Adeva Test App

Este repositorio contiene una aplicación de prueba dividida en varios componentes:
- **Base de Datos (Database)**: SQL Server usando Docker Compose.
- **Backend**: API REST en Node.js (Express).
- **Frontend**: Aplicación web básica (HTML/JS/CSS).
- **Mobile**: Aplicación en React Native usando Expo.

A continuación se detallan los pasos para lanzar todo el entorno localmente.

## Requisitos Previos

Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (recomendado v18 o superior)
- [Docker](https://www.docker.com/) y Docker Compose
- Para el entorno móvil: [Expo CLI](https://docs.expo.dev/get-started/installation/) y la app Expo Go en tu dispositivo físico, o tener configurado un emulador de Android/iOS.

## Instrucciones para levantar el proyecto

### 1. Levantar la Base de Datos

El proyecto utiliza Docker Compose para iniciar una instancia de SQL Server.

1. Abre una terminal y navega al directorio `database`:
   ```bash
   cd database
   ```
2. Inicia los contenedores en segundo plano:
   ```bash
   docker-compose up -d
   ```
*(Nota: Revisa si hay que esperar algunos segundos a que la base de datos se inicialice y ejecute los scripts `init.sql`)*.

### 2. Iniciar el Backend

El backend es una API Node.js conectada a la base de datos.

1. Abre una nueva pestaña/ventana de terminal y navega al directorio `backend`:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor:
   ```bash
   npm start
   ```
*(El servidor se ejecutará normalmente en un puerto definido en `.env` o en el código fuente)*.

### 3. Iniciar el Frontend

El frontend consiste en archivos estáticos que puedes servir usando cualquier servidor HTTP simple.

1. Abre una nueva terminal y navega al directorio `frontend`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias (por si hay herramientas de testing configuradas):
   ```bash
   npm install
   ```
3. Sirve los archivos. Si no tienes un servidor configurado, puedes usar `serve` o `http-server` con npx:
   ```bash
   npx serve .
   ```
   *(También puedes usar la extensión "Live Server" si estás usando VS Code, abriendo el archivo `index.html`)*.

### 4. Iniciar la App Móvil (Expo)

La aplicación móvil está construida con React Native y Expo.

1. Abre otra terminal y navega al directorio `mobile`:
   ```bash
   cd mobile
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Expo:
   ```bash
   npm start
   ```
4. Se abrirá una interfaz en tu terminal (o navegador). Puedes usar la aplicación **Expo Go** en tu celular escaneando el código QR, o presionar `a` para abrir en el emulador de Android / `i` para el simulador de iOS.

---

¡Con esto ya deberías tener todos los componentes del proyecto corriendo y listos para probar!
