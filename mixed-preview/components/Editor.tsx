import React from 'react';
import { Copy, Wand2, Loader2 } from 'lucide-react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  onFix?: () => void;
  isFixing?: boolean;
}

const Editor: React.FC<EditorProps> = ({ value, onChange, error, onFix, isFixing = false }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 shrink-0">
        <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Editor</h2>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors"
          title="Copy Code"
        >
          <Copy size={16} />
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <textarea
          className={`w-full h-full p-4 bg-white text-slate-800 font-mono text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500/50 ${error ? 'bg-red-50/30' : ''}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          placeholder="Enter Markdown, HTML, JSON, or Mermaid syntax..."
        />
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 text-red-700 text-xs font-mono break-all max-h-32 overflow-y-auto">
              <strong>Syntax Error:</strong> {error}
            </div>
            {onFix && (
              <button
                onClick={onFix}
                disabled={isFixing}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap self-start"
              >
                {isFixing ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                <span>{isFixing ? 'Fixing...' : 'Fix'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
