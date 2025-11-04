import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-similarity-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-similarity-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageSimilaritySearchComponent {}