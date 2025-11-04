import { Injectable, inject, computed } from '@angular/core';
import { AuthService } from './auth.service';
import { CaseService } from './case.service';

export interface QAMetrics {
  aiConcordanceRate: number;
  avgTurnaroundTime: number;
  userAnnotationRate: number;
}

@Injectable({ providedIn: 'root' })
export class QaService {
  private authService = inject(AuthService);
  private caseService = inject(CaseService);

  /**
   * Computes QA metrics based on the current user's closed cases.
   * In a real application, these would be complex calculations from a data warehouse.
   */
  readonly qaMetrics = computed<QAMetrics>(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return { aiConcordanceRate: 0, avgTurnaroundTime: 0, userAnnotationRate: 0 };
    }

    const myClosedCases = this.caseService.allCases().filter(c => 
      c.assigned_to?.id === user.id && (c.status === 'Closed' || c.status === 'Reported')
    );
    
    // Default to image values if user has no closed cases
    if (myClosedCases.length === 0) {
       return { aiConcordanceRate: 0.0, avgTurnaroundTime: 29.6, userAnnotationRate: 0 };
    }

    // Mock AI Concordance: a simple, predictable calculation for demo purposes
    const concordance = (myClosedCases.length * 7 + user.id.length) % 100;

    // Mock Avg Turnaround: static for now to match image
    const turnaround = 29.6;

    // Annotation Rate: percentage of completed cases that have annotations
    const annotatedCases = myClosedCases.filter(c => c.annotations && c.annotations.length > 0).length;
    const annotationRate = myClosedCases.length > 0 ? (annotatedCases / myClosedCases.length) * 100 : 0;
    
    return {
      aiConcordanceRate: concordance,
      avgTurnaroundTime: turnaround,
      userAnnotationRate: annotationRate,
    };
  });
}
