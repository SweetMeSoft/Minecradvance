import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressStateService } from '../../core/services/progress-state.service';
import { ProgressCardComponent } from '../../shared/components/progress-card/progress-card.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';
import { AdvancementProgress } from '../../core/models/progress.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ProgressCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  /** Inject the central state service */
  private readonly stateService = inject(ProgressStateService);

  /** Pass-through to the summary signal */
  protected readonly summary = this.stateService.progressSummary;

  /** Total overall percentage for the donut chart */
  protected readonly overallPercentage = computed(() => this.summary().overallPercentage);

  /** Quick stats */
  protected readonly totalCompleted = computed(() => this.summary().completedAdvancements);
  protected readonly totalAdvancements = computed(() => this.summary().totalAdvancements);
  protected readonly totalMissing = computed(
    () => this.totalAdvancements() - this.totalCompleted()
  );

  /** Circle coordinates for SVG donut chart */
  private readonly radius = 54;
  private readonly circumference = 2 * Math.PI * this.radius;

  /** Calculate stroke-dashoffset for the SVG donut chart based on percentage */
  protected readonly strokeDashoffset = computed(() => {
    const fraction = this.overallPercentage() / 100;
    return this.circumference * (1 - fraction);
  });

  protected readonly donutCircumference = this.circumference;

  /** Top 5 recent completions */
  protected readonly recentCompletions = computed(() => {
    const all = this.stateService.advancementProgress();
    // Filter only those completed and with a valid timestamp
    const completed = all.filter((a) => a.completed && a.completedAt);
    
    // Sort descending by timestamp
    completed.sort((a, b) => {
      const timeA = new Date(a.completedAt!).getTime();
      const timeB = new Date(b.completedAt!).getTime();
      return timeB - timeA;
    });

    return completed.slice(0, 5);
  });

  /** Get the color variant for a category ID */
  getCategoryVariant(categoryId: string): 'emerald' | 'diamond' | 'gold' | 'redstone' {
    switch (categoryId) {
      case 'story': return 'emerald';
      case 'adventure': return 'diamond';
      case 'nether': return 'redstone';
      case 'end': return 'diamond'; // Or maybe we give it its own? Diamond looks good
      case 'husbandry': return 'gold';
      default: return 'emerald';
    }
  }

  /** Format ISO date into a readable string */
  formatDate(isoDate: string | null): string {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit'
      }).format(date);
    } catch {
      return isoDate;
    }
  }
}
