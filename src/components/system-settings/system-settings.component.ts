import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiService } from '../../services/ui.service';
import { SystemSettingsService, SystemSettings } from '../../services/system-settings.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './system-settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemSettingsComponent {
  private readonly uiService = inject(UiService);
  private readonly settingsService = inject(SystemSettingsService);
  private readonly notificationService = inject(NotificationService);

  currentSettings = this.settingsService.settings;
  
  // Local state for form binding
  formState = signal<SystemSettings>({ ...this.currentSettings() });

  updateSetting<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) {
    this.formState.update(s => ({ ...s, [key]: value }));
  }

  save() {
    this.settingsService.updateSettings(this.formState());
    this.notificationService.show('System settings saved successfully.', 'success');
    this.close();
  }

  close() {
    this.uiService.showSystemSettings.set(false);
  }
}