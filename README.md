# ReadMyCode 🚀

**ReadMyCode** is an AI-powered code analysis and documentation platform built with Node.js, Express, React, Vite, and xAI Grok. It automatically parses codebase repositories (via GitHub URL or ZIP archive upload), extracts AST metadata, and generates README documentation, API docs, system architecture maps, flowcharts, function explanations, and interactive AI debugging.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Mermaid.js, React Flow
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Simple-Git, Adm-Zip, @babel/parser
- **AI Engine**: xAI Grok API (`grok-2-latest`) via standard OpenAI-compatible REST completion endpoints

---

## ⚙️ Environment Configuration

### Backend `.env` (`server/.env`)

Create or edit `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/readmycode
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
XAI_API_KEY=your_grok_api_key_here
AI_MODEL=grok-2-latest
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
cd server
npm install
npm run dev
```

The backend server will run on `http://localhost:5000`.

### 2. Start the Frontend Client

```bash
cd client
npm install
npm run dev
```

The Vite dev server will open on `http://localhost:5173`.

---

## 📋 Features

- 📑 **README Generation**: Automatically generates complete Markdown READMEs from project files.
- 🔌 **API Documentation**: Parses controllers and Express routes into interactive API cards.
- 🔀 **Flowcharts & Architecture**: Visualizes execution paths and system design via Mermaid diagrams.
- 🧩 **Function Explainer**: AST analysis of key functions with AI explanations.
- 🐞 **AI Debugger**: Analyzes stack traces and provides root cause analysis and fixes.
