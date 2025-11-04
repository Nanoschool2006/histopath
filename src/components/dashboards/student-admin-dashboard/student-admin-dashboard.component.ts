import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserRoleManagementComponent } from '../../user-role-management/user-role-management.component';
import { CourseManagementComponent } from '../../course-management/course-management.component';

@Component({
  selector: 'app-student-admin-dashboard',
  standalone: true,
  imports: [CommonModule, UserRoleManagementComponent, CourseManagementComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-800">Student Administration</h1>
      <app-user-role-management />
      <app-course-management />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentAdminDashboardComponent {
  readonly currentUser = inject(AuthService).currentUser;
}
