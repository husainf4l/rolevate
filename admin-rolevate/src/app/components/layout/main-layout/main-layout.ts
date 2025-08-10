import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { SidebarComponent } from '../sidebar/sidebar';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden">
      <!-- Sidebar -->
      <app-sidebar 
        [user]="authService.state().user"
        (logout)="handleLogout()"
        (menuItemSelected)="handleMenuItemSelected($event)"
        (profileClick)="handleProfileClick()"
        (settingsClick)="handleSettingsClick()"
      ></app-sidebar>
      
      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class MainLayoutComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  handleLogout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails, redirect to login
        this.router.navigate(['/login']);
      }
    });
  }

  handleMenuItemSelected(item: any) {
    console.log('Menu item selected:', item);
    // Handle navigation based on menu item
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  handleProfileClick() {
    this.router.navigate(['/profile']);
  }

  handleSettingsClick() {
    this.router.navigate(['/settings']);
  }
}
