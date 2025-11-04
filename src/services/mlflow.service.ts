import { Injectable, signal } from '@angular/core';
import { MlflowExperiment } from '../models';

const MOCK_EXPERIMENTS: MlflowExperiment[] = [
  { id: 'exp1', name: 'ResNet50-Hyperparam-Tune-v2', accuracy: 0.953, status: 'Completed' },
  { id: 'exp2', name: 'ViT-Base-Augmentation-Strategy', accuracy: null, status: 'Running' },
  { id: 'exp3', name: 'InceptionV3-Stain-Normalization', accuracy: null, status: 'Failed' },
];

@Injectable({ providedIn: 'root' })
export class MlflowService {
  private readonly _experiments = signal<MlflowExperiment[]>(MOCK_EXPERIMENTS);
  readonly experiments = this._experiments.asReadonly();
}