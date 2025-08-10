import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  id: string;
  label: string;
  route?: string;
  badge?: string;
  children?: MenuItem[];
  icon?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  company?: {
    id: string;
    name: string;
  };
  role?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full flex flex-col flex-shrink-0 bg-white/90 backdrop-blur-sm border-r border-neutral-200 shadow-lg md:relative fixed inset-y-0 left-0 z-50 md:z-auto w-64 md:w-64 sm:w-full md:translate-x-0 transition-transform duration-300 ease-out">
      <!-- Rolevate Logo/Header -->
      <div class="p-6 border-b border-neutral-200 bg-gradient-to-br from-neutral-50 to-white relative">
        <div class="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
        <div class="flex flex-col">
          <div class="flex items-center space-x-3 mb-2">
      
            <span class="text-2xl font-apple font-bold ">rolevate</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto apple-scrollbar">
        @for (item of menuItems; track item.id) {
          <div>
            <a 
              [routerLink]="item.route || null"
              [class]="getSidebarItemClasses(item)"
              [attr.aria-expanded]="item.children ? isExpanded(item.id) : null"
              [attr.aria-controls]="item.children ? 'submenu-' + item.id : null"
              [attr.role]="item.children ? 'button' : 'link'"
              (click)="onMenuItemClick(item)"
              (keydown.enter)="onMenuItemClick(item)"
              (keydown.space)="$event.preventDefault(); onMenuItemClick(item)"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="flex items-center justify-center transition-transform duration-200 hover:scale-110">
                    <ng-container [ngSwitch]="item.icon">
                      <svg *ngSwitchCase="'dashboard'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                      </svg>
                      <svg *ngSwitchCase="'candidates'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                      </svg>
                      <svg *ngSwitchCase="'jobs'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h2zm4-1a1 1 0 00-1 1v1h2V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                      </svg>
                      <svg *ngSwitchCase="'interviews'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/>
                        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"/>
                      </svg>
                      <svg *ngSwitchCase="'analytics'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                      </svg>
                      <svg *ngSwitchCase="'companies'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clip-rule="evenodd"/>
                      </svg>
                      <svg *ngSwitchCase="'settings'" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd"/>
                      </svg>
                      <svg *ngSwitchDefault class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    </ng-container>
                  </div>
                  <span class="text-sm font-apple font-medium" [style.letter-spacing]="'-0.003em'">{{ item.label }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  @if (item.badge) {
                    <span class="bg-gradient-to-r from-apple-blue-500 to-apple-blue-600 text-white text-xs font-apple font-bold px-2.5 py-1 rounded-full min-w-[1.5rem] text-center shadow-apple animate-pulse">{{ item.badge }}</span>
                  }
                  @if (item.children && item.children.length > 0) {
                    <svg class="w-4 h-4 transition-transform duration-200 text-neutral-400" [class.rotate-180]="isExpanded(item.id)" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                  }
                </div>
              </div>
            </a>
            
            <!-- Submenu -->
            @if (item.children && item.children.length > 0 && isExpanded(item.id)) {
              <div 
                class="ml-8 mt-2 space-y-1 border-l-2 border-gradient-to-b from-apple-blue-500 to-transparent pl-4 relative" 
                [id]="'submenu-' + item.id"
                role="menu"
                [attr.aria-labelledby]="item.id"
              >
                <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-apple-blue-500 to-transparent rounded-full"></div>
                @for (child of item.children; track child.id) {
                  <a 
                    [routerLink]="child.route || null"
                    [class]="getSidebarItemClasses(child, true)"
                    role="menuitem"
                    [attr.tabindex]="isExpanded(item.id) ? 0 : -1"
                    (click)="onMenuItemClick(child)"
                    (keydown.enter)="onMenuItemClick(child)"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-3">
                        <div class="w-4 h-4 flex items-center justify-center">
                          <div class="w-2 h-2 bg-current rounded-full opacity-60"></div>
                        </div>
                        <span class="text-sm">{{ child.label }}</span>
                      </div>
                      @if (child.badge) {
                        <span class="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.2rem] text-center shadow-sm">{{ child.badge }}</span>
                      }
                    </div>
                  </a>
                }
              </div>
            }
          </div>
        }
      </nav>

      <!-- Apple-Style User Section -->
      @if (user) {
        <div class="px-3 py-4 border-t border-gray-100">
          
          <!-- User Profile Card -->
          <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-150 group">
            @if (user.avatar) {
              <img 
                [src]="user.avatar" 
                [alt]="user.name" 
                class="w-10 h-10 rounded-full object-cover"
              />
            } @else {
              <div class="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200">
                <span class="text-gray-600 font-medium text-sm">{{ (user.name.charAt(0) || 'A').toUpperCase() }}</span>
              </div>
            }
            
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
              @if (user.company?.name) {
                <p class="text-xs text-gray-400 truncate mt-0.5">{{ user.company!.name }}</p>
              }
            </div>
            
            <!-- Logout Icon -->
            <button 
              (click)="onLogout()"
              class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all duration-150 opacity-0 group-hover:opacity-100"
              title="Sign Out"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: []
})
export class SidebarComponent {
  @Input() user?: User | null;
  @Input() activeRoute?: string;
  @Output() logout = new EventEmitter<void>();
  @Output() menuItemSelected = new EventEmitter<MenuItem>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() settingsClick = new EventEmitter<void>();

