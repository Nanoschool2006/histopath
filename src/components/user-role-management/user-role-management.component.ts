import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface User {
  id: string;
  name: string;
  role: string;
  email?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

@Component({
  selector: 'app-user-role-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-role-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRoleManagementComponent {
  activeTab = signal<'users' | 'roles'>('users');

  tenantUsers = signal<User[]>([
    { id: '1', name: 'Evelyn Reed', role: 'Administrator', email: 'evelyn@example.com' },
    { id: '2', name: 'John Smith', role: 'Pathologist', email: 'john@example.com' },
    { id: '3', name: 'Sarah Johnson', role: 'Student', email: 'sarah@example.com' }
  ]);

  tenantRoles = signal<Role[]>([
    { 
      id: '1', 
      name: 'Administrator', 
      description: 'Full system access and management',
      permissions: ['manage_users', 'manage_roles', 'view_all_cases', 'system_settings']
    },
    { 
      id: '2', 
      name: 'Pathologist', 
      description: 'Medical professional with diagnostic privileges',
      permissions: ['view_cases', 'diagnose_cases', 'review_cases']
    },
    { 
      id: '3', 
      name: 'Student', 
      description: 'Learning access with limited privileges',
      permissions: ['view_assigned_cases', 'submit_assignments']
    }
  ]);

  inviteUser(): void {
    // TODO: Implement user invitation logic
    console.log('Invite user functionality');
  }
}
