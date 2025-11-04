import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../services/feedback.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
  private feedbackService = inject(FeedbackService);
  private uiService = inject(UiService);
  leaderboard = this.feedbackService.leaderboard;

  showLeaderboardPage() {
    this.uiService.showLeaderboardPage.set(true);
  }
}