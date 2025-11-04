import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { CaseService } from '../../services/case.service';
import { ResearchService } from '../../services/research.service';

@Component({
  selector: 'app-dataset-query-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dataset-query-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetQueryBuilderComponent {
  private readonly geminiService = inject(GeminiService);
  private readonly caseService = inject(CaseService);
  private readonly researchService = inject(ResearchService);

  readonly queryText = signal('');
  readonly isLoading = signal(false);
  
  readonly results = this.researchService.queryResults;
  readonly resultCount = this.researchService.queryResultCount;

  async handleQuery() {
    if (!this.queryText().trim()) return;

    this.isLoading.set(true);
    this.researchService.clearQuery();

    try {
      const filters = await this.geminiService.parseQuery(this.queryText());
      this.researchService.setFilters(filters);
      
      // We apply filters to the main case service to get the results
      // In a real app, this would be a separate API call to a research database
      this.caseService.applyFilters(filters);
      
      // The `cases` computed signal in CaseService will update, so we can read from it
      // A slight delay ensures the computed signal has time to update
      setTimeout(() => {
        this.researchService.setResults(this.caseService.cases());
        this.isLoading.set(false);
      }, 100);

    } catch (error) {
      console.error('Failed to parse or run query:', error);
      this.isLoading.set(false);
    }
  }

  runQuery() {
    // This function can be used for manually added filters in the future.
    // For now, it re-runs the existing filters.
    this.isLoading.set(true);
    this.caseService.applyFilters(this.researchService.queryFilters());
     setTimeout(() => {
        this.researchService.setResults(this.caseService.cases());
        this.isLoading.set(false);
      }, 100);
  }
}