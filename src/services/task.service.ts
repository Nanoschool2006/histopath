import { Injectable, signal, computed, inject } from '@angular/core';
import { Task } from '../models';
import { AuthService } from './auth.service';

const MOCK_TASKS: Task[] = [
    { id: 't1', text: 'Review slides for S24-1002', isCompleted: false, caseId: 'c2', userId: 'u1', createdAt: new Date().toISOString() },
    { id: 't2', text: 'Draft report for S24-1001', isCompleted: false, caseId: 'c1', userId: 'u1', createdAt: new Date().toISOString() },
    { id: 't3', text: 'Follow up with Dr. Smith on case consult', isCompleted: true, userId: 'u1', createdAt: new Date().toISOString() },
    { id: 't4', text: 'Prepare for tumor board meeting', isCompleted: false, userId: 'u2', createdAt: new Date().toISOString() },
    { id: 't5', text: 'Finalize report for S24-1004', isCompleted: true, caseId: 'c4', userId: 'u2', createdAt: new Date().toISOString() },
];

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private authService = inject(AuthService);

  private readonly _tasks = signal<Task[]>(MOCK_TASKS);
  
  readonly userTasks = computed(() => {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];
    return this._tasks()
      .filter(task => task.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // show newest first
  });

  addTask(text: string): void {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !text.trim()) return;

    const newTask: Task = {
      id: `task-${Date.now()}`,
      text: text.trim(),
      isCompleted: false,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
    };
    this._tasks.update(tasks => [newTask, ...tasks]);
  }
  
  toggleTaskCompletion(taskId: string): void {
    this._tasks.update(tasks => 
      tasks.map(task => 
        task.id === taskId ? { ...task, isCompleted: !task.isCompleted } : task
      )
    );
  }

  deleteTask(taskId: string): void {
    this._tasks.update(tasks => tasks.filter(task => task.id !== taskId));
  }
}
