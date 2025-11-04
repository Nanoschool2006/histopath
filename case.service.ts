import { Injectable, signal, computed, inject } from '@angular/core';
import { Case, CaseFilters, Patient, User, AnalysisHistoryItem, Annotation, AnalysisFeedback } from '../models';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';

export interface NewCaseData {
  patientName: string;
  patientDob: string;
  patientGender: 'Male' | 'Female' | 'Other';
  patientMrn: string;
  accession_number: string;
  priority: 'Routine' | 'STAT';
  assigned_to_id: string | null;
  clinical_history: string;
}

export type SortableCaseColumns = 'accession_number' | 'patient' | 'date_received' | 'status' | 'priority' | 'assigned_to';


@Injectable({
  providedIn: 'root',
})
export class CaseService {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  private readonly MOCK_PATIENTS: Patient[] = [
    { id: 'p1', name: 'John Doe', dob: '1985-05-20', gender: 'Male', mrn: 'MRN001' },
    { id: 'p2', name: 'Jane Smith', dob: '1992-08-15', gender: 'Female', mrn: 'MRN002' },
    { id: 'p3', name: 'Robert Johnson', dob: '1978-11-30', gender: 'Male', mrn: 'MRN003' },
    { id: 'p4', name: 'Emily White', dob: '2001-02-10', gender: 'Female', mrn: 'MRN004' },
    { id: 'p5', name: 'Michael Brown', dob: '1964-03-12', gender: 'Male', mrn: 'MRN005' },
    { id: 'p6', name: 'Sarah Davis', dob: '1998-07-22', gender: 'Female', mrn: 'MRN006' },
  ];

  private readonly MOCK_CASES: Case[] = [
    {
      id: 'c1',
      accession_number: 'S24-1001',
      patient: this.MOCK_PATIENTS[0],
      patientId: 'p1',
      date_received: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      clinical_history: 'Routine checkup, suspicious mole on back.',
      status: 'Reported',
      priority: 'Routine',
      assigned_to: this.authService.allUsers().find(u => u.id === 'u1') || null,
      slide_image_url: 'https://picsum.photos/seed/c1/800/600',
      analysisHistory: [],
      annotations: [],
      isArchived: false,
      tenantId: 't1',
      aiDiagnosis: 'Benign Nevus',
      aiConfidence: 0.98,
      pathologistDiagnosis: 'Benign Nevus'
    },
    {
      id: 'c2',
      accession_number: 'S24-1002',
      patient: this.MOCK_PATIENTS[1],
      patientId: 'p2',
      date_received: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      clinical_history: 'Biopsy of skin lesion on left arm.',
      status: 'Awaiting Review',
      priority: 'STAT',
      assigned_to: this.authService.allUsers().find(u => u.id === 'u1') || null,
      slide_image_url: 'https://picsum.photos/seed/c2/800/600',
      analysisHistory: [],
      annotations: [],
      isArchived: false,
      tenantId: 't1'
    },
    {
      id: 'c3',
      accession_number: 'S24-1003',
      patient: this.MOCK_PATIENTS[2],
      patientId: 'p3',
      date_received: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      clinical_history: 'Colon polyp removal.',
      status: 'Closed',
      priority: 'Routine',
      assigned_to: this.authService.allUsers().find(u => u.id === 'u3') || null,
      slide_image_url: 'https://picsum.photos/seed/c3/800/600',
      analysisHistory: [],
      annotations: [],
      isArchived: true,
      tenantId: 't2',
      aiDiagnosis: 'Tubular Adenoma',
      aiConfidence: 0.85,
      pathologistDiagnosis: 'Villous Adenoma'
    },
     {
      id: 'c4',
      accession_number: 'S24-1004',
      patient: this.MOCK_PATIENTS[3],
      patientId: 'p4',
      date_received: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      clinical_history: 'Endometrial biopsy for abnormal bleeding.',
      status: 'In Review',
      priority: 'Routine',
      assigned_to: null, // Unassigned
      slide_image_url: 'https://picsum.photos/seed/c4/800/600',
      analysisHistory: [],
      annotations: [],
      isArchived: false,
      tenantId: 't1'
    },
    {
      id: 'c5',
      accession_number: 'S24-1005',
      patient: this.MOCK_PATIENTS[4],
      patientId: 'p5',
      date_received: new Date().toISOString(),
      clinical_history: 'Urgent frozen section for lung mass.',
      status: 'Specimen Accessioned',
      priority: 'STAT',
      assigned_to: null, // Unassigned
      slide_image_url: '', // No image yet
      analysisHistory: [],
      annotations: [],
      isArchived: false,
      tenantId: 't2'
    },
     {
      id: 'c6',
      accession_number: 'T24-001',
      patient: this.MOCK_PATIENTS[5],
      patientId: 'p6',
      date_received: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      clinical_history: 'Training case: Classic example of HSIL.',
      status: 'Awaiting Review',
      priority: 'Routine',
      assigned_to: this.authService.allUsers().find(u => u.id === 'u8') || null,
      slide_image_url: 'https://picsum.photos/seed/c6/800/600',
      analysisHistory: [],
      annotations: [],
      isArchived: false,
      tenantId: 't1',
      isTrainingCase: true,
    },
  ];

