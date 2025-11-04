import { Injectable, signal } from '@angular/core';
import { User, UserRole } from '../models';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Dr. Evelyn Reed', role: 'Pathologist', tenantId: 't1', feedbackPoints: 125 },
  { id: 'u2', name: 'Dr. Ben Carter', role: 'Researcher', tenantId: 't1', feedbackPoints: 80 },
  { id: 'u3', name: 'Dr. Olivia Chen', role: 'Pathologist', tenantId: 't2', feedbackPoints: 45 },
  { id: 'u4', name: 'Admin', role: 'SuperAdmin', tenantId: null, feedbackPoints: 15 },
  { id: 'u5', name: 'SysAdmin', role: 'SystemAdmin', tenantId: null, feedbackPoints: 5 },
  { id: 'u6', name: 'Admin (Tenant 1)', role: 'TenantAdmin', tenantId: 't1', feedbackPoints: 30 },
  { id: 'u7', name: 'Researcher Joe', role: 'Researcher', tenantId: null, feedbackPoints: 95 },
  { id: 'u8', name: 'Student', role: 'Student', tenantId: 't1', feedbackPoints: 60 },
  { id: 'u9', name: 'Demo User', role: 'Demo', tenantId: null, feedbackPoints: 0 },
  { id: 'u10', name: 'Prof. Alan Grant', role: 'StudentAdmin', tenantId: 't1', feedbackPoints: 40 },
  { id: 'u11', name: 'Dr. Kenji Tanaka', role: 'Pathologist', tenantId: 't1', feedbackPoints: 110 },
];

export interface NewUserData {
  name: string;
  role: UserRole;
  tenantId: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly _allUsers = signal<User[]>(MOCK_USERS);
  private readonly _currentUser = signal<User | null>(null);
  
  readonly currentUser = this._currentUser.asReadonly();
  readonly allUsers = this._allUsers.asReadonly();

  constructor() {
    // Attempt to load user from local storage to persist session
    try {
      const storedUserJson = localStorage.getItem('currentUser');
      if (storedUserJson) {
        const storedUser = JSON.parse(storedUserJson);
         // Sync with our "DB" to get the latest data (like points)
        const userInDb = this._allUsers().find(u => u.id === storedUser.id);
        this._currentUser.set(userInDb || null);
      } else {
        // Default to a user for demonstration purposes
        const defaultUser = this._allUsers()[0];
        this._currentUser.set(defaultUser);
        localStorage.setItem('currentUser', JSON.stringify(defaultUser));
      }
    } catch (e) {
      console.error('Could not parse user from localStorage', e);
      this._currentUser.set(this._allUsers()[0]);
    }
  }

  login(userId: string): void {
    const user = this._allUsers().find(u => u.id === userId);
    if (user) {
      this._currentUser.set(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        console.error('Login failed: user not found');
    }
  }

  logout(): void {
    this._currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  addUser(userData: NewUserData): void {
    const newUser: User = {
      id: `u${Date.now()}`,
      ...userData,
      feedbackPoints: 0,
    };
    this._allUsers.update(users => [...users, newUser]);
  }

  updateUser(userId: string, updatedData: Partial<Pick<User, 'name'>>): void {
    this._allUsers.update(users => 
      users.map(u => u.id === userId ? { ...u, ...updatedData } : u)
    );
    
    // Also update current user signal if it's them, so the UI reflects the change immediately
    if (this.currentUser()?.id === userId) {
        const updatedUser = this._allUsers().find(u => u.id === userId);
        this._currentUser.set(updatedUser || null);
         if (updatedUser) {
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
    }
  }

  addPointsToUser(userId: string, points: number): void {
    this._allUsers.update(users => 
      users.map(u => u.id === userId ? { ...u, feedbackPoints: (u.feedbackPoints || 0) + points } : u)
    );
    
    // Also update current user signal if it's them, so the UI reflects the change immediately
    if (this.currentUser()?.id === userId) {
        const updatedUser = this._allUsers().find(u => u.id === userId);
        this._currentUser.set(updatedUser || null);
    }
  }
}