import { Component, input, output, computed } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
  variant?: 'emerald' | 'diamond' | 'gold' | 'redstone' | 'default';
  count?: number;
}

@Component({
  selector: 'app-category-tabs',
  standalone: true,
  templateUrl: './category-tabs.component.html',
  styleUrl: './category-tabs.component.css',
})
export class CategoryTabsComponent {
  /** List of tabs to display */
  readonly tabs = input.required<TabItem[]>();

  /** The currently active tab ID */
  readonly activeTabId = input.required<string>();

  /** Emits the ID of the clicked tab */
  readonly tabChange = output<string>();

  /** 
   * Internal computed map for fast lookups (though the template just iterates over tabs array).
   * Could be useful if we need to derive active tab details.
   */
  protected readonly activeTab = computed(() => {
    return this.tabs().find((t) => t.id === this.activeTabId()) || null;
  });

  onTabClick(id: string): void {
    if (this.activeTabId() !== id) {
      this.tabChange.emit(id);
    }
  }
}