  // State Signals
  private readonly _allCases = signal<Case[]>(this.MOCK_CASES);
  private readonly _selectedCaseId = signal<string | null>(null);
  private readonly _filters = signal<CaseFilters>({ showArchived: false });
  private readonly _sortColumn = signal<SortableCaseColumns>('date_received');
  private readonly _sortDirection = signal<'asc' | 'desc'>('desc');

  // Public Readonly Signals
  readonly allCases = this._allCases.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly sortColumn = this._sortColumn.asReadonly();
  readonly sortDirection = this._sortDirection.asReadonly();

  readonly selectedCase = computed(() => {
    const caseId = this._selectedCaseId();
    return caseId ? this._allCases().find(c => c.id === caseId) ?? null : null;
  });

  readonly cases = computed(() => {
    let filteredCases = this._allCases();
    const filters = this._filters();

    // Filtering logic
    if (filters.status) {
      filteredCases = filteredCases.filter(c => c.status === filters.status);
    }
    if (filters.priority) {
      filteredCases = filteredCases.filter(c => c.priority === filters.priority);
    }
    if (filters.patientName) {
      const lowerPatientName = filters.patientName.toLowerCase();
      filteredCases = filteredCases.filter(c => c.patient.name.toLowerCase().includes(lowerPatientName));
    }
    if (filters.accessionNumber) {
        const lowerAccession = filters.accessionNumber.toLowerCase();
        filteredCases = filteredCases.filter(c => c.accession_number.toLowerCase().includes(lowerAccession));
    }
    if (filters.assignedToId) {
      filteredCases = filteredCases.filter(c => c.assigned_to?.id === filters.assignedToId);
    }
    if (filters.isTrainingCase !== undefined) {
      filteredCases = filteredCases.filter(c => !!c.isTrainingCase === filters.isTrainingCase);
    }
    if (!filters.showArchived) {
      filteredCases = filteredCases.filter(c => !c.isArchived);
    }

    // Sorting logic
    const column = this._sortColumn();
    const direction = this._sortDirection();

    return [...filteredCases].sort((a, b) => {
      const isAsc = direction === 'asc';
      let comparison = 0;

      switch (column) {
        case 'patient':
          comparison = a.patient.name.localeCompare(b.patient.name);
          break;
        case 'accession_number':
          comparison = a.accession_number.localeCompare(b.accession_number);
          break;
        case 'date_received':
          comparison = new Date(a.date_received).getTime() - new Date(b.date_received).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'priority':
          comparison = a.priority.localeCompare(b.priority);
          break;
        case 'assigned_to':
          const nameA = a.assigned_to?.name ?? 'ZZZ'; // Put unassigned at the end
          const nameB = b.assigned_to?.name ?? 'ZZZ';
          comparison = nameA.localeCompare(nameB);
          break;
      }
      return isAsc ? comparison : -comparison;
    });
  });

  // --- Case Selection ---
  selectCase(caseId: string): void {
    this._selectedCaseId.set(caseId);
  }

  clearSelectedCase(): void {
    this._selectedCaseId.set(null);
  }

  // --- Filtering and Sorting ---
  applyFilters(filters: CaseFilters): void {
    this._filters.set(filters);
  }
  
  updateFilters(filters: Partial<CaseFilters>): void {
    this._filters.update(current => ({ ...current, ...filters }));
  }

