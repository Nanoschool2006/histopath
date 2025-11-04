import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// FIX: Corrected the relative import path for the service.
import { FeedbackService } from '../../services/feedback.service';
import { Feedback, FeedbackStatus, FeedbackType } from '../../models';

@Component({
  selector: 'app-user-feedback-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-feedback-inbox.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserFeedbackInboxComponent {
  private readonly feedbackService = inject(FeedbackService);
  
  allFeedback = this.feedbackService.feedback;
  
  filterStatus = signal<FeedbackStatus | 'All'>('All');
  filterType = signal<FeedbackType | 'All'>('All');

  filteredFeedback = computed(() => {
    let feedback = this.allFeedback();
    if (this.filterStatus() !== 'All') {
      const status = this.filterStatus();
      feedback = feedback.filter(f => f.status === status);
    }
    if (this.filterType() !== 'All') {
      const type = this.filterType();
      feedback = feedback.filter(f => f.type === type);
    }
    return feedback;
  });

  getRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  }

  getStatusClass(status: FeedbackStatus): string {
    switch (status) {
      case 'New': return 'text-purple-600';
      case 'In Progress': return 'text-blue-600';
      case 'Resolved': return 'text-green-600';
      case 'Closed': return 'text-gray-500';
      default: return 'text-gray-500';
    }
  }

  getFeedbackTypeLabel(type: FeedbackType): string {
    if (type === 'Suggestion') return 'Suggestion';
    return `${type} Report`;
  }
}