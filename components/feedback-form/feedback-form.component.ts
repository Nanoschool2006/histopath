import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeedbackService } from '../../services/feedback.service';
import { UiService } from '../../services/ui.service';
import { FeedbackType } from '../../models';

@Component({
  selector: 'app-feedback-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackFormComponent {
  private feedbackService = inject(FeedbackService);
  private uiService = inject(UiService);

  feedbackType = signal<FeedbackType>('Suggestion');
  title = signal('');
  description = signal('');
  attachment = signal<File | null>(null);
  validationError = signal<string | null>(null);

  readonly MAX_FILE_SIZE_MB = 5;
  readonly MAX_FILE_SIZE_BYTES = this.MAX_FILE_SIZE_MB * 1024 * 1024;
  readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];


  close() {
    this.uiService.showFeedbackForm.set(false);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      this.validationError.set(null);
      this.attachment.set(null);

      if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
        this.validationError.set(`Invalid file type. Please upload a valid image (JPEG, PNG, GIF, WEBP).`);
        input.value = '';
        return;
      }

      if (file.size > this.MAX_FILE_SIZE_BYTES) {
        this.validationError.set(`File is too large. Maximum size is ${this.MAX_FILE_SIZE_MB} MB.`);
        input.value = '';
        return;
      }

      this.attachment.set(file);
    }
  }

  removeAttachment(fileInput: HTMLInputElement): void {
    this.attachment.set(null);
    this.validationError.set(null);
    if (fileInput) {
      fileInput.value = '';
    }
  }

  submit() {
    if (!this.title() || !this.description()) return;
    
    this.feedbackService.addFeedback({
      type: this.feedbackType(),
      title: this.title(),
      description: this.description(),
      attachment: this.attachment() ?? undefined,
    });

    this.close();
  }
}