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
  EditorState,
  SpriteConfig,
  BackgroundConfig,
  EditConfig,
  GridConfig,
  SpriteSubType,
  DEFAULT_SPRITE_CONFIG,
  DEFAULT_BACKGROUND_CONFIG,
  DEFAULT_EDIT_CONFIG,
  DEFAULT_GRID_CONFIG,
} from '../types';
import { loadRecords, saveRecords, loadLibrary, saveLibrary, loadModelConfig, saveModelConfig } from '../utils/storageUtils';
import { generateId, generateFileName, generateSpriteFileName } from '../utils/promptUtils';

const DEFAULT_EDITOR_STATE: EditorState = {
  activeTab: 'generate',
  spriteConfig: { ...DEFAULT_SPRITE_CONFIG },
  backgroundConfig: { ...DEFAULT_BACKGROUND_CONFIG },
  editConfig: { ...DEFAULT_EDIT_CONFIG, colorSwap: { ...DEFAULT_EDIT_CONFIG.colorSwap } },
  gridConfig: { ...DEFAULT_GRID_CONFIG },
  editedImageUrl: null,
  originalImageUrl: null,
  showEditor: false,
  history: [],
  historyIndex: -1,
};

interface GeneratorActions {
  setPrompt: (prompt: string) => void;
  setType: (type: AssetType) => void;
  setStyle: (style: ArtStyle) => void;
  setSize: (size: ImageSize) => void;
  setCurrentImage: (image: string | null, apiUrl?: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  addRecord: (record: Omit<GenerationRecord, 'id' | 'createdAt' | 'fileName'>) => void;
  addSpriteRecord: (spriteSubType: SpriteSubType, profession: string, recordData: Omit<GenerationRecord, 'id' | 'createdAt' | 'fileName'>) => void;
  deleteRecord: (id: string) => void;
  clearRecords: () => void;
  addToLibrary: (asset: Omit<LibraryAsset, 'id' | 'createdAt'> & { imageUrl?: string }) => void;
  removeFromLibrary: (id: string) => void;
  loadFromStorage: () => void;
  setModelProvider: (provider: AiModelProvider) => void;
  setApiKey: (apiKey: string) => void;
  setModelName: (modelName: string) => void;
  setModelConfig: (config: Partial<AiModelConfig>) => void;
  setCurrentMode: (mode: 'basic' | 'sprite') => void;
  setActiveTab: (tab: 'generate' | 'edit') => void;
  setSpriteConfig: (config: Partial<SpriteConfig>) => void;
  setColorScheme: (scheme: SpriteConfig['colorScheme']) => void;
  setBackgroundConfig: (config: Partial<BackgroundConfig>) => void;
  setEditConfig: (config: Partial<EditConfig>) => void;
  setColorSwapConfig: (config: Partial<EditConfig['colorSwap']>) => void;
  setGridConfig: (config: Partial<GridConfig>) => void;
  setEditedImage: (url: string | null) => void;
  setOriginalImage: (url: string | null) => void;
  setShowEditor: (show: boolean) => void;
  openEditor: (originalUrl: string, editedUrl?: string) => void;
  closeEditor: () => void;
  resetEditConfig: () => void;
  resetSpriteConfig: () => void;
  pushHistory: (imageUrl: string) => void;
  undo: () => void;
  redo: () => void;
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
  editorState: JSON.parse(JSON.stringify(DEFAULT_EDITOR_STATE)),
  currentMode: 'basic',

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

  addSpriteRecord: (spriteSubType: SpriteSubType, profession: string, recordData: Omit<GenerationRecord, 'id' | 'createdAt' | 'fileName'>) => {
    const newRecord: GenerationRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      fileName: generateSpriteFileName(spriteSubType, profession, recordData.style),
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

  setCurrentMode: (mode) => set({ currentMode: mode }),

  setActiveTab: (tab) => set((state) => ({
    editorState: { ...state.editorState, activeTab: tab },
  })),

  setSpriteConfig: (config) => set((state) => ({
    editorState: {
      ...state.editorState,
      spriteConfig: { ...state.editorState.spriteConfig, ...config },
    },
  })),

  setColorScheme: (scheme) => set((state) => ({
    editorState: {
      ...state.editorState,
      spriteConfig: { ...state.editorState.spriteConfig, colorScheme: scheme },
    },
  })),

  setBackgroundConfig: (config) => set((state) => ({
    editorState: {
      ...state.editorState,
      backgroundConfig: { ...state.editorState.backgroundConfig, ...config },
    },
  })),

  setEditConfig: (config) => set((state) => ({
    editorState: {
      ...state.editorState,
      editConfig: { ...state.editorState.editConfig, ...config },
    },
  })),

  setColorSwapConfig: (config) => set((state) => ({
    editorState: {
      ...state.editorState,
      editConfig: {
        ...state.editorState.editConfig,
        colorSwap: { ...state.editorState.editConfig.colorSwap, ...config },
      },
    },
  })),

  setGridConfig: (config) => set((state) => ({
    editorState: {
      ...state.editorState,
      gridConfig: { ...state.editorState.gridConfig, ...config },
    },
  })),

  setEditedImage: (url) => set((state) => ({
    editorState: { ...state.editorState, editedImageUrl: url },
  })),

  setOriginalImage: (url) => set((state) => ({
    editorState: { ...state.editorState, originalImageUrl: url },
  })),

  setShowEditor: (show) => set((state) => ({
    editorState: { ...state.editorState, showEditor: show },
  })),

  openEditor: (originalUrl, editedUrl) => set((state) => ({
    editorState: {
      ...state.editorState,
      originalImageUrl: originalUrl,
      editedImageUrl: editedUrl || originalUrl,
      showEditor: true,
      history: editedUrl ? [editedUrl] : [originalUrl],
      historyIndex: 0,
    },
  })),

  closeEditor: () => set((state) => ({
    editorState: {
      ...state.editorState,
      showEditor: false,
    },
  })),

  resetEditConfig: () => set((state) => ({
    editorState: {
      ...state.editorState,
      editConfig: {
        ...DEFAULT_EDIT_CONFIG,
        colorSwap: { ...DEFAULT_EDIT_CONFIG.colorSwap },
      },
    },
  })),

  resetSpriteConfig: () => set((state) => ({
    editorState: {
      ...state.editorState,
      spriteConfig: { ...DEFAULT_SPRITE_CONFIG },
    },
  })),

  pushHistory: (imageUrl) => set((state) => {
    const history = state.editorState.history.slice(0, state.editorState.historyIndex + 1);
    history.push(imageUrl);
    return {
      editorState: {
        ...state.editorState,
        history,
        historyIndex: history.length - 1,
      },
    };
  }),

  undo: () => set((state) => {
    if (state.editorState.historyIndex <= 0) return {};
    const newIndex = state.editorState.historyIndex - 1;
    return {
      editorState: {
        ...state.editorState,
        historyIndex: newIndex,
        editedImageUrl: state.editorState.history[newIndex],
      },
    };
  }),

  redo: () => set((state) => {
    if (state.editorState.historyIndex >= state.editorState.history.length - 1) return {};
    const newIndex = state.editorState.historyIndex + 1;
    return {
      editorState: {
        ...state.editorState,
        historyIndex: newIndex,
        editedImageUrl: state.editorState.history[newIndex],
      },
    };
  }),
}));
