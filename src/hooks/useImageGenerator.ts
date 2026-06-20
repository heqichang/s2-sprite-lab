import { useState, useCallback } from 'react';
import { useGeneratorStore } from '../store/useGeneratorStore';
import { buildPrompt } from '../utils/promptUtils';
import { IMAGE_SIZE_OPTIONS } from '../types';

function loadImage(url: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('图片加载失败，请重试'));
    img.src = url;
  });
}

export function useImageGenerator() {
  const {
    prompt,
    type,
    style,
    size,
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

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const sizeOption = IMAGE_SIZE_OPTIONS.find((s) => s.value === size);
      const apiSize = sizeOption?.apiSize || 'square';
      const finalPrompt = encodeURIComponent(buildPrompt(prompt, type, style, size));

      const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${finalPrompt}&image_size=${apiSize}`;

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 200);

      await loadImage(imageUrl);

      clearInterval(progressInterval);
      setProgress(100);

      setCurrentImage(imageUrl, imageUrl);
      addRecord({
        prompt,
        type,
        style,
        size,
        imageUrl,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '生成失败，请重试';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [prompt, type, style, size, setIsGenerating, setCurrentImage, setError, addRecord]);

  const regenerateImage = useCallback(async (recordPrompt: string, recordType: typeof type, recordStyle: typeof style, recordSize: typeof size) => {
    if (!recordPrompt.trim()) {
      setError('提示词为空');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);

    try {
      const sizeOption = IMAGE_SIZE_OPTIONS.find((s) => s.value === recordSize);
      const apiSize = sizeOption?.apiSize || 'square';
      const finalPrompt = encodeURIComponent(buildPrompt(recordPrompt, recordType, recordStyle, recordSize));

      const imageUrl = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${finalPrompt}&image_size=${apiSize}`;

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 200);

      await loadImage(imageUrl);

      clearInterval(progressInterval);
      setProgress(100);

      setCurrentImage(imageUrl, imageUrl);
      addRecord({
        prompt: recordPrompt,
        type: recordType,
        style: recordStyle,
        size: recordSize,
        imageUrl,
      });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : '生成失败，请重试';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  }, [setIsGenerating, setCurrentImage, setError, addRecord]);

  return { generateImage, regenerateImage, progress };
}
