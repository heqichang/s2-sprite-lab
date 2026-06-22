import { useState, useCallback } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { buildPrompt, buildSpritePrompt } from '../utils/promptUtils';
import { getPixelDimensions, resizeImage, getClosestSupportedSize } from '../utils/imageUtils';
import { IMAGE_SIZE_OPTIONS, DASHSCOPE_MODELS } from '../types';
import type { ImageSize, AiModelProvider, DashscopeApiMode, SpriteConfig } from '../types';

const QWEN_IMAGE_SYNC_SIZES = [
  { w: 2048, h: 2048 },
  { w: 1792, h: 1792 },
  { w: 1536, h: 1536 },
  { w: 1344, h: 1344 },
  { w: 1024, h: 1024 },
  { w: 2048, h: 1152 },
  { w: 1152, h: 2048 },
  { w: 2368, h: 1728 },
  { w: 1728, h: 2368 },
  { w: 2688, h: 1536 },
  { w: 1536, h: 2688 },
];

const QWEN_IMAGE_ASYNC_SIZES = [
  { w: 1664, h: 928 },
  { w: 1472, h: 1104 },
  { w: 1328, h: 1328 },
  { w: 1104, h: 1472 },
  { w: 928, h: 1664 },
];

const WAN26_SYNC_SIZES = [
  { w: 1280, h: 1280 },
  { w: 1344, h: 1344 },
  { w: 1440, h: 1440 },
  { w: 1472, h: 1104 },
  { w: 1104, h: 1472 },
  { w: 1696, h: 960 },
  { w: 960, h: 1696 },
  { w: 1600, h: 1024 },
  { w: 1024, h: 1600 },
];

const WAN22_ASYNC_SIZES = [
  { w: 1440, h: 1440 },
  { w: 1280, h: 1280 },
  { w: 1024, h: 1024 },
  { w: 768, h: 768 },
  { w: 1440, h: 816 },
  { w: 816, h: 1440 },
  { w: 1280, h: 720 },
  { w: 720, h: 1280 },
];

const VOLCENGINE_SIZES = [
  { w: 1024, h: 1024 },
  { w: 1024, h: 1408 },
  { w: 1408, h: 1024 },
  { w: 768, h: 768 },
  { w: 576, h: 1024 },
  { w: 1024, h: 576 },
  { w: 1408, h: 768 },
  { w: 768, h: 1408 },
];

function getDashscopeApiMode(modelName: string): DashscopeApiMode {
  const modelInfo = DASHSCOPE_MODELS.find((m) => m.value === modelName);
  return modelInfo?.apiMode || 'async-v1';
}

function getDashscopeSupportedSizes(modelName: string): Array<{ w: number; h: number }> {
  const apiMode = getDashscopeApiMode(modelName);
  if (modelName.startsWith('qwen-image')) {
    return apiMode === 'sync' ? QWEN_IMAGE_SYNC_SIZES : QWEN_IMAGE_ASYNC_SIZES;
  }
  if (modelName.startsWith('wan2.6')) {
    return apiMode === 'sync' ? WAN26_SYNC_SIZES : WAN26_SYNC_SIZES;
  }
  return WAN22_ASYNC_SIZES;
}

function getApiSize(size: ImageSize, provider: AiModelProvider, modelName?: string): string {
  const { width, height } = getPixelDimensions(size);

  if (provider === 'trae') {
    const sizeOption = IMAGE_SIZE_OPTIONS.find((s) => s.value === size);
    return sizeOption?.apiSize || 'square';
  }

  if (provider === 'dashscope' && modelName) {
    const supported = getDashscopeSupportedSizes(modelName);
    const best = getClosestSupportedSize(width, height, supported);
    return `${best.w}*${best.h}`;
  }

  if (provider === 'volcengine') {
    const best = getClosestSupportedSize(width, height, VOLCENGINE_SIZES);
    return `${best.w}x${best.h}`;
  }

  return `${width}x${height}`;
}

