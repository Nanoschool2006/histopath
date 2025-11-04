import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiService {
  readonly showLandingPage = signal(true);
  readonly showNewCaseForm = signal(false);
  readonly showFeedbackManagement = signal(false);
  readonly showRoleManagement = signal(false);
  readonly showTenantManagement = signal(false);
  readonly showSystemSettings = signal(false);
  readonly showAuditLog = signal(false);
  readonly showFeedbackForm = signal(false);
  readonly showLeaderboardPage = signal(false);
  readonly showUserEditForm = signal(false);
  readonly showUserProfile = signal(false);
  readonly showCourseManagement = signal(false); // For student admin
}