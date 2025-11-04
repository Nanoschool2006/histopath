import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PathologistDashboardComponent } from '../dashboards/pathologist-dashboard/pathologist-dashboard.component';
import { SuperAdminDashboardComponent } from '../dashboards/super-admin-dashboard/super-admin-dashboard.component';
import { SystemAdminDashboardComponent } from '../dashboards/system-admin-dashboard/system-admin-dashboard.component';
import { TenantAdminDashboardComponent } from '../dashboards/tenant-admin-dashboard/tenant-admin-dashboard.component';
import { ResearchDashboardComponent } from '../dashboards/research-dashboard/research-dashboard.component';
import { StudentDashboardComponent } from '../dashboards/student-dashboard/student-dashboard.component';
import { DemoDashboardComponent } from '../dashboards/demo-dashboard/demo-dashboard.component';
import { StudentAdminDashboardComponent } from '../dashboards/student-admin-dashboard/student-admin-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    PathologistDashboardComponent,
    SuperAdminDashboardComponent,
    SystemAdminDashboardComponent,
    TenantAdminDashboardComponent,
    ResearchDashboardComponent,
    StudentDashboardComponent,
    DemoDashboardComponent,
    StudentAdminDashboardComponent,
  ],
  // Fix: Replaced templateUrl with an inline template using @switch to render role-specific dashboards.
  template: `
    @if (currentUser(); as user) {
      @switch (user.role) {
        @case ('Pathologist') { <app-pathologist-dashboard /> }
        @case ('SuperAdmin') { <app-super-admin-dashboard /> }
        @case ('SystemAdmin') { <app-system-admin-dashboard /> }
        @case ('TenantAdmin') { <app-tenant-admin-dashboard /> }
        @case ('Researcher') { <app-research-dashboard /> }
        @case ('Student') { <app-student-dashboard /> }
        @case ('Demo') { <app-demo-dashboard /> }
        @case ('StudentAdmin') { <app-student-admin-dashboard /> }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;
}
