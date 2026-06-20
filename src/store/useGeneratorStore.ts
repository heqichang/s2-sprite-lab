import { create } from 'zustand';
import {
  GeneratorState,
  AssetType,
  ArtStyle,
  ImageSize,
  GenerationRecord,
  LibraryAsset,
  AiModelConfig,
  AiModelProvider,
} from '../types';
import { loadRecords, saveRecords, loadLibrary, saveLibrary, loadModelConfig, saveModelConfig } from '../utils/storageUtils';
import { generateId, generateFileName } from '../utils/promptUtils';

interface GeneratorActions {
  setPrompt: (prompt: string) => void;
  setType: (type: AssetType) => void;
  setStyle: (style: ArtStyle) => void;
  setSize: (size: ImageSize) => void;
  setCurrentImage: (image: string | null, apiUrl?: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  addRecord: (record: Omit<GenerationRecord, 'id' | 'createdAt' | 'fileName'>) => void;
  deleteRecord: (id: string) => void;
  clearRecords: () => void;
  addToLibrary: (asset: Omit<LibraryAsset, 'id' | 'createdAt'> & { imageUrl?: string }) => void;
  removeFromLibrary: (id: string) => void;
  loadFromStorage: () => void;
  setModelProvider: (provider: AiModelProvider) => void;
  setApiKey: (apiKey: string) => void;
  setModelName: (modelName: string) => void;
  setModelConfig: (config: Partial<AiModelConfig>) => void;
}

export const useGeneratorStore = create<GeneratorState & GeneratorActions>((set, get) => ({
  prompt: '',
  type: 'item',
  style: 'pixel',
  size: '128x128',
  currentImage: null,
  lastApiImageUrl: null,
  isGenerating: false,
  error: null,
  records: [],
  library: [],
  modelConfig: {
    provider: 'trae',
    apiKey: '',
    modelName: '',
  },

  setPrompt: (prompt) => set({ prompt }),
  setType: (type) => set({ type }),
  setStyle: (style) => set({ style }),
  setSize: (size) => set({ size }),
  setCurrentImage: (currentImage, apiUrl) => set({
    currentImage,
    lastApiImageUrl: apiUrl !== undefined ? apiUrl : get().lastApiImageUrl,
  }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),

  addRecord: (recordData) => {
    const newRecord: GenerationRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      fileName: generateFileName(recordData.type, recordData.style),
    };
    const records = [newRecord, ...get().records];
    set({ records });
    saveRecords(records);
  },

  deleteRecord: (id) => {
    const records = get().records.filter((r) => r.id !== id);
    set({ records });
    saveRecords(records);
  },

  clearRecords: () => {
    set({ records: [] });
    saveRecords([]);
  },

  addToLibrary: (assetData) => {
    const newAsset: LibraryAsset = {
      ...assetData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    const library = [newAsset, ...get().library];
    set({ library });
    saveLibrary(library);
  },

  removeFromLibrary: (id) => {
    const library = get().library.filter((a) => a.id !== id);
    set({ library });
    saveLibrary(library);
  },

  loadFromStorage: () => {
    set({
      records: loadRecords(),
      library: loadLibrary(),
      modelConfig: loadModelConfig(),
    });
  },

  setModelProvider: (provider) => {
    const newConfig = { ...get().modelConfig, provider };
    set({ modelConfig: newConfig });
    saveModelConfig(newConfig);
  },

  setApiKey: (apiKey) => {
    const newConfig = { ...get().modelConfig, apiKey };
    set({ modelConfig: newConfig });
    saveModelConfig(newConfig);
  },

  setModelName: (modelName) => {
    const newConfig = { ...get().modelConfig, modelName };
    set({ modelConfig: newConfig });
    saveModelConfig(newConfig);
  },

  setModelConfig: (config) => {
    const newConfig = { ...get().modelConfig, ...config };
    set({ modelConfig: newConfig });
    saveModelConfig(newConfig);
  },
}));
