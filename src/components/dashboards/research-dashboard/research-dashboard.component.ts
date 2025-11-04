import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { DatasetQueryBuilderComponent } from '../../dataset-query-builder/dataset-query-builder.component';
import { ImageSimilaritySearchComponent } from '../../image-similarity-search/image-similarity-search.component';
import { AiModelComparisonComponent } from '../../ai-model-comparison/ai-model-comparison.component';
import { MlflowTrackerComponent } from '../../mlflow-tracker/mlflow-tracker.component';

@Component({
  selector: 'app-research-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatasetQueryBuilderComponent,
    ImageSimilaritySearchComponent,
    AiModelComparisonComponent,
    MlflowTrackerComponent,
  ],
  templateUrl: './research-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResearchDashboardComponent {
  readonly currentUser = inject(AuthService).currentUser;
}