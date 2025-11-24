# Odoben Project

Welcome to the **Odoben** project repository. This monorepo contains the complete ecosystem for the Odoben decentralized file management platform, built on the Sui blockchain and Walrus protocol.

## 📂 Project Structure

The repository is organized into four main components:

- **[`backend/`](./backend)**: The API server handling data persistence, authentication, and interaction with the Sui network. Built with **ElysiaJS** and **Bun**.
- **[`frontend/`](./frontend)**: The web application interface for users to manage their files. Built with **Svelte 5**, **SvelteKit**, and **TailwindCSS 4**.
- **[`desktop/`](./desktop)**: The cross-platform desktop application. Built with **Electron**, **Svelte 5**, and **Vite**.
- **[`sdk/`](./sdk)**: The TypeScript SDK (`@bunland/odoben`) for developers to interact programmatically with the Odoben backend.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **[Node.js](https://nodejs.org/)** (v18+ recommended)
- **[Bun](https://bun.sh/)** (v1.0+ recommended)

### 1. Backend Setup

The backend is powered by the Bun runtime.

```bash
cd backend
bun install
bun run dev
```

The server will start at `http://localhost:3000`.

### 2. Frontend Setup

The web frontend uses SvelteKit and Vite.

```bash
cd frontend
npm install
npm run dev
```

The web app will be available at `http://localhost:5173`.

### 3. Desktop App Setup

The desktop application uses Electron and Vite.

```bash
cd desktop
npm install
npm run dev
```

This command runs both the Vite dev server and the Electron app concurrently.

### 4. SDK

The SDK is a TypeScript library for interacting with the backend.

```bash
cd sdk
bun install
bun test
```

---

## 🛠️ Technologies

- **Runtime:** [Bun](https://bun.sh/), [Node.js](https://nodejs.org/)
- **Frontend Framework:** [Svelte 5](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/)
- **Desktop Framework:** [Electron](https://www.electronjs.org/)
- **Backend Framework:** [ElysiaJS](https://elysiajs.com/)
- **Styling:** [TailwindCSS v4](https://tailwindcss.com/)
- **Blockchain:** [Sui](https://sui.io/), [Walrus Protocol](https://www.walrus.xyz/)
- **Database:** MongoDB (via Mongoose)

## 📄 Documentation 
https://odoben.xyz/docs
