import { ChangeDetectionStrategy, Component, inject, signal, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService, SortableCaseColumns } from '../../services/case.service';
import { GeminiService } from '../../services/gemini.service';
import { AuthService } from '../../services/auth.service';
import { UiService } from '../../services/ui.service';
import { CaseStatus, CasePriority } from '../../models';
import { AccessControlComponent } from '../access-control/access-control.component';

@Component({
  selector: 'app-case-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AccessControlComponent],
  templateUrl: './case-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseListComponent {
  private caseService = inject(CaseService);
  private geminiService = inject(GeminiService);
  private authService = inject(AuthService);
  private uiService = inject(UiService);

  readonly cases = this.caseService.cases;
  readonly isLoading = signal(false);
  readonly query = signal('');
  readonly currentUser = this.authService.currentUser;
  readonly showMyCasesOnly = signal(false);
  readonly showArchived = signal(false);

  // Sorting signals
  readonly sortColumn = this.caseService.sortColumn;
  readonly sortDirection = this.caseService.sortDirection;

  async search() {
    const currentQuery = this.query();
    if (!currentQuery.trim()) {
      this.caseService.clearFilters();
      // Keep the "my cases" and "archived" filters if they are active
      if (this.showMyCasesOnly() && this.currentUser()) {
        this.caseService.updateFilters({ assignedToId: this.currentUser()!.id });
      }
       if (this.showArchived()) {
        this.caseService.updateFilters({ showArchived: true });
      }
      return;
    }

    this.isLoading.set(true);
    try {
      const filters = await this.geminiService.parseQuery(currentQuery);
      // Preserve "my cases" and "archived" filters if active
      if (this.showMyCasesOnly() && this.currentUser()) {
          filters.assignedToId = this.currentUser()!.id;
      }
      if (this.showArchived()) {
        filters.showArchived = true;
      }
      this.caseService.applyFilters(filters);
    } catch (error) {
      console.error('Search failed', error);
      this.caseService.applyFilters({ patientName: currentQuery });
    } finally {
      this.isLoading.set(false);
    }
  }

  clearSearch() {
    this.query.set('');
    this.caseService.clearFilters();
     // Keep the "my cases" and "archived" filters if they are active
    if (this.showMyCasesOnly() && this.currentUser()) {
      this.caseService.updateFilters({ assignedToId: this.currentUser()!.id });
    }
    if (this.showArchived()) {
      this.caseService.updateFilters({ showArchived: true });
    }
  }

  toggleShowMyCases(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.showMyCasesOnly.set(isChecked);
    const user = this.currentUser();

    if (isChecked && user) {
      this.caseService.updateFilters({ assignedToId: user.id });
    } else {
      this.caseService.removeFilter('assignedToId');
    }
  }

  toggleShowArchived(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.showArchived.set(isChecked);
    this.caseService.updateFilters({ showArchived: isChecked });
  }
  
  unarchiveCase(caseId: string) {
    this.caseService.unarchiveCase(caseId);
  }

  viewCaseDetails(caseId: string) {
    this.caseService.selectCase(caseId);
  }

  openNewCaseForm() {
    this.uiService.showNewCaseForm.set(true);
  }

  onSort(column: SortableCaseColumns) {
    this.caseService.setSort(column);
  }

  getStatusClass(status: CaseStatus): string {
    switch (status) {
      case 'Awaiting Review': return 'bg-yellow-100 text-yellow-800';
      case 'In Review': return 'bg-blue-100 text-blue-800';
      case 'Reported': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Specimen Accessioned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  getPriorityClass(priority: CasePriority): string {
    return priority === 'STAT' ? 'border-red-500 text-red-600' : 'border-gray-300 text-gray-700';
  }

  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}