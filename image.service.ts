import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private sampleImageBase64: string | null = null;
  private fetchPromise: Promise<string> | null = null;

  /**
   * Fetches a sample image and returns its base64 representation.
   * Caches the result to avoid repeated fetches.
   */
  getSampleImageBase64(): Promise<string> {
    if (this.sampleImageBase64) {
      return Promise.resolve(this.sampleImageBase64);
    }
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    // Using a specific seed for consistency in the demo
    this.fetchPromise = fetch('https://picsum.photos/seed/default-slide/800/600')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // We only need the base64 data, not the data URL prefix
          const base64Data = (reader.result as string).split(',')[1];
          if (base64Data) {
            this.sampleImageBase64 = base64Data;
            this.fetchPromise = null;
            resolve(this.sampleImageBase64);
          } else {
            reject(new Error('Failed to read file as base64.'));
          }
        };
        reader.onerror = (error) => {
            this.fetchPromise = null;
            reject(error);
        };
        reader.readAsDataURL(blob);
      }))
      .catch(error => {
          console.error('Failed to fetch and process sample image:', error);
          this.fetchPromise = null;
          // Fallback or re-throw
          throw error;
      });
      
    return this.fetchPromise;
  }
}
