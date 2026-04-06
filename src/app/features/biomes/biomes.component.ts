import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressStateService } from '../../core/services/progress-state.service';
import { ProgressCardComponent } from '../../shared/components/progress-card/progress-card.component';
import { MasterBiome, MasterDatabase } from '../../core/models/progress.model';
import masterDataJson from '../../../../public/assets/data/master-advancements.json';

const masterDb = masterDataJson as MasterDatabase;

interface BiomeDisplay extends MasterBiome {
  isVisited: boolean;
}

@Component({
  selector: 'app-biomes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './biomes.component.html',
  styleUrl: './biomes.component.css',
})
export class BiomesComponent {
  private readonly stateService = inject(ProgressStateService);

  /** Search query signal */
  protected readonly searchQuery = signal('');

  /** Filter type (all | visited | missing) */
  protected readonly filterType = signal<'all' | 'visited' | 'missing'>('all');

  /** Internal parsed biomes list wrapping visited info */
  private readonly allBiomes = computed<BiomeDisplay[]>(() => {
    const visitedSet = new Set(this.stateService.visitedBiomes());
    
    // We only care about biomes required by Adventuring Time
    const advTime = masterDb.advancements.find(
      (a) => a.id === 'minecraft:adventure/adventuring_time'
    );
    if (!advTime) return [];

    const requiredBiomes = masterDb.biomes.filter(
      (b) => advTime.criteria.includes(b.id)
    );

    return requiredBiomes.map(b => ({
      ...b,
      isVisited: visitedSet.has(b.id)
    }));
  });

  /** Filtered and sorted list for display */
  protected readonly displayedBiomes = computed(() => {
    let list = this.allBiomes();
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
    const total = this.allBiomes().length;
    const visited = this.allBiomes().filter(b => b.isVisited).length;
    const percentage = total > 0 ? Math.round((visited / total) * 100) : 0;
    return { total, visited, percentage };
  });

  setFilter(filter: 'all' | 'visited' | 'missing'): void {
    this.filterType.set(filter);
  }
}

