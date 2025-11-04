import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MlflowService } from '../../services/mlflow.service';
import { ExperimentStatus } from '../../models';

interface StatusInfo {
  dotClass: string;
  textClass: string;
}

@Component({
  selector: 'app-mlflow-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mlflow-tracker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MlflowTrackerComponent {
  private readonly mlflowService = inject(MlflowService);
  readonly experiments = this.mlflowService.experiments;
  readonly isRefreshing = signal(false);

  refreshExperiments(): void {
    this.isRefreshing.set(true);
    // In a real app, you'd re-fetch data here.
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 1000);
  }

  getStatusInfo(status: ExperimentStatus): StatusInfo {
    switch (status) {
      case 'Completed':
        return { dotClass: 'bg-green-500', textClass: 'text-green-800' };
      case 'Running':
        return { dotClass: 'bg-blue-500', textClass: 'text-blue-800' };
      case 'Failed':
        return { dotClass: 'bg-red-500', textClass: 'text-red-800' };
      default:
        return { dotClass: 'bg-gray-400', textClass: 'text-gray-800' };
    }
  }

  getAccuracyClass(accuracy: number | null): string {
    if (accuracy === null) return 'text-gray-500';
    if (accuracy > 0.95) return 'text-green-600 font-bold';
    if (accuracy > 0.9) return 'text-emerald-600 font-semibold';
    if (accuracy > 0.8) return 'text-yellow-600';
    return 'text-orange-600';
  }
}
