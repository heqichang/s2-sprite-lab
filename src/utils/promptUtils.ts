import {
  AssetType,
  ArtStyle,
  ImageSize,
  SpriteConfig,
  SpriteSubType,
  Gender,
  BodyType,
  Facing,
  Pose,
} from '../types';

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

const SPRITE_SUBTYPE_DESCRIPTIONS: Record<SpriteSubType, string> = {
  'player': 'heroic player character, strong presence, protagonist design',
  'npc': 'non-player character, friendly or neutral appearance, distinct personality',
  'normal-monster': 'common enemy creature, standard threat level, typical monster design',
  'boss': 'epic boss monster, intimidating, large scale, powerful aura, elaborate design',
  'pet': 'cute companion animal, small size, adorable, loyal expression',
  'mount': 'rideable creature, sturdy build, suitable for carrying a rider, majestic',
  'summon': 'mystical summoned creature, ethereal, magical glow, otherworldly appearance',
};

const GENDER_DESCRIPTIONS: Record<Gender, string> = {
  'male': 'masculine features, male physique',
  'female': 'feminine features, female physique',
  'neutral': 'androgynous appearance, gender-neutral design',
};

const BODYTYPE_DESCRIPTIONS: Record<BodyType, string> = {
  'slim': 'slim and slender build',
  'normal': 'average and well-proportioned build',
  'athletic': 'muscular and athletic build, toned physique',
  'heavy': 'heavy and stocky build, broad frame',
  'small': 'petite and small stature, childlike proportions',
  'large': 'tall and imposing build, large stature',
};

const FACING_DESCRIPTIONS: Record<Facing, string> = {
  'front': 'front view, facing camera directly',
  'back': 'back view, facing away from camera',
  'left': 'left side profile view',
  'right': 'right side profile view',
  'topdown-45': '45-degree top-down perspective view',
  'isometric': 'isometric 3/4 perspective view',
};

const POSE_DESCRIPTIONS: Record<Pose, string> = {
  'idle': 'relaxed idle stance, neutral pose',
  'standing': 'standing upright, alert posture',
  'walking': 'mid-walk pose, one foot forward',
  'running': 'dynamic running pose, legs extended, motion implied',
  'attacking': 'combat attack pose, weapon raised, aggressive stance',
  'defending': 'defensive guarding pose, shield or weapon raised to block',
  'casting': 'magic casting pose, hands gesturing, concentration expression',
  'jumping': 'mid-air jumping pose, legs bent, arms raised',
  'sitting': 'seated position, relaxed sitting posture',
  'sleeping': 'resting or sleeping pose, eyes closed, reclined',
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

export function buildSpritePrompt(
  basePrompt: string,
  spriteConfig: SpriteConfig,
  style: ArtStyle,
  size: ImageSize,
): string {
  const {
    subType,
    gender,
    profession,
    bodyType,
    clothing,
    weapon,
    colorScheme,
    facing,
    pose,
    customDescription,
  } = spriteConfig;

  const colorDesc = `color scheme: primary ${colorScheme.primary}, secondary ${colorScheme.secondary}, accent ${colorScheme.accent}`;

  const parts: string[] = [];

  if (basePrompt.trim()) {
    parts.push(basePrompt.trim());
  }

  parts.push(SPRITE_SUBTYPE_DESCRIPTIONS[subType]);
  parts.push(GENDER_DESCRIPTIONS[gender]);

  if (subType === 'player' || subType === 'npc') {
    parts.push(`class: ${profession}`);
  }

  parts.push(BODYTYPE_DESCRIPTIONS[bodyType]);
  parts.push(`wearing: ${clothing}`);

  if (weapon && weapon !== '无') {
    parts.push(`equipped with: ${weapon}`);
  }

  parts.push(FACING_DESCRIPTIONS[facing]);
  parts.push(POSE_DESCRIPTIONS[pose]);
  parts.push(colorDesc);
  parts.push(STYLE_DESCRIPTIONS[style]);
  parts.push(`optimized for ${size} resolution`);
  parts.push('single frame sprite');
  parts.push('full body illustration');
  parts.push('isolated on solid background for easy background removal');
  parts.push('high quality, professional game asset, clean outlines');
  parts.push('centered composition');

  if (customDescription.trim()) {
    parts.push(customDescription.trim());
  }

  return parts.filter(Boolean).join(', ');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateFileName(type: AssetType, style: ArtStyle): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  return `sprite-${type}-${style}-${timestamp}`;
}

export function generateSpriteFileName(
  subType: SpriteSubType,
  profession: string,
  style: ArtStyle,
): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  const cleanProfession = profession.replace(/[^\w\u4e00-\u9fa5]/g, '');
  return `sprite-${subType}-${cleanProfession}-${style}-${timestamp}`;
}
