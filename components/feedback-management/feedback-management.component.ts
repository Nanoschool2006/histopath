import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { UiService } from '../../services/ui.service';
import { Feedback, FeedbackStatus, FeedbackType, FeedbackPriority } from '../../models';

@Component({
  selector: 'app-feedback-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackManagementComponent {
  private feedbackService = inject(FeedbackService);
  private uiService = inject(UiService);
  
  allFeedback = this.feedbackService.feedback;
  
  // Modal State
  showReviewModal = signal(false);
  feedbackToReview = signal<Feedback | null>(null);
  reviewAction = signal<'accept' | 'reject' | null>(null);
  
  // Form data for the modal
  reviewPriority = signal<FeedbackPriority>('Medium');
  reviewComment = signal('');
  reviewTargetDate = signal('');

  goBack() {
    this.uiService.showFeedbackManagement.set(false);
  }

  openReviewModal(feedback: Feedback, action: 'accept' | 'reject') {
    this.feedbackToReview.set(feedback);
    this.reviewAction.set(action);
    // Reset form fields
    this.reviewPriority.set('Medium');
    this.reviewComment.set('');
    this.reviewTargetDate.set('');
    this.showReviewModal.set(true);
  }

  closeReviewModal() {
    this.showReviewModal.set(false);
    this.feedbackToReview.set(null);
    this.reviewAction.set(null);
  }
  
  submitReview() {
    const feedback = this.feedbackToReview();
    const action = this.reviewAction();

    if (!feedback || !action) return;

    if (action === 'reject' && !this.reviewComment().trim()) {
      // A more user-friendly validation would be ideal in a real app
      alert('A reason is required to reject feedback.');
      return;
    }

    this.feedbackService.reviewFeedback(feedback.id, action, {
      priority: action === 'accept' ? this.reviewPriority() : undefined,
      comment: this.reviewComment(),
      targetDate: action === 'accept' ? this.reviewTargetDate() : undefined,
    });

    this.closeReviewModal();
  }

  updateStatus(feedbackId: string, event: Event) {
    const status = (event.target as HTMLSelectElement).value as FeedbackStatus;
    this.feedbackService.updateFeedbackStatus(feedbackId, status);
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

  getPriorityClass(priority?: FeedbackPriority): string {
    switch (priority) {
      case 'Critical': return 'bg-red-600 text-white';
      case 'High': return 'bg-red-200 text-red-900';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return '';
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
