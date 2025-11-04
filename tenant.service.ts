import { Injectable, signal } from '@angular/core';
import { Tenant } from '../models';

const MOCK_TENANTS: Tenant[] = [
  { id: 't1', name: 'General Hospital', status: 'Active' },
  { id: 't2', name: 'City Clinic', status: 'Active' },
  { id: 't3', name: 'University Medical Center', status: 'Suspended' },
];

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly _tenants = signal<Tenant[]>(MOCK_TENANTS);
  readonly tenants = this._tenants.asReadonly();

  addTenant(name: string): void {
    if (!name.trim()) return;
    const newTenant: Tenant = {
      id: `t${Date.now()}`,
      name: name.trim(),
      status: 'Active',
    };
    this._tenants.update(tenants => [...tenants, newTenant]);
  }

  updateTenant(updatedTenant: Tenant): void {
    this._tenants.update(tenants =>
      tenants.map(t => (t.id === updatedTenant.id ? updatedTenant : t))
    );
  }

  deleteTenant(tenantId: string): void {
    // In a real app, we'd need to handle what happens to users and cases associated with this tenant.
    // For this demo, we'll just delete the tenant.
    this._tenants.update(tenants => tenants.filter(t => t.id !== tenantId));
  }
}
