import { useGeneratorStore } from '../store/useGeneratorStore';
import { SpriteConfigPanel } from './SpriteConfigPanel';
import { SpriteEditorPanel } from './SpriteEditorPanel';
import { PixelButton } from './PixelButton';
import { PreviewPanel } from './PreviewPanel';
import { cn } from '../lib/utils';
import {
  Sparkles,
  Pencil,
  SlidersHorizontal,
} from 'lucide-react';

export function SpriteGenerator() {
  const {
    currentImage,
    isGenerating,
    editorState,
    setActiveTab,
    openEditor,
    setOriginalImage,
    setEditedImage,
  } = useGeneratorStore();

  const { activeTab, showEditor } = editorState;

  const handleOpenEditor = () => {
    if (!currentImage) return;
    setOriginalImage(currentImage);
    setEditedImage(currentImage);
    openEditor(currentImage, currentImage);
  };

  if (showEditor) {
    return (
      <div className="h-full">
        <SpriteEditorPanel />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      <div className="lg:col-span-2 overflow-y-auto pr-1">
        <div className="p-5 rounded-sm bg-game-card/80 backdrop-blur border-2 border-game-border hover:border-neon-amber/50 transition-colors h-full">
          <SpriteConfigPanel />
        </div>
      </div>

      <div className="lg:col-span-3">
        <div className="p-5 rounded-sm bg-game-card/80 backdrop-blur border-2 border-game-border hover:border-neon-green/50 transition-colors h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex rounded-sm overflow-hidden border-2 border-game-border">
                <button
                  onClick={() => setActiveTab('generate')}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 transition-all font-mono text-xs',
                    activeTab === 'generate'
                      ? 'bg-neon-amber/20 text-neon-amber'
                      : 'bg-game-bg text-gray-400 hover:text-gray-300'
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  生成
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 transition-all font-mono text-xs',
                    activeTab === 'edit'
                      ? 'bg-neon-green/20 text-neon-green'
                      : 'bg-game-bg text-gray-400 hover:text-gray-300'
                  )}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  编辑
                </button>
              </div>
            </div>
            <PixelButton
              variant="success"
              size="md"
              icon={<Pencil className="w-4 h-4" />}
              onClick={handleOpenEditor}
              disabled={!currentImage || isGenerating}
            >
              打开编辑器
            </PixelButton>
          </div>

          <div className="flex-1 min-h-0">
            {activeTab === 'generate' ? (
              <div className="h-full">
                <PreviewPanel />
              </div>
            ) : (
              <div className="h-full">
                <SpriteEditorPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
