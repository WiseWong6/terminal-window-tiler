import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, RotateCcw } from 'lucide-react';
import { AIConfig, AIProvider } from '../types/ai-config';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: AIConfig) => void;
  initialConfig: AIConfig | null;
}

interface Preset {
  label: string;
  provider: AIProvider;
  endpoint: string;
  model: string;
}

const PRESETS: Preset[] = [
  { label: 'OpenAI', provider: 'openai', endpoint: 'https://api.openai.com', model: 'gpt-4o-mini' },
  {
    label: 'DeepSeek',
    provider: 'openai',
    endpoint: 'https://api.deepseek.com',
    model: 'deepseek-chat',
  },
  {
    label: 'Gemini',
    provider: 'openai',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-2.0-flash',
  },
  {
    label: 'Groq',
    provider: 'openai',
    endpoint: 'https://api.groq.com/openai',
    model: 'llama-3.3-70b-versatile',
  },
  { label: 'Ollama', provider: 'openai', endpoint: 'http://localhost:11434', model: 'llama3' },
  {
    label: 'Anthropic',
    provider: 'anthropic',
    endpoint: 'https://api.anthropic.com',
    model: 'claude-sonnet-4-20250514',
  },
];

const AISettingsModal: React.FC<AISettingsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
}) => {
  const [provider, setProvider] = useState<AIProvider>(initialConfig?.provider ?? 'openai');
  const [endpoint, setEndpoint] = useState(initialConfig?.endpoint ?? '');
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey ?? '');
  const [model, setModel] = useState(initialConfig?.model ?? '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen && initialConfig) {
      setProvider(initialConfig.provider);
      setEndpoint(initialConfig.endpoint);
      setApiKey(initialConfig.apiKey);
      setModel(initialConfig.model);
    }
  }, [isOpen, initialConfig]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const applyPreset = (preset: Preset) => {
    setProvider(preset.provider);
    setEndpoint(preset.endpoint);
    setModel(preset.model);
  };

  const handleSave = () => {
    if (!endpoint.trim() || !apiKey.trim() || !model.trim()) return;
    onSave({ provider, endpoint: endpoint.trim(), apiKey: apiKey.trim(), model: model.trim() });
    onClose();
  };

  const isValid = endpoint.trim() && apiKey.trim() && model.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">AI Settings</h2>
        </div>

        {/* API Format */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
            API Format
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="openai"
                checked={provider === 'openai'}
                onChange={() => setProvider('openai')}
                className="accent-indigo-600"
              />
              <span className="text-sm text-slate-700">OpenAI Compatible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="provider"
                value="anthropic"
                checked={provider === 'anthropic'}
                onChange={() => setProvider('anthropic')}
                className="accent-indigo-600"
              />
              <span className="text-sm text-slate-700">Anthropic</span>
            </label>
            <button
              onClick={() => {
                setProvider('openai');
                setEndpoint('');
                setApiKey('');
                setModel('');
              }}
              className="ml-auto p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        {/* Endpoint */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Base URL
          </label>
          <input
            type="url"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://api.openai.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
        </div>

        {/* API Key */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded text-slate-400"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Model */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
            Model
          </label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="gpt-4o-mini"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-start gap-3">
          <button
            onClick={handleSave}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;
