import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-900">Rolevate Admin</h1>
              <p class="text-xs text-gray-500">AI-Powered Recruitment Platform</p>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            @if (user) {
              <div class="flex items-center space-x-3">
                @if (user.avatar) {
                  <img 
                    [src]="user.avatar" 
                    [alt]="user.name" 
                    class="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
                  />
                }
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-700">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ user.email }}</p>
                  @if (user.company?.name) {
                    <p class="text-xs text-blue-600">{{ user.company.name }}</p>
                  }
                </div>
              </div>
            } @else {
              <div class="text-right">
                <p class="text-sm font-medium text-gray-700">Administrator</p>
                <p class="text-xs text-gray-500">admin&#64;rolevate.com</p>
              </div>
            }
            <app-button 
              variant="primary"
              (clicked)="onLogout()"
              [icon]="true"
            >
              <svg slot="icon" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Logout
            </app-button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './page-header.css'
})
export class PageHeaderComponent {
  @Input() user?: any;
  @Output() logout = new EventEmitter<void>();

  onLogout(): void {
    this.logout.emit();
  }
}