  removeFilter(filterKey: keyof CaseFilters): void {
    this._filters.update(current => {
      const newFilters = { ...current };
      delete newFilters[filterKey];
      return newFilters;
    });
  }

  clearFilters(): void {
    this._filters.set({ showArchived: false });
  }

  setSort(column: SortableCaseColumns): void {
    if (this._sortColumn() === column) {
      this._sortDirection.update(dir => (dir === 'asc' ? 'desc' : 'asc'));
    } else {
      this._sortColumn.set(column);
      this._sortDirection.set('desc');
    }
  }

  // --- Case Manipulation ---
  addCase(data: NewCaseData): void {
    const user = this.authService.currentUser();
    if (!user) return;
    
    const newPatient: Patient = {
        id: `p${Date.now()}`,
        name: data.patientName,
        dob: data.patientDob,
        gender: data.patientGender,
        mrn: data.patientMrn,
    };
    
    const assignedUser = this.authService.allUsers().find(u => u.id === data.assigned_to_id) || null;
    
    const newCase: Case = {
        id: `c${Date.now()}`,
        accession_number: data.accession_number,
        patient: newPatient,
        patientId: newPatient.id,
        date_received: new Date().toISOString(),
        clinical_history: data.clinical_history,
        status: 'Specimen Accessioned',
        priority: data.priority,
        assigned_to: assignedUser,
        analysisHistory: [],
        annotations: [],
        isArchived: false,
        tenantId: user.tenantId || 't1', // Default to t1 if user has no tenant
    };

    this._allCases.update(cases => [newCase, ...cases]);

    const currentUser = this.authService.currentUser();
    if (currentUser && assignedUser && currentUser.id === assignedUser.id) {
        this.notificationService.show(`You have been assigned a new case: ${newCase.accession_number}`, 'info');
    }
  }

  archiveCase(caseId: string): void {
    this._allCases.update(cases =>
      cases.map(c => c.id === caseId ? { ...c, isArchived: true } : c)
    );
  }

  unarchiveCase(caseId: string): void {
    this._allCases.update(cases =>
      cases.map(c => c.id === caseId ? { ...c, isArchived: false } : c)
    );
  }

  updateCaseImageUrl(caseId: string, imageUrl: string): void {
    this._allCases.update(cases =>
      cases.map(c => c.id === caseId ? { ...c, slide_image_url: imageUrl } : c)
    );
  }
  
  updateCaseAssignment(caseId: string, userId: string | null): void {
    const userToAssign = userId ? this.authService.allUsers().find(u => u.id === userId) : null;
    let originalAssigneeId: string | null | undefined = undefined;

    this._allCases.update(cases =>
      cases.map(c => {
        if (c.id === caseId) {
          originalAssigneeId = c.assigned_to?.id;
          return { ...c, assigned_to: userToAssign || null };
        }
        return c;
      })
    );
    
    // Don't notify if assignment hasn't changed
    if (originalAssigneeId === userId) {
      return;
    }
    
    const currentUser = this.authService.currentUser();
    // Notify if the current user is the one being assigned
    if (currentUser && userToAssign && currentUser.id === userToAssign.id) {
      const assignedCase = this.allCases().find(c => c.id === caseId);
      if (assignedCase) {
        this.notificationService.show(`You have been assigned case: ${assignedCase.accession_number}`, 'info');
      }
    }
  }

  addAnalysisToHistory(caseId: string, historyItem: AnalysisHistoryItem): void {
    this._allCases.update(cases =>
      cases.map(c =>
        c.id === caseId ? { ...c, analysisHistory: [historyItem, ...c.analysisHistory] } : c
      )
    );
  }

  addFeedbackToAnalysisHistory(caseId: string, historyItemId: string, feedback: AnalysisFeedback): void {
      this._allCases.update(cases =>
        cases.map(c => {
            if (c.id === caseId) {
                const newHistory = c.analysisHistory.map(h => 
                    h.id === historyItemId ? { ...h, feedback: feedback } : h
                );
                return { ...c, analysisHistory: newHistory };
            }
            return c;
        })
      );
  }

  updateCaseAnnotations(caseId: string, annotations: Annotation[]): void {
    this._allCases.update(cases =>
      cases.map(c => (c.id === caseId ? { ...c, annotations: annotations } : c))
    );
  }
}
