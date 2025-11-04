import { Component, ChangeDetectionStrategy, Input, ElementRef, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var d3: any;

export interface PerformanceDataPoint {
  date: Date;
  avgTurnaroundTime: number;
  casesCompleted: number;
}

@Component({
  selector: 'app-performance-trends',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './performance-trends.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceTrendsComponent implements OnChanges {
  @Input() data: PerformanceDataPoint[] = [];
  
  @ViewChild('turnaroundChart', { static: true }) private turnaroundChartContainer!: ElementRef;
  @ViewChild('casesChart', { static: true }) private casesChartContainer!: ElementRef;

  private isInitialized = false;

  ngAfterViewInit(): void {
    this.isInitialized = true;
    if (this.data && this.data.length > 0) {
      this.drawCharts();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isInitialized && changes['data'] && this.data && this.data.length > 0) {
      this.drawCharts();
    }
  }

  private drawCharts(): void {
    this.drawChart(
      this.turnaroundChartContainer.nativeElement,
      this.data,
      'avgTurnaroundTime',
      '#3b82f6' // blue-500
    );
    this.drawChart(
      this.casesChartContainer.nativeElement,
      this.data,
      'casesCompleted',
      '#22c55e' // green-500
    );
  }
  
  private drawChart(container: HTMLElement, data: PerformanceDataPoint[], yKey: keyof PerformanceDataPoint, color: string): void {
    if (!container || container.clientWidth === 0) return;

    d3.select(container).select('svg').remove();

    const margin = {top: 5, right: 10, bottom: 20, left: 30};
    const width = container.clientWidth - margin.left - margin.right;
    const height = 150 - margin.top - margin.bottom;

    const svg = d3.select(container)
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
        
    const x = d3.scaleTime()
      .domain(d3.extent(data, (d: PerformanceDataPoint) => d.date))
      .range([ 0, width ]);
      
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat("%b %d")))
      .call((g: any) => g.select(".domain").remove())
      .call((g: any) => g.selectAll("line").remove())
      .call((g: any) => g.selectAll("text").style("font-size", "12px").attr("fill", "#6b7280"));

    const yMax = d3.max(data, (d: any) => d[yKey] as number) || 0;

    const y = d3.scaleLinear()
      .domain([0, yMax * 1.25])
      .range([ height, 0 ]);
      
    const yAxis = svg.append("g")
      .call(d3.axisLeft(y).ticks(4).tickSize(-width))
      
    yAxis.select(".domain").remove();
    yAxis.selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "2,2");
    yAxis.selectAll("text").style("font-size", "12px").attr("fill", "#6b7280");

    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2.5)
      .attr("d", d3.line()
        .x((d: any) => x(d.date))
        .y((d: any) => y(d[yKey]))
      );

    svg.selectAll("myCircles")
      .data(data)
      .join("circle")
        .attr("fill", color)
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .attr("cx", (d: any) => x(d.date))
        .attr("cy", (d: any) => y(d[yKey]))
        .attr("r", 5);
  }
}