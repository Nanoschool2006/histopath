import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { LeaderboardComponent } from '../../leaderboard/leaderboard.component';
import { CaseListComponent } from '../../case-list/case-list.component';
import { CaseService } from '../../../services/case.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, LeaderboardComponent, CaseListComponent],
  templateUrl: './student-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentDashboardComponent implements OnInit, OnDestroy {
  readonly authService = inject(AuthService);
  readonly caseService = inject(CaseService);
  readonly currentUser = this.authService.currentUser;

  readonly dashboardStats = computed(() => {
    const myCases = this.caseService.cases();
    const completed = myCases.filter(c => c.status === 'Reported' || c.status === 'Closed').length;
    return {
      totalAssigned: myCases.length,
      completed: completed,
    };
  });

  ngOnInit(): void {
    const user = this.currentUser();
    if (user) {
      // Apply filters to show only assigned training cases by default
      this.caseService.applyFilters({ 
        assignedToId: user.id,
        isTrainingCase: true,
        showArchived: false,
      });
    }
  }

  ngOnDestroy(): void {
    // Clear the specific filters when the student navigates away
    this.caseService.clearFilters();
  }
}