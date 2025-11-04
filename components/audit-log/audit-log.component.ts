import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiService } from '../../services/ui.service';
import { ActivityLogService, ActivityIcon } from '../../services/activity-log.service';

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogComponent {
  private readonly uiService = inject(UiService);
  private readonly activityLogService = inject(ActivityLogService);

  activities = this.activityLogService.activities;

  goBack() {
    this.uiService.showAuditLog.set(false);
  }
  
  getIconBgClass(icon: ActivityIcon): string {
    switch (icon) {
      case 'case_new': return 'bg-purple-500';
      case 'case_closed': return 'bg-green-500';
      case 'feedback_new': return 'bg-yellow-500';
      case 'user_added': return 'bg-blue-500';
      case 'system_update': return 'bg-gray-500';
      case 'action_cache': return 'bg-indigo-500';
      case 'action_restart': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }
}