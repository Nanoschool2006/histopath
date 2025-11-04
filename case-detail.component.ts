import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @deprecated This component's logic has been moved to 'src/components/case-detail/case-detail.component.ts'.
 * This file is obsolete and has been neutralized to prevent build errors.
 */
@Component({
  selector: 'app-case-detail-root-obsolete',
  standalone: true,
  imports: [CommonModule],
  template: '<!-- This component is obsolete. The content has been moved to src/components/case-detail/ -->',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseDetailRootObsoleteComponent {
  // Logic has been moved to src/components/case-detail/case-detail.component.ts
}
