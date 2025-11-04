import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditCase } from '../../services/tenant-admin.service';

interface AuditData {
  concordance: number;
  totalReviewed: number;
  concordant: number;
  discordant: number;
  cases: AuditCase[];
}

@Component({
  selector: 'app-diagnosis-audit-trail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnosis-audit-trail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosisAuditTrailComponent {
  auditData = input.required<AuditData>();

  readonly chartData = computed(() => {
    const data = this.auditData();
    if (!data) return null;
    
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (data.concordance / 100) * circumference;

    return {
      percentage: Math.round(data.concordance),
      radius,
      center: 35,
      circumference,
      offset,
    };
  });

  getStatusClass(status: 'Match' | 'Mismatch'): string {
    return status === 'Match' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  }
}