import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { TenantAdminService } from '../../../services/tenant-admin.service';
import { UserRoleManagementComponent } from '../../user-role-management/user-role-management.component';
import { DepartmentalCaseVolumeComponent } from '../../departmental-case-volume/departmental-case-volume.component';
import { StorageConsumptionComponent } from '../../storage-consumption/storage-consumption.component';
import { TenantIntegrationStatusComponent } from '../../tenant-integration-status/tenant-integration-status.component';
import { DiagnosisAuditTrailComponent } from '../../diagnosis-audit-trail/diagnosis-audit-trail.component';

@Component({
  selector: 'app-tenant-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    UserRoleManagementComponent,
    DepartmentalCaseVolumeComponent,
    StorageConsumptionComponent,
    TenantIntegrationStatusComponent,
    DiagnosisAuditTrailComponent,
  ],
  templateUrl: './tenant-admin-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantAdminDashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly tenantAdminService = inject(TenantAdminService);

  readonly currentUser = this.authService.currentUser;
  
  // Data signals from the dedicated service
  readonly caseVolume = this.tenantAdminService.departmentalCaseVolume;
  readonly storage = this.tenantAdminService.storageConsumption;
  readonly integrations = this.tenantAdminService.tenantIntegrations;
  readonly auditTrail = this.tenantAdminService.diagnosisAuditTrail;
}