import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('admin-rolevate');
  protected authService = inject(AuthService);

  ngOnInit() {
    // The AuthService automatically checks authentication status on initialization
    // No need to manually trigger it here to avoid duplicate API calls
  }
}
