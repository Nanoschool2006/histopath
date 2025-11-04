import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseService } from '../../../services/case.service';
import { AuthService } from '../../../services/auth.service';
import { TaskManagerComponent } from '../../task-manager/task-manager.component';
import { PerformanceTrendsComponent } from '../../performance-trends/performance-trends.component';
import { PerformanceService } from '../../../services/performance.service';
import { QaMetricsComponent } from '../../qa-metrics/qa-metrics.component';
import { QaService } from '../../../services/qa.service';

@Component({
  selector: 'app-pathologist-dashboard',
  standalone: true,
  imports: [CommonModule, TaskManagerComponent, PerformanceTrendsComponent, QaMetricsComponent],
  templateUrl: './pathologist-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PathologistDashboardComponent {
  private readonly caseService = inject(CaseService);
  private readonly authService = inject(AuthService);
  private readonly performanceService = inject(PerformanceService);
  private readonly qaService = inject(QaService);

  readonly performanceData = computed(() => this.performanceService.getPerformanceDataForCurrentUser());
  readonly qaMetrics = this.qaService.qaMetrics;

  readonly userStats = computed(() => {
    const cases = this.caseService.allCases();
    const user = this.authService.currentUser();

    if (!user) {
      return { myOpenCases: 0, myStatCases: 0, myCompletedCases: 0 };
    }

    const myCases = cases.filter(c => c.assigned_to?.id === user.id);

    return {
      myOpenCases: myCases.filter(c => c.status === 'Awaiting Review' || c.status === 'In Review').length,
      myStatCases: myCases.filter(c => c.priority === 'STAT' && (c.status !== 'Closed' && c.status !== 'Reported')).length,
      myCompletedCases: myCases.filter(c => c.status === 'Reported' || c.status === 'Closed').length,
    };
  });
}
