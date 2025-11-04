import { ChangeDetectionStrategy, Component, inject, signal, computed, ViewChild, ElementRef, OnDestroy, effect } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CaseService } from '../../services/case.service';
import { GeminiService } from '../../services/gemini.service';
import { ImageService } from '../../services/image.service';
import { CaseStatus, Annotation, CircleAnnotation, Point, AnalysisFeedback, AnalysisHistoryItem, User } from '../../models';
import { AccessControlComponent } from '../access-control/access-control.component';
import { ErrorLoggingService } from '../../services/error-logging.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

interface AnalysisConfig {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

const ANALYSIS_CONFIGS: AnalysisConfig[] = [
  {
    id: 'standard',
    name: 'Standard Analysis',
    description: 'Provides a general overview of histological features.',
    prompt: `Analyze the provided histopathology slide image and extract key findings. Focus on the following aspects: cellular morphology (e.g., size, shape, nuclear-to-cytoplasmic ratio), presence and type of inflammation, and any suspicious features (e.g., atypia, mitotic figures, necrosis). Format the output as a markdown list.`
  },
  {
    id: 'tumor_count',
    name: 'Tumor Cell Count',
    description: 'Estimates the percentage of tumor cells in the provided image.',
    prompt: `Analyze the provided histopathology slide image and estimate the tumor cell percentage. Provide a percentage range and a brief justification for your estimation based on visible neoplastic cell clusters versus normal tissue.`
  },
  {
    id: 'tumor_grade_assist',
    name: 'Tumor Grade Assist',
    description: 'Provides features relevant to grading, including estimated tumor percentage.',
    prompt: `Provide an analysis to assist with tumor grading. Specifically, estimate the tumor cell percentage, describe nuclear pleomorphism, and note the presence of necrosis. Present this as a structured report.`
  },
  {
    id: 'inflammation_grade',
    name: 'Inflammation Grade',
    description: 'Focuses on grading the level and type of inflammation present.',
    prompt: `Analyze the provided histopathology slide image to assess and grade the inflammation. Describe the type of inflammatory infiltrate (e.g., lymphocytic, neutrophilic) and grade its severity (mild, moderate, severe). Justify your grading.`
  },
  {
    id: 'margin_analysis',
    name: 'Margin Analysis',
    description: 'Checks for tumor presence at the margins of the tissue sample.',
    prompt: `Analyze the provided histopathology slide image, assuming it is a surgical resection specimen. Assess the surgical margins for the presence of neoplastic cells. State clearly whether margins appear positive or negative for tumor involvement and provide a brief description of the findings at the margin.`
  },
  {
    id: 'cell_type_id',
    name: 'Cell Type Identification',
    description: 'Identifies and describes the distribution of different cell types.',
    prompt: `Identify the different cell types present in the slide, such as neoplastic cells, lymphocytes, macrophages, and stromal cells. Provide a brief description of their distribution and relative proportions.`
  }
];

@Component({
  selector: 'app-case-detail',
  standalone: true,
  imports: [CommonModule, AccessControlComponent, NgOptimizedImage, FormsModule],
  templateUrl: './case-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CaseDetailComponent implements OnDestroy {
  @ViewChild('annotationCanvas') set annotationCanvasRef(ref: ElementRef<HTMLCanvasElement> | undefined) {
    if (ref) {
      this.setupCanvas(ref.nativeElement);
    } else if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
      this.ctx = undefined;
      this.annotationCanvas = undefined;
    }
  }

  private annotationCanvas: HTMLCanvasElement | undefined;
  private ctx: CanvasRenderingContext2D | undefined;
  private resizeObserver: ResizeObserver | undefined;

  private readonly caseService = inject(CaseService);
  private readonly geminiService = inject(GeminiService);
  private readonly imageService = inject(ImageService);
  private readonly errorLoggingService = inject(ErrorLoggingService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly selectedCase = this.caseService.selectedCase;
  readonly isAnalyzing = signal(false);
  readonly analysisError = signal<string | null>(null);
  readonly analysisErrorId = signal<string | null>(null);

  readonly analysisConfigs: AnalysisConfig[] = ANALYSIS_CONFIGS;
  readonly selectedAnalysisConfigId = signal<string>(this.analysisConfigs[0].id);
  readonly activeHistoryId = signal<string | null>(null);

  // AI Analysis Feedback State
  readonly feedbackRating = signal<'good' | 'bad' | null>(null);
  readonly feedbackComment = signal<string>('');

  // Signals for zoom and pan. Pan is in screen pixels.
  readonly zoomLevel = signal(1);
  readonly pan = signal({ x: 0, y: 0 });
  readonly isPanning = signal(false);
  private readonly startPanPosition = signal({ x: 0, y: 0 }); // Mouse position
  private readonly startPanValue = signal({ x: 0, y: 0 }); // Pan value at start of drag

  readonly MAX_ZOOM = 5;
  readonly MIN_ZOOM = 1;

  // --- Annotation State ---
  readonly annotations = signal<Annotation[]>([]);
  readonly currentTool = signal<'pen' | 'rectangle' | 'circle' | 'none'>('none');
  readonly currentColor = signal<string>('#ef4444'); // Tailwind red-500
  readonly strokeWidth = signal<number>(2);
  readonly isDrawing = signal(false);
  private currentDrawing = signal<Annotation | null>(null);

  readonly currentUser = this.authService.currentUser;

  readonly assignableUsers = computed(() => {
    const user = this.currentUser();
    // StudentAdmins can only assign to students
    if (user?.role === 'StudentAdmin') {
      return this.authService.allUsers().filter(u => u.role === 'Student');
    }
    // Other admins can assign to Pathologists or Students (for training cases)
    return this.authService.allUsers().filter(u => u.role === 'Pathologist' || u.role === 'Student');
  });


  readonly isViewReset = computed(() => this.zoomLevel() === this.MIN_ZOOM && this.pan().x === 0 && this.pan().y === 0);
  readonly imageTransform = computed(() => `translate(${this.pan().x}px, ${this.pan().y}px) scale(${this.zoomLevel()})`);

  constructor() {
    effect(() => {
        const currentCase = this.selectedCase();
        this.annotations.set(currentCase?.annotations ?? []);
        this.drawAnnotations();
    });

    // Redraw annotations whenever view changes to keep stroke width consistent
    effect(() => {
        this.zoomLevel();
        this.pan();
        this.drawAnnotations();
    });
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private setupCanvas(canvas: HTMLCanvasElement): void {
    this.annotationCanvas = canvas;
    const context = this.annotationCanvas.getContext('2d');
    if (!context) {
      console.error('Failed to get 2D context from canvas');
      return;
    }
    this.ctx = context;

    const container = this.annotationCanvas.parentElement!;
    if (this.resizeObserver) {
        this.resizeObserver.disconnect();
    }
    this.resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (this.annotationCanvas) {
            this.annotationCanvas.width = entry.contentRect.width;
            this.annotationCanvas.height = entry.contentRect.height;
            this.drawAnnotations();
        }
      }
    });
    this.resizeObserver.observe(container);
  }
  
