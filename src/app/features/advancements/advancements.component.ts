import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressStateService } from '../../core/services/progress-state.service';
import { CategoryTabsComponent, TabItem } from '../../shared/components/category-tabs/category-tabs.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { AdvancementProgress } from '../../core/models/progress.model';

@Component({
  selector: 'app-advancements',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryTabsComponent, ProgressBarComponent],
  templateUrl: './advancements.component.html',
  styleUrl: './advancements.component.css',
})
export class AdvancementsComponent {
  private readonly stateService = inject(ProgressStateService);

  /** Active category ID, defaults to 'story' */
  protected readonly activeCategoryId = signal<string>('story');

  /** Search query within advancements */
  protected readonly searchQuery = signal('');

  /** Current filter type for advancements mapping */
  protected readonly filterType = signal<'all' | 'completed' | 'in-progress' | 'missing'>('all');

  /** ID of the currently expanded advancement details card */
  protected readonly expandedAdvancementId = signal<string | null>(null);

  /** Generate category tabs from state service summary */
  protected readonly categoryTabs = computed<TabItem[]>(() => {
    return this.stateService.progressSummary().categories.map(c => ({
      id: c.category.id,
      label: c.category.name,
      icon: `assets/icons/${c.category.icon}`,
      variant: this.getCategoryVariant(c.category.id),
      count: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0 // Show percentage as badge
    }));
  });

  /** Raw advancements for the active category */
  private readonly rawActiveAdvancements = computed<AdvancementProgress[]>(() => {
    return this.stateService.advancementProgress().filter(
      (a) => a.advancement.category === this.activeCategoryId()
    );
  });

  /** Filtered, sorted, and searched advancements */
  protected readonly displayedAdvancements = computed<AdvancementProgress[]>(() => {
    let list = this.rawActiveAdvancements();
    const filter = this.filterType();
    const query = this.searchQuery().toLowerCase().trim();

    // Text Search
    if (query) {
      list = list.filter(a => 
        a.advancement.name.toLowerCase().includes(query) || 
        a.advancement.description.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filter === 'completed') {
      list = list.filter(a => a.completed);
    } else if (filter === 'in-progress') {
      list = list.filter(a => !a.completed && a.completedCriteria.length > 0);
    } else if (filter === 'missing') {
      list = list.filter(a => !a.completed && a.completedCriteria.length === 0);
    }

    // Sort: typically, we would do some topological/requirements tree sort, but for a grid/list we can just sort alphabetically or by completeness.
    return list.sort((a, b) => {
      // Completed last, or by percentage? Let's sort alphabetically for now
      return a.advancement.name.localeCompare(b.advancement.name);
    });
  });

  /** Stats for the currently selected category */
  protected readonly activeCategoryStats = computed(() => {
    const list = this.rawActiveAdvancements();
    const total = list.length;
    const completed = list.filter(l => l.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  });

  onCategoryChange(categoryId: string): void {
    this.activeCategoryId.set(categoryId);
    this.expandedAdvancementId.set(null); // Close expanded card when switching tabs
  }

  setFilter(filter: 'all' | 'completed' | 'in-progress' | 'missing'): void {
    this.filterType.set(filter);
    this.expandedAdvancementId.set(null);
  }

  toggleExpand(advId: string): void {
    if (this.expandedAdvancementId() === advId) {
      this.expandedAdvancementId.set(null);
    } else {
      this.expandedAdvancementId.set(advId);
    }
  }

  /** Format criteria string into a neat readable form */
  formatCriteriaName(c: string): string {
    return c
      .replace(/^minecraft:/, '')    // Remove namespace
      .replace(/_/g, ' ')            // Replace underscores
      .replace(/\b\w/g, l => l.toUpperCase()); // Title Case
  }

  /** Helper to determine the visual variant for a category */
  getCategoryVariant(categoryId: string): 'emerald' | 'diamond' | 'gold' | 'redstone' {
    switch (categoryId) {
      case 'story': return 'emerald';
      case 'adventure': return 'diamond';
      case 'nether': return 'redstone';
      case 'end': return 'diamond';
      case 'husbandry': return 'gold';
      default: return 'emerald';
    }
  }

  getCategoryLabel(): string {
    const tab = this.categoryTabs().find(t => t.id === this.activeCategoryId());
    return tab ? tab.label : this.activeCategoryId();
  }
}
