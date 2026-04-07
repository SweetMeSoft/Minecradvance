import { Injectable, computed, signal, inject } from '@angular/core';
import { ParsedAdvancements, UserAdvancement } from '../models/advancement.model';
import {
  MasterDatabase,
  MasterAdvancement,
  MasterBiome,
  AdvancementProgress,
  CategoryProgress,
  ProgressSummary,
} from '../models/progress.model';
import { LocalStorageService, StorageKey } from './local-storage.service';
import { FileParserService } from './file-parser.service';
import masterData from '../../../../public/assets/data/master-advancements.json';

/**
 * Central state service for the application.
 * Uses Angular Signals for reactive state management.
 *
 * Responsibilities:
 * - Holds the parsed advancement data from the user's file
 * - Computes derived state (visited/missing biomes, progress per category)
 * - Manages user seed with auto-persistence to localStorage
 * - Provides methods to load from file, load from storage, and clear state
 */
@Injectable({
  providedIn: 'root',
})
export class ProgressStateService {
  private readonly storage = inject(LocalStorageService);
  private readonly parser = inject(FileParserService);

  // ─── Master Data ───────────────────────────────────────────────────
  /** The static master database loaded from assets */
  readonly masterDb: MasterDatabase = masterData as MasterDatabase;

  constructor() {
    // Auto-restore saved advancement data on app startup
    this.loadFromStorage();
  }

  // ─── Primary State (Signals) ───────────────────────────────────────
  /** Raw parsed advancement data from the user's save file */
  readonly gameState = signal<ParsedAdvancements | null>(null);

  /** The user's world seed (auto-persisted) */
  readonly userSeed = signal<string>(
    this.storage.getString(StorageKey.UserSeed) ?? ''
  );

  /** The name of the last loaded file */
  readonly fileName = signal<string>(
    this.storage.getString(StorageKey.FileName) ?? ''
  );

  /** Whether data has been loaded (from file or storage) */
  readonly isLoaded = computed(() => this.gameState() !== null);

  // ─── Computed: Biomes ──────────────────────────────────────────────
  /** List of biome IDs the user has visited (from Adventuring Time criteria) */
  readonly visitedBiomes = computed<string[]>(() => {
    const state = this.gameState();
    if (!state) return [];

    const adventuringTime = state.advancements.get(
      'minecraft:adventure/adventuring_time'
    );
    if (!adventuringTime) return [];

    return Object.keys(adventuringTime.criteria);
  });

  /** Overworld biomes required for Adventuring Time */
  readonly requiredBiomes = computed<MasterBiome[]>(() => {
    const advTimeMaster = this.masterDb.advancements.find(
      (a) => a.id === 'minecraft:adventure/adventuring_time'
    );
    if (!advTimeMaster) return [];

    return this.masterDb.biomes.filter(
      (b) => b.dimension === 'overworld' && advTimeMaster.criteria.includes(b.id)
    );
  });

  /** Biomes the user still needs to visit */
  readonly missingBiomes = computed<MasterBiome[]>(() => {
    const visited = new Set(this.visitedBiomes());
    return this.requiredBiomes().filter((b) => !visited.has(b.id));
  });

  /** Biomes the user has already visited (with metadata) */
  readonly visitedBiomeDetails = computed<MasterBiome[]>(() => {
    const visited = new Set(this.visitedBiomes());
    return this.requiredBiomes().filter((b) => visited.has(b.id));
  });

  // ─── Computed: Per-Advancement Progress ────────────────────────────
  /** Full progress computation for every advancement */
  readonly advancementProgress = computed<AdvancementProgress[]>(() => {
    const state = this.gameState();
    return this.masterDb.advancements.map((master) =>
      this.computeAdvancementProgress(master, state)
    );
  });

  // ─── Computed: Per-Category Progress ───────────────────────────────
  /** Progress grouped by category */
  readonly categoryProgress = computed<CategoryProgress[]>(() => {
    const allProgress = this.advancementProgress();

    return this.masterDb.categories.map((cat) => {
      const catAdvancements = allProgress.filter(
        (p) => p.advancement.category === cat.id
      );
      const completed = catAdvancements.filter((p) => p.completed).length;
      const total = catAdvancements.length;

      return {
        category: cat,
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        advancements: catAdvancements,
      };
    });
  });

  // ─── Computed: Overall Summary ─────────────────────────────────────
  /** Full progress summary for the dashboard */
  readonly progressSummary = computed<ProgressSummary>(() => {
    const categories = this.categoryProgress();
    const totalAdvancements = categories.reduce((sum, c) => sum + c.total, 0);
    const completedAdvancements = categories.reduce(
      (sum, c) => sum + c.completed,
      0
    );
    const visited = this.visitedBiomes();
    const required = this.requiredBiomes();

    return {
      totalAdvancements,
      completedAdvancements,
      overallPercentage:
        totalAdvancements > 0
          ? Math.round((completedAdvancements / totalAdvancements) * 100)
          : 0,
      categories,
      visitedBiomesCount: visited.length,
      totalBiomesCount: required.length,
      visitedBiomes: visited,
      missingBiomes: this.missingBiomes().map((b) => b.id),
    };
  });

