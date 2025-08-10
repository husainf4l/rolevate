import { Component, inject, computed, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../services/auth';
import { StatisticsService } from '../../services/statistics.service';
import { InterviewStatistics } from '../../interfaces/statistics.interface';
import { StatCardComponent } from '../../components/ui/stat-card/stat-card';
import { CardComponent } from '../../components/ui/card/card';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, StatCardComponent, CardComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  standalone: true
})
export class Dashboard implements OnInit {
  private authService = inject(AuthService);
  private statisticsService = inject(StatisticsService);

  // Get auth state from service
  authState = this.authService.state;
  
  // Computed properties for template
  currentUser = computed(() => this.authState().user);
  currentDate = new Date();

  // Interview statistics
  interviewStats = signal<InterviewStatistics | null>(null);
  loadingStats = signal(false);
  statsError = signal<string | null>(null);

  ngOnInit() {
    this.loadInterviewStatistics();
  }

  loadInterviewStatistics() {
    this.loadingStats.set(true);
    this.statsError.set(null);

    this.statisticsService.getInterviewStatistics().subscribe({
      next: (stats) => {
        this.interviewStats.set(stats);
        this.loadingStats.set(false);
      },
      error: (err) => {
        console.error('Error loading interview statistics:', err);
        this.statsError.set('Failed to load statistics');
        this.loadingStats.set(false);
      }
    });
  }
}
