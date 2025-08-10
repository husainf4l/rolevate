import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CandidatesService } from '../../../services/candidates.service';
import { InterviewsService } from '../../../services/interviews.service';
import { Candidate } from '../../../interfaces/candidates.interface';
import { ButtonComponent } from '../../../components/ui/button/button';
import { CardComponent } from '../../../components/ui/card/card';
import { IconComponent } from '../../../components/ui/icon/icon';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    CardComponent,
    IconComponent
  ],
  templateUrl: './candidate-detail.html'
})
export class CandidateDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private candidatesService = inject(CandidatesService);
  private interviewsService = inject(InterviewsService);

  candidate = signal<Candidate | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const candidateId = params['id'];
      if (candidateId) {
        this.loadCandidate(candidateId);
      }
    });
  }

  loadCandidate(candidateId?: string) {
    const id = candidateId || this.route.snapshot.params['id'];
    if (!id) return;

    this.loading.set(true);
    this.error.set(null);

    this.candidatesService.getCandidateById(id).subscribe({
      next: (candidate) => {
        this.candidate.set(candidate);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading candidate:', error);
        this.error.set('Failed to load candidate details');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/candidates']);
  }

  editCandidate() {
    // Navigate to edit candidate page or open modal
    console.log('Edit candidate:', this.candidate()?.id);
    // this.router.navigate(['/candidates', this.candidate()?.id, 'edit']);
  }

  openResume() {
    const resumeUrl = this.candidate()?.resumeUrl;
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
    }
  }

  openPortfolio() {
    const portfolioUrl = this.candidate()?.portfolioUrl;
    if (portfolioUrl) {
      window.open(portfolioUrl, '_blank');
    }
  }

  openVideoLink(videoLink: string) {
    if (videoLink) {
      window.open(videoLink, '_blank');
    }
  }

  scheduleInterview() {
    console.log('Schedule interview for candidate:', this.candidate()?.id);
    // Implement interview scheduling logic
  }

  sendMessage() {
    console.log('Send message to candidate:', this.candidate()?.id);
    // Implement messaging logic
  }

  exportProfile() {
    console.log('Export profile for candidate:', this.candidate()?.id);
    // Implement profile export logic
  }

  toggleCandidateStatus() {
    console.log('Toggle status for candidate:', this.candidate()?.id);
    // Implement status toggle logic
  }

  getInitials(): string {
    const candidate = this.candidate();
    if (!candidate) return '';
    
    const firstInitial = candidate.firstName?.charAt(0) || '';
    const lastInitial = candidate.lastName?.charAt(0) || '';
    return (firstInitial + lastInitial).toUpperCase();
  }

  getApplicationStatusClasses(status: string): string {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getInterviewStatusClasses(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getCvScoreClasses(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  getAiScoreClasses(score: number): string {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  formatApplicationStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatInterviewStatus(status: string): string {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatInterviewType(type: string): string {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
