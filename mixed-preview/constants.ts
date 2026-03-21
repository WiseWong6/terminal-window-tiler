export const DEFAULT_MERMAID_CODE = `graph TD
  A[Start] --> B{Is it working?}
  B -- Yes --> C[Great!]
  B -- No --> D[Debug]
  D --> B
  C --> E[Deploy]
  E --> F[Relax]
  
  style A fill:#f9f,stroke:#333,stroke-width:2px
  style F fill:#bbf,stroke:#333,stroke-width:2px`;

export const SAMPLE_MIXED = `# Mixed Content Example

This editor supports **Markdown**, <span style="color: red;">HTML</span>, \`JSON\`, and \`Mermaid\` diagrams all in one place!

## 1. HTML
<div style="padding: 10px; background: #e0f2fe; border-left: 4px solid #0284c7; border-radius: 4px;">
  <strong>Notice:</strong> You can embed raw HTML directly.
</div>

## 2. JSON
JSON blocks are automatically parsed and formatted:
\`\`\`json
{
  "project": "Mixed Preview",
  "features": ["Markdown", "HTML", "JSON", "Mermaid"],
  "version": 2.0
}
\`\`\`

## 3. Mermaid — Flowchart
\`\`\`mermaid
graph LR
  A[Input] --> B{Detect Type}
  B -->|Markdown| C[Render MD]
  B -->|HTML| D[Iframe]
  B -->|JSON| E[Format & Highlight]
  B -->|Mermaid| F[Diagram]
\`\`\`

## 4. Mermaid — Sequence
\`\`\`mermaid
sequenceDiagram
    participant User
    participant Editor
    participant Preview
    User->>Editor: Type mixed content
    Editor->>Preview: Send content
    Preview-->>User: Rendered output!
\`\`\`
`;

export const SAMPLE_JSON = `{
  "name": "John Doe",
  "age": 30,
  "hobbies": ["reading", "hiking", "coding"],
  "address": {
    "street": "123 Main St",
    "city": "Anytown"
  }
}`;

export const SAMPLE_SEQUENCE = `sequenceDiagram
    participant Alice
    participant Bob
    Alice->>John: Hello John, how are you?
    loop Healthcheck
        John->>John: Fight against hypochondria
    end
    Note right of John: Rational thoughts <br/>prevail!
    John-->>Alice: Great!
    John->>Bob: How about you?
    Bob-->>John: Jolly good!`;

export const SAMPLE_MARKDOWN = `# Markdown Example

## Text Formatting
This is **bold**, *italic*, ~~strikethrough~~, and \`inline code\`.

## Lists
- Item one
- Item two
  - Nested item
  - Another nested

1. First
2. Second
3. Third

## Table

| Feature | Status |
|---------|--------|
| Markdown | ✅ |
| HTML | ✅ |
| JSON | ✅ |
| Mermaid | ✅ |

## Blockquote

> The best way to predict the future is to invent it.
> — Alan Kay

## Code Block
\`\`\`typescript
function greet(name: string): string {
  return \`Hello, \${name}!\`;
}
\`\`\`
`;

export const SAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #f8fafc; }
    .card { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto; }
    .card h2 { margin: 0 0 0.5rem; color: #1e293b; }
    .card p { color: #64748b; margin: 0 0 1rem; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 500; }
    .green { background: #dcfce7; color: #166534; }
    .blue { background: #dbeafe; color: #1e40af; }
  </style>
</head>
<body>
  <div class="card">
    <h2>Mixed Preview</h2>
    <p>A real-time mixed content editor with instant preview.</p>
    <span class="badge green">Active</span>
    <span class="badge blue">v1.0</span>
  </div>
</body>
</html>`;

export const SAMPLE_CLASS = `classDiagram
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra
    Animal : +int age
    Animal : +String gender
    Animal: +isMammal()
    Animal: +mate()
    class Duck{
      +String beakColor
      +swim()
      +quack()
    }
    class Fish{
      -int sizeInFeet
      -canEat()
    }
    class Zebra{
      +bool is_wild
      +run()
    }`;
