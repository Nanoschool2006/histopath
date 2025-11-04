import { Injectable, signal } from '@angular/core';
import { AiModel } from '../models';

const MOCK_MODELS: AiModel[] = [
  { id: 'm1', version: 'Gemini-Flash-Histology-v1.2', concordance: 94.6, status: 'Production', stabilityScore: 0.92, totalRuns: 184 },
  { id: 'm2', version: 'Gemini-Flash-Histology-v1.1', concordance: 92.1, status: 'Archived', stabilityScore: 0.88, totalRuns: 3205 },
  { id: 'm3', version: 'Internal-CNN-v3.4', concordance: 88.5, status: 'Archived', stabilityScore: 0.91, totalRuns: 10532 },
];

@Injectable({ providedIn: 'root' })
export class ModelManagementService {
  private readonly _models = signal<AiModel[]>(MOCK_MODELS);
  readonly models = this._models.asReadonly();

  rollbackModel(modelId: string): void {
    this._models.update(currentModels => {
      // Find the target model first. If it's not found or already in production, do nothing.
      const targetModel = currentModels.find(m => m.id === modelId);
      if (!targetModel || targetModel.status === 'Production') {
        return currentModels;
      }

      // Map over the models to create the new state.
      return currentModels.map(model => {
        // Archive the currently active model.
        if (model.status === 'Production') {
          return { ...model, status: 'Archived' };
        }
        // Activate the target model.
        if (model.id === modelId) {
          return { ...model, status: 'Production' };
        }
        // Leave other models as they are.
        return model;
      });
    });
  }
}