  expandedItems = new Set<string>();

  menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      id: 'candidates',
      label: 'Candidates',
      route: '/candidates',
      icon: 'candidates'
    },
    {
      id: 'jobs',
      label: 'Job Management',
      icon: 'jobs',
      children: [
        {
          id: 'jobs-active',
          label: 'Active Jobs',
          route: '/jobs/active'
        },
        {
          id: 'jobs-draft',
          label: 'Draft Jobs',
          route: '/jobs/draft'
        },
        {
          id: 'jobs-expired',
          label: 'Expired Jobs',
          route: '/jobs/expired'
        }
      ]
    },
    {
      id: 'interviews',
      label: 'AI Interviews',
      route: '/interviews',
      icon: 'interviews'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      route: '/analytics',
      icon: 'analytics'
    },
    {
      id: 'companies',
      label: 'Companies',
      route: '/companies',
      icon: 'companies'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      children: [
        {
          id: 'settings-profile',
          label: 'Profile Settings',
          route: '/settings/profile'
        },
        {
          id: 'settings-security',
          label: 'Security',
          route: '/settings/security'
        },
        {
          id: 'settings-notifications',
          label: 'Notifications',
          route: '/settings/notifications'
        }
      ]
    }
  ];

  constructor(private router: Router) {}

  isExpanded(itemId: string): boolean {
    return this.expandedItems.has(itemId);
  }

  toggleExpanded(itemId: string): void {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  getSidebarItemClasses(item: MenuItem, isChild: boolean = false): string {
    const baseClasses = 'flex items-center p-3 rounded-apple transition-all duration-200 ease-out cursor-pointer mb-1 relative focus:outline-none focus:ring-2 focus:ring-apple-blue-500 focus:ring-offset-2';
    const isActive = this.isActiveRoute(item.route);
    const activeClasses = isActive 
      ? 'bg-apple-blue-50 text-apple-blue-600 font-apple font-semibold shadow-apple border border-apple-blue-200 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-4/5 before:w-1 before:bg-gradient-to-b before:from-apple-blue-500 before:to-apple-blue-700 before:rounded-r-lg before:shadow-apple' 
      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 hover:translate-x-0.5 hover:shadow-apple font-apple';
    const childClasses = isChild ? 'text-xs py-2 ml-2' : '';
    
    return `${baseClasses} ${activeClasses} ${childClasses}`.trim();
  }

  isActiveRoute(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route || this.activeRoute === route;
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.children && item.children.length > 0) {
      this.toggleExpanded(item.id);
    } else if (item.route) {
      this.router.navigate([item.route]);
    }
    this.menuItemSelected.emit(item);
  }

  onLogout(): void {
    this.logout.emit();
  }

  onProfileClick(): void {
    this.profileClick.emit();
  }

  onSettingsClick(): void {
    this.settingsClick.emit();
  }
}
