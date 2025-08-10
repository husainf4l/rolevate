import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<svg [class]="classes"><use [attr.href]="'/assets/icons.svg#' + name"></use></svg>`
})
export class IconComponent {
  @Input() name: string = '';
  @Input() classes: string = 'w-6 h-6';
}
