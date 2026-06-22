import { GenerationRecord, LibraryAsset, AiModelConfig } from '../types';

const RECORDS_KEY = 'sprite-lab-records';
const LIBRARY_KEY = 'sprite-lab-library';
const CONFIG_KEY = 'sprite-lab-config';
const MAX_RECORDS = 20;

const DEFAULT_MODEL_CONFIG: AiModelConfig = {
  provider: 'trae',
  apiKey: '',
  modelName: '',
};

export function loadRecords(): GenerationRecord[] {
  try {
    const data = localStorage.getItem(RECORDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: GenerationRecord[]): void {
  try {
    const trimmed = records.slice(0, MAX_RECORDS);
    localStorage.setItem(RECORDS_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save records:', e);
  }
}

export function loadLibrary(): LibraryAsset[] {
  try {
    const data = localStorage.getItem(LIBRARY_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveLibrary(library: LibraryAsset[]): void {
  try {
    localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  } catch (e) {
    console.error('Failed to save library:', e);
  }
}

export function loadModelConfig(): AiModelConfig {
  try {
    const data = localStorage.getItem(CONFIG_KEY);
    if (data) {
      return { ...DEFAULT_MODEL_CONFIG, ...JSON.parse(data) };
    }
  } catch {
    // ignore JSON parse errors
  }
  return { ...DEFAULT_MODEL_CONFIG };
}

export function saveModelConfig(config: AiModelConfig): void {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save model config:', e);
  }
}
