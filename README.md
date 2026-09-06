# CodeSync

CodeSync is a real-time collaborative code editor where teams can create projects, invite collaborators with role-based access, manage a shared file tree, edit code live in Monaco, and run supported files from the browser.

The backend is an Express + MongoDB API with Socket.IO for live collaboration, JWT-based authentication, Cloudinary avatar uploads, and per-project file and collaborator management. The frontend is a React + Vite app that provides the landing page, auth flow, dashboard, and the in-browser project editor.

## Features

- User registration and login with JWT cookies
- Avatar upload with Cloudinary
- Project creation, update, deletion, join, and leave flows
- Invite-code based collaboration
- Role-based access control for `owner`, `editor`, and `viewer`
- Shared project explorer with folders and files
- Monaco editor for code editing
- Live code synchronization through Socket.IO
- Online collaborator presence
- Save file content to MongoDB
- Run supported files from the browser with stdin input

## Tech Stack

- Frontend: React, Vite, React Router, Monaco Editor, Socket.IO Client, Framer Motion, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, Multer, Cloudinary

## Project Structure

- `Backend/` - Express API, database models, controllers, middleware, and Socket.IO setup
- `Frontend/` - React client UI, routes, context, API client, and editor screens

## Prerequisites

- Node.js 18+
- MongoDB connection string
- Cloudinary account credentials for avatar uploads
- A Linux/macOS environment with optional compilers/interpreters if you want to run code inside the app

Supported execution languages in the app are:

- Python
- JavaScript
- C++
- Java

## Environment Variables

Create a `.env` file inside `Backend/` with values like these:

```env
PORT=8000
MONGODB_URL=mongodb://127.0.0.1:27017
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
NODE_ENV=development
```

Create a `.env` file inside `Frontend/` with:

```env
VITE_BACKEND_URL=http://localhost:8000/api
```

## Installation

Install dependencies separately for the backend and frontend.

```bash
cd Backend
npm install

cd ../Frontend
npm install
```

## Running the App

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend:

```bash
cd Frontend
npm run dev
```

By default, Vite runs on `http://localhost:5173`.

## Available Scripts

Backend:

- `npm run dev` - Start the API with nodemon
- `npm start` - Start the API in production mode

Frontend:

- `npm run dev` - Start the Vite dev server
- `npm run build` - Build the frontend for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build

## How It Works

1. Register or log in with an avatar image.
2. Create a project or join one with an invite code.
3. Manage collaborators and roles from the dashboard.
4. Open a project to create folders, create files, rename items, and delete items.
5. Edit files in the Monaco editor and sync changes live over Socket.IO.
6. Save the file to persist it in MongoDB.
7. Run supported files with optional stdin input and view the output in the embedded terminal panel.

## API Overview

- `POST /api/users/register` - Register a user
- `POST /api/users/login` - Log in
- `POST /api/users/logout` - Log out
- `GET /api/users/current-user` - Fetch the current user
- `POST /api/dashboard/create-project` - Create a project
- `POST /api/dashboard/join-project` - Join a project by invite code
- `GET /api/dashboard/get-user-project` - List the current user's projects
- `GET /api/dashboard/open-project/:projectId` - Load a project with its tree and role
- `POST /api/project/create-file/:projectId/:parentFolderId` - Create a file
- `POST /api/project/create-folder/:projectId/:parentFolderId` - Create a folder
- `PUT /api/project/rename-file-folder/:projectId/:fileId` - Rename an item
- `DELETE /api/project/delete-file-folder/:projectId/:fileId` - Delete an item
- `POST /api/project/save-file-content/:projectId/:fileId` - Save code content
- `POST /api/project/run-file/:projectId/:fileId` - Run a supported file
