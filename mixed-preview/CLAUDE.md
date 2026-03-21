# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mixed Preview — a React 19 + TypeScript + Vite real-time mixed content editor. Supports instant preview of Markdown, HTML, JSON, and Mermaid diagrams, with AI-powered code fixing via user-configured providers.

## Common Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## Architecture

### Entry & Rendering Flow

`index.html` → `index.tsx` (React DOM mount) → `App.tsx` (main state management)

Tailwind CSS is loaded via CDN script (with typography plugin). All other dependencies are npm packages bundled by Vite.

### Core Components

- **App.tsx** — Top-level state (`code`, `error`, `isSidebarOpen`, `isFixing`, `aiConfig`, `isSettingsOpen`), sample switching, sidebar layout, AI fix orchestration
- **components/Editor.tsx** — Textarea editor with syntax error display, copy and "Fix with AI" buttons
- **components/MixedPreview.tsx** — Main preview component, auto-detects content type:
  - JSON → JSON5 parse and format
  - HTML full document → iframe sandbox render
  - Mermaid code block → diagram render + SVG/PNG export
  - Other → react-markdown (GFM + raw HTML) + react-syntax-highlighter
- **components/AISettingsModal.tsx** — Settings modal for AI provider configuration (supports OpenAI-compatible and Anthropic APIs)

### Services

- **services/ai-service.ts** — AI config persistence (localStorage) and API call dispatch for OpenAI-compatible and Anthropic providers
- **types/ai-config.ts** — TypeScript types for AI configuration

### Key Patterns

- **Debounced rendering**: `hooks/useDebounce.ts` applies 600ms debounce to editor input
- **Path aliases**: `@/*` maps to project root (vite.config.ts + tsconfig.json)
- **PNG export**: Canvas-based SVG scaling with white background
- **AI fix**: Editor triggers → App.tsx calls `fixCodeWithAI` from ai-service → returns fixed code
- **User-configured AI**: Settings stored in localStorage (`mixed-preview-ai-config`), supports preset providers (OpenAI, DeepSeek, Gemini, Groq, Ollama, Anthropic)
