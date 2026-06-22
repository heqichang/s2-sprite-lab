export type AssetType = 'character' | 'monster' | 'item' | 'weapon' | 'background' | 'icon';
export type ArtStyle = 'pixel' | 'cartoon' | 'handdrawn' | 'japanese-rpg' | 'dark-fantasy' | 'cyberpunk' | 'low-poly-2d';
export type ImageSize = '32x32' | '64x64' | '128x128' | '256x256' | '512x512' | '1024x1024';
export type ImageFormat = 'png' | 'jpg';

export type AiModelProvider = 'trae' | 'dashscope' | 'volcengine';
export type DashscopeApiMode = 'sync' | 'async-v1' | 'async-v2';

export type SpriteSubType =
  | 'player'
  | 'npc'
  | 'normal-monster'
  | 'boss'
  | 'pet'
  | 'mount'
  | 'summon';

export type Gender = 'male' | 'female' | 'neutral';
export type BodyType = 'slim' | 'normal' | 'athletic' | 'heavy' | 'small' | 'large';
export type Facing = 'front' | 'back' | 'left' | 'right' | 'topdown-45' | 'isometric';
export type Pose =
  | 'idle'
  | 'standing'
  | 'walking'
  | 'running'
  | 'attacking'
  | 'defending'
  | 'casting'
  | 'jumping'
  | 'sitting'
  | 'sleeping';

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
}

export interface SpriteConfig {
  subType: SpriteSubType;
  gender: Gender;
  profession: string;
  bodyType: BodyType;
  clothing: string;
  weapon: string;
  colorScheme: ColorScheme;
  facing: Facing;
  pose: Pose;
  customDescription: string;
}

export interface BackgroundConfig {
  removeBackground: boolean;
  transparentPreview: boolean;
  edgeFeathering: number;
  pixelHardEdge: boolean;
  eraserActive: boolean;
  eraserSize: number;
}

export interface EditConfig {
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  scale: number;
  rotation: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  colorSwap: {
    enabled: boolean;
    fromColor: string;
    toColor: string;
    tolerance: number;
  };
}

export interface GridConfig {
  showPixelGrid: boolean;
  showCenterLine: boolean;
  autoCenter: boolean;
  alignFootBaseline: boolean;
  gridSize: number;
}

export interface EditorState {
  activeTab: 'generate' | 'edit';
  spriteConfig: SpriteConfig;
  backgroundConfig: BackgroundConfig;
  editConfig: EditConfig;
  gridConfig: GridConfig;
  editedImageUrl: string | null;
  originalImageUrl: string | null;
  showEditor: boolean;
  history: string[];
  historyIndex: number;
}

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
  editorState: EditorState;
  currentMode: 'basic' | 'sprite';
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

export const SPRITE_SUBTYPE_OPTIONS: { value: SpriteSubType; label: string; icon: string }[] = [
  { value: 'player', label: '玩家角色', icon: 'Sword' },
  { value: 'npc', label: 'NPC', icon: 'Users' },
  { value: 'normal-monster', label: '普通怪物', icon: 'Bug' },
  { value: 'boss', label: 'Boss', icon: 'Crown' },
  { value: 'pet', label: '宠物', icon: 'Heart' },
  { value: 'mount', label: '坐骑', icon: 'Shield' },
  { value: 'summon', label: '召唤物', icon: 'Sparkles' },
];

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male', label: '男性' },
  { value: 'female', label: '女性' },
  { value: 'neutral', label: '中性' },
];

export const PROFESSION_OPTIONS: string[] = [
  '战士',
  '法师',
  '弓箭手',
  '盗贼',
  '牧师',
  '骑士',
  '刺客',
  '德鲁伊',
  '术士',
  '猎人',
  '萨满',
  '武僧',
  '吟游诗人',
  '死灵法师',
  '圣骑士',
  '野蛮人',
];

export const BODYTYPE_OPTIONS: { value: BodyType; label: string }[] = [
  { value: 'slim', label: '苗条' },
  { value: 'normal', label: '标准' },
  { value: 'athletic', label: '健美' },
  { value: 'heavy', label: '粗壮' },
  { value: 'small', label: '娇小' },
  { value: 'large', label: '高大' },
];

