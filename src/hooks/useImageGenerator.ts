import { useState, useCallback } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { buildPrompt } from '../utils/promptUtils';
import { getPixelDimensions } from '../utils/imageUtils';
import { IMAGE_SIZE_OPTIONS, DASHSCOPE_MODELS } from '../types';
import type { ImageSize, AiModelProvider, DashscopeApiMode } from '../types';

function getApiSize(size: ImageSize, provider: AiModelProvider): string {
  const { width, height } = getPixelDimensions(size);
  if (provider === 'trae') {
    const sizeOption = IMAGE_SIZE_OPTIONS.find((s) => s.value === size);
    return sizeOption?.apiSize || 'square';
  }
  if (provider === 'dashscope') {
    return `${width}*${height}`;
  }
  return `${width}x${height}`;
}

function getDashscopeApiMode(modelName: string): DashscopeApiMode {
  const modelInfo = DASHSCOPE_MODELS.find((m) => m.value === modelName);
  return modelInfo?.apiMode || 'async-v1';
}

function mapToDashscopeSize(size: string, modelName: string): string {
  if (modelName.startsWith('qwen-image')) {
    return '1024*1024';
  }
  if (modelName.startsWith('wan2.6')) {
    return '1280*1280';
  }
  return '1024*1024';
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
        size: mapToDashscopeSize('', modelName),
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
        size: mapToDashscopeSize('', modelName),
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
  onProgress: (p: number) => void,
): Promise<{ blob: Blob; url: string }> {
  if (!apiKey) {
    throw new Error('请先在设置中配置阿里云 API Key');
  }

  const apiMode = getDashscopeApiMode(modelName);

  if (apiMode === 'sync') {
    return generateWithDashscopeSync(prompt, modelName, apiKey);
  }

  return generateWithDashscopeAsync(prompt, modelName, apiKey, onProgress);
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
      const apiSize = getApiSize(size, provider);
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
        result = await generateWithDashscope(finalPrompt, modelName, apiKey, setProgress);
      } else if (provider === 'volcengine') {
        setProgress(30);
        result = await generateWithVolcengine(finalPrompt, apiSize, apiKey, modelName);
      } else {
        throw new Error('不支持的模型提供商');
      }

      const objectUrl = URL.createObjectURL(result.blob);

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
      const apiSize = getApiSize(recordSize, provider);
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
        result = await generateWithDashscope(finalPrompt, modelName, apiKey, setProgress);
      } else if (provider === 'volcengine') {
        setProgress(30);
        result = await generateWithVolcengine(finalPrompt, apiSize, apiKey, modelName);
      } else {
        throw new Error('不支持的模型提供商');
      }

      const objectUrl = URL.createObjectURL(result.blob);

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

  return { generateImage, regenerateImage, progress };
}
