import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.css',
})
export class ProgressBarComponent {
  /** Progress percentage (0–100) */
  readonly value = input<number>(0);

  /** Optional label text (displayed left side) */
  readonly label = input<string>('');

  /** Show percentage text on the bar */
  readonly showPercentage = input<boolean>(true);

  /** Bar height variant */
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  /** Color variant */
  readonly variant = input<'emerald' | 'diamond' | 'gold' | 'redstone'>('emerald');

  /** Whether to animate the fill on load */
  readonly animated = input<boolean>(true);

  /** Show the fraction (e.g., "10/53") */
  readonly completed = input<number | null>(null);
  readonly total = input<number | null>(null);

  /** Clamped value between 0–100 */
  protected readonly clampedValue = computed(() =>
    Math.min(100, Math.max(0, Math.round(this.value())))
  );

  /** Fraction text like "10/53" */
  protected readonly fractionText = computed(() => {
    const c = this.completed();
    const t = this.total();
    if (c !== null && t !== null) {
      return `${c}/${t}`;
    }
    return null;
  });
}
