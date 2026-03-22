import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ArrowLeft,
  Key,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Settings,
  CheckCircle2,
  Database,
  Wand2,
  FileBox,
} from 'lucide-react';
import { useStore } from '../state/store';
import {
  saveDefaultRestoreSettings,
  getUnifiedProviders,
  saveUnifiedProviders,
} from '../services/configAdapter';
import type { RestoreMode, RestoreFormat, UnifiedProvider, UnifiedModel, ModelCapability } from '../types';

type TabId = 'providers' | 'restore';

const SettingsView: React.FC = () => {
  const { state, dispatch } = useStore();
  const [activeTab, setActiveTab] = useState<TabId>('providers');

  // --- Unified providers local state ---
  const [providers, setProviders] = useState<UnifiedProvider[]>(() => getUnifiedProviders());

  // --- Restore settings ---
  const [restoreMode, setRestoreMode] = useState<RestoreMode>(state.restoreMode);
  const [restoreFormat, setRestoreFormat] = useState<RestoreFormat>(state.restoreFormat);
  const [restorePrompt, setRestorePrompt] = useState<string>(state.restorePrompt);
  const [restoreLlmModelId, setRestoreLlmModelId] = useState<string>(state.restoreLlmModelId);
  const [restoreTemperature, setRestoreTemperature] = useState<number>(state.restoreTemperature);
  const [restoreMaxTokens, setRestoreMaxTokens] = useState<number>(state.restoreMaxTokens);

  useEffect(() => {
    setRestoreMode(state.restoreMode);
    setRestoreFormat(state.restoreFormat);
    setRestorePrompt(state.restorePrompt);
    setRestoreLlmModelId(state.restoreLlmModelId);
    setRestoreTemperature(state.restoreTemperature);
    setRestoreMaxTokens(state.restoreMaxTokens);
  }, [state.settingsOpen]);

  // Handle setting close
  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_SETTINGS_OPEN', open: false });
  }, [dispatch]);

  // Handle setting save
  const handleSave = useCallback(() => {
    saveUnifiedProviders(providers);
    saveDefaultRestoreSettings({
      mode: restoreMode,
      format: restoreFormat,
      prompt: restorePrompt,
      llmModelId: restoreLlmModelId,
      temperature: restoreTemperature,
      maxTokens: restoreMaxTokens,
    });

    dispatch({ type: 'SET_RESTORE_MODE', mode: restoreMode });
    dispatch({ type: 'SET_RESTORE_FORMAT', format: restoreFormat });
    dispatch({ type: 'SET_RESTORE_PROMPT', prompt: restorePrompt });
    dispatch({ type: 'SET_RESTORE_LLM_MODEL', modelId: restoreLlmModelId });
    dispatch({ type: 'SET_RESTORE_TEMPERATURE', temperature: restoreTemperature });
    dispatch({ type: 'SET_RESTORE_MAX_TOKENS', maxTokens: restoreMaxTokens });

    // Close view
    handleClose();
  }, [
    providers, restoreMode, restoreFormat, restorePrompt, restoreLlmModelId,
    restoreTemperature, restoreMaxTokens, dispatch, handleClose
  ]);

  // --- Provider Handlers ---
  const toggleProvider = useCallback((id: string) => {
    setProviders(prev => prev.map(p => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }, []);

  const updateProvider = useCallback((id: string, updates: Partial<UnifiedProvider>) => {
    setProviders(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const removeProvider = useCallback((id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
  }, []);

  const addProvider = useCallback((
    label: string, type: 'openai-compat' | 'anthropic', baseUrl: string, apiKey: string
  ) => {
    const newId = `custom-${Date.now()}`;
    setProviders(prev => [
      ...prev,
      { id: newId, label, type, baseUrl, apiKey, enabled: true, isDefault: false, models: [] },
    ]);
  }, []);

  const toggleModel = useCallback((providerId: string, modelId: string) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id !== providerId) return p;
        return {
          ...p,
          models: p.models.map(m => (m.id === modelId ? { ...m, enabled: !m.enabled } : m)),
        };
      })
    );
  }, []);

  const addModelWithDetails = useCallback((
    providerId: string, id: string, label: string, capabilities: ModelCapability
  ) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id !== providerId) return p;
        return {
          ...p,
          models: [...p.models, { id, label, capabilities, enabled: true }],
        };
      })
    );
  }, []);

  const updateModel = useCallback((
    providerId: string, modelId: string, updates: Partial<UnifiedModel>
  ) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id !== providerId) return p;
        return {
          ...p,
          models: p.models.map(m => (m.id === modelId ? { ...m, ...updates } : m)),
        };
      })
    );
  }, []);

  const removeModel = useCallback((providerId: string, modelId: string) => {
    setProviders(prev =>
      prev.map(p => {
        if (p.id !== providerId) return p;
        return { ...p, models: p.models.filter(m => m.id !== modelId) };
      })
    );
  }, []);

  // Use entire screen
  return (
    <div className="absolute inset-0 z-50 bg-slate-50 flex flex-col pt-14 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top action bar within the settings overlay */}
      <div className="absolute top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-10 shadow-sm">
        <button
          onClick={handleClose}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm px-3 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft size={16} />
          返回工作台
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all duration-200"
          >
            放弃修改
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition-all duration-200"
          >
            <Save size={16} />
            保存全部设置
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Master Nav */}
        <div className="w-64 border-r border-slate-200 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-0">
          <div className="p-6 pb-2">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">配置中心</h2>
            <p className="text-xs text-slate-500 mt-1">管理模型节点与工作流引擎</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            <button
              onClick={() => setActiveTab('providers')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'providers'
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Database size={16} />
              模型资产与供应商
            </button>
            <button
              onClick={() => setActiveTab('restore')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'restore'
                  ? 'bg-purple-50 text-purple-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Wand2 size={16} />
              还原流管线设置
            </button>
          </div>
        </div>

        {/* Right Detail Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50">
          <div className="max-w-5xl mx-auto p-8">
            {activeTab === 'providers' ? (
              <ProvidersTabContent
                providers={providers}
                onToggleProvider={toggleProvider}
                onUpdateProvider={updateProvider}
                onRemoveProvider={removeProvider}
                onAddProvider={addProvider}
                onToggleModel={toggleModel}
                onAddModel={addModelWithDetails}
                onUpdateModel={updateModel}
                onRemoveModel={removeModel}
              />
            ) : (
              <RestoreTabContent
                restoreMode={restoreMode}
                restoreFormat={restoreFormat}
                restorePrompt={restorePrompt}
                restoreLlmModelId={restoreLlmModelId}
                restoreTemperature={restoreTemperature}
                restoreMaxTokens={restoreMaxTokens}
                providers={providers}
                onSetRestoreMode={setRestoreMode}
                onSetRestoreFormat={setRestoreFormat}
                onSetRestorePrompt={setRestorePrompt}
                onSetRestoreLlmModelId={setRestoreLlmModelId}
                onSetRestoreTemperature={setRestoreTemperature}
                onSetRestoreMaxTokens={setRestoreMaxTokens}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Providers Detail Content
// ============================================================
interface ProvidersTabProps {
  providers: UnifiedProvider[];
  onToggleProvider: (id: string) => void;
  onUpdateProvider: (id: string, updates: Partial<UnifiedProvider>) => void;
  onRemoveProvider: (id: string) => void;
  onAddProvider: (label: string, type: 'openai-compat' | 'anthropic', baseUrl: string, apiKey: string) => void;
  onToggleModel: (providerId: string, modelId: string) => void;
  onAddModel: (providerId: string, id: string, label: string, capabilities: ModelCapability) => void;
  onUpdateModel: (providerId: string, modelId: string, updates: Partial<UnifiedModel>) => void;
  onRemoveModel: (providerId: string, modelId: string) => void;
}

const ProvidersTabContent: React.FC<ProvidersTabProps> = ({
  providers,
  onToggleProvider,
  onUpdateProvider,
  onRemoveProvider,
  onAddProvider,
  onToggleModel,
  onAddModel,
  onUpdateModel,
  onRemoveModel,
}) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [addingModelFor, setAddingModelFor] = useState<string | null>(null);
  const [newModelId, setNewModelId] = useState('');
  const [newModelLabel, setNewModelLabel] = useState('');
  const [newModelCapability, setNewModelCapability] = useState<ModelCapability>('llm');
  const [addingProvider, setAddingProvider] = useState(false);
  
  // Custom Provider State
  const [newProviderLabel, setNewProviderLabel] = useState('');
  const [newProviderType, setNewProviderType] = useState<'openai-compat' | 'anthropic'>('openai-compat');
  const [newProviderBaseUrl, setNewProviderBaseUrl] = useState('');
  const [newProviderApiKey, setNewProviderApiKey] = useState('');
  
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const toggleShowKey = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddModelSubmit = (providerId: string) => {
    if (!newModelId.trim()) return;
    onAddModel(providerId, newModelId.trim(), newModelLabel.trim() || newModelId.trim(), newModelCapability);
    setAddingModelFor(null);
    setNewModelId('');
    setNewModelLabel('');
    setNewModelCapability('llm');
  };

  const handleAddProviderSubmit = () => {
    if (!newProviderLabel.trim() || !newProviderBaseUrl.trim()) return;
    onAddProvider(newProviderLabel.trim(), newProviderType, newProviderBaseUrl.trim(), newProviderApiKey.trim());
    setAddingProvider(false);
    setNewProviderLabel('');
    setNewProviderType('openai-compat');
    setNewProviderBaseUrl('');
    setNewProviderApiKey('');
  };

  const activeProvidersCount = providers.filter(p => p.enabled).length;

  return (
    <div className="animate-in fade-in duration-300 space-y-8 pb-12">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">模型提供商管理</h3>
        <p className="text-slate-500 text-sm mt-1">目前已启用 {activeProvidersCount} 个接入凭据，大模型能力可在各种工作流中全局调用。</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {providers.map(provider => {
          const activeModelsCount = provider.models.filter(m => m.enabled).length;

          return (
            <div
              key={provider.id}
              className={`rounded-2xl border transition-all duration-200 bg-white ${
                provider.enabled 
                  ? 'border-indigo-100 shadow-[0_4px_20px_-4px_rgba(79,70,229,0.08)] ring-1 ring-indigo-50/50' 
                  : 'border-slate-200 opacity-80'
              }`}
            >
              {/* Provider Header Block */}
              <div className="flex flex-wrap items-center gap-4 px-6 py-5 border-b border-slate-100 bg-slate-50/30 rounded-t-2xl">
                <div 
                  className={`flex items-center justify-center w-6 h-6 rounded border cursor-pointer ${
                    provider.enabled ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm' : 'bg-white border-slate-300 text-transparent hover:border-indigo-300'
                  } transition-colors flex-shrink-0`}
                  onClick={() => onToggleProvider(provider.id)}
                >
                  <CheckCircle2 size={16} strokeWidth={3} className={provider.enabled ? 'text-white' : 'text-slate-100/0'} />
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${provider.enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                      {provider.label}
                    </span>
                    <span className="text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200/60 text-slate-500 font-medium shadow-sm">
                      {provider.type === 'anthropic' ? 'Anthropic' : 'OpenAI Compat'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {provider.enabled ? (
                      activeModelsCount > 0 ? (
                        <span className="text-indigo-600 font-medium">已激活 {activeModelsCount} 个端点</span>
                      ) : '暂无可用端点在路由中'
                    ) : (
                      '已在全局路由中停用'
                    )}
                  </div>
                </div>

                <div className="ml-auto flex shrink-0">
                  <button
                    onClick={() => {
                       if (provider.isDefault) {
                         setDeleteConfirm(provider.id);
                       } else {
                         setDeleteConfirm(provider.id);
                       }
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title={provider.isDefault ? '默认提供商不允许删除' : '卸载提供商'}
                    disabled={provider.isDefault}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Provider Body Block */}
              <div className={`p-6 transition-all ${provider.enabled ? 'opacity-100' : 'opacity-60 pointer-events-none'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Global Credentials */}
                  <div className="lg:col-span-5 space-y-5">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
                        <Settings className="text-indigo-500" size={16} /> 
                        底层连接配置
                      </h4>
                      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Base URL</label>
                          <input
                            type="text"
                            value={provider.baseUrl}
                            onChange={e => onUpdateProvider(provider.id, { baseUrl: e.target.value })}
                            disabled={provider.isDefault}
                            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 font-mono shadow-sm transition-all disabled:bg-slate-100 disabled:text-slate-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">API Secret Key</label>
                          <div className="relative">
                            <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type={showKeys[provider.id] ? 'text' : 'password'}
                              value={provider.apiKey}
                              onChange={e => onUpdateProvider(provider.id, { apiKey: e.target.value })}
                              className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 font-mono shadow-sm transition-all"
                              placeholder="sk-..."
                            />
                            <button
                              onClick={() => toggleShowKey(provider.id)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showKeys[provider.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Models */}
                  <div className="lg:col-span-7">
                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-4">
                      <Database className="text-indigo-500" size={16} />
                      授权模型列表
                    </h4>
                    <div className="space-y-3">
                      {provider.models.map(model => (
                        <div
                          key={model.id}
                          className="flex flex-wrap sm:flex-nowrap items-center gap-3 py-2.5 px-3.5 rounded-xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                        >
                          <input
                            type="checkbox"
                            checked={model.enabled}
                            onChange={() => onToggleModel(provider.id, model.id)}
                            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                          />
                          <input
                            type="text"
                            value={model.id}
                            onChange={e => onUpdateModel(provider.id, model.id, { id: e.target.value })}
                            disabled={provider.isDefault}
                            className="flex-1 min-w-[120px] text-sm px-2 py-1.5 rounded bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-mono text-slate-700 disabled:text-slate-500 disabled:hover:bg-transparent transition-all border border-transparent hover:border-slate-200"
                          />
                          <input
                            type="text"
                            value={model.label}
                            onChange={e => onUpdateModel(provider.id, model.id, { label: e.target.value })}
                            disabled={provider.isDefault}
                            className="w-32 text-sm px-2 py-1.5 rounded bg-transparent hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-700 disabled:text-slate-500 disabled:hover:bg-transparent transition-all border border-transparent hover:border-slate-200"
                          />
                          <span className={`flex-shrink-0 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                            model.capabilities === 'llm'
                              ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/10'
                              : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10'
                          }`}>
                            {model.capabilities}
                          </span>
                          <button
                            onClick={() => {
                              if (provider.isDefault && provider.models.length <= 1) {
                                setDeleteConfirm(`model::${provider.id}::${model.id}`);
                              } else {
                                onRemoveModel(provider.id, model.id);
                              }
                            }}
                            className="p-1.5 shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1"
                            disabled={provider.isDefault}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      {addingModelFor === provider.id ? (
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <input
                            type="text"
                            value={newModelId}
                            onChange={e => setNewModelId(e.target.value)}
                            placeholder="如: deepseek-chat"
                            className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white font-mono focus:ring-2 focus:ring-indigo-500/30 shadow-sm"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={newModelLabel}
                            onChange={e => setNewModelLabel(e.target.value)}
                            placeholder="UI 名称"
                            className="w-32 text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/30 shadow-sm"
                          />
                          <select
                            value={newModelCapability}
                            onChange={e => setNewModelCapability(e.target.value as ModelCapability)}
                            className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/30 shadow-sm"
                          >
                            <option value="llm">LLM</option>
                            <option value="ocr">OCR</option>
                          </select>
                          <div className="flex items-center gap-1 shrink-0 ml-1">
                            <button
                              onClick={() => handleAddModelSubmit(provider.id)}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => { setAddingModelFor(null); setNewModelId(''); setNewModelLabel(''); }}
                              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingModelFor(provider.id)}
                          className="flex items-center justify-center gap-2 w-full mt-2 py-3 text-sm font-medium text-indigo-600 bg-slate-50/50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 border-dashed rounded-xl transition-all"
                        >
                          <Plus size={16} />
                          注册新的大模型 ID
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Global Provider */}
        {addingProvider ? (
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
            <h3 className="text-lg font-bold text-slate-800 mb-6">配置并引入新大模型供应商</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">服务商显示名称</label>
                <input
                  type="text"
                  value={newProviderLabel}
                  onChange={e => setNewProviderLabel(e.target.value)}
                  placeholder="如: DeepSeek 官方"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium bg-slate-50 focus:bg-white"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">标准网关类型</label>
                <select
                  value={newProviderType}
                  onChange={e => setNewProviderType(e.target.value as 'openai-compat' | 'anthropic')}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium bg-slate-50 focus:bg-white"
                >
                  <option value="openai-compat">OpenAI Compatible (如 VLLM, 多数云厂商)</option>
                  <option value="anthropic">Anthropic API</option>
                </select>
              </div>
              
              <div className="md:col-span-2 space-y-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Base URL</label>
                  <input
                    type="text"
                    value={newProviderBaseUrl}
                    onChange={e => setNewProviderBaseUrl(e.target.value)}
                    placeholder="如: https://api.deepseek.com/v1"
                    className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">API Secret (Bearer Token)</label>
                  <input
                    type="password"
                    value={newProviderApiKey}
                    onChange={e => setNewProviderApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => {
                  setAddingProvider(false);
                  setNewProviderLabel('');
                  setNewProviderBaseUrl('');
                  setNewProviderApiKey('');
                }}
                className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddProviderSubmit}
                disabled={!newProviderLabel.trim() || !newProviderBaseUrl.trim()}
                className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 shadow-sm transition-all shadow-indigo-200"
              >
                验证并引入
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAddingProvider(true)}
            className="flex flex-col items-center justify-center gap-3 w-full py-10 bg-white border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 hover:bg-indigo-50/20 group transition-all duration-300"
          >
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 text-slate-400 transition-colors">
              <Plus size={24} />
            </div>
            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">接入新的基础设施提供商</span>
          </button>
        )}
      </div>

      {deleteConfirm && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-slate-100 animate-in zoom-in-95 duration-200">
             <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-5">
               <Trash2 size={24} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">
               {deleteConfirm.startsWith('model::') ? '永久移除该模型?' : '永久移除提供商?'}
             </h3>
             <p className="text-slate-500 mb-6 leading-relaxed text-sm">
               此操作将断开连接配置，任何正在使用此配置的依赖任务都会报错。确认继续吗？
             </p>
             <div className="flex justify-end gap-3">
               <button
                 onClick={() => setDeleteConfirm(null)}
                 className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
               >
                 我不删了
               </button>
               <button
                 onClick={() => {
                   if (deleteConfirm.startsWith('model::')) {
                     const [, providerId, modelId] = deleteConfirm.split('::');
                     onRemoveModel(providerId, modelId);
                   } else {
                     onRemoveProvider(deleteConfirm);
                   }
                   setDeleteConfirm(null);
                 }}
                 className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 shadow-sm transition-colors"
               >
                 确认永久删除
               </button>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

// ============================================================
// Restore Settings Detail Content
// ============================================================
interface RestoreTabProps {
  restoreMode: RestoreMode;
  restoreFormat: RestoreFormat;
  restorePrompt: string;
  restoreLlmModelId: string;
  restoreTemperature: number;
  restoreMaxTokens: number;
  providers: UnifiedProvider[];
  onSetRestoreMode: (mode: RestoreMode) => void;
  onSetRestoreFormat: (format: RestoreFormat) => void;
  onSetRestorePrompt: (prompt: string) => void;
  onSetRestoreLlmModelId: (id: string) => void;
  onSetRestoreTemperature: (temp: number) => void;
  onSetRestoreMaxTokens: (tokens: number) => void;
}

const RestoreTabContent: React.FC<RestoreTabProps> = ({
  restoreMode,
  restoreFormat,
  restorePrompt,
  restoreLlmModelId,
  restoreTemperature,
  restoreMaxTokens,
  providers,
  onSetRestoreMode,
  onSetRestoreFormat,
  onSetRestorePrompt,
  onSetRestoreLlmModelId,
  onSetRestoreTemperature,
  onSetRestoreMaxTokens,
}) => {
  // Get flat list of enabled LLMs
  const availableLlmModels = useMemo(() => {
    return providers
      .filter(p => p.enabled)
      .flatMap(p => 
        p.models
          .filter(m => m.enabled && m.capabilities === 'llm')
          .map(m => ({
             providerId: p.id,
             providerLabel: p.label,
             modelId: m.id,
             modelLabel: m.label,
             fullId: `${p.id}::${m.id}`
          }))
      );
  }, [providers]);

  // Handle Default selecting first available model if it is unset or invalid
  useEffect(() => {
    if (availableLlmModels.length > 0) {
      if (!restoreLlmModelId || !availableLlmModels.find(m => m.fullId === restoreLlmModelId)) {
        onSetRestoreLlmModelId(availableLlmModels[0].fullId);
      }
    }
  }, [availableLlmModels, restoreLlmModelId, onSetRestoreLlmModelId]);

  return (
    <div className="animate-in fade-in duration-300 space-y-8 pb-12 max-w-4xl">
      <div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">全局还原管线设定</h3>
        <p className="text-slate-500 text-sm mt-1">控制系统对 OCR 原文本的下游处理行为。配置后的逻辑将在右边栏的重构面板全局共享。</p>
      </div>

      <div className="flex flex-col gap-5">
        
        {/* Default Mode */}
        <div 
          onClick={() => onSetRestoreMode('default')}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
            restoreMode === 'default' 
              ? 'border-indigo-600 bg-indigo-50/20 shadow-md shadow-indigo-100/50' 
              : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
          }`}
        >
          <div className="flex gap-4 items-start">
            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              restoreMode === 'default' ? 'border-indigo-600' : 'border-slate-300'
            }`}>
              {restoreMode === 'default' && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
            </div>
            
            <div className="flex-1">
               <div className="flex items-center gap-2 mb-2">
                 <FileBox size={20} className={restoreMode === 'default' ? 'text-indigo-600' : 'text-slate-400'} />
                 <h4 className={`text-lg font-bold ${restoreMode === 'default' ? 'text-indigo-900' : 'text-slate-800'}`}>
                   规则引擎无损渲染 (Default Local Mode)
                 </h4>
               </div>
               <p className="text-sm text-slate-500 leading-relaxed mb-6">
                 静默解析底层多模态返回的结构化切片数据，0 Token 成本，瞬间成型。适合简单的公式流和极高确信度的无扭曲版面。
               </p>
               
               <div className={`transition-all duration-300 overflow-hidden ${restoreMode === 'default' ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm inline-block">
                     <label className="block text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3">目标渲染格式</label>
                     <div className="flex gap-2">
                        {(['auto', 'md', 'html', 'json'] as RestoreFormat[]).map(fmt => (
                          <button
                            key={fmt}
                            onClick={(e) => { e.stopPropagation(); onSetRestoreFormat(fmt); }}
                            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all border ${
                              restoreFormat === fmt
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                          >
                            {fmt.toUpperCase()}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* AI Mode */}
        <div 
          onClick={() => onSetRestoreMode('prompt')}
          className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
            restoreMode === 'prompt' 
              ? 'border-purple-600 bg-white shadow-xl shadow-purple-100/50 relative overflow-hidden' 
              : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-sm'
          }`}
        >
          {restoreMode === 'prompt' && (
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 rounded-bl-[100px] -z-10 blur-xl"></div>
          )}
          
          <div className="flex gap-4 items-start relative z-0">
            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
              restoreMode === 'prompt' ? 'border-purple-600' : 'border-slate-300'
            }`}>
              {restoreMode === 'prompt' && <div className="w-2.5 h-2.5 bg-purple-600 rounded-full" />}
            </div>
            
            <div className="flex-1 w-full">
               <div className="flex items-center gap-2 mb-2">
                 <Wand2 size={20} className={restoreMode === 'prompt' ? 'text-purple-600' : 'text-slate-400'} />
                 <h4 className={`text-lg font-bold ${restoreMode === 'prompt' ? 'text-purple-900' : 'text-slate-800'}`}>
                   深度思考 AI 重构流 (LLM Prompt Pipeline)
                 </h4>
               </div>
               <p className="text-sm text-slate-500 leading-relaxed mb-6">
                 直接赋予重构大脑大模型的强逻辑与推断力。解决 OCR 乱序、结构错位、漏字错别字等疑难杂症，通过 Few-shot 或缜密的神级 System Prompt，实现脱胎换骨的再造。
               </p>

               <div className={`transition-all duration-500 origin-top overflow-hidden ${restoreMode === 'prompt' ? 'max-h-[1200px] opacity-100 scale-y-100' : 'max-h-0 opacity-0 scale-y-95 pointer-events-none'}`}>
                  
                  {/* LLM Resource Assignment */}
                  <div className="mb-6 p-5 rounded-xl border border-purple-100 bg-purple-50/50">
                    <h5 className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
                      1. 分配重构神经元模型
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                       <div>
                         <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">执行大模型</label>
                         <select
                           value={restoreLlmModelId}
                           onChange={e => onSetRestoreLlmModelId(e.target.value)}
                           className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-purple-500/30 transition-all font-semibold text-slate-800 cursor-pointer"
                         >
                           {availableLlmModels.length === 0 && <option value="" disabled>暂无可用 LLM，前往资产管理添加</option>}
                           {availableLlmModels.map(m => (
                             <option key={m.fullId} value={m.fullId}>
                               [{m.providerLabel}] {m.modelLabel}
                             </option>
                           ))}
                         </select>
                       </div>
                       <div>
                          <label className="flex justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                            <span>Temperature (创造力)</span>
                            <span className="text-purple-600 font-mono">{restoreTemperature.toFixed(2)}</span>
                          </label>
                          <div className="pt-2 px-1">
                            <input
                              type="range"
                              min="0"
                              max="2"
                              step="0.05"
                              value={restoreTemperature}
                              onChange={e => onSetRestoreTemperature(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium">
                              <span>0 (确定性输出)</span>
                              <span>2 (天马行空)</span>
                            </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Prompt Engineering Space */}
                  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                       <h5 className="text-sm font-bold text-slate-800">
                         2. Global Super Prompt (通用全局底层指令)
                       </h5>
                    </div>
                    <div className="p-5 flex flex-col xl:flex-row gap-6">
                       
                       {/* Editor */}
                       <div className="flex-1 flex flex-col">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
                            <span>System & User Unified Template</span>
                          </label>
                          <textarea
                            value={restorePrompt}
                            onChange={e => onSetRestorePrompt(e.target.value)}
                            placeholder="请利用您的理解能力重新排版下方的内容...\n原图: {{source_image}}\n识别文稿: {{ocr_text}}"
                            className="w-full h-56 text-sm p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 transition-all font-mono leading-relaxed resize-y placeholder-slate-400"
                          />
                       </div>

                       {/* Variables Sheet */}
                       <div className="w-full xl:w-72 shrink-0 bg-blue-50/50 border border-blue-100 rounded-xl p-5 flex flex-col">
                          <h6 className="text-[11px] font-bold text-blue-800 uppercase tracking-widest mb-4">合法运行时上下文宏</h6>
                          
                          <div className="space-y-4">
                            <div className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm">
                               <code className="text-xs font-bold font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 block mb-2 w-max">
                                 {'{' + '{' + 'source_image' + '}' + '}'}
                               </code>
                               <p className="text-xs text-slate-600 leading-relaxed">
                                 将当前正在处理的 PDF/图像切片页转化为 Base64 URLs 发送给多模态大模型。
                               </p>
                            </div>
                            <div className="bg-white border border-blue-100 rounded-lg p-3 shadow-sm">
                               <code className="text-xs font-bold font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 block mb-2 w-max">
                                 {'{' + '{' + 'ocr_text' + '}' + '}'}
                               </code>
                               <p className="text-xs text-slate-600 leading-relaxed">
                                 引擎自动注入此页的顶层 Raw Text 获取的 JSON 字符串内容。
                               </p>
                            </div>
                          </div>

                          <div className="mt-auto pt-6 pb-1">
                             <div className="px-3 py-2 bg-slate-800 rounded-lg text-xs leading-relaxed text-slate-300 relative overflow-hidden">
                               <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
                               此设定仅仅构成了 "底层基座"。在工作台右栏，您可以毫无阻力地【魔改】这些配置针对临时需要！
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