  closeDetailView() {
    this.caseService.clearSelectedCase();
  }

  archiveCase() {
    const caseToArchive = this.selectedCase();
    if (caseToArchive) {
      this.caseService.archiveCase(caseToArchive.id);
      this.closeDetailView();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const caseId = this.selectedCase()?.id;
      const dataUrl = reader.result as string;
      if (caseId && dataUrl) {
        this.caseService.updateCaseImageUrl(caseId, dataUrl);
        const base64Data = dataUrl.split(',')[1];
        this.runAiAnalysis(base64Data);
      }
    };

    reader.readAsDataURL(file);
    input.value = ''; // Reset file input
  }

  async runAiAnalysis(imageBase64?: string) {
    const selectedConfig = this.analysisConfigs.find(c => c.id === this.selectedAnalysisConfigId());
    if (!selectedConfig) {
      this.analysisError.set('Invalid analysis configuration selected.');
      return;
    }

    this.isAnalyzing.set(true);
    this.analysisError.set(null);
    this.analysisErrorId.set(null);

    try {
      let analysisData: string | undefined = imageBase64;

      if (!analysisData) {
        const caseImageUrl = this.selectedCase()?.slide_image_url;
        if (caseImageUrl && caseImageUrl.startsWith('data:')) {
          analysisData = caseImageUrl.split(',')[1];
        } else {
          analysisData = await this.imageService.getSampleImageBase64();
        }
      }

      if (!analysisData) {
        throw new Error('No image available for analysis.');
      }

      const result = await this.geminiService.analyzeSlide(analysisData, selectedConfig.prompt);
      
      const currentCase = this.selectedCase();
      if (currentCase) {
        const newHistoryItem: AnalysisHistoryItem = {
            id: `ah-${Date.now()}`,
            date: new Date().toISOString(),
            analysisName: selectedConfig.name,
            prompt: selectedConfig.prompt,
            result: result,
        };
        this.caseService.addAnalysisToHistory(currentCase.id, newHistoryItem);
        this.activeHistoryId.set(newHistoryItem.id);
      }

    } catch (error) {
      const errorId = this.errorLoggingService.logError(error, 'AI Slide Analysis');
      this.analysisErrorId.set(errorId);
      this.analysisError.set(`The AI analysis failed to complete due to an unexpected issue. Please try again in a few moments.`);
    } finally {
      this.isAnalyzing.set(false);
    }
  }

