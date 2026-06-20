import { useState } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import {
  AI_MODEL_PROVIDERS,
  DASHSCOPE_MODELS,
  VOLCENGINE_MODELS,
} from '../types';
import { Settings, X, Eye, EyeOff, Key, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

export function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { modelConfig, setModelProvider, setApiKey, setModelName } = useGeneratorStore();
  const [showApiKey, setShowApiKey] = useState(false);

  const getModelOptions = () => {
    switch (modelConfig.provider) {
      case 'dashscope':
        return DASHSCOPE_MODELS;
      case 'volcengine':
        return VOLCENGINE_MODELS;
      default:
        return [];
    }
  };

  const needsApiKey = modelConfig.provider !== 'trae';
  const needsModelName = modelConfig.provider !== 'trae';

  const getModelLabel = () => {
    const models = getModelOptions();
    const found = models.find((m) => m.value === modelConfig.modelName);
    return found?.label || modelConfig.modelName;
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-sm bg-game-card border border-game-border hover:border-neon-purple/50 transition-colors"
      >
        <Settings className="w-4 h-4 text-gray-400" />
        <span className="font-mono text-xs text-gray-400">模型设置</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md mx-4 bg-game-card border-2 border-game-border rounded-sm shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-game-border shrink-0">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-neon-purple" />
                <h3 className="font-pixel text-sm text-neon-purple">AI 模型设置</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-game-bg rounded-sm transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                  模型提供商
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {AI_MODEL_PROVIDERS.map((option) => {
                    const isSelected = modelConfig.provider === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setModelProvider(option.value);
                          if (option.value === 'dashscope') {
                            setModelName(DASHSCOPE_MODELS[0].value);
                          } else if (option.value === 'volcengine') {
                            setModelName(VOLCENGINE_MODELS[0].value);
                          } else {
                            setModelName('');
                          }
                        }}
                        className={cn(
                          'flex flex-col items-start gap-1 p-3 rounded-sm border-2 transition-all duration-200 text-left',
                          isSelected
                            ? 'bg-neon-purple/20 border-neon-purple shadow-neon-purple'
                            : 'bg-game-bg border-game-border hover:border-neon-purple/50'
                        )}
                      >
                        <span className={cn(
                          'font-mono text-sm',
                          isSelected ? 'text-neon-purple' : 'text-gray-300'
                        )}>
                          {option.label}
                        </span>
                        <span className="font-mono text-xs text-gray-500">
                          {option.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {needsModelName && (
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                    模型版本
                  </label>
                  <select
                    value={modelConfig.modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className={cn(
                      'w-full p-3 rounded-sm',
                      'bg-game-bg border-2 border-game-border',
                      'font-mono text-sm text-white',
                      'focus:outline-none focus:border-neon-purple transition-colors',
                      'cursor-pointer'
                    )}
                  >
                    {getModelOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {modelConfig.provider === 'dashscope' && (
                    <p className="font-mono text-xs text-gray-600">
                      {modelConfig.modelName.startsWith('qwen-image')
                        ? 'Qwen-Image 系列擅长文字渲染与复杂布局'
                        : modelConfig.modelName.startsWith('wan2.6')
                          ? '万相 2.6 最新版，支持同步调用，体验最佳'
                          : '万相 2.2 极速版，异步调用，速度更快'}
                    </p>
                  )}
                </div>
              )}

              {needsApiKey && (
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-3 h-3" />
                    API Key
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={modelConfig.apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="请输入 API Key"
                      className={cn(
                        'w-full p-3 pr-10 rounded-sm',
                        'bg-game-bg border-2 border-game-border',
                        'font-mono text-sm text-white placeholder-gray-500',
                        'focus:outline-none focus:border-neon-purple transition-colors'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xs text-gray-500">
                    {modelConfig.provider === 'dashscope' && (
                      <>API Key 请在 <span className="text-neon-cyan">bailian.console.aliyun.com</span> 获取</>
                    )}
                    {modelConfig.provider === 'volcengine' && (
                      <>API Key 请在 <span className="text-neon-cyan">console.volcengine.com/ark</span> 获取</>
                    )}
                  </p>
                </div>
              )}

              {needsApiKey && !modelConfig.apiKey && (
                <div className="p-3 rounded-sm bg-amber-500/10 border border-amber-500/30">
                  <p className="font-mono text-xs text-amber-400">
                    ⚠️ 请先配置 API Key 后再使用该模型
                  </p>
                </div>
              )}

              <div className="p-3 rounded-sm bg-game-bg border border-game-border">
                <p className="font-mono text-xs text-gray-400">
                  <span className="text-neon-green">●</span> 当前模型：
                  <span className="text-white ml-1">
                    {AI_MODEL_PROVIDERS.find(p => p.value === modelConfig.provider)?.label}
                    {modelConfig.modelName && ` · ${getModelLabel()}`}
                  </span>
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-game-border shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className={cn(
                  'w-full p-3 rounded-sm font-mono text-sm',
                  'bg-neon-purple/20 border-2 border-neon-purple text-neon-purple',
                  'hover:bg-neon-purple/30 transition-colors'
                )}
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
