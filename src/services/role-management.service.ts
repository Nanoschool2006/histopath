import { Injectable, signal } from '@angular/core';
import { Role, Permission, UserRole } from '../models';

export interface PermissionDescriptor {
    id: Permission;
    description: string;
}

const ALL_PERMISSIONS: PermissionDescriptor[] = [
    { id: 'view:cases', description: 'Can view pathology cases within their scope.' },
    { id: 'manage:cases', description: 'Can create, edit, assign, and archive cases.' },
    { id: 'view:users', description: 'Can view users within their scope (e.g., own tenant).' },
    { id: 'manage:users', description: 'Can add, edit, and remove users within their scope.' },
    { id: 'view:roles', description: 'Can view user roles and their assigned permissions.' },
    { id: 'manage:roles', description: 'Can create, edit, and delete user roles.' },
    { id: 'view:system-health', description: 'Can monitor system status and view error logs.' },
    { id: 'view:reports', description: 'Can access and view system-wide research reports.' },
    { id: 'run:ai-analysis', description: 'Can perform AI-powered analysis on case slides.' }
];

const MOCK_ROLES: Role[] = [
  {
    id: 'role-superadmin',
    name: 'SuperAdmin',
    description: 'Has all permissions across the entire system.',
    permissions: ALL_PERMISSIONS.map(p => p.id)
  },
  {
    id: 'role-sysadmin',
    name: 'SystemAdmin',
    description: 'Manages system health and configuration.',
    permissions: ['view:system-health']
  },
  {
    id: 'role-pathologist',
    name: 'Pathologist',
    description: 'Manages and reviews pathology cases.',
    permissions: ['view:cases', 'manage:cases', 'run:ai-analysis']
  },
  {
    id: 'role-tenantadmin',
    name: 'TenantAdmin',
    description: 'Manages users and cases within their own tenant.',
    permissions: ['view:cases', 'manage:cases', 'view:users', 'manage:users', 'view:roles', 'manage:roles']
  },
  {
    id: 'role-studentadmin',
    name: 'StudentAdmin',
    description: 'Manages students and educational content.',
    permissions: ['view:cases', 'manage:cases', 'view:users', 'manage:users']
  },
  {
    id: 'role-researcher',
    name: 'Researcher',
    description: 'Can view anonymized case data for research.',
    permissions: ['view:cases', 'view:reports']
  },
  {
    id: 'role-student',
    name: 'Student',
    description: 'Has limited access to assigned training cases.',
    permissions: ['view:cases']
  },
  {
    id: 'role-demo',
    name: 'Demo',
    description: 'Has read-only access for demonstration purposes.',
    permissions: []
  }
];


@Injectable({ providedIn: 'root' })
export class RoleManagementService {
    private readonly _roles = signal<Role[]>(MOCK_ROLES);
    readonly roles = this._roles.asReadonly();
    readonly allPermissions = signal<PermissionDescriptor[]>(ALL_PERMISSIONS).asReadonly();

    addRole(role: Omit<Role, 'id'>) {
        const newRole: Role = {
            ...role,
            id: `role-${Date.now()}-${Math.random()}`
        };
        this._roles.update(roles => [...roles, newRole]);
    }

    updateRole(updatedRole: Role) {
        this._roles.update(roles => roles.map(r => r.id === updatedRole.id ? updatedRole : r));
    }

    deleteRole(roleId: string) {
        this._roles.update(roles => roles.filter(r => r.id !== roleId));
    }
}