  toggleHistory(id: string) {
    this.feedbackRating.set(null);
    this.feedbackComment.set('');
    this.activeHistoryId.update(currentId => (currentId === id ? null : id));
  }
  
  submitAnalysisFeedback(historyItemId: string) {
    const caseId = this.selectedCase()?.id;
    const rating = this.feedbackRating();
    const currentUser = this.authService.currentUser();

    if (!caseId || !rating || !currentUser) {
      this.analysisError.set('Could not submit feedback. User or case not found.');
      return;
    }

    const feedback: AnalysisFeedback = {
      rating: rating,
      comment: this.feedbackComment(),
      submittedBy: currentUser.id,
      submittedAt: new Date().toISOString(),
    };

    this.caseService.addFeedbackToAnalysisHistory(caseId, historyItemId, feedback);
    
    const pointsAwarded = 2;
    this.authService.addPointsToUser(currentUser.id, pointsAwarded);
    this.notificationService.show(`Thank you! You've been awarded ${pointsAwarded} points for your feedback.`, 'success');
    
    this.feedbackRating.set(null);
    this.feedbackComment.set('');
  }

  onAssignCase(event: Event) {
    const caseToAssign = this.selectedCase();
    const target = event.target as HTMLSelectElement;
    const userId = target.value === 'null' ? null : target.value;

    if (caseToAssign) {
      this.caseService.updateCaseAssignment(caseToAssign.id, userId);
    }
  }

