import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService, NewCaseData } from '../../services/case.service';
import { UiService } from '../../services/ui.service';
import { AuthService } from '../../services/auth.service';
import { CasePriority } from '../../models';

const INITIAL_STATE: NewCaseData = {
  patientName: '',
  patientDob: '',
  patientGender: 'Male',
  patientMrn: '',
  accession_number: '',
  priority: 'Routine',
  assigned_to_id: null,
  clinical_history: '',
};

@Component({
  selector: 'app-case-edit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './case-edit.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseEditComponent {
  private readonly caseService = inject(CaseService);
  private readonly uiService = inject(UiService);
  private readonly authService = inject(AuthService);
  
  newCaseData = signal<NewCaseData>(INITIAL_STATE);
  showConfirmation = signal(false);
  
  readonly currentUser = this.authService.currentUser;

  readonly assignableUsers = computed(() => {
    const user = this.currentUser();
    if (user?.role === 'StudentAdmin') {
      return this.authService.allUsers().filter(u => u.role === 'Student');
    }
    // Default behavior for other admin roles
    return this.authService.allUsers().filter(u => u.role === 'Pathologist');
  });
  
  isSaveDisabled = computed(() => {
    const data = this.newCaseData();
    return !data.patientName || !data.patientDob || !data.accession_number || !data.patientMrn;
  });

  updateField<K extends keyof NewCaseData>(field: K, value: NewCaseData[K]) {
    this.newCaseData.update(data => ({ ...data, [field]: value }));
  }

  saveCase() {
    if (this.isSaveDisabled()) return;
    this.showConfirmation.set(true);
  }

  confirmSave() {
    this.caseService.addCase(this.newCaseData());
    this.close();
  }

  cancelSave() {
    this.showConfirmation.set(false);
  }
  
  close() {
    this.newCaseData.set(INITIAL_STATE);
    this.showConfirmation.set(false);
    this.uiService.showNewCaseForm.set(false);
  }
}