import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InterviewsService } from '../../../services/interviews.service';
import { InterviewDetails } from '../../../interfaces/interviews.interface';
import { CardComponent } from '../../../components/ui/card/card';
import { ButtonComponent } from '../../../components/ui/button/button';
import { IconComponent } from '../../../components/ui/icon/icon';

@Component({
  selector: 'app-interview-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardComponent,
    ButtonComponent,
    IconComponent
  ],
  templateUrl: './interview-detail.html',
  styleUrl: './interview-detail.css'
})
export class InterviewDetailComponent implements OnInit {
  route = inject(ActivatedRoute);
  private router = inject(Router);
  private interviewsService = inject(InterviewsService);

  // Signals
  interview = signal<InterviewDetails | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const interviewId = this.route.snapshot.paramMap.get('id');
    if (interviewId) {
      this.loadInterview(interviewId);
    } else {
      this.error.set('Interview ID not found');
    }
  }

  loadInterview(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.interviewsService.getInterviewById(id).subscribe({
      next: (interview) => {
        this.interview.set(interview);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading interview:', err);
        this.error.set('Failed to load interview details');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/interviews']);
  }

  editInterview() {
    const interviewId = this.interview()?.id;
    if (interviewId) {
      // Navigate to edit interview page (to be implemented)
      console.log('Edit interview:', interviewId);
    }
  }

  rescheduleInterview() {
    const interviewId = this.interview()?.id;
    if (interviewId) {
      console.log('Reschedule interview:', interviewId);
    }
  }

  cancelInterview() {
    const interviewId = this.interview()?.id;
    if (interviewId) {
      console.log('Cancel interview:', interviewId);
    }
  }

  startInterview() {
    const interviewId = this.interview()?.id;
    if (interviewId) {
      console.log('Start interview:', interviewId);
    }
  }

  viewCandidate() {
    const candidateId = this.interview()?.candidate?.id;
    if (candidateId) {
      this.router.navigate(['/candidates', candidateId]);
    }
  }

  openVideoLink() {
    const videoLink = this.interview()?.videoLink;
    if (videoLink) {
      window.open(videoLink, '_blank');
    }
  }

  joinInterview() {
    // Same as opening video link for now
    this.openVideoLink();
  }

  openRecording() {
    const recordingUrl = this.interview()?.recordingUrl;
    if (recordingUrl) {
      window.open(recordingUrl, '_blank');
    }
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatInterviewType(type: string | undefined): string {
    if (!type) return 'Not specified';
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  formatInterviewStatus(status: string | undefined): string {
    if (!status) return 'Unknown';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  getStatusClasses(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getAiScoreClasses(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  formatRecommendation(recommendation: string | null | undefined): string {
    if (!recommendation) return 'No recommendation';
    switch (recommendation.toUpperCase()) {
      case 'REJECT':
        return 'Not Recommended';
      case 'SECOND_INTERVIEW':
        return 'Recommended for Second Interview';
      case 'HIRE':
        return 'Recommended to Hire';
      case 'PENDING':
        return 'Pending Review';
      default:
        return recommendation.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }
  }
}
