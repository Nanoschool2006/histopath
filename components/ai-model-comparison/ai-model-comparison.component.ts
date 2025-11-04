import { ChangeDetectionStrategy, Component, inject, signal, ViewChild, ElementRef, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModelManagementService } from '../../services/model-management.service';
import { AiModel } from '../../models';

declare var d3: any;

@Component({
  selector: 'app-ai-model-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-model-comparison.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiModelComparisonComponent implements AfterViewInit {
  @ViewChild('chart', { static: true }) private chartContainer!: ElementRef;

  private readonly modelService = inject(ModelManagementService);
  readonly allModels = this.modelService.models;
  
  readonly selectedModels = signal<Set<string>>(new Set(this.allModels().map(m => m.id)));
  
  readonly colorScale = d3.scaleOrdinal()
      .domain(this.allModels().map((d: AiModel) => d.id))
      .range(['#3b82f6', '#10b981', '#f97316', '#8b5cf6']); // blue, green, orange, purple

  constructor() {
    effect(() => {
      if (this.chartContainer) {
        this.drawChart();
      }
    });
  }

  ngAfterViewInit(): void {
    this.drawChart();
  }

  toggleModel(modelId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.selectedModels.update(currentSet => {
      const newSet = new Set(currentSet);
      if (isChecked) {
        newSet.add(modelId);
      } else {
        newSet.delete(modelId);
      }
      return newSet;
    });
  }

  selectAll(): void {
    this.selectedModels.set(new Set(this.allModels().map(m => m.id)));
  }

  selectNone(): void {
    this.selectedModels.set(new Set());
  }

  private drawChart(): void {
    const container = this.chartContainer.nativeElement;
    if (!container || container.clientWidth === 0) return;

    d3.select(container).select('svg').remove();

    const modelsToShow = this.allModels().filter(m => this.selectedModels().has(m.id));
    if (modelsToShow.length === 0) return;

    const margin = { top: 30, right: 20, bottom: 80, left: 40 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // X axis
    const x = d3.scaleBand()
      .range([0, width])
      .domain(modelsToShow.map((d: AiModel) => d.version))
      .padding(0.2);

    const xAxis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));
    
    xAxis.selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "10px")
      .attr("fill", "#374151");
    xAxis.select(".domain").remove();

    // Y axis
    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
      
    const yAxis = svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d: number) => `${d}%`).tickSize(-width));
      
    yAxis.select(".domain").remove();
    yAxis.selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "2,2");
    yAxis.selectAll("text").style("font-size", "12px").attr("fill", "#6b7280");

    // Bars
    svg.selectAll("mybar")
      .data(modelsToShow)
      .join("rect")
        .attr("x", (d: AiModel) => x(d.version))
        .attr("y", (d: AiModel) => y(d.concordance))
        .attr("width", x.bandwidth())
        .attr("height", (d: AiModel) => height - y(d.concordance))
        .attr("fill", (d: AiModel) => this.colorScale(d.id));

    // Labels on bars
    svg.selectAll(".bar-label")
      .data(modelsToShow)
      .join("text")
        .attr("class", "bar-label")
        .attr("x", (d: AiModel) => x(d.version)! + x.bandwidth() / 2)
        .attr("y", (d: AiModel) => y(d.concordance) - 5)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", "#374151")
        .text((d: AiModel) => `${d.concordance.toFixed(1)}%`);
  }
}
