# mixed-preview

<p align="center">
  <a href="./README.md">中文</a> | <a href="./README.en.md">English</a>
</p>

> A real-time mixed content editor.
>
> Write Markdown, HTML, JSON, and Mermaid in one editor — see the rendered result instantly on the right.
>
> Stop switching between four different tools when writing docs.

## Preview

Edit on the left, live render on the right:

```
┌──────────────────────────────────────────────────────┐
│  Mixed Preview                [samples]  ⚙  ☰       │
├──────────────┬───────────────────────────────────────┤
│              │                                       │
│   Editor     │   Preview                             │
│              │                                       │
│  # Hello     │   Hello                               │
│  ```mermaid  │   ┌───┐    ┌───┐                      │
│  graph LR    │   │ A │───→│ B │                      │
│    A --> B   │   └───┘    └───┘                      │
│  ```         │                                       │
│              │                                       │
│  ```json     │   ┌─────────────────┐                 │
│  {"a": 1}    │   │ { "a": 1 }     │                 │
│  ```         │   └─────────────────┘                 │
│              │                                       │
└──────────────┴───────────────────────────────────────┘
```

## At a Glance

- Type and preview instantly — 600ms debounce, no lag
- Auto-detects content type: paste raw JSON or raw Mermaid syntax directly, no need to wrap in fences
- Export Mermaid diagrams as SVG or PNG (PNG auto-scales to 2500px wide, white background)
- Full HTML documents render in a sandboxed iframe with style isolation
- 6 built-in sample contents, one-click switch: Mixed / Markdown / HTML / JSON / Flowchart / Sequence
- AI fix: let AI fix your syntax errors, with configurable API providers

## Quick Start

```bash
git clone https://github.com/WiseWong6/wise-labs.git
cd wise-labs/mixed-preview

npm install
npm run dev
# → http://localhost:3000
```

---

## What Problem Does It Solve

**If you work like this**

When writing technical docs, the content is often mixed: a Markdown paragraph, a JSON config example, a Mermaid flowchart, plus a few lines of HTML for special formatting.

Existing tools either only support Markdown (Typora, StackEdit), or only do Mermaid (mermaid.live), or only do JSON (jsoneditor). The result: you're constantly switching between three or four windows to preview one document.

And every time you switch to mermaid.live to draw a diagram, you still have to manually copy the code back into your document.

---

## Why Existing Solutions Fall Short

| Tool | Good at | Why it's not enough |
|------|---------|---------------------|
| **mermaid.live** | Mermaid diagram preview & export | Mermaid only — no Markdown mixing; can't write text and diagrams in the same file |
| **Typora / StackEdit** | Markdown live preview | Limited Mermaid support, no JSON rendering, no full HTML document support |
| **CodePen / JSFiddle** | HTML/CSS/JS online preview | Built for frontend dev, not document editing |
| **VS Code preview** | Markdown preview | Needs plugins for Mermaid; JSON and HTML each require different preview methods |

---

## Supported Content Types

### Markdown

Full GFM (GitHub Flavored Markdown) support: tables, task lists, strikethrough, syntax highlighting. Raw HTML tags can be mixed directly into Markdown.

### Mermaid

All major diagram types are supported:

| Type | Keyword |
|------|---------|
| Flowchart | `graph` / `flowchart` |
| Sequence | `sequenceDiagram` |
| Class | `classDiagram` |
| State | `stateDiagram` |
| ER | `erDiagram` |
| Gantt | `gantt` |
| Pie | `pie` |
| User Journey | `journey` |
| Mindmap | `mindmap` |
| Timeline | `timeline` |
| Git Graph | `gitGraph` |

Each diagram has SVG and PNG export buttons above it. PNG export auto-scales to high resolution with a white background — ready to paste into docs or slides.

### JSON

Supports JSON5 syntax (comments, trailing commas, single quotes). Input is auto-formatted and syntax-highlighted.

### HTML

When a full HTML document is detected (starting with `<!DOCTYPE html>` or `<html`), it renders in a sandboxed iframe with full style support.

---

## AI Fix

When the preview encounters a syntax error, the editor shows the error message and a "Fix with AI" button. Clicking it sends your code and error to your configured AI provider, which returns the fixed code.

Click the gear icon in the top-right to configure AI:

| Provider Type | Supported Services |
|--------------|-------------------|
| OpenAI-compatible | OpenAI, DeepSeek, Gemini, Groq, Ollama |
| Anthropic | Claude API |

Configuration is stored in localStorage — nothing is sent to any server. API requests go directly from the browser.

---

## Tech Stack

| Dependency | Purpose |
|-----------|---------|
| React 19 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling (CDN) |
| mermaid | Diagram rendering |
| react-markdown + remark-gfm + rehype-raw | Markdown rendering |
| react-syntax-highlighter | Code highlighting |
| json5 | Lenient JSON parsing |
| lucide-react | Icons |

---

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

---

## Scope

**It does**
- Mix Markdown, HTML, JSON, and Mermaid in one editor with live preview
- Auto-detect content type — no manual selection needed
- High-resolution diagram export (SVG / PNG)
- Optional AI-assisted code fixing

**It doesn't**
- Not a collaborative editor (no real-time multi-user editing)
- Not a file manager (single editor pane, no multi-file management)
- No persistent storage (content resets to sample on page refresh)
- Not an IDE (no file tree, terminal, or Git integration)

---

## Social

<div align="center">
  <p><code>@歪斯Wise</code></p>
  <p>
    <a href="https://www.xiaohongshu.com/user/profile/61f3ea4f000000001000db73">XiaoHongShu</a> /
    <a href="https://x.com/killthewhys">Twitter(X)</a> /
    WeChat Official Account
  </p>
  <img src="assets/wechat-wise-qr.jpg" alt="WeChat QR Code" width="220" />
</div>

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=WiseWong6/wise-labs&type=Date)](https://www.star-history.com/#WiseWong6/wise-labs&Date)
