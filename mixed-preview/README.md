# Mixed Preview

Real-time mixed content editor supporting Markdown, HTML, JSON, and Mermaid diagrams with instant preview. Includes AI-powered code fixing with configurable providers.

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## AI Configuration

Click the gear icon in the header to configure an AI provider for the "Fix with AI" feature. Supported API formats:

- **OpenAI-compatible**: OpenAI, DeepSeek, Gemini, Groq, Ollama, etc.
- **Anthropic**: Claude API with direct browser access

Configuration is stored in localStorage and persists across sessions.
