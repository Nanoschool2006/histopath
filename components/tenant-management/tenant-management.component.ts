import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../services/ui.service';
import { TenantService } from '../../services/tenant.service';
import { Tenant } from '../../models';
import { AccessControlComponent } from '../access-control/access-control.component';

@Component({
  selector: 'app-tenant-management',
  standalone: true,
  imports: [CommonModule, FormsModule, AccessControlComponent],
  templateUrl: './tenant-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantManagementComponent {
  private readonly uiService = inject(UiService);
  private readonly tenantService = inject(TenantService);

  tenants = this.tenantService.tenants;

  showModal = signal(false);
  isEditing = signal(false);
  showDeleteConfirm = signal(false);

  currentTenant = signal<Partial<Tenant>>({ name: '', status: 'Active' });
  tenantToDelete = signal<Tenant | null>(null);

  isSaveDisabled = computed(() => !this.currentTenant().name?.trim());

  openAddModal() {
    this.isEditing.set(false);
    this.currentTenant.set({ name: '', status: 'Active' });
    this.showModal.set(true);
  }

  openEditModal(tenant: Tenant) {
    this.isEditing.set(true);
    this.currentTenant.set({ ...tenant });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  openDeleteConfirm(tenant: Tenant) {
    this.tenantToDelete.set(tenant);
    this.showDeleteConfirm.set(true);
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm.set(false);
    this.tenantToDelete.set(null);
  }

  confirmDelete() {
    const tenant = this.tenantToDelete();
    if (tenant) {
      this.tenantService.deleteTenant(tenant.id);
    }
    this.closeDeleteConfirm();
  }

  updateField<K extends keyof Partial<Tenant>>(field: K, value: Partial<Tenant>[K]) {
    this.currentTenant.update(t => ({ ...t, [field]: value }));
  }

  saveTenant() {
    const tenant = this.currentTenant();
    if (this.isSaveDisabled()) return;

    if (this.isEditing() && tenant.id) {
      this.tenantService.updateTenant(tenant as Tenant);
    } else {
      this.tenantService.addTenant(tenant.name!);
    }
    
    this.closeModal();
  }
  
  goBack() {
    this.uiService.showTenantManagement.set(false);
  }
}
