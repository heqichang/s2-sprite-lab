import { useState, useEffect, useCallback } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { PixelButton } from './PixelButton';
import { SpriteCanvas } from './SpriteCanvas';
import {
  applyAllBackgroundProcessing,
  applyAllEdits,
  createCanvasFromImage,
  canvasToDataUrl,
  applyEditTransforms,
  applyColorAdjustments,
  applyColorSwap,
} from '../utils/spriteEditUtils';
import { cn } from '../lib/utils';
import {
  Undo2,
  Redo2,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Droplets,
  Palette,
  Wand2,
  Grid3x3,
  Target,
  Layers,
  Download,
  Save,
  X,
  Eraser,
  RefreshCw,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';

type EditorTab = 'background' | 'transform' | 'color' | 'grid';

export function SpriteEditorPanel() {
  const {
    editorState,
    currentImage,
    type,
    setBackgroundConfig,
    setEditConfig,
    setColorSwapConfig,
    setGridConfig,
    setEditedImage,
    setOriginalImage,
    pushHistory,
    undo,
    redo,
    closeEditor,
    resetEditConfig,
    addToLibrary,
  } = useGeneratorStore();

  const { activeTab, spriteConfig, backgroundConfig, editConfig, gridConfig, editedImageUrl, originalImageUrl, history, historyIndex } = editorState;
  const [tab, setTab] = useState<EditorTab>('background');
  const [saved, setSaved] = useState(false);
  const [processing, setProcessing] = useState(false);

  const displayImage = editedImageUrl || currentImage;

  const processBackground = useCallback(async () => {
    if (!originalImageUrl) return;
    setProcessing(true);
    try {
      const result = await applyAllBackgroundProcessing(originalImageUrl, backgroundConfig);
      setEditedImage(result);
      pushHistory(result);
    } catch (e) {
      console.error('背景处理失败:', e);
    } finally {
      setProcessing(false);
    }
  }, [originalImageUrl, backgroundConfig, setEditedImage, pushHistory]);

  const applyTransforms = useCallback(async () => {
    if (!editedImageUrl && !originalImageUrl) return;
    const src = editedImageUrl || originalImageUrl || '';
    setProcessing(true);
    try {
      const result = await applyEditTransforms(src, editConfig);
      setEditedImage(result);
      pushHistory(result);
    } catch (e) {
      console.error('变换处理失败:', e);
    } finally {
      setProcessing(false);
    }
  }, [editedImageUrl, originalImageUrl, editConfig, setEditedImage, pushHistory]);

  const applyColors = useCallback(async () => {
    if (!editedImageUrl && !originalImageUrl) return;
    const src = editedImageUrl || originalImageUrl || '';
    setProcessing(true);
    try {
      let result = await applyColorAdjustments(src, editConfig);
      result = await applyColorSwap(result, editConfig);
      setEditedImage(result);
      pushHistory(result);
    } catch (e) {
      console.error('颜色处理失败:', e);
    } finally {
      setProcessing(false);
    }
  }, [editedImageUrl, originalImageUrl, editConfig, setEditedImage, pushHistory]);

  const applyAllChanges = useCallback(async () => {
    if (!originalImageUrl) return;
    setProcessing(true);
    try {
      let result = await applyAllBackgroundProcessing(originalImageUrl, backgroundConfig);
      result = await applyAllEdits(result, editConfig);
      setEditedImage(result);
      pushHistory(result);
    } catch (e) {
      console.error('处理失败:', e);
    } finally {
      setProcessing(false);
    }
  }, [originalImageUrl, backgroundConfig, editConfig, setEditedImage, pushHistory]);

  const handleEraser = useCallback(async (x: number, y: number, size: number) => {
    if (!editedImageUrl) return;
    try {
      const { canvas, ctx } = await createCanvasFromImage(editedImageUrl);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      const result = canvasToDataUrl(canvas);
      setEditedImage(result);
    } catch (e) {
      console.error('橡皮擦失败:', e);
    }
  }, [editedImageUrl, setEditedImage]);

  useEffect(() => {
    if (activeTab === 'edit' && tab === 'background' && !editedImageUrl && originalImageUrl) {
      processBackground();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (currentImage && activeTab === 'edit') {
      if (!originalImageUrl || originalImageUrl !== currentImage) {
        setOriginalImage(currentImage);
        setEditedImage(currentImage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImage, activeTab]);

  const handleSaveToLibrary = () => {
    if (!displayImage) return;
    addToLibrary({
      name: `sprite-${spriteConfig.subType}-${spriteConfig.profession}-${Date.now()}`,
      imageUrl: displayImage,
      type,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tabs: { id: EditorTab; label: string; icon: React.ElementType }[] = [
    { id: 'background', label: '背景', icon: Layers },
    { id: 'transform', label: '变换', icon: Crop },
    { id: 'color', label: '颜色', icon: Palette },
    { id: 'grid', label: '网格', icon: Grid3x3 },
  ];

  const Slider = ({
    label,
    value,
    onChange,
    min,
    max,
    unit = '',
    icon: Icon,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
    min: number;
    max: number;
    unit?: string;
    icon?: React.ElementType;
  }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-neon-cyan" />}
          <span className="font-mono text-[11px] text-gray-300">{label}</span>
        </div>
        <span className="font-mono text-[11px] text-neon-purple">{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-game-bg rounded-sm appearance-none cursor-pointer accent-neon-purple"
      />
    </div>
  );

  const Toggle = ({
    label,
    checked,
    onChange,
    icon: Icon,
  }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    icon?: React.ElementType;
  }) => (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-center justify-between w-full p-2.5 rounded-sm border-2 transition-all',
        checked
          ? 'bg-neon-purple/10 border-neon-purple'
          : 'bg-game-bg border-game-border hover:border-neon-purple/40'
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon className={cn('w-4 h-4', checked ? 'text-neon-purple' : 'text-gray-400')} />}
        <span className="font-mono text-[11px] text-gray-200">{label}</span>
      </div>
      <div
        className={cn(
          'w-8 h-4 rounded-sm relative transition-colors',
          checked ? 'bg-neon-purple' : 'bg-game-border'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 w-3 h-3 rounded-sm bg-white transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5'
          )}
        />
      </div>
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-game-border">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-neon-green" />
          <h2 className="font-pixel text-sm text-neon-green">精灵编辑器</h2>
        </div>
        <button
          onClick={closeEditor}
          className="p-1.5 rounded-sm bg-game-bg border border-game-border hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
        <div className="xl:col-span-2 flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <PixelButton
                variant="secondary"
                size="sm"
                icon={<Undo2 className="w-3.5 h-3.5" />}
                onClick={undo}
                disabled={historyIndex <= 0 || processing}
              >
                撤销
              </PixelButton>
              <PixelButton
                variant="secondary"
                size="sm"
                icon={<Redo2 className="w-3.5 h-3.5" />}
                onClick={redo}
                disabled={historyIndex >= history.length - 1 || processing}
              >
                重做
              </PixelButton>
              <div className="ml-2 font-mono text-[10px] text-gray-500">
                历史: {historyIndex + 1}/{history.length}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <PixelButton
                variant="warning"
                size="sm"
                icon={<RefreshCw className={cn('w-3.5 h-3.5', processing && 'animate-spin')} />}
                onClick={applyAllChanges}
                disabled={processing}
              >
                {processing ? '处理中...' : '应用全部'}
              </PixelButton>
              <PixelButton
                variant="secondary"
                size="sm"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={resetEditConfig}
                disabled={processing}
              >
                重置
              </PixelButton>
            </div>
          </div>

          <div className="flex-1 min-h-[350px] rounded-sm border-2 border-game-border overflow-hidden">
            <SpriteCanvas
              imageUrl={displayImage}
              gridConfig={gridConfig}
              onEraser={backgroundConfig.eraserActive ? handleEraser : undefined}
              eraserActive={backgroundConfig.eraserActive}
              eraserSize={backgroundConfig.eraserSize}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <PixelButton
              variant="primary"
              size="md"
              icon={<Download className="w-4 h-4" />}
              onClick={() => {
                if (!displayImage) return;
                const a = document.createElement('a');
                a.href = displayImage;
                a.download = `sprite-${Date.now()}.png`;
                a.click();
              }}
              disabled={!displayImage}
            >
              导出 PNG
            </PixelButton>
            <PixelButton
              variant="success"
              size="md"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSaveToLibrary}
              disabled={!displayImage}
            >
              {saved ? '已保存!' : '保存到素材库'}
            </PixelButton>
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-y-auto pr-1">
          <div className="grid grid-cols-4 gap-1">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isSelected = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-sm border-2 transition-all',
                    isSelected
                      ? 'bg-neon-purple/20 border-neon-purple text-neon-purple'
                      : 'bg-game-bg border-game-border text-gray-400 hover:border-neon-purple/40 hover:text-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-mono text-[10px]">{t.label}</span>
                </button>
              );
            })}
          </div>

          {tab === 'background' && (
            <div className="flex flex-col gap-3 p-3 rounded-sm bg-game-bg/50 border-2 border-game-border">
              <h3 className="font-mono text-xs text-neon-cyan uppercase flex items-center gap-2">
                <Layers className="w-4 h-4" />
                背景处理
              </h3>
              <Toggle
                label="自动移除背景"
                checked={backgroundConfig.removeBackground}
                onChange={(v) => setBackgroundConfig({ removeBackground: v })}
                icon={CheckCircle2}
              />
              <Toggle
                label="透明背景预览"
                checked={backgroundConfig.transparentPreview}
                onChange={(v) => setBackgroundConfig({ transparentPreview: v })}
                icon={Layers}
              />
              <Toggle
                label="像素风硬边"
                checked={backgroundConfig.pixelHardEdge}
                onChange={(v) => setBackgroundConfig({ pixelHardEdge: v })}
                icon={Grid3x3}
              />
              <Slider
                label="边缘羽化"
                value={backgroundConfig.edgeFeathering}
                onChange={(v) => setBackgroundConfig({ edgeFeathering: v })}
                min={0}
                max={20}
                unit="px"
                icon={Droplets}
              />
              <div className="h-px bg-game-border my-2" />
              <h3 className="font-mono text-xs text-neon-amber uppercase flex items-center gap-2">
                <Eraser className="w-4 h-4" />
                橡皮擦工具
              </h3>
              <Toggle
                label="启用橡皮擦"
                checked={backgroundConfig.eraserActive}
                onChange={(v) => setBackgroundConfig({ eraserActive: v })}
                icon={Eraser}
              />
              <Slider
                label="橡皮擦大小"
                value={backgroundConfig.eraserSize}
                onChange={(v) => setBackgroundConfig({ eraserSize: v })}
                min={1}
                max={50}
                unit="px"
              />
              <PixelButton
                variant="primary"
                size="sm"
                icon={<Wand2 className="w-3.5 h-3.5" />}
                onClick={processBackground}
                disabled={processing || !originalImageUrl}
                className="w-full mt-2"
              >
                应用背景处理
              </PixelButton>
            </div>
          )}

          {tab === 'transform' && (
            <div className="flex flex-col gap-3 p-3 rounded-sm bg-game-bg/50 border-2 border-game-border">
              <h3 className="font-mono text-xs text-neon-cyan uppercase flex items-center gap-2">
                <Crop className="w-4 h-4" />
                裁剪区域 (%)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <Slider label="X 起点" value={editConfig.cropX} onChange={(v) => setEditConfig({ cropX: v })} min={0} max={100} unit="%" />
                <Slider label="Y 起点" value={editConfig.cropY} onChange={(v) => setEditConfig({ cropY: v })} min={0} max={100} unit="%" />
                <Slider label="宽度" value={editConfig.cropWidth} onChange={(v) => setEditConfig({ cropWidth: v })} min={1} max={100} unit="%" />
                <Slider label="高度" value={editConfig.cropHeight} onChange={(v) => setEditConfig({ cropHeight: v })} min={1} max={100} unit="%" />
              </div>
              <div className="h-px bg-game-border my-1" />
              <h3 className="font-mono text-xs text-neon-cyan uppercase flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                变换操作
              </h3>
              <Slider
                label="缩放"
                value={editConfig.scale}
                onChange={(v) => setEditConfig({ scale: v })}
                min={10}
                max={300}
                unit="%"
                icon={ZoomIn}
              />
              <Slider
                label="旋转角度"
                value={editConfig.rotation}
                onChange={(v) => setEditConfig({ rotation: v })}
                min={-180}
                max={180}
                unit="°"
                icon={RotateCw}
              />
              <div className="grid grid-cols-2 gap-2">
                <Toggle
                  label="水平翻转"
                  checked={editConfig.flipHorizontal}
                  onChange={(v) => setEditConfig({ flipHorizontal: v })}
                  icon={FlipHorizontal}
                />
                <Toggle
                  label="垂直翻转"
                  checked={editConfig.flipVertical}
                  onChange={(v) => setEditConfig({ flipVertical: v })}
                  icon={FlipVertical}
                />
              </div>
              <div className="grid grid-cols-4 gap-1.5 mt-1">
                <button
                  onClick={() => setEditConfig({ scale: Math.min(300, editConfig.scale + 10) })}
                  className="p-2 rounded-sm bg-game-bg border border-game-border hover:border-neon-purple/50 text-gray-300 transition-colors"
                  title="放大"
                >
                  <ZoomIn className="w-3.5 h-3.5 mx-auto" />
                </button>
                <button
                  onClick={() => setEditConfig({ scale: Math.max(10, editConfig.scale - 10) })}
                  className="p-2 rounded-sm bg-game-bg border border-game-border hover:border-neon-purple/50 text-gray-300 transition-colors"
                  title="缩小"
                >
                  <ZoomOut className="w-3.5 h-3.5 mx-auto" />
                </button>
                <button
                  onClick={() => setEditConfig({ rotation: (editConfig.rotation - 90 + 360) % 360 - 180 })}
                  className="p-2 rounded-sm bg-game-bg border border-game-border hover:border-neon-purple/50 text-gray-300 transition-colors"
                  title="逆时针 90°"
                >
                  <RotateCcw className="w-3.5 h-3.5 mx-auto" />
                </button>
                <button
                  onClick={() => setEditConfig({ rotation: (editConfig.rotation + 90) % 360 - 180 })}
                  className="p-2 rounded-sm bg-game-bg border border-game-border hover:border-neon-purple/50 text-gray-300 transition-colors"
                  title="顺时针 90°"
                >
                  <RotateCw className="w-3.5 h-3.5 mx-auto" />
                </button>
              </div>
              <PixelButton
                variant="primary"
                size="sm"
                icon={<Crop className="w-3.5 h-3.5" />}
                onClick={applyTransforms}
                disabled={processing || !displayImage}
                className="w-full mt-2"
              >
                应用变换
              </PixelButton>
            </div>
          )}

          {tab === 'color' && (
            <div className="flex flex-col gap-3 p-3 rounded-sm bg-game-bg/50 border-2 border-game-border">
              <h3 className="font-mono text-xs text-neon-cyan uppercase flex items-center gap-2">
                <Sun className="w-4 h-4" />
                颜色调整
              </h3>
              <Slider
                label="亮度"
                value={editConfig.brightness}
                onChange={(v) => setEditConfig({ brightness: v })}
                min={0}
                max={200}
                unit="%"
                icon={Sun}
              />
              <Slider
                label="对比度"
                value={editConfig.contrast}
                onChange={(v) => setEditConfig({ contrast: v })}
                min={0}
                max={200}
                unit="%"
                icon={Contrast}
              />
              <Slider
                label="饱和度"
                value={editConfig.saturation}
                onChange={(v) => setEditConfig({ saturation: v })}
                min={0}
                max={200}
                unit="%"
                icon={Droplets}
              />
              <Slider
                label="色相偏移"
                value={editConfig.hue}
                onChange={(v) => setEditConfig({ hue: v })}
                min={-180}
                max={180}
                unit="°"
                icon={Palette}
              />
              <div className="h-px bg-game-border my-1" />
              <h3 className="font-mono text-xs text-neon-purple uppercase flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                更换主色调
              </h3>
              <Toggle
                label="启用颜色替换"
                checked={editConfig.colorSwap.enabled}
                onChange={(v) => setColorSwapConfig({ enabled: v })}
                icon={CheckCircle2}
              />
              {editConfig.colorSwap.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-gray-400">源颜色</span>
                      <div className="flex items-center gap-2 p-2 rounded-sm bg-game-bg border border-game-border">
                        <input
                          type="color"
                          value={editConfig.colorSwap.fromColor}
                          onChange={(e) => setColorSwapConfig({ fromColor: e.target.value })}
                          className="w-8 h-8 rounded-sm border border-game-border bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-gray-300 uppercase">{editConfig.colorSwap.fromColor}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] text-gray-400">目标颜色</span>
                      <div className="flex items-center gap-2 p-2 rounded-sm bg-game-bg border border-game-border">
                        <input
                          type="color"
                          value={editConfig.colorSwap.toColor}
                          onChange={(e) => setColorSwapConfig({ toColor: e.target.value })}
                          className="w-8 h-8 rounded-sm border border-game-border bg-transparent cursor-pointer"
                        />
                        <span className="font-mono text-[10px] text-gray-300 uppercase">{editConfig.colorSwap.toColor}</span>
                      </div>
                    </div>
                  </div>
                  <Slider
                    label="容差"
                    value={editConfig.colorSwap.tolerance}
                    onChange={(v) => setColorSwapConfig({ tolerance: v })}
                    min={0}
                    max={150}
                  />
                </>
              )}
              <PixelButton
                variant="primary"
                size="sm"
                icon={<Palette className="w-3.5 h-3.5" />}
                onClick={applyColors}
                disabled={processing || !displayImage}
                className="w-full mt-2"
              >
                应用颜色调整
              </PixelButton>
            </div>
          )}

          {tab === 'grid' && (
            <div className="flex flex-col gap-3 p-3 rounded-sm bg-game-bg/50 border-2 border-game-border">
              <h3 className="font-mono text-xs text-neon-cyan uppercase flex items-center gap-2">
                <Grid3x3 className="w-4 h-4" />
                网格与对齐
              </h3>
              <Toggle
                label="显示像素网格"
                checked={gridConfig.showPixelGrid}
                onChange={(v) => setGridConfig({ showPixelGrid: v })}
                icon={Grid3x3}
              />
              <Slider
                label="网格尺寸"
                value={gridConfig.gridSize}
                onChange={(v) => setGridConfig({ gridSize: v })}
                min={4}
                max={64}
                unit="格"
              />
              <Toggle
                label="显示中心线"
                checked={gridConfig.showCenterLine}
                onChange={(v) => setGridConfig({ showCenterLine: v })}
                icon={Target}
              />
              <Toggle
                label="自动居中对齐"
                checked={gridConfig.autoCenter}
                onChange={(v) => setGridConfig({ autoCenter: v })}
                icon={Target}
              />
              <Toggle
                label="显示角色脚底基线"
                checked={gridConfig.alignFootBaseline}
                onChange={(v) => setGridConfig({ alignFootBaseline: v })}
                icon={Layers}
              />
              <div className="mt-2 p-3 rounded-sm bg-neon-green/5 border border-neon-green/20">
                <p className="font-mono text-[10px] text-neon-green/80 leading-relaxed">
                  💡 提示：开启像素网格可直观查看精灵分布，
                  中心线用于对齐对称角色，
                  基线用于统一多个角色的脚底位置。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
