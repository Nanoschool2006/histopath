import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course.service';
import { UiService } from '../../services/ui.service';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white p-6 rounded-lg shadow-md mt-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-gray-800">Course Management</h2>
        <button (click)="openCourseManagement()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Manage Courses
        </button>
      </div>
      <p class="text-gray-600">Total Courses: {{ courses().length }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseManagementComponent {
  private courseService = inject(CourseService);
  private uiService = inject(UiService);

  courses = this.courseService.courses;

  openCourseManagement() {
    // This would open a full-page modal, which we can manage via the UI service.
    this.uiService.showCourseManagement.set(true);
  }
}
