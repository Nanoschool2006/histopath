import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskManagerComponent {
  private taskService = inject(TaskService);
  
  tasks = this.taskService.userTasks;
  newTaskText = signal('');

  addTask() {
    this.taskService.addTask(this.newTaskText());
    this.newTaskText.set('');
  }

  toggleTask(taskId: string) {
    this.taskService.toggleTaskCompletion(taskId);
  }

  deleteTask(taskId: string) {
    this.taskService.deleteTask(taskId);
  }
}
