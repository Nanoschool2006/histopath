import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CaseVolume {
  count: number;
  change: number;
}

@Component({
  selector: 'app-departmental-case-volume',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './departmental-case-volume.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentalCaseVolumeComponent {
  volume = input.required<CaseVolume>();
}