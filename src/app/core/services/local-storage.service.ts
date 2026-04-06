import { Injectable } from '@angular/core';

/**
 * Storage keys used by the application.
 */
export enum StorageKey {
  GameState = 'mpt_game_state',
  UserSeed = 'mpt_user_seed',
  LastLoadedAt = 'mpt_last_loaded_at',
  FileName = 'mpt_file_name',
}

/**
 * Wrapper service for localStorage with typed get/set operations.
 * Handles serialization, deserialization, and storage quota errors gracefully.
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  /**
   * Check if localStorage is available in the current environment.
   */
  isAvailable(): boolean {
    try {
      const testKey = '__mpt_storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get a typed value from localStorage.
   * Returns null if the key doesn't exist or parsing fails.
   */
  get<T>(key: StorageKey): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) {
        return null;
      }
      return JSON.parse(raw) as T;
    } catch {
      console.warn(`[LocalStorage] Failed to parse key "${key}"`);
      return null;
    }
  }

  /**
   * Get a raw string value from localStorage.
   */
  getString(key: StorageKey): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Set a typed value in localStorage.
   * Returns true on success, false if storage quota is exceeded.
   */
  set<T>(key: StorageKey, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.error(
          `[LocalStorage] Storage quota exceeded for key "${key}". ` +
            `Consider clearing old data.`
        );
      } else {
        console.error(`[LocalStorage] Failed to set key "${key}":`, error);
      }
      return false;
    }
  }

  /**
   * Set a raw string value in localStorage.
   */
  setString(key: StorageKey, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (this.isQuotaError(error)) {
        console.error(`[LocalStorage] Storage quota exceeded for key "${key}".`);
      }
      return false;
    }
  }

  /**
   * Remove a value from localStorage.
   */
  remove(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail — nothing to remove
    }
  }

  /**
   * Check if a key exists in localStorage.
   */
  has(key: StorageKey): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  /**
   * Clear all application-specific keys from localStorage.
   */
  clearAll(): void {
    const keys = Object.values(StorageKey);
    for (const key of keys) {
      this.remove(key);
    }
  }

  /**
   * Get approximate storage usage in bytes for app keys.
   */
  getUsageBytes(): number {
    let total = 0;
    const keys = Object.values(StorageKey);
    for (const key of keys) {
      const value = localStorage.getItem(key);
      if (value) {
        // Each character is roughly 2 bytes in UTF-16
        total += (key.length + value.length) * 2;
      }
    }
    return total;
  }

  /**
   * Check if an error is a storage quota exceeded error.
   */
  private isQuotaError(error: unknown): boolean {
    if (error instanceof DOMException) {
      return (
        error.code === 22 || // Legacy
        error.code === 1014 || // Firefox
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED' // Firefox
      );
    }
    return false;
  }
}
