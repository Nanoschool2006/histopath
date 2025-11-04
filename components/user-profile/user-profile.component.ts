import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../services/ui.service';
import { AuthService } from '../../services/auth.service';
import { FeedbackService } from '../../services/feedback.service';
import { FeedbackStatus, FeedbackType } from '../../models';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
  private readonly uiService = inject(UiService);
  private readonly authService = inject(AuthService);
  private readonly feedbackService = inject(FeedbackService);
  
  readonly currentUser = this.authService.currentUser;
  
  isEditing = signal(false);
  editableName = signal('');
  
  userContributions = computed(() => {
    const user = this.currentUser();
    if (!user) {
      return [];
    }
    return this.feedbackService.feedback().filter(f => f.submittedBy === user.id);
  });

  ngOnInit(): void {
    this.editableName.set(this.currentUser()?.name ?? '');
  }

  toggleEdit(editing: boolean): void {
    this.isEditing.set(editing);
    if (!editing) {
      // Reset name on cancel
      this.editableName.set(this.currentUser()?.name ?? '');
    }
  }
  
  saveChanges(): void {
    const user = this.currentUser();
    if (user && this.editableName().trim()) {
      this.authService.updateUser(user.id, { name: this.editableName().trim() });
      this.isEditing.set(false);
    }
  }

  goBack(): void {
    this.uiService.showUserProfile.set(false);
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