import { Injectable, signal } from '@angular/core';
import { Integration } from '../models';

const MOCK_INTEGRATIONS: Integration[] = [
  { id: 'int1', name: 'LIS (Cerner)', type: 'LIS', tenant: 'General Hospital', status: 'Connected', lastSync: '1 hours ago' },
  { id: 'int2', name: 'EHR (Epic)', type: 'EHR', tenant: 'General Hospital', status: 'Error', lastSync: '5 hours ago' },
  { id: 'int3', name: 'PACS (Sectra)', type: 'PACS', tenant: 'Metro Clinic', status: 'Connected', lastSync: '1 hours ago' },
  { id: 'int4', name: 'LIS (Meditech)', type: 'LIS', tenant: 'Metro Clinic', status: 'Disconnected', lastSync: '3 days ago' },
];

@Injectable({ providedIn: 'root' })
export class IntegrationService {
  private readonly _integrations = signal<Integration[]>(MOCK_INTEGRATIONS);
  readonly integrations = this._integrations.asReadonly();
}
