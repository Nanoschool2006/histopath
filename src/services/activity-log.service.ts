import { Injectable, signal } from '@angular/core';

export type ActivityIcon = 'case_new' | 'case_closed' | 'feedback_new' | 'user_added' | 'system_update' | 'action_cache' | 'action_restart';

export interface Activity {
  id: string;
  icon: ActivityIcon;
  text: string;
  timestamp: string;
}

const MOCK_ACTIVITIES: Activity[] = [
    { id: 'a1', icon: 'case_new', text: 'New STAT case S24-1005 added to tenant "t2".', timestamp: '1 hour ago' },
    { id: 'a2', icon: 'case_closed', text: 'Case S24-1003 was reported by Dr. Ben Carter.', timestamp: '3 hours ago' },
    { id: 'a3', icon: 'feedback_new', text: 'New feedback "Suggestion" submitted by Dr. Evelyn Reed.', timestamp: '5 hours ago' },
    { id: 'a4', icon: 'user_added', text: 'User "New Student" added to tenant "t1" by Prof. Alan Grant.', timestamp: '8 hours ago'},
    { id: 'a5', icon: 'case_new', text: 'New case S24-1006 created for tenant "t1".', timestamp: '1 day ago' },
    { id: 'a6', icon: 'system_update', text: 'AI model "gemini-2.5-flash" was updated.', timestamp: '2 days ago' },
    { id: 'a7', icon: 'case_closed', text: 'Case S24-1004 was closed and archived.', timestamp: '2 days ago' },
];


@Injectable({
  providedIn: 'root',
})
export class ActivityLogService {
  private readonly _activities = signal<Activity[]>(MOCK_ACTIVITIES);
  readonly activities = this._activities.asReadonly();
  
  logActivity(icon: ActivityIcon, text: string) {
    const newActivity: Activity = {
      id: `a-${Date.now()}`,
      icon,
      text,
      timestamp: 'just now',
    };
    
    // update timestamps of existing activities
    const updatedActivities = this._activities().map(a => {
        // This is a simplistic way to update relative time, a real app would use a library
        if (a.timestamp === 'just now') return {...a, timestamp: 'a moment ago'};
        return a;
    });

    this._activities.set([newActivity, ...updatedActivities]);
  }
}