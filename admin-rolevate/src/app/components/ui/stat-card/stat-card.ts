import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

type StatColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-lg shadow-sm hover:shadow-md p-6 border border-neutral-200 transition-all duration-200 ease-out hover:-translate-y-0.5">
      <div class="flex items-center">
        <div [class]="iconClasses">
          <ng-content select="[slot=icon]"></ng-content>
        </div>
        <div class="ml-4 flex-1">
          <p class="text-sm font-medium text-neutral-500">{{ label }}</p>
          <p class="text-2xl font-bold text-neutral-900 mt-1">{{ value }}</p>
          @if (trend) {
            <p [class]="trendClasses">
              {{ trend }}
            </p>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './stat-card.css'
})
export class StatCardComponent {
  @Input() label!: string;
  @Input() value!: string | number;
  @Input() color: StatColor = 'blue';
  @Input() trend?: string;
  @Input() trendDirection: 'up' | 'down' | 'neutral' = 'neutral';

  get iconClasses(): string {
    const baseClasses = 'w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 hover:scale-105';
    
    const colorClasses = {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
      green: 'bg-gradient-to-br from-green-500 to-green-600',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
      orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
      red: 'bg-gradient-to-br from-red-500 to-red-600',
      yellow: 'bg-gradient-to-br from-yellow-500 to-yellow-600'
    };

    return `${baseClasses} ${colorClasses[this.color]}`;
  }

  get trendClasses(): string {
    const baseClasses = 'text-xs mt-2 font-medium';
    
    const directionClasses = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-neutral-500'
    };

    return `${baseClasses} ${directionClasses[this.trendDirection]}`;
  }
}
