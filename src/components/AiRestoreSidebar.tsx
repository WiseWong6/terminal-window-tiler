import React, { useState, useMemo } from 'react';
import { Play, Loader2, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { useStore } from '../state/store';
import { getUnifiedProviders } from '../services/configAdapter';
import MarkdownRenderer from './MarkdownRenderer';

// We implement a standalone fetch for the LLM stream or block here
async function callLlmForRestore(
  providerId: string,
  modelId: string,
  prompt: string,
  temperature: number,
  maxTokens: number
): Promise<string> {
  const providers = getUnifiedProviders();
  const provider = providers.find(p => p.id === providerId);
  if (!provider || !provider.enabled) throw new Error('模型服务商未配置或被禁用');
  
  const model = provider.models.find(m => m.id === modelId);
  if (!model || !model.enabled) throw new Error('指定的模型未启用');

  const messages = [
    { role: 'user', content: prompt }
  ];

  const body: any = {
    model: modelId,
    messages,
    stream: false,
    temperature,
    max_tokens: maxTokens
  };

  const isAnthropic = provider.type === 'anthropic';
  const url = isAnthropic ? `${provider.baseUrl}/v1/messages` : `${provider.baseUrl}/chat/completions`;
  const headers: any = {
    'Content-Type': 'application/json',
  };

  if (isAnthropic) {
    headers['x-api-key'] = provider.apiKey;
    headers['anthropic-version'] = '2023-06-01';
    headers['anthropic-dangerous-direct-browser-access'] = 'true';
    body.max_tokens = maxTokens;
  } else {
    headers['Authorization'] = `Bearer ${provider.apiKey}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API 请求失败: ${res.status}`);
  }

  const data = await res.json();
  if (isAnthropic) {
     return data.content?.find((b: any) => b.type === 'text')?.text || '';
  } else {
     return data.choices?.[0]?.message?.content || '';
  }
}

const AiRestoreSidebar: React.FC = () => {
  const { state, activeGroup } = useStore();
  const [sourceTaskId, setSourceTaskId] = useState<string>('');
  const [localPrompt, setLocalPrompt] = useState(state.restorePrompt);
  
  const [isRunning, setIsRunning] = useState(false);
  const [resultText, setResultText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize local prompt when global prompt changes
  React.useEffect(() => {
    setLocalPrompt(state.restorePrompt);
  }, [state.restorePrompt]);

  const tasks = activeGroup?.tasks || [];
  const finishedTasks = tasks.filter(t => t.status === 'done');
  
  // Auto-select first finished task if none selected
  React.useEffect(() => {
    if (!sourceTaskId && finishedTasks.length > 0) {
      setSourceTaskId(finishedTasks[0].id);
    }
  }, [finishedTasks, sourceTaskId]);

  const handleRun = async () => {
    if (!sourceTaskId) return;
    const task = tasks.find(t => t.id === sourceTaskId);
    if (!task) return;

    const pageData = task.pagesData[state.currentPage - 1];
    if (!pageData || !pageData.rawOCR) {
       setErrorMsg('当前页没有提取到 OCR 文本。');
       return;
    }

    if (!state.restoreLlmModelId) {
       setErrorMsg('未配置 AI 重构使用的大模型，请前往设置中心配置。');
       return;
    }

    setIsRunning(true);
    setErrorMsg('');
    setResultText('');

    try {
      const [providerId, modelId] = state.restoreLlmModelId.split('::');
      if (!providerId || !modelId) throw new Error('大模型ID格式错误');

      // Replace variables in prompt
      let finalPrompt = localPrompt;
      finalPrompt = finalPrompt.replace(/\{\{ocr_text\}\}/g, pageData.rawOCR);
      // NOTE: source_image is mocked here since passing raw base64 of huge images to non-VLM LLMs will crash.
      // In a real VLM pipeline, we would format this as multi-modal message array.
      finalPrompt = finalPrompt.replace(/\{\{source_image\}\}/g, '[Image Context Bound]');

      const res = await callLlmForRestore(
        providerId, 
        modelId, 
        finalPrompt, 
        state.restoreTemperature, 
        state.restoreMaxTokens
      );

      setResultText(res);
    } catch (err: any) {
      setErrorMsg(err.message || '重构失败');
    } finally {
      setIsRunning(false);
    }
  };

  if (state.restoreMode !== 'prompt') {
    return null; // Don't render if not in AI mode
  }

  return (
    <div className="w-[360px] shrink-0 border-l border-slate-200 bg-white flex flex-col h-full shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
      <div className="flex-none px-4 py-3 border-b border-slate-200 bg-purple-50/50 flex items-center justify-between">
         <div className="flex items-center gap-2">
           <Sparkles size={16} className="text-purple-600" />
           <span className="font-bold text-sm text-purple-900">AI 智能重构流</span>
         </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
         {/* Config Panel */}
         <div className="p-4 space-y-4 border-b border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">数据抽取源 (OCR Text)</label>
              <select 
                value={sourceTaskId}
                onChange={e => setSourceTaskId(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500/30"
              >
                {finishedTasks.length === 0 && <option value="" disabled>当前无已完成的 OCR 任务</option>}
                {finishedTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.modelLabel}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase mb-2">
                <span>动态提示词 (Prompt)</span>
                <button 
                  onClick={() => setLocalPrompt(state.restorePrompt)}
                  className="text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  title="恢复为全局设定的 Prompt"
                >
                  <RefreshCw size={10} /> 恢复默认
                </button>
              </label>
              <textarea
                value={localPrompt}
                onChange={e => setLocalPrompt(e.target.value)}
                className="w-full h-32 text-xs p-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 font-mono resize-y"
              />
            </div>

            <button
               onClick={handleRun}
               disabled={isRunning || !sourceTaskId}
               className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl shadow-sm shadow-purple-200 font-bold transition-all"
            >
               {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} className="fill-current" />}
               {isRunning ? '大模型推理中...' : '对当前页执行 AI 重构'}
            </button>
         </div>

         {/* Result Panel */}
         <div className="flex-1 flex flex-col min-h-0 p-4 bg-slate-50">
           <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
             <Layers size={14} /> 模型输出结果
           </h4>
           
           <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-white p-4 shadow-sm relative">
             {errorMsg && (
                <div className="absolute inset-x-4 top-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{errorMsg}</span>
                </div>
             )}

             {!resultText && !errorMsg && !isRunning && (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  点击按钮开始重构
                </div>
             )}

             {isRunning && !resultText && (
                <div className="h-full flex items-center justify-center text-purple-400 text-sm gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                  等待响应...
                </div>
             )}

             {resultText && (
                <MarkdownRenderer content={resultText} />
             )}
           </div>
         </div>
      </div>
    </div>
  );
};

export default AiRestoreSidebar;
