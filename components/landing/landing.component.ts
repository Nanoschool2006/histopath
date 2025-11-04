import { ChangeDetectionStrategy, Component, output, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements AfterViewInit, OnDestroy {
  readonly launchApp = output<void>();

  activeSection = signal<string>('');
  private sections: { id: string; element: HTMLElement }[] = [];
  private scrollListener!: () => void;
  private throttledScroll: any = null;

  onLaunchApp(): void {
    this.launchApp.emit();
  }

  setActiveSection(sectionId: string): void {
    this.activeSection.set(sectionId);
  }

  // FIX: Corrected the method signature from 'void: void' to 'void', which was a syntax error causing numerous downstream compilation failures.
  ngAfterViewInit(): void {
    // Using setTimeout to ensure elements are rendered and available.
    setTimeout(() => {
      this.sections = ['features', 'how-it-works', 'testimonials', 'disclaimer', 'cta'].map(id => ({
        id,
        element: document.getElementById(id) as HTMLElement
      })).filter(s => s.element);

      this.scrollListener = () => {
        if (!this.throttledScroll) {
          this.throttledScroll = setTimeout(() => {
            this.onScroll();
            this.throttledScroll = null;
          }, 100);
        }
      };
      
      window.addEventListener('scroll', this.scrollListener, { passive: true });
      this.onScroll(); // Initial check
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.scrollListener) {
      window.removeEventListener('scroll', this.scrollListener);
    }
    if (this.throttledScroll) {
      clearTimeout(this.throttledScroll);
    }
  }

  private onScroll(): void {
    const scrollPosition = window.scrollY;
    const offset = 150; 
    let currentSectionId = '';

    // Find the last section that the user has scrolled past
    for (const section of this.sections) {
      if (section.element.offsetTop - offset <= scrollPosition) {
        currentSectionId = section.id;
      }
    }
    
    // If scrolled back to top, no section is active.
    const heroSection = document.querySelector('section'); // The first section
    if (heroSection && scrollPosition < heroSection.offsetTop - offset) {
        currentSectionId = '';
    }

    this.activeSection.set(currentSectionId);
  }
}