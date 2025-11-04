import { Injectable, signal } from '@angular/core';

type HelpTopic = 'dashboard' | 'case-list' | 'case-detail';

@Injectable({
  providedIn: 'root',
})
export class HelpService {
  readonly showHelpModal = signal(false);
  readonly helpTitle = signal('');
  readonly helpContent = signal('');

  private readonly helpTopics: Record<HelpTopic, { title: string, content: string }> = {
    'dashboard': {
      title: 'Dashboard Help',
      content: `
        <h3 class="font-semibold text-lg mb-2">Understanding Your Dashboard</h3>
        <p class="mb-4">Your dashboard provides a personalized, at-a-glance overview of your work. The widgets displayed are tailored to your specific role.</p>
        <ul class="space-y-3 list-disc list-inside text-sm text-gray-700">
          <li><strong>Stat Cards:</strong> Quick metrics showing your open, STAT, and completed cases.</li>
          <li><strong>Performance Trends:</strong> Visualizes your case turnaround time and completion rate over the last 7 days.</li>
          <li><strong>Quality Assurance:</strong> Tracks key metrics like AI concordance rate (how often the AI diagnosis matches yours) and your annotation rate.</li>
          <li><strong>Task Manager:</strong> A personal to-do list to help you keep track of important tasks.</li>
        </ul>
      `,
    },
    'case-list': {
      title: 'Case List Help',
      content: `
        <h3 class="font-semibold text-lg mb-2">Navigating the Case List</h3>
        <p class="mb-4">This is your main queue for managing pathology cases.</p>
        <ul class="space-y-3 list-disc list-inside text-sm text-gray-700">
          <li><strong>Natural Language Search:</strong> Use the search bar to find cases with simple language, like "urgent cases for John Doe" or "closed cases from last week". The AI will parse your query into filters.</li>
          <li><strong>Toggles:</strong> Quickly filter the list to see only cases assigned to you or to view archived cases.</li>
          <li><strong>Sorting:</strong> Click on column headers like "Patient" or "Date Received" to sort the case list.</li>
          <li><strong>New Case:</strong> If you have the permissions, you can create a new case using the "New Case" button.</li>
        </ul>
      `,
    },
    'case-detail': {
      title: 'Case Detail & Analysis Help',
      content: `
        <h3 class="font-semibold text-lg mb-2">Analyzing a Case</h3>
        <p class="mb-4">This view is where you perform slide analysis, run AI tools, and manage case details.</p>
        <ul class="space-y-3 list-disc list-inside text-sm text-gray-700">
          <li><strong>Slide Viewer:</strong> Use your mouse wheel to zoom in and out. Click and drag to pan across the image.</li>
          <li><strong>Annotation Tools:</strong> Use the toolbar in the top-left of the image viewer to draw on the slide. You can select a tool (pen, rectangle, circle), change colors, and adjust line thickness. Click an annotation in the legend to delete it.</li>
          <li><strong>AI Analysis:</strong> Choose an analysis type from the dropdown (e.g., 'Tumor Cell Count') and click "Run AI Analysis" to get an AI-generated report on the current slide.</li>
          <li><strong>Analysis History:</strong> All AI analyses are saved. You can expand previous results to review them and provide feedback on their accuracy, which helps improve the AI models.</li>
          <li><strong>Upload Image:</strong> If a case has no slide, you can upload one. This will replace any existing image.</li>
        </ul>
      `,
    }
  };

  showHelp(topic: HelpTopic): void {
    const helpData = this.helpTopics[topic];
    if (helpData) {
      this.helpTitle.set(helpData.title);
      this.helpContent.set(helpData.content);
      this.showHelpModal.set(true);
    }
  }

  hideHelp(): void {
    this.showHelpModal.set(false);
  }
}