  getStatusClass(status: CaseStatus): string {
    switch (status) {
      case 'Awaiting Review': return 'bg-yellow-100 text-yellow-800';
      case 'In Review': return 'bg-blue-100 text-blue-800';
      case 'Reported': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      case 'Specimen Accessioned': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  getFormattedDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  private saveAnnotations(): void {
    const caseId = this.selectedCase()?.id;
    if (caseId) {
      this.caseService.updateCaseAnnotations(caseId, this.annotations());
    }
  }

  selectTool(tool: 'pen' | 'rectangle' | 'circle') {
    this.currentTool.update(current => (current === tool ? 'none' : tool));
  }

  setColor(event: Event) {
    this.currentColor.set((event.target as HTMLInputElement).value);
  }

  clearAnnotations() {
    this.annotations.set([]);
    this.drawAnnotations();
    this.saveAnnotations();
  }

  deleteAnnotation(annotationId: string): void {
    this.annotations.update(annos => annos.filter(a => a.id !== annotationId));
    this.drawAnnotations();
    this.saveAnnotations();
  }

  private drawAnnotations() {
    if (!this.ctx || !this.annotationCanvas) return;
    this.ctx.clearRect(0, 0, this.annotationCanvas.width, this.annotationCanvas.height);

    const allAnnotations = this.currentDrawing()
      ? [...this.annotations(), this.currentDrawing()!]
      : this.annotations();

    for (const annotation of allAnnotations) {
      this.ctx.strokeStyle = annotation.color;
      this.ctx.lineWidth = annotation.strokeWidth;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.beginPath();

      if (annotation.type === 'pen' && annotation.points.length > 1) {
        this.ctx.moveTo(annotation.points[0].x, annotation.points[0].y);
        for (let i = 1; i < annotation.points.length; i++) {
          this.ctx.lineTo(annotation.points[i].x, annotation.points[i].y);
        }
      } else if (annotation.type === 'rectangle') {
        const start = annotation.start;
        const end = annotation.end;
        this.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      } else if (annotation.type === 'circle') {
        const center = annotation.center;
        this.ctx.arc(center.x, center.y, annotation.radius, 0, 2 * Math.PI);
      }
      this.ctx.stroke();
    }
  }

  private getPointInCanvas(event: MouseEvent): Point {
      if (!this.annotationCanvas) return { x: 0, y: 0 };
      const rect = this.annotationCanvas.getBoundingClientRect();
      const pan = this.pan();
      const zoom = this.zoomLevel();
      const xOnElement = event.clientX - rect.left;
      const yOnElement = event.clientY - rect.top;
      return {
          x: (xOnElement - pan.x) / zoom,
          y: (yOnElement - pan.y) / zoom,
      };
  }

  onMouseDown(event: MouseEvent): void {
    event.preventDefault();

    if (this.currentTool() !== 'none') {
      this.isDrawing.set(true);
      const startPoint = this.getPointInCanvas(event);
      let newAnnotation: Annotation;

      const baseAnnotation = {
        id: `anno-${Date.now()}`,
        color: this.currentColor(),
        strokeWidth: this.strokeWidth(),
      };
      
      switch (this.currentTool()) {
        case 'pen':
          newAnnotation = { ...baseAnnotation, type: 'pen', points: [startPoint] };
          break;
        case 'rectangle':
          newAnnotation = { ...baseAnnotation, type: 'rectangle', start: startPoint, end: startPoint };
          break;
        case 'circle':
          newAnnotation = { ...baseAnnotation, type: 'circle', center: startPoint, radius: 0 };
          break;
      }
      this.currentDrawing.set(newAnnotation);
    } else {
      if (this.zoomLevel() <= this.MIN_ZOOM) return;
      this.isPanning.set(true);
      this.startPanPosition.set({ x: event.clientX, y: event.clientY });
      this.startPanValue.set(this.pan());
    }
  }

  onMouseMove(event: MouseEvent, container: HTMLElement): void {
    if (this.isDrawing()) {
      event.preventDefault();
      const point = this.getPointInCanvas(event);
      this.currentDrawing.update(drawing => {
        if (!drawing) return null;
        if (drawing.type === 'pen') {
          return { ...drawing, points: [...drawing.points, point] };
        } else if (drawing.type === 'rectangle') {
          return { ...drawing, end: point };
        } else if (drawing.type === 'circle') {
            const dx = point.x - (drawing as CircleAnnotation).center.x;
            const dy = point.y - (drawing as CircleAnnotation).center.y;
            const radius = Math.sqrt(dx * dx + dy * dy);
            return { ...drawing, radius };
        }
        return drawing;
      });
      this.drawAnnotations();
    } else if (this.isPanning()) {
      event.preventDefault();
      const startPos = this.startPanPosition();
      const startPan = this.startPanValue();
      const dx = event.clientX - startPos.x;
      const dy = event.clientY - startPos.y;
      const newPan = { x: startPan.x + dx, y: startPan.y + dy };
      const clampedPan = this.getClampedPan(container, this.zoomLevel(), newPan);
      this.pan.set(clampedPan);
    }
  }

  onMouseUp(): void {
    if (this.isDrawing()) {
      if (this.currentDrawing()) {
        this.annotations.update(annos => [...annos, this.currentDrawing()!]);
        this.saveAnnotations();
      }
      this.isDrawing.set(false);
      this.currentDrawing.set(null);
      this.drawAnnotations();
    }
    if (this.isPanning()) {
      this.isPanning.set(false);
    }
  }

  onWheel(event: WheelEvent, container: HTMLElement): void {
    event.preventDefault();
    const oldZoom = this.zoomLevel();
    const oldPan = this.pan();
    
    const scale = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    let newZoom = oldZoom * scale;
    newZoom = Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, newZoom));
    if (newZoom === oldZoom) return;

    if (newZoom <= this.MIN_ZOOM) {
        this.resetView();
        return;
    }

    const rect = container.getBoundingClientRect();
    const mousePoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    
    const newPanX = mousePoint.x - (((mousePoint.x - oldPan.x) / oldZoom) * newZoom);
    const newPanY = mousePoint.y - (((mousePoint.y - oldPan.y) / oldZoom) * newZoom);
    
    const newPan = { x: newPanX, y: newPanY };
    const clampedPan = this.getClampedPan(container, newZoom, newPan);

    this.zoomLevel.set(newZoom);
    this.pan.set(clampedPan);
  }

  private getClampedPan(container: HTMLElement, zoom: number, panToClamp: {x: number, y: number}): {x: number, y: number} {
    if (zoom <= this.MIN_ZOOM) {
        return { x: 0, y: 0 };
    }
    const zoomedWidth = container.clientWidth * zoom;
    const zoomedHeight = container.clientHeight * zoom;

    const minPanX = container.clientWidth - zoomedWidth;
    const minPanY = container.clientHeight - zoomedHeight;
    
    return {
        x: Math.max(minPanX, Math.min(0, panToClamp.x)),
        y: Math.max(minPanY, Math.min(0, panToClamp.y)),
    };
  }

  zoomIn(): void {
    this.zoomLevel.update(level => Math.min(this.MAX_ZOOM, level * 1.2));
  }

  zoomOut(): void {
    this.zoomLevel.update(level => {
      const newZoom = Math.max(this.MIN_ZOOM, level / 1.2);
      if (newZoom <= this.MIN_ZOOM) {
        this.resetView();
      }
      return newZoom;
    });
  }

  resetView(): void {
    this.zoomLevel.set(1);
    this.pan.set({ x: 0, y: 0 });
  }
}
