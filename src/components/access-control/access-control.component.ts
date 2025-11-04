import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Permission, UserRole } from '../../models';
import { RoleManagementService } from '../../services/role-management.service';

@Component({
  selector: 'app-access-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './access-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessControlComponent {
  private readonly authService = inject(AuthService);
  private readonly roleService = inject(RoleManagementService);
  
  requiredRoles = input<UserRole[]>([]);
  requiredPermissions = input<Permission[]>([]);
  
  currentUser = this.authService.currentUser;
  allRoles = this.roleService.roles;

  canShow = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return false;
    }
    
    // Role check
    const hasRequiredRole = this.requiredRoles().length === 0 || this.requiredRoles().includes(user.role);
    if (!hasRequiredRole) {
      return false;
    }

    // Permission check
    if (this.requiredPermissions().length > 0) {
      const userRole = this.allRoles().find(r => r.name === user.role);
      if (!userRole) {
        return false; // User has a role that doesn't exist in role management
      }
      const userPermissions = userRole.permissions;
      return this.requiredPermissions().every(p => userPermissions.includes(p));
    }

    return true; // If no permissions required, role check was sufficient
  });
}