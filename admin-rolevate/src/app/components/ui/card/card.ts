import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cardClasses" class="animate-fade-in">
      @if (title) {
        <div class="px-6 py-5 border-b border-neutral-200">
          <h3 class="text-lg font-semibold text-neutral-900 tracking-tight">{{ title }}</h3>
          @if (subtitle) {
            <p class="text-sm text-neutral-600 mt-1 tracking-tight">{{ subtitle }}</p>
          }
        </div>
      }
      <div [class]="contentClasses">
        <ng-content></ng-content>
      </div>
      @if (hasFooter) {
        <div class="px-6 py-4 bg-neutral-50 border-t border-neutral-200 rounded-b-2xl">
          <ng-content select="[slot=footer]"></ng-content>
        </div>
      }
    </div>
  `,
  styleUrl: './card.css'
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding = true;  // Default to true for padding
  @Input() shadow = true;
  @Input() hasFooter = false;

  get cardClasses(): string {
    const baseClasses = 'bg-white rounded-2xl border border-neutral-200 overflow-hidden mb-6 transition-all duration-200 ease-out hover:-translate-y-0.5';
    const shadowClass = this.shadow ? 'shadow-sm hover:shadow-md' : '';
    
    return `${baseClasses} ${shadowClass}`.trim();
  }

  get contentClasses(): string {
    return this.padding ? 'p-6' : '';
  }
}
