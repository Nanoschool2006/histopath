import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HelpService } from '../../services/help.service';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './help.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpComponent {
  helpService = inject(HelpService);

  showModal = this.helpService.showHelpModal;
  title = this.helpService.helpTitle;
  content = this.helpService.helpContent;

  close(): void {
    this.helpService.hideHelp();
  }
}
