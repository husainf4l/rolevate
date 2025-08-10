import { Directive, Input, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  @Input('appTooltip') tooltipText = '';
  @Input() delay = 300;
  private tooltip: HTMLElement | null = null;
  private timeout: any;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('mouseenter') onMouseEnter() {
    this.timeout = setTimeout(() => {
      if (!this.tooltip && this.tooltipText) {
        this.createTooltip();
      }
    }, this.delay);
  }

  @HostListener('mouseleave') onMouseLeave() {
    clearTimeout(this.timeout);
    if (this.tooltip) {
      this.destroyTooltip();
    }
  }

  private createTooltip() {
    this.tooltip = this.renderer.createElement('span');
    this.renderer.appendChild(
      this.tooltip!,
      this.renderer.createText(this.tooltipText)
    );

    this.renderer.appendChild(document.body, this.tooltip);
    this.renderer.addClass(this.tooltip!, 'tooltip');

    const hostPos = this.el.nativeElement.getBoundingClientRect();
    const tooltipPos = this.tooltip!.getBoundingClientRect();

    const top = hostPos.top - tooltipPos.height - 10;
    const left = hostPos.left + (hostPos.width - tooltipPos.width) / 2;

    this.renderer.setStyle(this.tooltip!, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltip!, 'left', `${left}px`);
  }

  private destroyTooltip() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }
  }
}
