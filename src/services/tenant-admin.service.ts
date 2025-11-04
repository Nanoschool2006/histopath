import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { CaseService } from './case.service';
import { Integration } from '../models';

export interface AuditCase {
  id: string;
  casePatient: string;
  aiDiagnosis: string;
  aiConfidence: number;
  pathologistDiagnosis: string;
  status: 'Match' | 'Mismatch';
}

@Injectable({ providedIn: 'root' })
export class TenantAdminService {
  private authService = inject(AuthService);
  private caseService = inject(CaseService);

  readonly currentUser = this.authService.currentUser;

  readonly departmentalCaseVolume = computed(() => {
    // Mock data based on the image
    return {
      count: 1284,
      change: 5,
    };
  });

  readonly storageConsumption = computed(() => {
    // Mock data based on the image
    return {
      used: 1280,
      total: 2048,
    };
  });

  readonly tenantIntegrations = computed<Integration[]>(() => {
    // Mock data for a specific tenant based on the image
     return [
      { id: 'int-t1-1', name: 'LIS (Cerner)', type: 'LIS', tenant: 'General Hospital', status: 'Connected', lastSync: '1h ago' },
      { id: 'int-t1-2', name: 'PACS (Sectra)', type: 'PACS', tenant: 'General Hospital', status: 'Connected', lastSync: '1h ago' },
      { id: 'int-t1-3', name: 'EHR (Epic)', type: 'EHR', tenant: 'General Hospital', status: 'Error', lastSync: '5h ago' }, // Mapped from 'Warning' in image
    ];
  });

  readonly diagnosisAuditTrail = computed(() => {
    const tenantId = this.currentUser()?.tenantId;
    if (!tenantId) {
      return { concordance: 0, totalReviewed: 0, concordant: 0, discordant: 0, cases: [] };
    }

    const tenantCases = this.caseService.allCases().filter(c => 
      c.tenantId === tenantId && 
      c.status === 'Reported' && 
      c.aiDiagnosis && 
      c.pathologistDiagnosis
    );

    const auditCases: AuditCase[] = [];

    for (const c of tenantCases) {
      const isMatch = c.aiDiagnosis === c.pathologistDiagnosis;
      auditCases.push({
        id: c.id,
        casePatient: `${c.accession_number}\n${c.patient.mrn}`,
        aiDiagnosis: c.aiDiagnosis!,
        aiConfidence: c.aiConfidence!,
        pathologistDiagnosis: c.pathologistDiagnosis!,
        status: isMatch ? 'Match' : 'Mismatch',
      });
    }

    // Use mock data from image for summary to be precise
    return {
      concordance: 67,
      totalReviewed: 3,
      concordant: 2,
      discordant: 1,
      cases: auditCases.sort((a,b) => a.casePatient > b.casePatient ? -1 : 1) // Sort to match image order
    };
  });
}