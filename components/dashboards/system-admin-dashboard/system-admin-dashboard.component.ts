import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';
import { ErrorLoggingService } from '../../../services/error-logging.service';
import { NotificationService } from '../../../services/notification.service';
import { ActivityLogService } from '../../../services/activity-log.service';

@Component({
  selector: 'app-system-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './system-admin-dashboard.component.html',
  styleUrl: './system-admin-dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemAdminDashboardComponent {
  readonly currentUser = inject(AuthService).currentUser;
  private readonly uiService = inject(UiService);
  private readonly errorService = inject(ErrorLoggingService);
  private readonly notificationService = inject(NotificationService);
  private readonly activityLogService = inject(ActivityLogService);

  readonly recentErrors = computed(() => this.errorService.loggedErrors().slice(0, 5));
  
  isPerformingAction = signal<string | null>(null); // 'cache' or 'restart'
  showClearCacheConfirm = signal(false);
  showRestartConfirm = signal(false);

  // Mock system health stats for a more dynamic feel
  readonly systemHealth = computed(() => {
    return {
      apiLatency: 45 + Math.floor(Math.random() * 20), // e.g., 45-65ms
      dbConnections: 98,
      aiModelStatus: 'Operational',
    };
  });

  goToRoleManagement() {
    this.uiService.showRoleManagement.set(true);
  }
  
  openNotificationSettings() {
    this.uiService.showSystemSettings.set(true);
  }
  
  openAuditLog() {
    this.uiService.showAuditLog.set(true);
  }
  
  confirmClearCache() {
    this.isPerformingAction.set('cache');
    this.showClearCacheConfirm.set(false);
    
    setTimeout(() => {
        this.notificationService.show('System cache cleared successfully.', 'success');
        this.activityLogService.logActivity('action_cache', `${this.currentUser()?.name} cleared the system cache.`);
        this.isPerformingAction.set(null);
    }, 1500);
  }
  
  confirmRestartServices() {
    this.isPerformingAction.set('restart');
    this.showRestartConfirm.set(false);
    
    setTimeout(() => {
        this.notificationService.show('All services have been restarted.', 'success');
        this.activityLogService.logActivity('action_restart', `${this.currentUser()?.name} initiated a system services restart.`);
        this.isPerformingAction.set(null);
    }, 3000);
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
