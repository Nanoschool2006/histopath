import { Injectable, signal, computed, inject } from '@angular/core';
import { Feedback, FeedbackStatus, FeedbackType, FeedbackPriority } from '../models';
import { AuthService } from './auth.service';

export interface ReviewFeedbackData {
  priority?: FeedbackPriority;
  comment: string;
  targetDate?: string;
}

const MOCK_FEEDBACK: Feedback[] = [
  {
    id: 'fb1',
    type: 'Bug',
    title: 'Annotation tool freezes',
    description: 'The annotation tool sometimes freezes when drawing a freehand shape on very large slide images. I have to refresh the page to get it working again.',
    status: 'In Progress',
    submittedBy: 'u1',
    submittedByName: 'Dr. Evelyn Reed',
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    pointsAwarded: 5,
    priority: 'High',
    attachment: { name: 'screenshot-freeze.png', type: 'image/png', size: 120345 },
  },
  {
    id: 'fb2',
    type: 'Suggestion',
    title: 'Keyboard shortcuts for annotation',
    description: "It would be great if we could have keyboard shortcuts for switching between annotation tools (e.g., 'R' for rectangle, 'P' for polygon). It would speed up my workflow significantly.",
    status: 'Resolved',
    submittedBy: 'u_kenji',
    submittedByName: 'Dr. Kenji Tanaka',
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    pointsAwarded: 25,
  },
  {
    id: 'fb3',
    type: 'Suggestion',
    title: 'Export to Jupyter notebook',
    description: 'The natural language query for cohort building is fantastic, but it would be helpful if it supported exporting the results directly to a Jupyter notebook format.',
    status: 'Resolved',
    submittedBy: 'u2',
    submittedByName: 'Dr. Ben Carter',
    submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    pointsAwarded: 25,
  },
  {
    id: 'fb4',
    type: 'Suggestion',
    title: 'New UI update looks great!',
    description: 'The new UI update looks great! Much cleaner and more intuitive.',
    status: 'New', // mapped from 'Submitted'
    submittedBy: 'u1',
    submittedByName: 'Dr. Evelyn Reed',
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    pointsAwarded: 5,
  },
  {
    id: 'fb5',
    type: 'Error',
    title: 'AI misclassified a clear case of LSIL as HSIL.',
    description: 'The AI misclassified a clear case of LSIL as HSIL. Confidence was high (92%) which is concerning. See CASE-004 for details.',
    status: 'In Progress',
    submittedBy: 'u_sofia',
    submittedByName: 'Dr. Sofia Rossi',
    submittedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    pointsAwarded: 5,
    priority: 'Critical'
  },
];


@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private authService = inject(AuthService);
  private readonly _feedback = signal<Feedback[]>(MOCK_FEEDBACK);
  
  readonly feedback = this._feedback.asReadonly();
  readonly newFeedbackCount = computed(() => this._feedback().filter(f => f.status === 'New').length);
  
  readonly leaderboard = computed(() => {
      return this.authService.allUsers()
          .slice() // create a copy
          .sort((a, b) => (b.feedbackPoints || 0) - (a.feedbackPoints || 0));
  });

  addFeedback(data: { type: FeedbackType, title: string, description: string, attachment?: File }) {
      const currentUser = this.authService.currentUser();
      if (!currentUser) return;
      
      const submissionPoints = 5;

      const newFeedback: Feedback = {
          id: `fb-${Date.now()}`,
          type: data.type,
          title: data.title,
          description: data.description,
          status: 'New',
          submittedBy: currentUser.id,
          submittedByName: currentUser.name,
          submittedAt: new Date().toISOString(),
          pointsAwarded: submissionPoints,
      };

      if (data.attachment) {
        newFeedback.attachment = {
          name: data.attachment.name,
          type: data.attachment.type,
          size: data.attachment.size,
        };
      }
      
      this._feedback.update(f => [newFeedback, ...f]);
      this.authService.addPointsToUser(currentUser.id, submissionPoints);
  }

  reviewFeedback(feedbackId: string, action: 'accept' | 'reject', data: ReviewFeedbackData) {
    this._feedback.update(feedbackList =>
      feedbackList.map(f => {
        if (f.id === feedbackId) {
          const newStatus = action === 'accept' ? 'In Progress' : 'Closed';
          return {
            ...f,
            status: newStatus,
            priority: data.priority,
            admin_comment: data.comment,
            target_resolution_date: data.targetDate,
          };
        }
        return f;
      })
    );
  }

  updateFeedbackStatus(feedbackId: string, status: FeedbackStatus) {
      let userToReward: string | null = null;
      let pointsToAward = 0;

      this._feedback.update(feedbackList => 
          feedbackList.map(f => {
              if (f.id === feedbackId && f.status !== status) {
                  const updatedFeedback = { ...f, status };
                  // If a suggestion is resolved, award bonus points
                  if (f.type === 'Suggestion' && f.status !== 'Resolved' && status === 'Resolved') {
                      userToReward = f.submittedBy;
                      pointsToAward = 20; // Bonus points
                      updatedFeedback.pointsAwarded += pointsToAward;
                  }
                  return updatedFeedback;
              }
              return f;
          })
      );

      if (userToReward) {
          this.authService.addPointsToUser(userToReward, pointsToAward);
      }
  }
}
