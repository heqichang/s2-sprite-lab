import { useEffect } from 'react';
import { InputPanel } from '../components/InputPanel';
import { PreviewPanel } from '../components/PreviewPanel';
import { HistoryPanel } from '../components/HistoryPanel';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { Gamepad2, Sparkles } from 'lucide-react';

export function Home() {
  const loadFromStorage = useGeneratorStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return (
    <div className="min-h-screen bg-game-bg text-white relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle, #a855f7 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        <div className="w-full h-full animate-scanline bg-gradient-to-b from-transparent via-neon-purple to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex flex-col min-h-screen">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-sm border-2 border-neon-purple bg-neon-purple/10 flex items-center justify-center shadow-neon-purple animate-float">
                  <Gamepad2 className="w-8 h-8 text-neon-purple" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-neon-amber animate-pulse-neon" />
                </div>
              </div>
              <div>
                <h1 className="font-pixel text-xl text-white mb-1 tracking-wider">
                  SPRITE<span className="text-neon-purple">LAB</span>
                </h1>
                <p className="font-mono text-xs text-gray-400">
                  2D 游戏素材 AI 生成工具
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-game-card border border-game-border">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="font-mono text-xs text-gray-400">AI 引擎就绪</span>
              </div>
            </div>
          </div>

          <div className="mt-6 h-1 rounded-sm overflow-hidden bg-game-card">
            <div className="h-full w-full bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-blue animate-pulse-neon" />
          </div>
        </header>

        <main className="flex-1 flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
            <div className="lg:col-span-2">
              <div className="h-full p-6 rounded-sm bg-game-card/80 backdrop-blur border-2 border-game-border hover:border-neon-purple/50 transition-colors">
                <InputPanel />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-full p-6 rounded-sm bg-game-card/80 backdrop-blur border-2 border-game-border hover:border-neon-cyan/50 transition-colors">
                <PreviewPanel />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-sm bg-game-card/80 backdrop-blur border-2 border-game-border hover:border-neon-amber/50 transition-colors">
            <HistoryPanel />
          </div>
        </main>

        <footer className="mt-6 pt-4 border-t border-game-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="font-mono text-xs text-gray-600">
              © 2024 SpriteLab · Powered by AI
            </p>
            <div className="flex items-center gap-4">
              <span className="font-mono text-[10px] text-gray-700">
                像素风 · 卡通风 · 手绘风 · 日系RPG · 暗黑奇幻 · 赛博朋克 · 低多边形
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
