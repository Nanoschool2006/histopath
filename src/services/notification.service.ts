import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly _notification = signal<Notification | null>(null);
  readonly notification = this._notification.asReadonly();

  private timer: any;

  show(message: string, type: NotificationType = 'info', duration: number = 3000) {
    this._notification.set({ message, type });
    
    if (this.timer) {
        clearTimeout(this.timer);
    }
    
    this.timer = setTimeout(() => {
        this.hide();
    }, duration);
  }

  hide() {
    this._notification.set(null);
  }
}