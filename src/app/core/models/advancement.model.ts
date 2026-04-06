/**
 * Models the raw Minecraft advancements JSON file structure.
 *
 * The advancements file is located at:
 *   .minecraft/saves/<world>/advancements/<uuid>.json
 *
 * Structure: { "minecraft:story/root": { criteria: { ... }, done: true }, ... }
 */

/**
 * A single criterion entry in an advancement.
 * The key is the criterion name, value is the completion timestamp or null.
 */
export type CriteriaMap = Record<string, string>;

/**
 * A single advancement entry from the user's save file.
 */
export interface UserAdvancement {
  /** Map of criterion name → completion timestamp (ISO string) */
  criteria: CriteriaMap;
  /** Whether the advancement is fully completed */
  done: boolean;
}

/**
 * The raw JSON structure of a Minecraft advancements file.
 * Keys are advancement IDs like "minecraft:story/root".
 * The file also contains a "DataVersion" key (number).
 */
export interface AdvancementsJSON {
  /** Raw advancement entries keyed by namespace ID */
  [advancementId: string]: UserAdvancement | number;
  // Note: "DataVersion" is a number, all other keys are UserAdvancement
}

/**
 * Type guard to check if a value is a UserAdvancement (not DataVersion).
 */
export function isUserAdvancement(
  value: UserAdvancement | number
): value is UserAdvancement {
  return typeof value === 'object' && value !== null && 'done' in value;
}

/**
 * Parsed and validated advancements data from user's file.
 */
export interface ParsedAdvancements {
  /** Data version from the save file */
  dataVersion: number;
  /** Map of advancement ID → user advancement entry */
  advancements: Map<string, UserAdvancement>;
}