export const CLOTHING_OPTIONS: string[] = [
  '布甲',
  '皮甲',
  '锁子甲',
  '板甲',
  '长袍',
  '法袍',
  '轻便战衣',
  '贵族礼服',
  '冒险者装束',
  '部落服饰',
  '东方古风',
  '休闲便装',
  '皇家铠甲',
  '刺客紧身衣',
  '魔法师斗篷',
];

export const WEAPON_OPTIONS: string[] = [
  '无',
  '长剑',
  '巨剑',
  '短剑',
  '匕首',
  '战斧',
  '长弓',
  '短弓',
  '法杖',
  '权杖',
  '盾牌',
  '双剑',
  '长矛',
  '长柄刀',
  '魔法书',
  '暗器',
  '拳套',
  '火枪',
];

export const FACING_OPTIONS: { value: Facing; label: string }[] = [
  { value: 'front', label: '正面' },
  { value: 'back', label: '背面' },
  { value: 'left', label: '左侧' },
  { value: 'right', label: '右侧' },
  { value: 'topdown-45', label: '俯视45度' },
  { value: 'isometric', label: '等距视角' },
];

export const POSE_OPTIONS: { value: Pose; label: string }[] = [
  { value: 'idle', label: '待机' },
  { value: 'standing', label: '站立' },
  { value: 'walking', label: '行走' },
  { value: 'running', label: '奔跑' },
  { value: 'attacking', label: '攻击' },
  { value: 'defending', label: '防御' },
  { value: 'casting', label: '施法' },
  { value: 'jumping', label: '跳跃' },
  { value: 'sitting', label: '坐下' },
  { value: 'sleeping', label: '休息' },
];

export const DEFAULT_COLOR_SCHEMES: { name: string; scheme: ColorScheme }[] = [
  { name: '经典蓝', scheme: { primary: '#3b82f6', secondary: '#1e40af', accent: '#93c5fd' } },
  { name: '烈焰红', scheme: { primary: '#ef4444', secondary: '#991b1b', accent: '#fca5a5' } },
  { name: '翡翠绿', scheme: { primary: '#22c55e', secondary: '#166534', accent: '#86efac' } },
  { name: '皇家紫', scheme: { primary: '#a855f7', secondary: '#6b21a8', accent: '#d8b4fe' } },
  { name: '黄金色', scheme: { primary: '#eab308', secondary: '#854d0e', accent: '#fde047' } },
  { name: '深渊黑', scheme: { primary: '#374151', secondary: '#111827', accent: '#6b7280' } },
  { name: '天空青', scheme: { primary: '#06b6d4', secondary: '#164e63', accent: '#67e8f9' } },
  { name: '樱花粉', scheme: { primary: '#ec4899', secondary: '#9d174d', accent: '#f9a8d4' } },
];

export const DEFAULT_SPRITE_CONFIG: SpriteConfig = {
  subType: 'player',
  gender: 'male',
  profession: '战士',
  bodyType: 'normal',
  clothing: '板甲',
  weapon: '长剑',
  colorScheme: DEFAULT_COLOR_SCHEMES[0].scheme,
  facing: 'front',
  pose: 'idle',
  customDescription: '',
};

export const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  removeBackground: true,
  transparentPreview: true,
  edgeFeathering: 0,
  pixelHardEdge: true,
  eraserActive: false,
  eraserSize: 10,
};

export const DEFAULT_EDIT_CONFIG: EditConfig = {
  cropX: 0,
  cropY: 0,
  cropWidth: 100,
  cropHeight: 100,
  scale: 100,
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  colorSwap: {
    enabled: false,
    fromColor: '#ffffff',
    toColor: '#000000',
    tolerance: 30,
  },
};

export const DEFAULT_GRID_CONFIG: GridConfig = {
  showPixelGrid: false,
  showCenterLine: false,
  autoCenter: true,
  alignFootBaseline: false,
  gridSize: 16,
};
