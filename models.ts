// User and Auth
export type UserRole = 'SuperAdmin' | 'SystemAdmin' | 'TenantAdmin' | 'StudentAdmin' | 'Pathologist' | 'Researcher' | 'Student' | 'Demo';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  feedbackPoints: number;
}

// Permissions and Roles
export type Permission = 
  'view:cases' | 'manage:cases' | 'view:users' | 'manage:users' | 
  'view:roles' | 'manage:roles' | 'view:system-health' | 'view:reports' | 
  'run:ai-analysis';

export interface Role {
  id: string;
  name: UserRole;
  description: string;
  permissions: Permission[];
}

// Tenant
export interface Tenant {
    id: string;
    name: string;
    status: 'Active' | 'Suspended';
}

// Patient and Case
export interface Patient {
  id: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  mrn: string;
}

export type CaseStatus = 'Specimen Accessioned' | 'Awaiting Review' | 'In Review' | 'Second Opinion' | 'Reported' | 'Closed';
export type CasePriority = 'Routine' | 'STAT';

export interface Case {
  id: string;
  accession_number: string;
  patient: Patient;
  patientId: string;
  date_received: string; // ISO string
  clinical_history: string;
  status: CaseStatus;
  priority: CasePriority;
  assigned_to: User | null;
  slide_image_url?: string;
  analysisHistory: AnalysisHistoryItem[];
  annotations: Annotation[];
  isArchived: boolean;
  tenantId: string | null;
  isTrainingCase?: boolean;
  aiDiagnosis?: string;
  aiConfidence?: number;
  pathologistDiagnosis?: string;
}

export interface CaseFilters {
  status?: CaseStatus;
  priority?: CasePriority;
  patientName?: string;
  accessionNumber?: string;
  assignedToId?: string;
  isTrainingCase?: boolean;
  showArchived?: boolean;
  assignedTo?: string; // from Gemini query
}

export interface AnalysisFeedback {
    rating: 'good' | 'bad';
    comment?: string;
    submittedBy: string;
    submittedAt: string; // ISO string
}

export interface AnalysisHistoryItem {
  id: string;
  date: string; // ISO string
  analysisName: string;
  prompt: string;
  result: string;
  feedback?: AnalysisFeedback;
}

// Annotations
export interface Point {
  x: number;
  y: number;
}

interface BaseAnnotation {
    id: string;
    type: 'pen' | 'rectangle' | 'circle';
    color: string;
    strokeWidth: number;
}
export interface PenAnnotation extends BaseAnnotation {
  type: 'pen';
  points: Point[];
}
export interface RectangleAnnotation extends BaseAnnotation {
  type: 'rectangle';
  start: Point;
  end: Point;
}
export interface CircleAnnotation extends BaseAnnotation {
    type: 'circle';
    center: Point;
    radius: number;
}
export type Annotation = PenAnnotation | RectangleAnnotation | CircleAnnotation;


// Feedback
export type FeedbackType = 'Bug' | 'Suggestion' | 'Error' | 'Question';
export type FeedbackStatus = 'New' | 'In Progress' | 'Resolved' | 'Closed';
export type FeedbackPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string; // ISO string
  pointsAwarded: number;
  priority?: FeedbackPriority;
  attachment?: { name: string; type: string; size: number };
  admin_comment?: string;
  target_resolution_date?: string;
}

// System & Admin
export interface LoggedError {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  context: string;
  errorObject: unknown;
}

export type ActivityIcon = 'case_new' | 'case_closed' | 'feedback_new' | 'user_added' | 'system_update' | 'action_cache' | 'action_restart';

export interface Activity {
  id: string;
  icon: ActivityIcon;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  caseId?: string;
  userId: string;
  createdAt: string;
}

export type IntegrationStatus = 'Connected' | 'Error' | 'Disconnected';

export interface Integration {
  id: string;
  name: string;
  type: 'LIS' | 'EHR' | 'PACS';
  tenant: string;
  status: IntegrationStatus;
  lastSync: string;
}

export type ModelStatus = 'Production' | 'Archived' | 'In Development';

export interface AiModel {
    id: string;
    version: string;
    concordance: number;
    status: ModelStatus;
    stabilityScore: number;
    totalRuns: number;
}

export type ChangelogItemType = 'NEW' | 'IMPROVE' | 'FIX';

export interface ChangelogItem {
    id: string;
    type: ChangelogItemType;
    date: string;
    description: string;
}

export type ExperimentStatus = 'Completed' | 'Running' | 'Failed';

export interface MlflowExperiment {
  id: string;
  name: string;
  accuracy: number | null;
  status: ExperimentStatus;
}


// Course Management
export interface Course {
    id: string;
    title: string;
    description: string;
    assignedStudents: string[]; // array of user IDs
}
