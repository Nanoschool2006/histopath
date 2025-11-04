import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UiService } from '../../../services/ui.service';
import { FeedbackService } from '../../../services/feedback.service';
import { CaseService } from '../../../services/case.service';
import { ActivityLogService } from '../../../services/activity-log.service';
import { TenantService } from '../../../services/tenant.service';

import { ChangelogComponent } from '../../changelog/changelog.component';
import { GlobalIntegrationStatusComponent } from '../../global-integration-status/global-integration-status.component';
import { ModelManagementComponent } from '../../model-management/model-management.component';
import { UserFeedbackInboxComponent } from '../../user-feedback-inbox/user-feedback-inbox.component';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ChangelogComponent,
    GlobalIntegrationStatusComponent,
    ModelManagementComponent,
    UserFeedbackInboxComponent
  ],
  templateUrl: './super-admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SuperAdminDashboardComponent {
  private readonly uiService = inject(UiService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly authService = inject(AuthService);
  private readonly caseService = inject(CaseService);
  private readonly activityLogService = inject(ActivityLogService);
  private readonly tenantService = inject(TenantService);
  
  readonly currentUser = this.authService.currentUser;
  readonly newFeedbackCount = this.feedbackService.newFeedbackCount;
  readonly activities = this.activityLogService.activities;

  readonly dashboardData = computed(() => {
    const users = this.authService.allUsers();
    const cases = this.caseService.allCases();
    const tenants = this.tenantService.tenants();

    // Existing stats
    const totalUsers = users.length;
    const totalCases = cases.length;
    const totalTenants = tenants.length;

    // Data for "Cases by Tenant" chart
    const casesByTenantMap = new Map<string, number>();
    for (const c of cases) {
        if (c.tenantId) {
            casesByTenantMap.set(c.tenantId, (casesByTenantMap.get(c.tenantId) || 0) + 1);
        }
    }
    const casesByTenant = Array.from(casesByTenantMap.entries())
        .map(([tenantId, count]) => ({ tenantId, count }))
        .sort((a, b) => b.count - a.count);
    const maxCaseCount = Math.max(...casesByTenant.map(d => d.count), 0);
    
    // Data for "Users by Role" chart
    const usersByRoleMap = new Map<string, number>();
    for (const u of users) {
        usersByRoleMap.set(u.role, (usersByRoleMap.get(u.role) || 0) + 1);
    }
    const usersByRole = Array.from(usersByRoleMap.entries())
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count);
    const maxUserCount = Math.max(...usersByRole.map(d => d.count), 0);

    return {
      totalUsers,
      totalCases,
      totalTenants,
      casesByTenant,
      maxCaseCount,
      usersByRole,
      maxUserCount
    };
  });

  openFeedbackManagement() {
    this.uiService.showFeedbackManagement.set(true);
  }
  
  openRoleManagement() {
    this.uiService.showRoleManagement.set(true);
  }

  openTenantManagement() {
    this.uiService.showTenantManagement.set(true);
  }

  openNewCaseForm() {
    this.uiService.showNewCaseForm.set(true);
  }
}