/**
 * Models for master advancement data and computed progress summaries.
 */

/**
 * A category grouping advancements (Story, Adventure, Nether, End, Husbandry).
 */
export interface MasterCategory {
  /** Category identifier (e.g., "story", "adventure") */
  id: string;
  /** Display name (e.g., "Adventure") */
  name: string;
  /** Category description */
  description: string;
  /** Relative path to category icon */
  icon: string;
}

/**
 * A single advancement entry from the master database.
 */
export interface MasterAdvancement {
  /** Full namespace ID (e.g., "minecraft:story/root") */
  id: string;
  /** Category this advancement belongs to */
  category: string;
  /** Display name (e.g., "Stone Age") */
  name: string;
  /** Description text */
  description: string;
  /** Icon filename (e.g., "diamond.png") */
  icon: string;
  /** Parent advancement ID, or null for root advancements */
  parent: string | null;
  /** List of criteria IDs for multi-criteria advancements (e.g., biomes list) */
  criteria: string[];
}

/**
 * A biome entry from the master database.
 */
export interface MasterBiome {
  /** Full namespace ID (e.g., "minecraft:plains") */
  id: string;
  /** Display name (e.g., "Plains") */
  name: string;
  /** Dimension this biome belongs to */
  dimension: 'overworld' | 'nether' | 'end';
}

/**
 * The full master advancements database structure.
 */
export interface MasterDatabase {
  /** Minecraft version this data targets */
  version: string;
  /** Date the data was last updated */
  lastUpdated: string;
  /** Advancement categories */
  categories: MasterCategory[];
  /** All advancements */
  advancements: MasterAdvancement[];
  /** All biomes */
  biomes: MasterBiome[];
}

/**
 * Computed progress for a single advancement.
 */
export interface AdvancementProgress {
  /** Reference to the master advancement */
  advancement: MasterAdvancement;
  /** Whether the advancement is fully completed */
  completed: boolean;
  /** For multi-criteria: list of completed criteria IDs */
  completedCriteria: string[];
  /** For multi-criteria: list of missing criteria IDs */
  missingCriteria: string[];
  /** Completion percentage (0–100) */
  percentage: number;
  /** Completion timestamp if done, null otherwise */
  completedAt: string | null;
}

/**
 * Computed progress summary for a category.
 */
export interface CategoryProgress {
  /** Category metadata */
  category: MasterCategory;
  /** Total advancements in this category */
  total: number;
  /** Number of completed advancements */
  completed: number;
  /** Completion percentage (0–100) */
  percentage: number;
  /** Individual advancement progress entries */
  advancements: AdvancementProgress[];
}

/**
 * Overall progress summary across all categories.
 */
export interface ProgressSummary {
  /** Total advancements across all categories */
  totalAdvancements: number;
  /** Total completed advancements */
  completedAdvancements: number;
  /** Overall completion percentage (0–100) */
  overallPercentage: number;
  /** Per-category progress breakdown */
  categories: CategoryProgress[];
  /** Total biomes visited (for Adventuring Time) */
  visitedBiomesCount: number;
  /** Total biomes required */
  totalBiomesCount: number;
  /** List of visited biome IDs */
  visitedBiomes: string[];
  /** List of missing biome IDs */
  missingBiomes: string[];
}
