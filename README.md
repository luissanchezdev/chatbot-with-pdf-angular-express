# Proyecto de Chatbot con IA - BLAPER
![chatbot-screenshot-para-readme](https://github.com/user-attachments/assets/103a8ac1-d5f0-4bf7-8510-b5cadf987ee7)


Este proyecto implementa un chatbot personalizado para empresas utilizando Express y MongoDB en el backend, y Angular 17 en el frontend. El chatbot permite a las empresas cargar archivos para alimentar su base de conocimientos, y los usuarios pueden interactuar con él gracias a la asistencia de inteligencia artificial de ChatGPT.

## Estructura del Proyecto

El proyecto está dividido en dos partes principales:

1. Backend (Express + MongoDB)
2. Frontend (Angular 17)

### Backend

El backend está construido con Express.js y utiliza MongoDB como base de datos. Proporciona las siguientes rutas API:

- `/api/auth/login`: Autenticación de usuarios
- `/api/auth/register`: Registro de nuevos usuarios
- `/api/chat`: Manejo de conversaciones de chat
- `/api/chat-list`: Listado de chats disponibles
- `/api/upload`: Carga de archivos para alimentar el chatbot
- `/api/message`: Manejo de mensajes individuales
- `/api/chat-status`: Estado del chat

### Frontend

El frontend está desarrollado con Angular 17 y proporciona las siguientes rutas:

- `/login`: Página de inicio de sesión
- `/register`: Página de registro
- `/chat`: Interfaz principal del chat
- `/chat-list`: Listado de chats disponibles
- `/chat/empresa`: Vista específica del chat para empresas

## Requisitos Previos

- Node.js (v14 o superior)
- MongoDB
- Angular CLI (v17)

## Configuración

### Backend

1. Navega al directorio del backend:
   ```
   cd backend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Crea un archivo `.env` en la raíz del directorio backend y configura las variables de entorno necesarias:
   ```
   OPENAI_API_KEY=TU-API-KEY
   MONGODB_URI=TU-MONGO-URI
   JWT_SECRET=TU-FRASE-SECRETA
   ```

4. Inicia el servidor:
   ```
   npm start
   ```

### Frontend

1. Navega al directorio del frontend:
   ```
   cd frontend
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```
   ng serve
   ```

## Uso

1. Abre un navegador y ve a `http://localhost:4200` para acceder a la interfaz de usuario.
2. Regístrate como una nueva empresa o inicia sesión si ya tienes una cuenta.
3. Carga un archivo para alimentar tu chatbot personalizado.
4. Los usuarios pueden interactuar con el chatbot navegando a la URL específica de tu empresa.

## Características Principales

- Autenticación de usuarios y empresas
- Carga de archivos para personalizar el conocimiento del chatbot
- Integración con ChatGPT para proporcionar respuestas inteligentes
- Interfaz de usuario intuitiva para la interacción con el chatbot

## Créditos
Realizado por Anderson Ramirez  y Luis Sanchez

## Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
