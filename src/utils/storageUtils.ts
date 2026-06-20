import { GenerationRecord, LibraryAsset } from '../types';

const RECORDS_KEY = 'sprite-lab-records';
const LIBRARY_KEY = 'sprite-lab-library';
const MAX_RECORDS = 20;

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
