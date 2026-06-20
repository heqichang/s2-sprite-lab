export type AssetType = 'character' | 'monster' | 'item' | 'weapon' | 'background' | 'icon';
export type ArtStyle = 'pixel' | 'cartoon' | 'handdrawn' | 'japanese-rpg' | 'dark-fantasy' | 'cyberpunk' | 'low-poly-2d';
export type ImageSize = '32x32' | '64x64' | '128x128' | '256x256' | '512x512' | '1024x1024';
export type ImageFormat = 'png' | 'jpg';

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
  isGenerating: boolean;
  error: string | null;
  records: GenerationRecord[];
  library: LibraryAsset[];
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
