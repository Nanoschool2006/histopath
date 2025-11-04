import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../services/feedback.service';
import { UiService } from '../../services/ui.service';
import { User, FeedbackStatus, FeedbackType } from '../../models';

@Component({
  selector: 'app-leaderboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardPageComponent {
  private readonly feedbackService = inject(FeedbackService);
  private readonly uiService = inject(UiService);

  leaderboard = this.feedbackService.leaderboard;
  selectedUser = signal<User | null>(null);

  userContributions = computed(() => {
    const user = this.selectedUser();
    if (!user) {
      return [];
    }
    return this.feedbackService.feedback().filter(f => f.submittedBy === user.id);
  });

  goBack() {
    this.uiService.showLeaderboardPage.set(false);
  }

  selectUser(user: User) {
    this.selectedUser.set(user);
  }

  getTrophy(rank: number): string {
    if (rank === 0) return '🏆';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return '';
  }

  getStatusClass(status: FeedbackStatus): string {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeClass(type: FeedbackType): string {
    switch (type) {
      case 'Bug': return 'bg-red-100 text-red-800';
      case 'Suggestion': return 'bg-purple-100 text-purple-800';
      case 'Error': return 'bg-orange-100 text-orange-800';
      case 'Question': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
