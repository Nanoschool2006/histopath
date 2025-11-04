import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelManagementService } from '../../services/model-management.service';
import { ModelStatus, AiModel } from '../../models';

@Component({
  selector: 'app-model-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './model-management.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelManagementComponent {
  private readonly modelService = inject(ModelManagementService);
  readonly models = this.modelService.models;

  // State for rollback confirmation modal
  readonly showRollbackConfirm = signal(false);
  readonly modelToRollback = signal<AiModel | null>(null);

  getStatusClass(status: ModelStatus): string {
    return status === 'Production' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }

  openRollbackConfirm(model: AiModel): void {
    this.modelToRollback.set(model);
    this.showRollbackConfirm.set(true);
  }

  closeRollbackConfirm(): void {
    this.showRollbackConfirm.set(false);
    this.modelToRollback.set(null);
  }

  confirmRollback(): void {
    const model = this.modelToRollback();
    if (model) {
      this.modelService.rollbackModel(model.id);
    }
    this.closeRollbackConfirm();
  }
}