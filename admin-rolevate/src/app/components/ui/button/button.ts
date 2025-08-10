import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick()"
    >
      @if (loading) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      @if (icon && !loading) {
        <ng-content select="[slot=icon]"></ng-content>
      }
      <ng-content></ng-content>
    </button>
  `,
  styleUrl: './button.css'
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() icon = false;
  @Input() fullWidth = false;
  
  @Output() clicked = new EventEmitter<void>();

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center font-apple font-medium rounded-apple transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-apple-blue-500 hover:bg-apple-blue-600 text-white focus:ring-apple-blue-500 shadow-apple hover:shadow-apple-md active:transform active:scale-95',
      secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 hover:border-neutral-400 focus:ring-apple-blue-500',
      outline: 'border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 focus:ring-apple-blue-500 shadow-apple',
      danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500 shadow-apple hover:shadow-apple-md',
      success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500 shadow-apple hover:shadow-apple-md'
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base'
    };

    const widthClass = this.fullWidth ? 'w-full' : '';
    const hoverTransform = this.variant !== 'outline' && this.variant !== 'secondary' ? 'hover:-translate-y-0.5' : '';

    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]} ${widthClass} ${hoverTransform}`.trim();
  }

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit();
    }
  }
}
