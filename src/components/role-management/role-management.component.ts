import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RoleManagementService } from '../../services/role-management.service';
import { Role, Permission, UserRole } from '../../models';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './role-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoleManagementComponent {
  private readonly roleService = inject(RoleManagementService);
  private readonly uiService = inject(UiService);
  private readonly fb = inject(FormBuilder);
  
  roles = this.roleService.roles;
  allPermissions = this.roleService.allPermissions;

  // Master-detail state
  selectedRole = signal<Role | null>(null);
  isCreating = signal(false);

  // Form state
  roleForm: FormGroup;
  
  // Delete confirmation modal state
  showDeleteConfirm = signal(false);
  roleToDelete = signal<Role | null>(null);

  // Derived state to know what to show in the detail pane
  isDetailViewActive = computed(() => this.selectedRole() !== null || this.isCreating());

  allPermissionsSelected = computed(() => {
    const permissionsGroup = this.roleForm.get('permissions') as FormGroup;
    // FIX: Use getRawValue() to avoid typing issues with AbstractControl. This is safer and cleaner.
    const permissionsValues = permissionsGroup.getRawValue();
    const values = Object.values(permissionsValues);
    if (values.length === 0) return false;
    return values.every(value => value === true);
  });

  constructor() {
    this.roleForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      description: ['', Validators.required],
      permissions: this.fb.group({}) // Permissions will be added dynamically
    });

    // When the available permissions change, rebuild the permissions form group
    effect(() => {
        const permissionsGroup = this.allPermissions().reduce((group, permission) => {
            group[permission.id] = this.fb.control(false);
            return group;
        }, {} as Record<string, any>);
        this.roleForm.setControl('permissions', this.fb.group(permissionsGroup));
    });
  }

  selectRole(role: Role) {
    this.selectedRole.set(role);
    this.isCreating.set(false);
    this.roleForm.reset();
    this.roleForm.patchValue({
      id: role.id,
      name: role.name,
      description: role.description,
    });
    
    // Set permission checkboxes
    const permissionsValues: Record<string, boolean> = {};
    for (const p of this.allPermissions()) {
        permissionsValues[p.id] = role.permissions.includes(p.id);
    }
    this.roleForm.get('permissions')?.patchValue(permissionsValues);
  }
  
  startCreating() {
    this.selectedRole.set(null);
    this.isCreating.set(true);
    this.roleForm.reset();
  }

  cancelEdit() {
    this.selectedRole.set(null);
    this.isCreating.set(false);
    this.roleForm.reset();
  }

  saveRole() {
    if (this.roleForm.invalid) {
      return;
    }

    const formValue = this.roleForm.getRawValue();

    // Convert permissions from object to array of strings
    const permissions = Object.entries(formValue.permissions)
      .filter(([, value]) => value)
      .map(([key]) => key as Permission);
    
    if (this.isCreating()) {
      const newRole: Omit<Role, 'id'> = {
        name: formValue.name as UserRole,
        description: formValue.description,
        permissions: permissions
      };
      this.roleService.addRole(newRole);
    } else if (this.selectedRole()) {
       const updatedRole: Role = {
          id: this.selectedRole()!.id,
          name: formValue.name as UserRole,
          description: formValue.description,
          permissions: permissions
      };
      this.roleService.updateRole(updatedRole);
    }
    
    this.cancelEdit();
  }
  
  openDeleteConfirm(role: Role) {
    this.roleToDelete.set(role);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.roleToDelete.set(null);
  }

  confirmDelete() {
    const role = this.roleToDelete();
    if (role) {
      // If we are deleting the currently selected role, reset the view
      if (this.selectedRole()?.id === role.id) {
        this.cancelEdit();
      }
      this.roleService.deleteRole(role.id);
    }
    this.closeDeleteConfirm();
  }
  
  goBack() {
    this.uiService.showRoleManagement.set(false);
  }

  toggleAllPermissions() {
    const selectAll = !this.allPermissionsSelected();
    const permissionsValues: Record<string, boolean> = {};
    for (const p of this.allPermissions()) {
        permissionsValues[p.id] = selectAll;
    }
    this.roleForm.get('permissions')?.patchValue(permissionsValues);
  }

  get permissionsFormGroup(): FormGroup {
    return this.roleForm.get('permissions') as FormGroup;
  }
}