# Multi-Agent App Builder

AI-Powered Full-Stack Code Generation using Multi-Agent System.

## Architecture

- **Architect Agent**: Creates technical specs from user input.
- **Frontend Dev Agent**: Generates React/Next.js UI code.
- **Backend Dev Agent**: Generates Next.js API routes.
- **QA Reviewer Agent**: Reviews code, loops back if failed.

Flow: `Architect → Frontend + Backend (Parallel) → QA → Output / Loop`

## Getting Started

1. Install dependencies: `npm install`
2. Run dev server: `npm run dev`
3. Open `http://localhost:3000`

## Environment Variables (Optional)

Copy `.env.example` to `.env` and add your LLM API key for real AI responses. Without it, the app runs in simulation mode.
