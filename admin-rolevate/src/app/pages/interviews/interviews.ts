import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { InterviewsService } from '../../services/interviews.service';
import { InterviewDetails, InterviewsFilters } from '../../interfaces/interviews.interface';

@Component({
  selector: 'app-interviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './interviews.html',
  styleUrls: ['./interviews.css']
})
export class InterviewsComponent implements OnInit {
  // Make Math available in template
  Math = Math;

  // Injected services
  private router = inject(Router);

  // State signals
  selectedInterviews = signal<Set<string>>(new Set());
  searchTerm = signal<string>('');
  statusFilter = signal<string>('');
  typeFilter = signal<string>('');
  sortField = signal<string>('scheduledAt');
  sortDirection = signal<'asc' | 'desc'>('desc');
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);

  // Computed properties
  filteredInterviews = computed(() => {
    let interviews = this.interviewsService.interviews();
    const search = this.searchTerm().toLowerCase();
    const status = this.statusFilter();
    const type = this.typeFilter();

    // Apply filters
    if (search) {
      interviews = interviews.filter(interview =>
        interview.candidate?.firstName?.toLowerCase().includes(search) ||
        interview.candidate?.lastName?.toLowerCase().includes(search) ||
        interview.candidate?.email?.toLowerCase().includes(search) ||
        interview.job?.title?.toLowerCase().includes(search) ||
        interview.company?.name?.toLowerCase().includes(search) ||
        interview.title.toLowerCase().includes(search)
      );
    }

    if (status) {
      interviews = interviews.filter(interview => interview.status === status);
    }

    if (type) {
      interviews = interviews.filter(interview => interview.type === type);
    }

    // Apply sorting
    interviews.sort((a, b) => {
      const field = this.sortField();
      let aValue: any, bValue: any;

      switch (field) {
        case 'candidateName':
          aValue = a.candidate ? `${a.candidate.firstName} ${a.candidate.lastName}` : '';
          bValue = b.candidate ? `${b.candidate.firstName} ${b.candidate.lastName}` : '';
          break;
        case 'jobTitle':
          aValue = a.job?.title || '';
          bValue = b.job?.title || '';
          break;
        case 'company':
          aValue = a.company?.name || '';
          bValue = b.company?.name || '';
          break;
        case 'scheduledAt':
        case 'status':
        case 'type':
        case 'aiScore':
          aValue = a[field as keyof InterviewDetails];
          bValue = b[field as keyof InterviewDetails];
          break;
        default:
          aValue = a[field as keyof InterviewDetails];
          bValue = b[field as keyof InterviewDetails];
      }

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });

    return interviews;
  });

  paginatedInterviews = computed(() => {
    const interviews = this.filteredInterviews();
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return interviews.slice(start, end);
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredInterviews().length / this.itemsPerPage());
  });

  allSelected = computed(() => {
    const currentInterviews = this.paginatedInterviews();
    if (currentInterviews.length === 0) return false;
    return currentInterviews.every(interview => this.selectedInterviews().has(interview.id));
  });

  someSelected = computed(() => {
    const currentInterviews = this.paginatedInterviews();
    return currentInterviews.some(interview => this.selectedInterviews().has(interview.id));
  });

  // Status and type options
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'FIRST_ROUND', label: 'First Round' },
    { value: 'SECOND_ROUND', label: 'Second Round' },
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'FINAL', label: 'Final Round' }
  ];

  constructor(public interviewsService: InterviewsService) {}

  ngOnInit() {
    this.loadInterviews();
    this.loadStatistics();
  }

  loadInterviews() {
    const filters: InterviewsFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      search: this.searchTerm() || undefined,
      status: this.statusFilter() || undefined,
      type: this.typeFilter() || undefined,
      sortBy: this.sortField(),
      sortOrder: this.sortDirection()
    };

    this.interviewsService.loadInterviews(filters);
  }

  loadStatistics() {
    this.interviewsService.loadStatistics();
  }

  onSearch(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadInterviews();
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.loadInterviews();
  }

  onTypeFilterChange(type: string) {
    this.typeFilter.set(type);
    this.currentPage.set(1);
    this.loadInterviews();
  }

  setSortField(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
    this.loadInterviews();
  }

  toggleSelectAll() {
    const currentInterviews = this.paginatedInterviews();
    const selected = this.selectedInterviews();
    
    if (this.allSelected()) {
      // Deselect all current page interviews
      currentInterviews.forEach(interview => selected.delete(interview.id));
    } else {
      // Select all current page interviews
      currentInterviews.forEach(interview => selected.add(interview.id));
    }
    
    this.selectedInterviews.set(new Set(selected));
  }

  toggleSelectInterview(id: string) {
    const selected = this.selectedInterviews();
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    this.selectedInterviews.set(new Set(selected));
  }

  getSelectedCount(): number {
    return this.selectedInterviews().size;
  }

  clearSelection() {
    this.selectedInterviews.set(new Set());
  }

  // Bulk operations
  bulkUpdateStatus(status: InterviewDetails['status']) {
    const selectedIds = Array.from(this.selectedInterviews());
    if (selectedIds.length === 0) return;

    // For now, update each interview individually since bulk endpoint may not exist
    const updatePromises = selectedIds.map(id => 
      this.interviewsService.updateInterviewStatus(id, status).toPromise()
    );

    Promise.all(updatePromises).then(() => {
      this.clearSelection();
      this.loadInterviews();
    }).catch((error: any) => {
      console.error('Error updating interviews:', error);
    });
  }

  bulkCancel() {
    this.bulkUpdateStatus('CANCELLED');
  }

  bulkComplete() {
    this.bulkUpdateStatus('COMPLETED');
  }

  // Individual interview actions
  updateInterviewStatus(id: string, status: InterviewDetails['status']) {
    this.interviewsService.updateInterviewStatus(id, status).subscribe({
      error: (error) => {
        console.error('Error updating interview status:', error);
      }
    });
  }

  startInterview(id: string) {
    // Use update status method since startInterview may not exist
    this.updateInterviewStatus(id, 'IN_PROGRESS');
  }

  completeInterview(id: string, feedback?: { aiScore?: number, aiRecommendation?: string }) {
    // Use update status method since completeInterview may not exist
    this.updateInterviewStatus(id, 'COMPLETED');
  }

  cancelInterview(id: string) {
    this.updateInterviewStatus(id, 'CANCELLED');
  }

  // Pagination
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadInterviews();
    }
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  changePageSize(size: number) {
    this.itemsPerPage.set(size);
    this.currentPage.set(1);
    this.loadInterviews();
  }

  // Utility methods
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'FIRST_ROUND': return 'bg-purple-100 text-purple-800';
      case 'SECOND_ROUND': return 'bg-indigo-100 text-indigo-800';
      case 'TECHNICAL': return 'bg-blue-100 text-blue-800';
      case 'FINAL': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getScoreClass(score: number | null): string {
    if (score === null || score === undefined) return 'text-gray-400';
    if (score >= 4) return 'text-green-600 font-semibold';
    if (score >= 3) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  }

  // Export functionality
  exportInterviews() {
    // For now, we'll just log since export method may not exist
    console.log('Export functionality not yet implemented');
    alert('Export functionality will be implemented soon');
  }

  // View interview details
  viewInterviewDetails(interviewId: string) {
    // Option 1: Navigate to a detail route (recommended)
    this.router.navigate(['/interviews', interviewId]);
    
    // Option 2: If you want to fetch and display details inline
    /*
    this.interviewsService.getInterviewById(interviewId).subscribe({
      next: (interview) => {
        console.log('Interview details:', interview);
        // You could open a modal or navigate to detail page here
        alert(`Interview Details:\n\nCandidate: ${interview.candidate.firstName} ${interview.candidate.lastName}\nJob: ${interview.job.title}\nStatus: ${interview.status}\nScheduled: ${this.formatDate(interview.scheduledAt)}`);
      },
      error: (error) => {
        console.error('Error fetching interview details:', error);
        alert('Failed to load interview details');
      }
    });
    */
  }

  // Clear filters
  clearFilters() {
    this.searchTerm.set('');
    this.statusFilter.set('');
    this.typeFilter.set('');
    this.currentPage.set(1);
    this.loadInterviews();
  }
}
