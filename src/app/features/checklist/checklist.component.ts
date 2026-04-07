import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ProgressStateService } from '../../core/services/progress-state.service';
import { MasterAdvancement } from '../../core/models/progress.model';

interface ChecklistItem {
  id: string;
  name: string;
  isVisited: boolean;
}

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checklist.component.html',
  styleUrl: './checklist.component.css',
})
export class ChecklistComponent {
  private readonly stateService = inject(ProgressStateService);
  private readonly route = inject(ActivatedRoute);

  /** Search query signal */
  protected readonly searchQuery = signal('');

  /** Filter type (all | visited | missing) */
  protected readonly filterType = signal<'all' | 'visited' | 'missing'>('all');

  /** The advancement we are viewing currently */
  protected readonly currentAdvancementId = signal<string>('');

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.currentAdvancementId.set(decodeURIComponent(id));
      }
    });
  }

  /** The master data definition for the current checklist advancement */
  protected readonly masterData = computed<MasterAdvancement | null>(() => {
    const id = this.currentAdvancementId();
    if (!id) return null;
    return this.stateService.masterDb.advancements.find(a => a.id === id) || null;
  });

  /** Internal parsed checklist items wrapping completed info */
  private readonly allItems = computed<ChecklistItem[]>(() => {
    const master = this.masterData();
    if (!master) return [];

    // Find user progress for this specific advancement
    const progressList = this.stateService.advancementProgress();
    const progress = progressList.find(p => p.advancement.id === master.id);
    
    // Convert array of completed criteria names to a set
    const completedSet = new Set<string>(progress?.completedCriteria || []);
    
    return master.criteria.map(c => ({
      id: c,
      name: this.formatCriteriaName(c),
      isVisited: completedSet.has(c)
    }));
  });

  /** Filtered and sorted list for display */
  protected readonly displayedItems = computed(() => {
    let list = this.allItems();
    const filter = this.filterType();
    const query = this.searchQuery().toLowerCase().trim();

    // 1. Text Search
    if (query) {
      list = list.filter(b => b.name.toLowerCase().includes(query) || b.id.toLowerCase().includes(query));
    }

    // 2. State Filter
    if (filter === 'visited') {
      list = list.filter(b => b.isVisited);
    } else if (filter === 'missing') {
      list = list.filter(b => !b.isVisited);
    }

    // 3. Sort: Missing first, then alphabetical
    return list.sort((a, b) => {
      if (a.isVisited !== b.isVisited) {
        return a.isVisited ? 1 : -1;
      }
      return a.name.localeCompare(b.name);
    });
  });

  /** Header statistics */
  protected readonly stats = computed(() => {
    const total = this.allItems().length;
    const visited = this.allItems().filter(b => b.isVisited).length;
    const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;
    return { total, visited, percentage };
  });

  setFilter(filter: 'all' | 'visited' | 'missing'): void {
    this.filterType.set(filter);
  }

  /** Format criteria string into a neat readable form */
  private formatCriteriaName(c: string): string {
    return c
      .replace(/^minecraft:/, '')    // Remove namespace
      .replace(/_/g, ' ')            // Replace underscores
      .replace(/\b\w/g, l => l.toUpperCase()); // Title Case
  }
}
