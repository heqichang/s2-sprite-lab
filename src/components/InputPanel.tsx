import { useGeneratorStore } from '../store/useGeneratorStore';
import { ASSET_TYPE_OPTIONS, ART_STYLE_OPTIONS, IMAGE_SIZE_OPTIONS } from '../types';
import { PixelButton } from './PixelButton';
import { Wand2, User, Skull, Package, Swords, Image, Star, Sparkles } from 'lucide-react';
import { useImageGenerator } from '../hooks/useImageGenerator';
import { cn } from '../lib/utils';

const iconMap: Record<string, React.ElementType> = {
  User,
  Skull,
  Package,
  Swords,
  Image,
  Star,
};

export function InputPanel() {
  const {
    prompt,
    type,
    style,
    size,
    setPrompt,
    setType,
    setStyle,
    setSize,
    isGenerating,
    error,
  } = useGeneratorStore();

  const { generateImage, progress } = useImageGenerator();

  return (
    <div className="flex flex-col gap-5 h-full">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-neon-purple" />
        <h2 className="font-pixel text-sm text-neon-purple">素材生成器</h2>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
          素材描述
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="例如：一把散发蓝光的魔法剑，镶嵌紫色宝石..."
          className={cn(
            'w-full h-32 p-4 rounded-sm',
            'bg-game-bg border-2 border-game-border',
            'font-mono text-sm text-white placeholder-gray-500',
            'focus:outline-none focus:border-neon-purple transition-colors',
            'resize-none'
          )}
          disabled={isGenerating}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
          素材类型
        </label>
        <div className="grid grid-cols-3 gap-2">
          {ASSET_TYPE_OPTIONS.map((option) => {
            const IconComponent = iconMap[option.icon];
            const isSelected = type === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setType(option.value)}
                disabled={isGenerating}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-sm border-2 transition-all duration-200',
                  'font-mono text-xs uppercase tracking-wider',
                  isSelected
                    ? 'bg-neon-purple/20 border-neon-purple text-neon-purple shadow-neon-purple'
                    : 'bg-game-bg border-game-border text-gray-400 hover:border-neon-purple/50 hover:text-neon-purple/70',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {IconComponent && <IconComponent className="w-5 h-5" />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
          画风风格
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value as typeof style)}
          disabled={isGenerating}
          className={cn(
            'w-full p-3 rounded-sm',
            'bg-game-bg border-2 border-game-border',
            'font-mono text-sm text-white',
            'focus:outline-none focus:border-neon-purple transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'cursor-pointer'
          )}
        >
          {ART_STYLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
          输出尺寸
        </label>
        <div className="grid grid-cols-3 gap-2">
          {IMAGE_SIZE_OPTIONS.map((option) => {
            const isSelected = size === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSize(option.value)}
                disabled={isGenerating}
                className={cn(
                  'p-3 rounded-sm border-2 transition-all duration-200',
                  'font-mono text-xs',
                  isSelected
                    ? 'bg-neon-blue/20 border-neon-blue text-neon-blue shadow-neon-blue'
                    : 'bg-game-bg border-game-border text-gray-400 hover:border-neon-blue/50 hover:text-neon-blue/70',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {option.value}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-sm bg-red-500/10 border-2 border-red-500/50">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="mt-auto">
        {isGenerating && (
          <div className="mb-3">
            <div className="h-2 bg-game-bg rounded-sm border border-game-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-mono text-xs text-gray-400 mt-2 text-center animate-pulse">
              正在生成素材... {progress}%
            </p>
          </div>
        )}
        <PixelButton
          variant="primary"
          size="lg"
          className="w-full"
          icon={<Wand2 className="w-5 h-5" />}
          onClick={generateImage}
          disabled={isGenerating}
        >
          {isGenerating ? '生成中...' : '生成素材'}
        </PixelButton>
      </div>
    </div>
  );
}
