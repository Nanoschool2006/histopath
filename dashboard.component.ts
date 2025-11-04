import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @deprecated This component's logic has been moved to 'src/components/dashboards/pathologist-dashboard/pathologist-dashboard.component.ts'.
 * This file is obsolete and has been neutralized to prevent build errors.
 */
@Component({
  selector: 'app-pathologist-dashboard-root-obsolete',
  standalone: true,
  imports: [CommonModule],
  template: '<!-- MOVED to src/components/dashboards/pathologist-dashboard/ -->',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathologistDashboardObsoleteComponent {
  // Logic moved.
}
