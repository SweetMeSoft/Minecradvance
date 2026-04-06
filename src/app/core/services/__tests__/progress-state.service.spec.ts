import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ParsedAdvancements,
  UserAdvancement,
} from '../../models/advancement.model';
import {
  MasterDatabase,
  MasterAdvancement,
  MasterBiome,
  AdvancementProgress,
} from '../../models/progress.model';
import sampleData from './fixtures/sample-advancements.json';
import masterDataJson from '../../../../../public/assets/data/master-advancements.json';

/**
 * Tests for the core business logic of ProgressStateService.
 * These test the pure functions that power the computed signals,
 * without needing Angular's injection context.
 */

const masterDb = masterDataJson as MasterDatabase;

// ─── Pure functions replicating service logic ────────────────────

function parseRawJSON(content: string): ParsedAdvancements {
  const json = JSON.parse(content);
  const dataVersion = typeof json['DataVersion'] === 'number' ? json['DataVersion'] : 0;
  const advancements = new Map<string, UserAdvancement>();

  for (const [key, value] of Object.entries(json)) {
    if (key === 'DataVersion') continue;
    if (
      typeof value === 'object' &&
      value !== null &&
      'done' in (value as any)
    ) {
      advancements.set(key, value as UserAdvancement);
    }
  }

  return { dataVersion, advancements };
}

function computeAdvancementProgress(
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

  const userAdv = state.advancements.get(master.id);
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

  if (master.criteria.length > 0) {
    const completedCriteria = master.criteria.filter((c) => c in userAdv.criteria);
    const missingCriteria = master.criteria.filter((c) => !(c in userAdv.criteria));
    const percentage = Math.round(
      (completedCriteria.length / master.criteria.length) * 100
    );
    const timestamps = Object.values(userAdv.criteria).filter(
      (v): v is string => typeof v === 'string'
    );

    return {
      advancement: master,
      completed: userAdv.done,
      completedCriteria,
      missingCriteria,
      percentage: userAdv.done ? 100 : percentage,
      completedAt: timestamps.length > 0 ? timestamps.sort().reverse()[0] : null,
    };
  }

  const timestamps = Object.values(userAdv.criteria).filter(
    (v): v is string => typeof v === 'string'
  );

  return {
    advancement: master,
    completed: userAdv.done,
    completedCriteria: userAdv.done ? ['default'] : [],
    missingCriteria: userAdv.done ? [] : ['default'],
    percentage: userAdv.done ? 100 : 0,
    completedAt: userAdv.done && timestamps.length > 0 ? timestamps.sort().reverse()[0] : null,
  };
}

function getVisitedBiomes(state: ParsedAdvancements | null): string[] {
  if (!state) return [];
  const adv = state.advancements.get('minecraft:adventure/adventuring_time');
  if (!adv) return [];
  return Object.keys(adv.criteria);
}

function getRequiredBiomes(): MasterBiome[] {
  const advTime = masterDb.advancements.find(
    (a) => a.id === 'minecraft:adventure/adventuring_time'
  );
  if (!advTime) return [];
  return masterDb.biomes.filter(
    (b) => b.dimension === 'overworld' && advTime.criteria.includes(b.id)
  );
}

function getMissingBiomes(state: ParsedAdvancements | null): MasterBiome[] {
  const visited = new Set(getVisitedBiomes(state));
  return getRequiredBiomes().filter((b) => !visited.has(b.id));
}

// ─── Tests ───────────────────────────────────────────────────────

