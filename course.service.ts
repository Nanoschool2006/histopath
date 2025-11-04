import { Injectable, signal } from '@angular/core';
import { Course } from '../models';

const MOCK_COURSES: Course[] = [
    {
        id: 'course1',
        title: 'Introduction to Digital Pathology',
        description: 'A comprehensive overview of digital slide scanning, viewing, and analysis.',
        assignedStudents: ['u8']
    },
    {
        id: 'course2',
        title: 'Advanced Histological Staining',
        description: 'Covers IHC, ISH, and other advanced staining techniques.',
        assignedStudents: []
    }
];

@Injectable({ providedIn: 'root' })
export class CourseService {
    private readonly _courses = signal<Course[]>(MOCK_COURSES);
    readonly courses = this._courses.asReadonly();

    addCourse(data: Omit<Course, 'id' | 'assignedStudents'>) {
        const newCourse: Course = {
            id: `course-${Date.now()}`,
            ...data,
            assignedStudents: [],
        };
        this._courses.update(courses => [...courses, newCourse]);
    }
}
