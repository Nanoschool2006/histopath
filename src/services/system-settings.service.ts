import { Injectable, signal } from '@angular/core';

export interface SystemSettings {
  emailOnError: boolean;
  weeklyReport: boolean;
  mfaEnforced: boolean;
}

const INITIAL_SETTINGS: SystemSettings = {
  emailOnError: true,
  weeklyReport: false,
  mfaEnforced: false,
};

@Injectable({
  providedIn: 'root',
})
export class SystemSettingsService {
  private readonly _settings = signal<SystemSettings>(INITIAL_SETTINGS);
  readonly settings = this._settings.asReadonly();

  updateSettings(newSettings: Partial<SystemSettings>) {
    this._settings.update(current => ({ ...current, ...newSettings }));
    // In a real app, this would be an API call.
    console.log('System settings updated:', this.settings());
  }
}