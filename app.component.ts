import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CaseListComponent } from './components/case-list/case-list.component';
import { CaseDetailComponent } from './components/case-detail/case-detail.component';
import { CaseService } from './services/case.service';
import { UiService } from './services/ui.service';
import { AuthService } from './services/auth.service';
import { FeedbackFormComponent } from './components/feedback-form/feedback-form.component';
import { RoleManagementComponent } from './components/role-management/role-management.component';
import { FeedbackManagementComponent } from './components/feedback-management/feedback-management.component';
import { CaseEditComponent } from './components/case-edit/case-edit.component';
import { LeaderboardPageComponent } from './components/leaderboard-page/leaderboard-page.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { NotificationComponent } from './components/notification/notification.component';
import { SystemSettingsComponent } from './components/system-settings/system-settings.component';
import { AuditLogComponent } from './components/audit-log/audit-log.component';
import { TenantManagementComponent } from './components/tenant-management/tenant-management.component';
import { LoginComponent } from './components/login/login.component';
import { HelpComponent } from './components/help/help.component';
import { HelpService } from './services/help.service';
import { LandingComponent } from './components/landing/landing.component';
import { GeminiService } from './services/gemini.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    CaseListComponent,
    CaseDetailComponent,
    FeedbackFormComponent,
    RoleManagementComponent,
    FeedbackManagementComponent,
    CaseEditComponent,
    LeaderboardPageComponent,
    UserProfileComponent,
    NotificationComponent,
    SystemSettingsComponent,
    AuditLogComponent,
    TenantManagementComponent,
    LoginComponent,
    HelpComponent,
    LandingComponent,
  ],
  template: `
    @if (geminiService.isConfigured) {
      @if (ui.showLandingPage()) {
        <app-landing (launchApp)="enterApp()"></app-landing>
      } @else {
        @if (currentUser()) {
          <div class="flex h-screen bg-gray-100 font-sans">
            <!-- Sidebar -->
            <div class="w-64 bg-gray-800 text-white flex-shrink-0">
              <div class="p-4 text-2xl font-bold border-b border-gray-700">Patho<span class="text-blue-400">Genius</span></div>
              <nav class="mt-4">
                <a href="#" (click)="$event.preventDefault(); clearViews()" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700" title="Return to the main dashboard view">
                  <svg class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                  Dashboard
                </a>
                <a href="#" (click)="$event.preventDefault(); openFeedbackForm()" class="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700" title="Submit feedback, suggestions, or bug reports">
                  <svg class="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                  Submit Feedback
                </a>
              </nav>
            </div>

            <div class="flex-1 flex flex-col overflow-hidden">
              <!-- Header -->
              <header class="bg-white shadow-md p-4 flex justify-between items-center">
                  <div class="text-lg font-semibold text-gray-700">Pathology Case Dashboard</div>
                  @if (currentUser(); as user) {
                      <div class="flex items-center space-x-4">
                          <button (click)="showHelp()" class="text-gray-500 hover:text-blue-600" title="Get help for the current page">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                            </svg>
                          </button>
                          <button (click)="openUserProfile()" class="flex items-center space-x-2 text-gray-600 hover:text-gray-900" title="View your profile and contributions">
                              <span>{{ user.name }} ({{ user.role }})</span>
                              <div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                  {{ user.name.charAt(0) }}
                              </div>
                          </button>
                          <button (click)="logout()" class="text-gray-500 hover:text-red-600" title="Logout">
                              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                          </button>
                      </div>
                  }
              </header>

              <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                <div class="container mx-auto">
                  @if (caseService.selectedCase()) {
                    <app-case-detail />
                  } @else if (ui.showLeaderboardPage()) {
                    <app-leaderboard-page />
                  } @else if (ui.showUserProfile()) {
                    <app-user-profile />
                  } @else {
                    <app-dashboard />
                    <div class="mt-6">
                      <app-case-list />
                    </div>
                  }
                </div>
              </main>
            </div>

            <!-- Modals and Overlays -->
            @if (ui.showFeedbackForm()) { <app-feedback-form /> }
            @if (ui.showFeedbackManagement()) { <app-feedback-management /> }
            @if (ui.showRoleManagement()) { <app-role-management /> }
            @if (ui.showTenantManagement()) { <app-tenant-management /> }
            @if (ui.showNewCaseForm()) { <app-case-edit /> }
            @if (ui.showSystemSettings()) { <app-system-settings /> }
            @if (ui.showAuditLog()) { <app-audit-log /> }
            
            <app-notification />
            <app-help />
          </div>
        } @else {
          <app-login />
        }
      }
    } @else {
      <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4 font-sans">
        <div class="w-full max-w-2xl p-8 space-y-6 bg-white rounded-lg shadow-2xl border-2 border-red-200">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <svg class="h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800">Application Configuration Error</h1>
              <p class="mt-1 text-gray-600">The application failed to start due to a missing configuration.</p>
            </div>
          </div>
          <div class="bg-red-50 p-4 rounded-lg border border-red-200">
            <h2 class="font-semibold text-red-800">Missing Environment Variable: <code class="font-mono bg-red-100 px-1 py-0.5 rounded">API_KEY</code></h2>
            <p class="mt-2 text-red-700">
              This application requires a Google AI API key to function, but it was not found in the deployment environment. The app works in AI Studio because this key is provided automatically.
            </p>
          </div>
          <div>
              <h3 class="font-semibold text-gray-800">How to Fix This</h3>
              <p class="mt-2 text-gray-600">
                You need to set the <code class="font-mono bg-gray-200 px-1 py-0.5 rounded">API_KEY</code> environment variable in your Google Cloud deployment settings.
              </p>
              <ol class="list-decimal list-inside mt-2 space-y-1 text-gray-600">
                  <li>Go to your service configuration in the Google Cloud Console (e.g., Cloud Run or App Engine).</li>
                  <li>Find the section for "Environment variables".</li>
                  <li>Add a new variable with the name <code class="font-mono bg-gray-200 px-1 py-0.5 rounded">API_KEY</code> and set its value to your Google AI API key.</li>
                  <li>Save the changes and redeploy your application.</li>
              </ol>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  readonly caseService = inject(CaseService);
  readonly ui = inject(UiService);
  private readonly authService = inject(AuthService);
  private readonly helpService = inject(HelpService);
  readonly geminiService = inject(GeminiService);

  readonly currentUser = this.authService.currentUser;

  enterApp(): void {
    this.ui.showLandingPage.set(false);
  }

  clearViews(): void {
    this.caseService.clearSelectedCase();
    this.ui.showLeaderboardPage.set(false);
    this.ui.showUserProfile.set(false);
  }

  openFeedbackForm(): void {
    this.ui.showFeedbackForm.set(true);
  }
  
  openUserProfile(): void {
    this.ui.showUserProfile.set(true);
  }

  showHelp(): void {
    if (this.caseService.selectedCase()) {
      this.helpService.showHelp('case-detail');
    } else {
      // The main view is a combination of dashboard and case list.
      // 'case-list' help is the most relevant for this view.
      this.helpService.showHelp('case-list');
    }
  }

  logout(): void {
    this.authService.logout();
    this.ui.showLandingPage.set(true);
  }
}