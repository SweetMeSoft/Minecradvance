import { describe, it, expect, beforeEach } from 'vitest';
import {
  UserAdvancement,
  ParsedAdvancements,
  isUserAdvancement,
} from '../../models/advancement.model';
import sampleData from './fixtures/sample-advancements.json';

/**
 * Tests for file parsing logic.
 * Tests the pure parsing functions without Angular's DI context.
 */

// ─── Pure parsing logic (mirrors FileParserService) ──────────────

function parseRawJSON(content: string): ParsedAdvancements {
  if (!content || content.trim().length === 0) {
    throw new Error('The file content is empty.');
  }

  let json: any;
  try {
    json = JSON.parse(content);
  } catch {
    throw new Error('The file does not contain valid JSON.');
  }

  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    throw new Error('Invalid file structure.');
  }

  const dataVersion = typeof json['DataVersion'] === 'number' ? json['DataVersion'] : 0;
  const advancements = new Map<string, UserAdvancement>();

  for (const [key, value] of Object.entries(json)) {
    if (key === 'DataVersion') continue;
    if (isUserAdvancement(value as any)) {
      advancements.set(key, value as UserAdvancement);
    }
  }

  if (advancements.size === 0) {
    throw new Error('No valid advancement entries found.');
  }

  return { dataVersion, advancements };
}

// ─── Tests ───────────────────────────────────────────────────────

describe('FileParserService (logic tests)', () => {
  describe('parseRawJSON', () => {
    it('should parse valid advancement JSON string', () => {
      const result = parseRawJSON(JSON.stringify(sampleData));
      expect(result).toBeDefined();
      expect(result.dataVersion).toBe(3953);
      expect(result.advancements).toBeInstanceOf(Map);
      expect(result.advancements.size).toBeGreaterThan(0);
    });

    it('should extract DataVersion correctly', () => {
      const result = parseRawJSON(JSON.stringify(sampleData));
      expect(result.dataVersion).toBe(3953);
    });

    it('should parse all advancement entries (excluding DataVersion)', () => {
      const result = parseRawJSON(JSON.stringify(sampleData));
      const expectedCount = Object.keys(sampleData).filter(
        (k) => k !== 'DataVersion'
      ).length;
      expect(result.advancements.size).toBe(expectedCount);
    });

    it('should correctly parse a completed advancement', () => {
      const result = parseRawJSON(JSON.stringify(sampleData));
      const root = result.advancements.get('minecraft:story/root');
      expect(root).toBeDefined();
      expect(root!.done).toBe(true);
      expect(root!.criteria).toHaveProperty('crafting_table');
    });

    it('should correctly parse an incomplete multi-criteria advancement', () => {
      const result = parseRawJSON(JSON.stringify(sampleData));
      const adventuringTime = result.advancements.get(
        'minecraft:adventure/adventuring_time'
      );
      expect(adventuringTime).toBeDefined();
      expect(adventuringTime!.done).toBe(false);
      expect(Object.keys(adventuringTime!.criteria).length).toBe(10);
      expect(adventuringTime!.criteria).toHaveProperty('minecraft:plains');
      expect(adventuringTime!.criteria).toHaveProperty('minecraft:forest');
    });

    it('should throw for empty content', () => {
      expect(() => parseRawJSON('')).toThrow('empty');
    });

    it('should throw for whitespace-only content', () => {
      expect(() => parseRawJSON('   \n  ')).toThrow('empty');
    });

    it('should throw for invalid JSON', () => {
      expect(() => parseRawJSON('{not valid}')).toThrow('valid JSON');
    });

    it('should throw for JSON array instead of object', () => {
      expect(() => parseRawJSON('[1, 2, 3]')).toThrow('Invalid');
    });

    it('should throw for object with no valid advancements', () => {
      expect(() =>
        parseRawJSON(
          JSON.stringify({ DataVersion: 3953, someKey: 'value', num: 42 })
        )
      ).toThrow('No valid');
    });

    it('should handle DataVersion being 0 if missing', () => {
      const result = parseRawJSON(
        JSON.stringify({
          'minecraft:story/root': {
            criteria: { crafting_table: '2024-01-01T00:00:00+00:00' },
            done: true,
          },
        })
      );
      expect(result.dataVersion).toBe(0);
    });

    it('should parse criteria timestamps correctly', () => {
      const result = parseRawJSON(JSON.stringify(sampleData));
      const root = result.advancements.get('minecraft:story/root');
      expect(root!.criteria['crafting_table']).toBe('2024-03-15T10:30:00+00:00');
    });
  });

  describe('isUserAdvancement type guard', () => {
    it('should return true for valid advancement objects', () => {
      expect(
        isUserAdvancement({ criteria: {}, done: true })
      ).toBe(true);
    });

    it('should return false for numbers (DataVersion)', () => {
      expect(isUserAdvancement(3953)).toBe(false);
    });

    it('should return false for strings', () => {
      expect(isUserAdvancement('test' as any)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isUserAdvancement(null as any)).toBe(false);
    });
  });
});
