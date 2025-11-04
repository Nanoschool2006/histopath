import { Injectable } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';
import { CaseFilters } from '../models';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  private readonly ai: GoogleGenAI | null = null;
  readonly isConfigured: boolean = false;

  constructor() {
    const apiKey = 'AIzaSyC0nzrt8bKmnmuKG5pjG9-zbmwJFbs_KWw';
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
      (this as any).isConfigured = true;
    } else {
      console.error('Deployment Error: The API_KEY environment variable is not set. Gemini features will be disabled.');
    }
  }

  async parseQuery(query: string): Promise<CaseFilters> {
    if (!this.ai) {
      console.error('GeminiService is not configured. Cannot parse query. Returning fallback.');
      // Fallback to a simple keyword search on patient name
      return { patientName: query };
    }

    const filterSchema = {
      type: Type.OBJECT,
      properties: {
        status: {
          type: Type.STRING,
          enum: ['Specimen Accessioned', 'Awaiting Review', 'In Review', 'Second Opinion', 'Reported', 'Closed'],
          description: 'The status of the case.'
        },
        priority: {
          type: Type.STRING,
          enum: ['Routine', 'STAT'],
          description: 'The priority of the case.'
        },
        patientName: {
          type: Type.STRING,
          description: 'The name of the patient. e.g., "John Doe".'
        },
        assignedTo: {
          type: Type.STRING,
          description: 'The name of the pathologist assigned to the case. e.g., "Dr. Reed".'
        },
        accessionNumber: {
            type: Type.STRING,
            description: 'The unique accession number for the case, e.g., "S24-1001".'
        }
      },
    };

    const prompt = `Parse the following user query to filter pathology cases and extract the filter criteria into a JSON object matching the provided schema. Query: "${query}"`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: filterSchema,
        },
      });

      const jsonString = response.text;
      if (!jsonString) {
        return {};
      }
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing query with Gemini:', error);
      // Fallback to a simple keyword search on patient name if AI fails
      return { patientName: query };
    }
  }

  async analyzeSlide(imageBase64: string, prompt: string): Promise<string> {
    if (!this.ai) {
      console.error('GeminiService is not configured. Cannot analyze slide.');
      throw new Error('AI Service is not configured. Please check the application setup.');
    }
    
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    };

    const textPart = { text: prompt };

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart, imagePart] },
      });

      return response.text;
    } catch (error) {
      console.error('Error analyzing slide with Gemini:', error);
      throw new Error('Failed to analyze the slide. The AI model may be temporarily unavailable.');
    }
  }
}