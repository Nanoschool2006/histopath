import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: Corrected the relative import path for the service.
import { IntegrationService } from '../../services/integration.service';
import { IntegrationStatus } from '../../models';

@Component({
  selector: 'app-global-integration-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './global-integration-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalIntegrationStatusComponent {
  private readonly integrationService = inject(IntegrationService);
  readonly integrations = this.integrationService.integrations;

  getStatusClass(status: IntegrationStatus): { dot: string, text: string } {
    switch (status) {
      case 'Connected':
        return { dot: 'bg-green-500', text: 'text-green-800' };
      case 'Error':
        return { dot: 'bg-red-500', text: 'text-red-800' };
      case 'Disconnected':
        return { dot: 'bg-gray-400', text: 'text-gray-800' };
      default:
        return { dot: 'bg-gray-400', text: 'text-gray-800' };
    }
  }
}