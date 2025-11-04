import { Injectable, signal } from '@angular/core';
import { CaseFilters, Case } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ResearchService {
  readonly queryFilters = signal<CaseFilters>({});
  readonly queryResults = signal<Case[] | null>(null);
  readonly queryResultCount = signal<number>(0);

  setFilters(filters: CaseFilters) {
    this.queryFilters.set(filters);
  }

  setResults(results: Case[]) {
    this.queryResults.set(results);
    this.queryResultCount.set(results.length);
  }

  clearQuery() {
    this.queryFilters.set({});
    this.queryResults.set(null);
    this.queryResultCount.set(0);
  }
}