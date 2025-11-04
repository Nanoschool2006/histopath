import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Integration, IntegrationStatus } from '../../models';

@Component({
  selector: 'app-tenant-integration-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tenant-integration-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantIntegrationStatusComponent {
  integrations = input.required<Integration[]>();

  getStatusDotClass(status: IntegrationStatus): string {
    switch (status) {
      case 'Connected': return 'bg-green-500';
      case 'Error': return 'bg-yellow-500'; // Mapped from 'Warning' in image
      case 'Disconnected': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  }
}