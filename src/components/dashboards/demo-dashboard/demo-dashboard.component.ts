import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-demo-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './demo-dashboard.component.html',
  // Fix: Corrected typo from ChangeDirectionStrategy to ChangeDetectionStrategy.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoDashboardComponent {
  readonly currentUser = inject(AuthService).currentUser;
}