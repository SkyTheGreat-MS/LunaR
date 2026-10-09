/**
 * Local Storage Persistence Layer
 * Versioned, safe save/load mechanisms with error recovery
 */

import { GameSettings, MissionState } from '../game/types';

const SAVE_VERSION = 'v1.0';
const MISSION_SAVE_KEY = `junior_astronaut_mission_${SAVE_VERSION}`;
const SETTINGS_SAVE_KEY = `junior_astronaut_settings_${SAVE_VERSION}`;

export interface SavedMissionPayload {
  version: string;
  timestamp: number;
  state: MissionState;
}

const inMemoryStore: Record<string, string> = {};

function getStorageItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return inMemoryStore[key] ?? null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, value);
      return;
    }
  } catch {
    // fallback
  }
  inMemoryStore[key] = value;
}

function removeStorageItem(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(key);
      return;
    }
  } catch {
    // fallback
  }
  delete inMemoryStore[key];
}

export function saveMissionToStorage(state: MissionState): boolean {
  try {
    const payload: SavedMissionPayload = {
      version: SAVE_VERSION,
      timestamp: Date.now(),
      state,
    };
    setStorageItem(MISSION_SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn('Failed to save mission to localStorage:', err);
    return false;
  }
}

export function loadMissionFromStorage(): MissionState | null {
  try {
    const raw = getStorageItem(MISSION_SAVE_KEY);
    if (!raw) return null;

    const parsed: SavedMissionPayload = JSON.parse(raw);
    if (!parsed || parsed.version !== SAVE_VERSION || !parsed.state) {
      console.warn('Outdated or invalid save payload version. Ignoring.');
      return null;
    }

    // Basic structural validation
    const s = parsed.state;
    if (!s.missionId || !s.resources || !s.crew || !Array.isArray(s.buildings)) {
      console.warn('Corrupt save state structure detected.');
      return null;
    }

    return s;
  } catch (err) {
    console.error('Failed to parse save from localStorage:', err);
    return null;
  }
}

export function clearSavedMission(): void {
  try {
    removeStorageItem(MISSION_SAVE_KEY);
  } catch (err) {
    console.warn('Failed to clear save:', err);
  }
}

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  volume: 0.6,
  reducedMotion: false,
  showGridLines: true,
  highContrast: false,
};

export function saveSettingsToStorage(settings: GameSettings): void {
  try {
    setStorageItem(SETTINGS_SAVE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings:', err);
  }
}

export function loadSettingsFromStorage(): GameSettings {
  try {
    const raw = getStorageItem(SETTINGS_SAVE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
