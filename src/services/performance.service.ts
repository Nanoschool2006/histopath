import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { PerformanceDataPoint } from '../components/performance-trends/performance-trends.component';

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private authService = inject(AuthService);

  // In a real app, this would fetch from a backend. Here we generate mock data.
  getPerformanceDataForCurrentUser(): PerformanceDataPoint[] {
    const user = this.authService.currentUser();
    if (!user) return [];

    const data: PerformanceDataPoint[] = [];
    const today = new Date();
    
    // Generate data for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      // Simple hash from user id to create predictable, yet user-specific, randomness
      const userSeed = (user.id.charCodeAt(1) || 1) + i;
      
      const avgTurnaroundTime = 28 + Math.sin(userSeed) * 5; 
      const casesCompleted = 12 + Math.cos(userSeed) * 3;
      
      data.push({
        date,
        avgTurnaroundTime: Math.max(18, Math.round(avgTurnaroundTime)), // Ensure minimum value
        casesCompleted: Math.max(5, Math.round(casesCompleted)), // Ensure minimum value
      });
    }
    
    return data;
  }
}