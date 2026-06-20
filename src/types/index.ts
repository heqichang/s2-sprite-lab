export type AssetType = 'character' | 'monster' | 'item' | 'weapon' | 'background' | 'icon';
export type ArtStyle = 'pixel' | 'cartoon' | 'handdrawn' | 'japanese-rpg' | 'dark-fantasy' | 'cyberpunk' | 'low-poly-2d';
export type ImageSize = '32x32' | '64x64' | '128x128' | '256x256' | '512x512' | '1024x1024';
export type ImageFormat = 'png' | 'jpg';

export type AiModelProvider = 'trae' | 'dashscope' | 'volcengine';

export type DashscopeApiMode = 'sync' | 'async-v1' | 'async-v2';

export interface AiModelConfig {
  provider: AiModelProvider;
  apiKey: string;
  modelName: string;
}

export const AI_MODEL_PROVIDERS: { value: AiModelProvider; label: string; desc: string }[] = [
  { value: 'trae', label: 'Trae API', desc: '内置默认模型' },
  { value: 'dashscope', label: '阿里云百炼', desc: 'Qwen-Image · 万相' },
  { value: 'volcengine', label: '豆包 Seedream', desc: '火山引擎方舟' },
];

export interface DashscopeModelInfo {
  value: string;
  label: string;
  apiMode: DashscopeApiMode;
}

export const DASHSCOPE_MODELS: DashscopeModelInfo[] = [
  { value: 'qwen-image-2.0-pro', label: 'Qwen-Image 2.0 Pro（推荐）', apiMode: 'sync' },
  { value: 'qwen-image-2.0', label: 'Qwen-Image 2.0', apiMode: 'sync' },
  { value: 'qwen-image-max', label: 'Qwen-Image Max', apiMode: 'sync' },
  { value: 'wan2.6-t2i', label: '万相 2.6（推荐）', apiMode: 'sync' },
  { value: 'wan2.2-t2i-flash', label: '万相 2.2 极速版', apiMode: 'async-v1' },
];

export const VOLCENGINE_MODELS: { value: string; label: string }[] = [
  { value: 'doubao-seedream-5-0-260128', label: 'Seedream 5.0（推荐）' },
  { value: 'doubao-seedream-5-0-lite-260128', label: 'Seedream 5.0 Lite' },
  { value: 'doubao-seedream-4.5', label: 'Seedream 4.5' },
];

export interface GenerationRecord {
  id: string;
  prompt: string;
  type: AssetType;
  style: ArtStyle;
  size: ImageSize;
  imageUrl: string;
  createdAt: string;
  fileName: string;
}

export interface LibraryAsset {
  id: string;
  name: string;
  imageUrl: string;
  type: AssetType;
  createdAt: string;
}

export interface GeneratorState {
  prompt: string;
  type: AssetType;
  style: ArtStyle;
  size: ImageSize;
  currentImage: string | null;
  lastApiImageUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  records: GenerationRecord[];
  library: LibraryAsset[];
  modelConfig: AiModelConfig;
}

export const ASSET_TYPE_OPTIONS: { value: AssetType; label: string; icon: string }[] = [
  { value: 'character', label: '角色', icon: 'User' },
  { value: 'monster', label: '怪物', icon: 'Skull' },
  { value: 'item', label: '道具', icon: 'Package' },
  { value: 'weapon', label: '武器', icon: 'Swords' },
  { value: 'background', label: '背景', icon: 'Image' },
  { value: 'icon', label: '图标', icon: 'Star' },
];

export const ART_STYLE_OPTIONS: { value: ArtStyle; label: string }[] = [
  { value: 'pixel', label: '像素风' },
  { value: 'cartoon', label: '卡通风' },
  { value: 'handdrawn', label: '手绘风' },
  { value: 'japanese-rpg', label: '日系 RPG' },
  { value: 'dark-fantasy', label: '暗黑奇幻' },
  { value: 'cyberpunk', label: '赛博朋克' },
  { value: 'low-poly-2d', label: '低多边形 2D' },
];

export const IMAGE_SIZE_OPTIONS: { value: ImageSize; apiSize: string }[] = [
  { value: '32x32', apiSize: 'square' },
  { value: '64x64', apiSize: 'square' },
  { value: '128x128', apiSize: 'square' },
  { value: '256x256', apiSize: 'square' },
  { value: '512x512', apiSize: 'square_hd' },
  { value: '1024x1024', apiSize: 'square_hd' },
];