async function generateWithTrae(prompt: string, apiSize: string): Promise<{ blob: Blob; url: string }> {
  const finalPrompt = encodeURIComponent(prompt);
  const imageUrl = `/api/text-to-image?prompt=${finalPrompt}&image_size=${apiSize}`;
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`生成失败: HTTP ${response.status}`);
  }
  const blob = await response.blob();
  if (blob.size === 0 || !blob.type.startsWith('image/')) {
    throw new Error('返回数据无效，请重试');
  }
  const remoteUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${finalPrompt}&image_size=${apiSize}`;
  return { blob, url: remoteUrl };
}

async function generateWithDashscopeSync(
  prompt: string,
  modelName: string,
  apiKey: string,
  size: string,
): Promise<{ blob: Blob; url: string }> {
  const submitUrl = '/api/dashscope/api/v1/services/aigc/multimodal-generation/generation';
  const res = await fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      input: {
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }],
          },
        ],
      },
      parameters: {
        size,
        n: 1,
        prompt_extend: true,
        watermark: false,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`生成失败: HTTP ${res.status} ${errText}`);
  }

  const data = await res.json();
  const imageUrl = data.output?.choices?.[0]?.message?.content?.[0]?.image;
  if (!imageUrl) {
    const msg = data.message || '生成失败';
    throw new Error(`生成失败: ${msg}`);
  }

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error('图片下载失败');
  const blob = await imgRes.blob();
  return { blob, url: imageUrl };
}

async function generateWithDashscopeAsync(
  prompt: string,
  modelName: string,
  apiKey: string,
  size: string,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; url: string }> {
  const submitUrl = '/api/dashscope/api/v1/services/aigc/text2image/image-synthesis';
  const res = await fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: modelName,
      input: { prompt },
      parameters: {
        size,
        n: 1,
        prompt_extend: true,
        watermark: false,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`提交任务失败: HTTP ${res.status} ${errText}`);
  }

  const submitData = await res.json();
  const taskId = submitData.output?.task_id;
  if (!taskId) {
    throw new Error('未获取到任务 ID');
  }

  const taskUrl = `/api/dashscope/api/v1/tasks/${taskId}`;
  const maxAttempts = 60;
  let attempt = 0;

  while (attempt < maxAttempts) {
    attempt++;
    await new Promise((r) => setTimeout(r, 2000));

    const taskRes = await fetch(taskUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    if (!taskRes.ok) {
      throw new Error(`查询任务失败: HTTP ${taskRes.status}`);
    }

    const taskData = await taskRes.json();
    const status = taskData.output?.task_status;

    const progress = Math.min(95, Math.floor((attempt / maxAttempts) * 100));
    onProgress(progress);

    if (status === 'SUCCEEDED') {
      const results = taskData.output?.results;
      if (results && results.length > 0 && results[0].url) {
        const imageUrl = results[0].url;
        const imgRes = await fetch(imageUrl);
        if (!imgRes.ok) throw new Error('图片下载失败');
        const blob = await imgRes.blob();
        return { blob, url: imageUrl };
      }
      throw new Error('生成结果为空');
    }

    if (status === 'FAILED') {
      const message = taskData.output?.message || taskData.message || '生成失败';
      throw new Error(`生成失败: ${message}`);
    }
  }

  throw new Error('生成超时，请重试');
}

async function generateWithDashscope(
  prompt: string,
  modelName: string,
  apiKey: string,
  size: string,
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; url: string }> {
  if (!apiKey) {
    throw new Error('请先在设置中配置阿里云 API Key');
  }

  const apiMode = getDashscopeApiMode(modelName);

  if (apiMode === 'sync') {
    return generateWithDashscopeSync(prompt, modelName, apiKey, size);
  }

  return generateWithDashscopeAsync(prompt, modelName, apiKey, size, onProgress);
}

async function generateWithVolcengine(
  prompt: string,
  apiSize: string,
  apiKey: string,
  modelName: string,
): Promise<{ blob: Blob; url: string }> {
  if (!apiKey) {
    throw new Error('请先在设置中配置火山引擎 API Key');
  }

  const url = '/api/volcengine/api/v3/images/generations';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      prompt,
      size: apiSize,
      n: 1,
      sequential_image_generation: 'disabled',
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`生成失败: HTTP ${res.status} ${errText}`);
  }

  const data = await res.json();
  const imageUrl = data.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error('返回数据中未找到图片 URL');
  }

  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error('图片下载失败');
  const blob = await imgRes.blob();
  return { blob, url: imageUrl };
}

export function useImageGenerator() {
  const {
    prompt,
    type,
    style,
    size,
    modelConfig,
    setIsGenerating,
    setCurrentImage,
    setError,
    addRecord,
  } = useGeneratorStore();

  const [progress, setProgress] = useState(0);

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) {
      setError('请输入素材描述');
      return;
    }

    const { provider, apiKey, modelName } = modelConfig;

    if (provider !== 'trae' && !apiKey) {
      setError('请先在模型设置中配置 API Key');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const apiSize = getApiSize(size, provider, modelName);
      const targetDim = getPixelDimensions(size);
      const finalPrompt = buildPrompt(prompt, type, style, size);

      let result: { blob: Blob; url: string };

      if (provider === 'trae') {
        const progressInterval = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 5 : prev));
        }, 200);

        try {
          result = await generateWithTrae(finalPrompt, apiSize);
        } finally {
          clearInterval(progressInterval);
        }
      } else if (provider === 'dashscope') {
        result = await generateWithDashscope(finalPrompt, modelName, apiKey, apiSize, setProgress);
      } else if (provider === 'volcengine') {
        setProgress(30);
        result = await generateWithVolcengine(finalPrompt, apiSize, apiKey, modelName);
      } else {
        throw new Error('不支持的模型提供商');
      }

      setProgress(92);

      let finalBlob = result.blob;
      if (targetDim.width && targetDim.height) {
        finalBlob = await resizeImage(result.blob, targetDim.width, targetDim.height);
      }

      setProgress(98);

      const objectUrl = URL.createObjectURL(finalBlob);

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('图片解码失败'));
        };
        img.src = objectUrl;
      });

      setProgress(100);

      setCurrentImage(objectUrl, result.url);
      addRecord({
        prompt,
        type,
        style,
        size,
        imageUrl: result.url,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '生成失败，请重试';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [prompt, type, style, size, modelConfig, setIsGenerating, setCurrentImage, setError, addRecord]);

  const regenerateImage = useCallback(async (recordPrompt: string, recordType: typeof type, recordStyle: typeof style, recordSize: typeof size) => {
    if (!recordPrompt.trim()) {
      setError('提示词为空');
      return;
    }

    const { provider, apiKey, modelName } = modelConfig;

    if (provider !== 'trae' && !apiKey) {
      setError('请先在模型设置中配置 API Key');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const apiSize = getApiSize(recordSize, provider, modelName);
      const targetDim = getPixelDimensions(recordSize);
      const finalPrompt = buildPrompt(recordPrompt, recordType, recordStyle, recordSize);

      let result: { blob: Blob; url: string };

      if (provider === 'trae') {
        const progressInterval = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 5 : prev));
        }, 200);

        try {
          result = await generateWithTrae(finalPrompt, apiSize);
        } finally {
          clearInterval(progressInterval);
        }
      } else if (provider === 'dashscope') {
        result = await generateWithDashscope(finalPrompt, modelName, apiKey, apiSize, setProgress);
      } else if (provider === 'volcengine') {
        setProgress(30);
        result = await generateWithVolcengine(finalPrompt, apiSize, apiKey, modelName);
      } else {
        throw new Error('不支持的模型提供商');
      }

      setProgress(92);

      let finalBlob = result.blob;
      if (targetDim.width && targetDim.height) {
        finalBlob = await resizeImage(result.blob, targetDim.width, targetDim.height);
      }

      setProgress(98);

      const objectUrl = URL.createObjectURL(finalBlob);

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('图片解码失败'));
        };
        img.src = objectUrl;
      });

      setProgress(100);

      setCurrentImage(objectUrl, result.url);
      addRecord({
        prompt: recordPrompt,
        type: recordType,
        style: recordStyle,
        size: recordSize,
        imageUrl: result.url,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '生成失败，请重试';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [modelConfig, setIsGenerating, setCurrentImage, setError, addRecord]);

  const generateSprite = useCallback(async (spriteConfig: SpriteConfig) => {
    const { prompt, type, style, size, modelConfig, setIsGenerating, setCurrentImage, setError, setEditedImage, setOriginalImage } = useGeneratorStore.getState();

    const { provider, apiKey, modelName } = modelConfig;

    if (provider !== 'trae' && !apiKey) {
      setError('请先在模型设置中配置 API Key');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const apiSize = getApiSize(size, provider, modelName);
      const targetDim = getPixelDimensions(size);
      const finalPrompt = buildSpritePrompt(prompt, spriteConfig, style, size);

      let result: { blob: Blob; url: string };

      if (provider === 'trae') {
        const progressInterval = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 5 : prev));
        }, 200);

        try {
          result = await generateWithTrae(finalPrompt, apiSize);
        } finally {
          clearInterval(progressInterval);
        }
      } else if (provider === 'dashscope') {
        result = await generateWithDashscope(finalPrompt, modelName, apiKey, apiSize, setProgress);
      } else if (provider === 'volcengine') {
        setProgress(30);
        result = await generateWithVolcengine(finalPrompt, apiSize, apiKey, modelName);
      } else {
        throw new Error('不支持的模型提供商');
      }

      setProgress(92);

      let finalBlob = result.blob;
      if (targetDim.width && targetDim.height) {
        finalBlob = await resizeImage(result.blob, targetDim.width, targetDim.height);
      }

      setProgress(98);

      const objectUrl = URL.createObjectURL(finalBlob);

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('图片解码失败'));
        };
        img.src = objectUrl;
      });

      setProgress(100);

      setCurrentImage(objectUrl, result.url);
      setOriginalImage(objectUrl);
      setEditedImage(objectUrl);

      useGeneratorStore.getState().addRecord({
        prompt,
        type,
        style,
        size,
        imageUrl: result.url,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '生成失败，请重试';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, []);

  return { generateImage, regenerateImage, generateSprite, progress };
}
