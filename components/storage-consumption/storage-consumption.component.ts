import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Storage {
  used: number;
  total: number;
}

@Component({
  selector: 'app-storage-consumption',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './storage-consumption.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageConsumptionComponent {
  storage = input.required<Storage>();

  readonly chartData = computed(() => {
    const s = this.storage();
    const percentage = s.total > 0 ? (s.used / s.total) * 100 : 0;
    
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return {
      percentage: Math.round(percentage),
      radius,
      center: 50,
      circumference,
      offset,
    };
  });
}