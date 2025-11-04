import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QAMetrics } from '../../services/qa.service';

@Component({
  selector: 'app-qa-metrics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './qa-metrics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaMetricsComponent {
  metrics = input.required<QAMetrics | null>();
}