  // ─── Actions ───────────────────────────────────────────────────────

  /**
   * Load advancement data from a File object (drag & drop / file input).
   * Parses the file, updates state, and persists to localStorage.
   */
  async loadFromFile(file: File): Promise<void> {
    const parsed = await this.parser.parseFile(file);
    this.gameState.set(parsed);
    this.fileName.set(file.name);

    // Persist to localStorage
    this.persistState(parsed, file.name);
  }

  /**
   * Load advancement data from localStorage (returning user).
   * Returns true if data was found and loaded, false otherwise.
   */
  loadFromStorage(): boolean {
    const rawState = this.storage.get<Record<string, unknown>>(StorageKey.GameState);
    if (!rawState) return false;

    try {
      const content = JSON.stringify(rawState);
      const parsed = this.parser.parseRawJSON(content);
      const storedFileName =
        this.storage.getString(StorageKey.FileName) ?? 'saved session';

      this.gameState.set(parsed);
      this.fileName.set(storedFileName);
      return true;
    } catch (error) {
      console.warn('[ProgressState] Failed to load from localStorage:', error);
      return false;
    }
  }

  /**
   * Update the user's world seed and persist it.
   */
  updateSeed(seed: string): void {
    const trimmed = seed.trim();
    this.userSeed.set(trimmed);
    if (trimmed) {
      this.storage.setString(StorageKey.UserSeed, trimmed);
    } else {
      this.storage.remove(StorageKey.UserSeed);
    }
  }

  /**
   * Generate a Chunkbase URL for the current seed.
   * Returns null if no seed is set.
   */
  getChunkbaseUrl(): string | null {
    const seed = this.userSeed();
    if (!seed) return null;
    return `https://www.chunkbase.com/apps/seed-map#seed=${encodeURIComponent(seed)}`;
  }

  /**
   * Clear all state and localStorage data.
   */
  clearState(): void {
    this.gameState.set(null);
    this.userSeed.set('');
    this.fileName.set('');
    this.storage.clearAll();
  }

  /**
   * Check if the user has previously saved data in localStorage.
   */
  hasSavedData(): boolean {
    return this.storage.has(StorageKey.GameState);
  }

  // ─── Private Helpers ───────────────────────────────────────────────

  /**
   * Compute progress for a single advancement.
   */
  private computeAdvancementProgress(
    master: MasterAdvancement,
    state: ParsedAdvancements | null
  ): AdvancementProgress {
    if (!state) {
      return {
        advancement: master,
        completed: false,
        completedCriteria: [],
        missingCriteria: [...master.criteria],
        percentage: 0,
        completedAt: null,
      };
    }

    const userAdv: UserAdvancement | undefined = state.advancements.get(master.id);

    if (!userAdv) {
      return {
        advancement: master,
        completed: false,
        completedCriteria: [],
        missingCriteria: [...master.criteria],
        percentage: 0,
        completedAt: null,
      };
    }

    // For multi-criteria advancements (e.g., Adventuring Time, Monsters Hunted)
    if (master.criteria.length > 0) {
      const completedCriteria = master.criteria.filter(
        (c) => c in userAdv.criteria
      );
      const missingCriteria = master.criteria.filter(
        (c) => !(c in userAdv.criteria)
      );
      const percentage = Math.round(
        (completedCriteria.length / master.criteria.length) * 100
      );

      return {
        advancement: master,
        completed: userAdv.done,
        completedCriteria,
        missingCriteria,
        percentage: userAdv.done ? 100 : percentage,
        completedAt: this.getLatestTimestamp(userAdv),
      };
    }

    // For single-criteria advancements
    return {
      advancement: master,
      completed: userAdv.done,
      completedCriteria: userAdv.done ? ['default'] : [],
      missingCriteria: userAdv.done ? [] : ['default'],
      percentage: userAdv.done ? 100 : 0,
      completedAt: userAdv.done ? this.getLatestTimestamp(userAdv) : null,
    };
  }

  /**
   * Get the latest completion timestamp from a user advancement's criteria.
   */
  private getLatestTimestamp(adv: UserAdvancement): string | null {
    const timestamps = Object.values(adv.criteria).filter(
      (v): v is string => typeof v === 'string'
    );
    if (timestamps.length === 0) return null;

    return timestamps.sort().reverse()[0];
  }

  /**
   * Persist the current state to localStorage.
   */
  private persistState(parsed: ParsedAdvancements, fileName: string): void {
    // Convert Map back to plain object for JSON serialization
    const plainState: Record<string, unknown> = {
      DataVersion: parsed.dataVersion,
    };
    parsed.advancements.forEach((value, key) => {
      plainState[key] = value;
    });

    this.storage.set(StorageKey.GameState, plainState);
    this.storage.setString(StorageKey.FileName, fileName);
    this.storage.setString(
      StorageKey.LastLoadedAt,
      new Date().toISOString()
    );
  }
}
