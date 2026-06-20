import { AssetType, ArtStyle, ImageSize } from '../types';

const STYLE_DESCRIPTIONS: Record<ArtStyle, string> = {
  'pixel': '16-bit pixel art style, retro game sprite, crisp pixel edges, limited color palette',
  'cartoon': 'cartoon style, bold outlines, flat colors, vibrant, game asset illustration',
  'handdrawn': 'hand-drawn style, sketchy lines, textured shading, organic feel, game concept art',
  'japanese-rpg': 'Japanese RPG style, anime-inspired, detailed character design, fantasy game aesthetic',
  'dark-fantasy': 'dark fantasy style, gothic, moody lighting, dramatic shadows, medieval game art',
  'cyberpunk': 'cyberpunk style, neon lights, futuristic, high-tech, glowing elements, sci-fi game asset',
  'low-poly-2d': 'low poly 2D style, geometric shapes, flat shading, minimalist, modern game design',
};

const TYPE_DESCRIPTIONS: Record<AssetType, string> = {
  'character': 'game character sprite, full body, front-facing, transparent background',
  'monster': 'game monster creature, menacing, fantasy beast, transparent background',
  'item': 'game item object, collectible, icon-style, centered, transparent background',
  'weapon': 'game weapon equipment, detailed, fantasy or sci-fi, transparent background',
  'background': 'game background scene, landscape, environment, seamless tileable',
  'icon': 'game UI icon, simplified, recognizable, small size optimized',
};

export function buildPrompt(prompt: string, type: AssetType, style: ArtStyle, size: ImageSize): string {
  const parts = [
    prompt.trim(),
    TYPE_DESCRIPTIONS[type],
    STYLE_DESCRIPTIONS[style],
    `optimized for ${size} resolution`,
    'high quality, professional game asset, clean edges',
  ];
  return parts.filter(Boolean).join(', ');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateFileName(type: AssetType, style: ArtStyle): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `sprite-${type}-${style}-${timestamp}`;
}
