
import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
// FIX: Corrected import path for AppComponent to be relative.
import { AppComponent } from './src/app.component';

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection()],
}).catch((err) => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.