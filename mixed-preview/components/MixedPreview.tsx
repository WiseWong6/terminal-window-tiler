import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import mermaid from 'mermaid';
import { Download, Image as ImageIcon } from 'lucide-react';
import JSON5 from 'json5';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
});

interface MixedPreviewProps {
  code: string;
  onError: (error: string | null) => void;
}

// A component to render a single Mermaid diagram
const MermaidDiagram: React.FC<{ code: string }> = ({ code }) => {
  const [svgContent, setSvgContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const renderDiagram = async () => {
      try {
        await mermaid.parse(code);
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;
        const { svg } = await mermaid.render(id, code);
        if (isMounted) {
          let cleanedSvg = svg
            .replace(/style="[^"]*max-width:[^"]*"/gi, '');
        // Normalize diagram size: use a fixed scale so all diagrams' internal elements look the same
        const vbMatch = cleanedSvg.match(/viewBox="[^"]*\s([\d.]+)\s([\d.]+)"/);
        if (vbMatch) {
          const vbW = parseFloat(vbMatch[1]);
          const renderWidth = Math.round(vbW * 0.79);
          cleanedSvg = cleanedSvg.replace(/width="[^"]*"/, `width="${renderWidth}px"`);
        }
          setSvgContent(cleanedSvg);
          setError(null);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e.message : 'Syntax error');
        }
      }
    };
    renderDiagram();
    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleDownloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mermaid-diagram-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!svgContent) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const svgEl = doc.documentElement;

    svgEl.removeAttribute('style');

    const viewBox = svgEl.getAttribute('viewBox');
    let nativeWidth = 0;
    let nativeHeight = 0;

    if (viewBox) {
      const parts = viewBox.split(/\s+|,/).filter(Boolean);
      if (parts.length >= 4) {
        nativeWidth = parseFloat(parts[2]);
        nativeHeight = parseFloat(parts[3]);
      }
    }

    if (!nativeWidth) nativeWidth = parseFloat(svgEl.getAttribute('width') || '0');
    if (!nativeHeight) nativeHeight = parseFloat(svgEl.getAttribute('height') || '0');

    if (nativeWidth && nativeHeight) {
      svgEl.setAttribute('width', nativeWidth.toString());
      svgEl.setAttribute('height', nativeHeight.toString());
    }

    const serializer = new XMLSerializer();
    const newSvgString = serializer.serializeToString(svgEl);

    const img = new Image();
    const svg64 = btoa(unescape(encodeURIComponent(newSvgString)));
    const image64 = `data:image/svg+xml;base64,${svg64}`;

    img.onload = () => {
      const canvas = document.createElement('canvas');

      const targetWidth = 2500;
      let scale = 3;
      if (img.width < targetWidth) {
        scale = targetWidth / img.width;
      }
      scale = Math.min(scale, 10);

      canvas.width = Math.ceil(img.width * scale);
      canvas.height = Math.ceil(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `mermaid-diagram-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
    img.src = image64;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 font-mono text-xs rounded border border-red-200 overflow-auto">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="my-4 rounded shadow-sm border border-slate-200 overflow-hidden bg-white">
      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-end space-x-2">
        <button
          onClick={handleDownloadSVG}
          className="flex items-center space-x-1 px-2 py-1 bg-white hover:bg-slate-100 rounded text-xs text-slate-600 transition-colors border border-slate-200"
          title="Download SVG"
        >
          <Download size={14} />
          <span>SVG</span>
        </button>
        <button
          onClick={handleDownloadPNG}
          className="flex items-center space-x-1 px-2 py-1 bg-indigo-50 hover:bg-indigo-100 rounded text-xs text-indigo-700 transition-colors border border-indigo-200"
          title="Download PNG"
        >
          <ImageIcon size={14} />
          <span>PNG</span>
        </button>
      </div>
      <div
        className="mermaid-container flex justify-center p-4 overflow-auto"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

// A component to render JSON
const JsonViewer: React.FC<{ code: string }> = ({ code }) => {
  let parsed: any;
  let formatted = code;
  let error = null;
  try {
    parsed = JSON5.parse(code);
    formatted = JSON.stringify(parsed, null, 2);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Invalid JSON';
  }

  if (error) {
    return (
      <div className="my-4">
        <div className="p-2 bg-red-50 text-red-700 font-mono text-xs rounded-t border border-red-200 border-b-0">
          JSON Parse Error: {error}
        </div>
        <SyntaxHighlighter
          language="json"
          style={vscDarkPlus}
          className="!m-0 !rounded-t-none !rounded-b"
        >
          {code}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <div className="my-4 rounded overflow-hidden border border-slate-200 shadow-sm">
      <div className="bg-slate-800 px-4 py-1 text-xs text-slate-400 font-mono flex justify-between items-center">
        <span>JSON</span>
      </div>
      <SyntaxHighlighter language="json" style={vscDarkPlus} className="!m-0 !rounded-none">
        {formatted}
      </SyntaxHighlighter>
    </div>
  );
};

// A component to render HTML in an iframe
const HtmlPreview: React.FC<{ code: string }> = ({ code }) => {
  return (
    <div className="my-4 rounded overflow-hidden border border-slate-200 shadow-sm bg-white h-[800px] flex flex-col">
      <div className="bg-slate-800 px-4 py-1 text-xs text-slate-400 font-mono flex justify-between items-center shrink-0">
        <span>HTML Preview</span>
      </div>
      <iframe
        srcDoc={code}
        className="w-full flex-1 border-none bg-white"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

const MixedPreview: React.FC<MixedPreviewProps> = ({ code, onError }) => {
  // Pre-process the code to auto-detect pure JSON or pure Mermaid if not wrapped
  const preprocessCode = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return '';

    // Check if pure JSON
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))
    ) {
      try {
        JSON5.parse(trimmed);
        return `\`\`\`json\n${input}\n\`\`\``;
      } catch {
        // Not valid JSON
      }
    }

    // Check if pure HTML document
    if (
      trimmed.toLowerCase().startsWith('<!doctype html>') ||
      trimmed.toLowerCase().startsWith('<html')
    ) {
      return `\`\`\`html-preview\n${input}\n\`\`\``;
    }

    // Check if pure Mermaid
    const mermaidKeywords = [
      'graph',
      'flowchart',
      'sequenceDiagram',
      'classDiagram',
      'stateDiagram',
      'erDiagram',
      'gantt',
      'pie',
      'journey',
      'mindmap',
      'timeline',
      'gitGraph',
    ];
    const firstWord = trimmed.split(/\s+/)[0];
    if (mermaidKeywords.includes(firstWord)) {
      return `\`\`\`mermaid\n${input}\n\`\`\``;
    }

    return input;
  };

  const processedCode = preprocessCode(code);

  // We clear global error because individual blocks handle their own errors
  useEffect(() => {
    onError(null);
  }, [processedCode, onError]);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 bg-white border-b border-slate-200 z-10 shrink-0 shadow-sm" style={{ minHeight: '45px' }}>
        <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
          Preview
        </span>
      </div>
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200 prose prose-slate max-w-none prose-strong:font-bold prose-strong:text-slate-900">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              p: ({ ...props }: any) => <div className="mb-4 leading-relaxed" {...props} />,
              div: ({ ...props }: any) => {
                // If it has a data-html attribute, it's our injected raw HTML
                if (props['data-html']) {
                  return <div dangerouslySetInnerHTML={{ __html: props['data-html'] }} />;
                }
                return <div {...props} />;
              },
              code({ className, children, ...props }: any) {
                const match = /language-([a-zA-Z0-9_-]+)/.exec(className || '');
                const language = match ? match[1] : '';
                const content = String(children).replace(/\n$/, '');

                // If it has a language match, it's a code block. Otherwise, treat as inline code.
                // (react-markdown v9+ removed the 'inline' prop)
                const isBlock = Boolean(match);

                if (isBlock && language === 'mermaid') {
                  return <MermaidDiagram code={content} />;
                }

                if (isBlock && language === 'json') {
                  return <JsonViewer code={content} />;
                }

                if (isBlock && language === 'html-preview') {
                  return <HtmlPreview code={content} />;
                }

                return isBlock ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus as any}
                    language={language}
                    PreTag="div"
                    className="rounded-md !my-4"
                    {...props}
                  >
                    {content}
                  </SyntaxHighlighter>
                ) : (
                  <code
                    className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {processedCode}
          </ReactMarkdown>
          {!processedCode && (
            <div className="text-slate-400 text-center mt-10">
              Enter Markdown, HTML, JSON, or Mermaid syntax...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MixedPreview;
