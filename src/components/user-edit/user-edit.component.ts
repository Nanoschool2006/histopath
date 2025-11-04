import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, NewUserData } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { RoleManagementService } from '../../services/role-management.service';
import { Role, UserRole } from '../../models';

const INITIAL_STATE: Omit<NewUserData, 'tenantId'> = {
  name: '',
  role: 'Student', // Default role
};

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserEditComponent {
  private readonly authService = inject(AuthService);
  private readonly uiService = inject(UiService);
  private readonly roleService = inject(RoleManagementService);
  
  newUserData = signal(INITIAL_STATE);
  
  currentUser = this.authService.currentUser;

  // Tenant Admins should not be able to create system-level or higher-level admin roles.
  // Student Admins should only be able to create students.
  availableRoles = computed(() => {
    const currentUserRole = this.currentUser()?.role;

    if (currentUserRole === 'StudentAdmin') {
      return this.roleService.roles().filter(r => r.name === 'Student');
    }

    const forbiddenRoles: UserRole[] = ['SuperAdmin', 'SystemAdmin', 'TenantAdmin'];
    return this.roleService.roles().filter(r => !forbiddenRoles.includes(r.name));
  });
  
  isSaveDisabled = computed(() => !this.newUserData().name || !this.newUserData().role);

  updateField<K extends keyof Omit<NewUserData, 'tenantId'>>(field: K, value: Omit<NewUserData, 'tenantId'>[K]) {
    this.newUserData.update(data => ({ ...data, [field]: value }));
  }

  saveUser() {
    if (this.isSaveDisabled() || !this.currentUser()?.tenantId) return;

    const finalUserData: NewUserData = {
      ...this.newUserData(),
      tenantId: this.currentUser()!.tenantId,
    };
    
    this.authService.addUser(finalUserData);
    this.close();
  }
  
  close() {
    this.newUserData.set(INITIAL_STATE);
    this.uiService.showUserEditForm.set(false);
  }
}