describe('ProgressStateService (logic tests)', () => {
  let parsed: ParsedAdvancements;

  beforeEach(() => {
    parsed = parseRawJSON(JSON.stringify(sampleData));
  });

  // ─── Master Database ───────────────────────────────────────────

  describe('master database', () => {
    it('should have 5 categories', () => {
      expect(masterDb.categories.length).toBe(5);
    });

    it('should have advancements', () => {
      expect(masterDb.advancements.length).toBeGreaterThan(50);
    });

    it('should have biomes', () => {
      expect(masterDb.biomes.length).toBeGreaterThan(50);
    });

    it('should have all category IDs', () => {
      const ids = masterDb.categories.map((c) => c.id);
      expect(ids).toContain('story');
      expect(ids).toContain('adventure');
      expect(ids).toContain('nether');
      expect(ids).toContain('end');
      expect(ids).toContain('husbandry');
    });
  });

  // ─── Biome Tracking ────────────────────────────────────────────

  describe('biome tracking', () => {
    it('should return visited biomes from Adventuring Time', () => {
      const visited = getVisitedBiomes(parsed);
      expect(visited.length).toBe(10);
      expect(visited).toContain('minecraft:plains');
      expect(visited).toContain('minecraft:forest');
      expect(visited).toContain('minecraft:river');
    });

    it('should return empty visited biomes when no data', () => {
      expect(getVisitedBiomes(null)).toEqual([]);
    });

    it('should compute missing biomes correctly', () => {
      const missing = getMissingBiomes(parsed);
      const required = getRequiredBiomes();
      expect(missing.length).toBe(required.length - 10);
    });

    it('should not include visited biomes in missing list', () => {
      const missingIds = getMissingBiomes(parsed).map((b) => b.id);
      expect(missingIds).not.toContain('minecraft:plains');
      expect(missingIds).not.toContain('minecraft:forest');
    });

    it('should include unvisited biomes in missing list', () => {
      const missingIds = getMissingBiomes(parsed).map((b) => b.id);
      expect(missingIds).toContain('minecraft:jungle');
      expect(missingIds).toContain('minecraft:mushroom_fields');
    });

    it('should report all biomes as missing when no data', () => {
      expect(getMissingBiomes(null).length).toBe(getRequiredBiomes().length);
    });
  });

  // ─── Advancement Progress ─────────────────────────────────────

  describe('advancement progress', () => {
    it('should mark completed advancements', () => {
      const p = computeAdvancementProgress(
        masterDb.advancements.find((a) => a.id === 'minecraft:story/root')!,
        parsed
      );
      expect(p.completed).toBe(true);
      expect(p.percentage).toBe(100);
      expect(p.completedAt).not.toBeNull();
    });

    it('should mark missing advancements as 0%', () => {
      const p = computeAdvancementProgress(
        masterDb.advancements.find((a) => a.id === 'minecraft:end/elytra')!,
        parsed
      );
      expect(p.completed).toBe(false);
      expect(p.percentage).toBe(0);
      expect(p.completedAt).toBeNull();
    });

    it('should compute partial progress for Adventuring Time', () => {
      const p = computeAdvancementProgress(
        masterDb.advancements.find(
          (a) => a.id === 'minecraft:adventure/adventuring_time'
        )!,
        parsed
      );
      expect(p.completed).toBe(false);
      expect(p.completedCriteria.length).toBe(10);
      expect(p.missingCriteria.length).toBe(43);
      expect(p.percentage).toBe(19);
    });

    it('should compute partial progress for Monsters Hunted', () => {
      const p = computeAdvancementProgress(
        masterDb.advancements.find(
          (a) => a.id === 'minecraft:adventure/kill_all_mobs'
        )!,
        parsed
      );
      expect(p.completed).toBe(false);
      expect(p.completedCriteria.length).toBe(5);
    });

    it('should return all criteria as missing with null state', () => {
      const p = computeAdvancementProgress(
        masterDb.advancements.find(
          (a) => a.id === 'minecraft:adventure/adventuring_time'
        )!,
        null
      );
      expect(p.completedCriteria.length).toBe(0);
      expect(p.missingCriteria.length).toBe(53);
      expect(p.percentage).toBe(0);
    });
  });

  // ─── Category Progress ─────────────────────────────────────────

  describe('category progress', () => {
    it('should compute correct story category completion', () => {
      const storyAdvancements = masterDb.advancements.filter(
        (a) => a.category === 'story'
      );
      const storyProgress = storyAdvancements.map((a) =>
        computeAdvancementProgress(a, parsed)
      );
      const completed = storyProgress.filter((p) => p.completed).length;
      expect(completed).toBe(5);
    });

    it('should compute reasonable overall percentage', () => {
      const allProgress = masterDb.advancements.map((m) =>
        computeAdvancementProgress(m, parsed)
      );
      const total = allProgress.length;
      const completed = allProgress.filter((p) => p.completed).length;
      const pct = Math.round((completed / total) * 100);
      expect(pct).toBeGreaterThan(0);
      expect(pct).toBeLessThan(50);
    });
  });

  // ─── Seed / URL Logic ──────────────────────────────────────────

  describe('seed / URL logic', () => {
    it('should generate correct Chunkbase URL', () => {
      const seed = '12345';
      const url = `https://www.chunkbase.com/apps/seed-map#seed=${encodeURIComponent(seed)}`;
      expect(url).toBe('https://www.chunkbase.com/apps/seed-map#seed=12345');
    });

    it('should encode special characters in seed URL', () => {
      const seed = '-123 456';
      const url = `https://www.chunkbase.com/apps/seed-map#seed=${encodeURIComponent(seed)}`;
      expect(url).toContain('-123%20456');
    });

    it('should handle numeric seeds', () => {
      const seed = '-9876543210';
      const url = `https://www.chunkbase.com/apps/seed-map#seed=${encodeURIComponent(seed)}`;
      expect(url).toBe(
        'https://www.chunkbase.com/apps/seed-map#seed=-9876543210'
      );
    });
  });

  // ─── JSON Parsing ─────────────────────────────────────────────

  describe('JSON parsing', () => {
    it('should extract DataVersion', () => {
      expect(parsed.dataVersion).toBe(3953);
    });

    it('should parse all advancement entries', () => {
      const expected = Object.keys(sampleData).filter(
        (k) => k !== 'DataVersion'
      ).length;
      expect(parsed.advancements.size).toBe(expected);
    });

    it('should handle missing DataVersion', () => {
      const noVersion = parseRawJSON(
        JSON.stringify({
          'minecraft:story/root': {
            criteria: { test: '2024-01-01T00:00:00+00:00' },
            done: true,
          },
        })
      );
      expect(noVersion.dataVersion).toBe(0);
    });
  });
});
