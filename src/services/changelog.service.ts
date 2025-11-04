import { Injectable, signal } from '@angular/core';
import { ChangelogItem } from '../models';

const MOCK_CHANGELOG: ChangelogItem[] = [
  {
    id: 'cl1',
    type: 'IMPROVE',
    date: 'October 2025',
    description: "It would be great if we could have keyboard shortcuts for switching between annotation tools (e.g., 'R' for rectangle, 'P' for polygon). It would speed up my workflow significantly."
  },
  {
    id: 'cl2',
    type: 'IMPROVE',
    date: 'October 2025',
    description: "The natural language query for cohort building is fantastic, but it would be helpful if it supported exporting the results directly to a Jupyter notebook format."
  },
];

@Injectable({ providedIn: 'root' })
export class ChangelogService {
  private readonly _changelog = signal<ChangelogItem[]>(MOCK_CHANGELOG);
  readonly changelog = this._changelog.asReadonly();
}