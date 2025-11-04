import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: Corrected the relative import path for the service.
import { ChangelogService } from '../../services/changelog.service';
import { ChangelogItemType } from '../../models';

@Component({
  selector: 'app-changelog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './changelog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangelogComponent {
  private readonly changelogService = inject(ChangelogService);
  
  // Group changelog items by date for display
  readonly changelogGroups = computed(() => {
    const groups = new Map<string, any[]>();
    this.changelogService.changelog().forEach(item => {
      const group = groups.get(item.date) || [];
      group.push(item);
      groups.set(item.date, group);
    });
    return Array.from(groups.entries());
  });

  getTypeClass(type: ChangelogItemType): string {
    switch (type) {
      case 'IMPROVE': return 'bg-yellow-100 text-yellow-800';
      case 'NEW': return 'bg-blue-100 text-blue-800';
      case 'FIX': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
