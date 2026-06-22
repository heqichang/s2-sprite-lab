import { useGeneratorStore } from '../store/useGeneratorStore';
import { PixelButton } from './PixelButton';
import {
  SPRITE_SUBTYPE_OPTIONS,
  GENDER_OPTIONS,
  PROFESSION_OPTIONS,
  BODYTYPE_OPTIONS,
  CLOTHING_OPTIONS,
  WEAPON_OPTIONS,
  FACING_OPTIONS,
  POSE_OPTIONS,
  DEFAULT_COLOR_SCHEMES,
  ART_STYLE_OPTIONS,
  IMAGE_SIZE_OPTIONS,
  ArtStyle,
  ImageSize,
  Gender,
  BodyType,
  Facing,
} from '../types';
import { useImageGenerator } from '../hooks/useImageGenerator';
import { cn } from '../lib/utils';
import {
  Wand2,
  RotateCcw,
  Sword,
  Users,
  Bug,
  Crown,
  Heart,
  Shield,
  Sparkles,
  Palette,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

const subtypeIconMap: Record<string, React.ElementType> = {
  Sword,
  Users,
  Bug,
  Crown,
  Heart,
  Shield,
  Sparkles,
};

export function SpriteConfigPanel() {
  const {
    prompt,
    style,
    size,
    setPrompt,
    setStyle,
    setSize,
    isGenerating,
    error,
    setType,
    editorState,
    setSpriteConfig,
    setColorScheme,
    resetSpriteConfig,
  } = useGeneratorStore();

  const { spriteConfig } = editorState;
  const { generateSprite, progress } = useImageGenerator();
  const [showAdvanced, setShowAdvanced] = useState(true);

  const handleGenerate = () => {
    if (spriteConfig.subType === 'player' || spriteConfig.subType === 'npc') {
      setType('character');
    } else if (spriteConfig.subType === 'normal-monster' || spriteConfig.subType === 'boss') {
      setType('monster');
    } else {
      setType('character');
    }
    generateSprite(spriteConfig);
  };

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-amber" />
          <h2 className="font-pixel text-sm text-neon-amber">精灵生成器</h2>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 font-mono text-xs text-gray-400 hover:text-neon-cyan transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showAdvanced ? '收起' : '展开'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
          精灵类型
        </label>
        <div className="grid grid-cols-4 gap-2">
          {SPRITE_SUBTYPE_OPTIONS.map((option) => {
            const IconComponent = subtypeIconMap[option.icon];
            const isSelected = spriteConfig.subType === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setSpriteConfig({ subType: option.value })}
                disabled={isGenerating}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-sm border-2 transition-all duration-200',
                  'font-mono text-[10px] uppercase tracking-wider',
                  isSelected
                    ? 'bg-neon-amber/20 border-neon-amber text-neon-amber shadow-neon-amber'
                    : 'bg-game-bg border-game-border text-gray-400 hover:border-neon-amber/50 hover:text-neon-amber/70',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {IconComponent && <IconComponent className="w-4 h-4" />}
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {showAdvanced && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                性别
              </label>
              <select
                value={spriteConfig.gender}
                onChange={(e) => setSpriteConfig({ gender: e.target.value as Gender })}
                disabled={isGenerating}
                className={cn(
                  'w-full p-2 rounded-sm',
                  'bg-game-bg border-2 border-game-border',
                  'font-mono text-xs text-white',
                  'focus:outline-none focus:border-neon-purple transition-colors',
                  'disabled:opacity-50 cursor-pointer'
                )}
              >
                {GENDER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {(spriteConfig.subType === 'player' || spriteConfig.subType === 'npc') && (
              <div className="flex flex-col gap-2">
                <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                  职业
                </label>
                <select
                  value={spriteConfig.profession}
                  onChange={(e) => setSpriteConfig({ profession: e.target.value })}
                  disabled={isGenerating}
                  className={cn(
                    'w-full p-2 rounded-sm',
                    'bg-game-bg border-2 border-game-border',
                    'font-mono text-xs text-white',
                    'focus:outline-none focus:border-neon-purple transition-colors',
                    'disabled:opacity-50 cursor-pointer'
                  )}
                >
                  {PROFESSION_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                体型
              </label>
              <select
                value={spriteConfig.bodyType}
                onChange={(e) => setSpriteConfig({ bodyType: e.target.value as BodyType })}
                disabled={isGenerating}
                className={cn(
                  'w-full p-2 rounded-sm',
                  'bg-game-bg border-2 border-game-border',
                  'font-mono text-xs text-white',
                  'focus:outline-none focus:border-neon-purple transition-colors',
                  'disabled:opacity-50 cursor-pointer'
                )}
              >
                {BODYTYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                服装
              </label>
              <select
                value={spriteConfig.clothing}
                onChange={(e) => setSpriteConfig({ clothing: e.target.value })}
                disabled={isGenerating}
                className={cn(
                  'w-full p-2 rounded-sm',
                  'bg-game-bg border-2 border-game-border',
                  'font-mono text-xs text-white',
                  'focus:outline-none focus:border-neon-purple transition-colors',
                  'disabled:opacity-50 cursor-pointer'
                )}
              >
                {CLOTHING_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                武器
              </label>
              <select
                value={spriteConfig.weapon}
                onChange={(e) => setSpriteConfig({ weapon: e.target.value })}
                disabled={isGenerating}
                className={cn(
                  'w-full p-2 rounded-sm',
                  'bg-game-bg border-2 border-game-border',
                  'font-mono text-xs text-white',
                  'focus:outline-none focus:border-neon-purple transition-colors',
                  'disabled:opacity-50 cursor-pointer'
                )}
              >
                {WEAPON_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                朝向
              </label>
              <select
                value={spriteConfig.facing}
                onChange={(e) => setSpriteConfig({ facing: e.target.value as Facing })}
                disabled={isGenerating}
                className={cn(
                  'w-full p-2 rounded-sm',
                  'bg-game-bg border-2 border-game-border',
                  'font-mono text-xs text-white',
                  'focus:outline-none focus:border-neon-purple transition-colors',
                  'disabled:opacity-50 cursor-pointer'
                )}
              >
                {FACING_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                姿势
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {POSE_OPTIONS.map((o) => {
                  const isSelected = spriteConfig.pose === o.value;
                  return (
                    <button
                      key={o.value}
                      onClick={() => setSpriteConfig({ pose: o.value })}
                      disabled={isGenerating}
                      className={cn(
                        'p-2 rounded-sm border-2 transition-all text-center',
                        'font-mono text-[10px] uppercase',
                        isSelected
                          ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                          : 'bg-game-bg border-game-border text-gray-400 hover:border-neon-cyan/50',
                        'disabled:opacity-50'
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-neon-purple" />
              <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
                配色方案
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {DEFAULT_COLOR_SCHEMES.map((preset) => {
                const isSelected =
                  spriteConfig.colorScheme.primary === preset.scheme.primary &&
                  spriteConfig.colorScheme.secondary === preset.scheme.secondary;
                return (
                  <button
                    key={preset.name}
                    onClick={() => setColorScheme(preset.scheme)}
                    disabled={isGenerating}
                    className={cn(
                      'flex items-center gap-1.5 p-2 rounded-sm border-2 transition-all',
                      isSelected
                        ? 'border-neon-purple bg-neon-purple/10'
                        : 'border-game-border hover:border-neon-purple/50',
                      'disabled:opacity-50'
                    )}
                  >
                    <div className="flex flex-col gap-0.5">
                      <div
                        className="w-4 h-2 rounded-sm"
                        style={{ backgroundColor: preset.scheme.primary }}
                      />
                      <div
                        className="w-4 h-1.5 rounded-sm"
                        style={{ backgroundColor: preset.scheme.secondary }}
                      />
                    </div>
                    <span className="font-mono text-[10px] text-gray-300 truncate">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['primary', 'secondary', 'accent'] as const).map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={spriteConfig.colorScheme[key]}
                    onChange={(e) =>
                      setColorScheme({
                        ...spriteConfig.colorScheme,
                        [key]: e.target.value,
                      })
                    }
                    disabled={isGenerating}
                    className="w-6 h-6 rounded-sm border border-game-border bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-[10px] text-gray-400 capitalize">
                    {key === 'primary' ? '主色' : key === 'secondary' ? '辅色' : '强调'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
          自定义描述（可选）
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="补充描述：如面部特征、装饰细节、特殊效果等..."
          className={cn(
            'w-full h-20 p-3 rounded-sm',
            'bg-game-bg border-2 border-game-border',
            'font-mono text-xs text-white placeholder-gray-500',
            'focus:outline-none focus:border-neon-purple transition-colors',
            'resize-none'
          )}
          disabled={isGenerating}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
            画风
          </label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as ArtStyle)}
            disabled={isGenerating}
            className={cn(
              'w-full p-2 rounded-sm',
              'bg-game-bg border-2 border-game-border',
              'font-mono text-xs text-white',
              'focus:outline-none focus:border-neon-purple',
              'disabled:opacity-50 cursor-pointer'
            )}
          >
            {ART_STYLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs text-neon-cyan uppercase tracking-wider">
            尺寸
          </label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as ImageSize)}
            disabled={isGenerating}
            className={cn(
              'w-full p-2 rounded-sm',
              'bg-game-bg border-2 border-game-border',
              'font-mono text-xs text-white',
              'focus:outline-none focus:border-neon-blue',
              'disabled:opacity-50 cursor-pointer'
            )}
          >
            {IMAGE_SIZE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.value}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-sm bg-red-500/10 border-2 border-red-500/50">
          <p className="font-mono text-xs text-red-400">{error}</p>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {isGenerating && (
          <div>
            <div className="h-2 bg-game-bg rounded-sm border border-game-border overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-amber via-neon-purple to-neon-cyan transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="font-mono text-xs text-gray-400 mt-2 text-center animate-pulse">
              正在生成精灵... {progress}%
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <PixelButton
            variant="secondary"
            size="md"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={resetSpriteConfig}
            disabled={isGenerating}
          >
            重置配置
          </PixelButton>
          <PixelButton
            variant="primary"
            size="md"
            icon={<Wand2 className="w-4 h-4" />}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? '生成中...' : '生成精灵'}
          </PixelButton>
        </div>
      </div>
    </div>
  );
}
