import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CandidatesService } from '../../services/candidates.service';
import { Candidate, CandidatesFilters } from '../../interfaces/candidates.interface';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';

@Component({
  selector: 'app-candidates',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CardComponent, ButtonComponent],
  templateUrl: './candidates.html',
  styleUrl: './candidates.css'
})
export class CandidatesComponent implements OnInit {
  private candidatesService = inject(CandidatesService);
  private router = inject(Router);

  // Expose Math for template
  Math = Math;

  // Local state
  searchTerm = signal('');
  selectedExperienceLevel = signal('');
  selectedWorkType = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(20);
  sortBy = signal('createdAt');
  sortOrder = signal<'asc' | 'desc'>('desc');
  selectedCandidates = signal<string[]>([]);
  openMenus = signal<Set<string>>(new Set());

  ngOnInit() {
    this.loadCandidates();
  }

  get candidates() {
    return this.candidatesService.candidates;
  }

  get pagination() {
    return this.candidatesService.pagination;
  }

  get loading() {
    return this.candidatesService.loading;
  }

  get error() {
    return this.candidatesService.error;
  }

  loadCandidates() {
    const filters: CandidatesFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      search: this.searchTerm() || undefined,
      experienceLevel: this.selectedExperienceLevel() || undefined,
      preferredWorkType: this.selectedWorkType() || undefined,
      isActive: this.selectedStatus() ? this.selectedStatus() === 'true' : undefined,
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    };

    this.candidatesService.loadCandidates(filters);
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadCandidates();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadCandidates();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCandidates();
  }

  onItemsPerPageChange() {
    this.currentPage.set(1);
    this.loadCandidates();
  }

  onSortChange() {
    this.currentPage.set(1);
    this.loadCandidates();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedExperienceLevel.set('');
    this.selectedWorkType.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.loadCandidates();
  }

  refreshData() {
    this.loadCandidates();
  }

  sort(field: string) {
    if (this.sortBy() === field) {
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.loadCandidates();
  }

  // Selection methods
  isSelected(candidateId: string): boolean {
    return this.selectedCandidates().includes(candidateId);
  }

  toggleSelect(candidateId: string) {
    const current = this.selectedCandidates();
    if (current.includes(candidateId)) {
      this.selectedCandidates.set(current.filter(id => id !== candidateId));
    } else {
      this.selectedCandidates.set([...current, candidateId]);
    }
  }

  isAllSelected(): boolean {
    const candidates = this.candidates();
    return candidates.length > 0 && candidates.every(c => this.isSelected(c.id));
  }

  isPartiallySelected(): boolean {
    const selected = this.selectedCandidates().length;
    return selected > 0 && selected < this.candidates().length;
  }

  toggleSelectAll() {
    if (this.isAllSelected()) {
      this.selectedCandidates.set([]);
    } else {
      this.selectedCandidates.set(this.candidates().map(c => c.id));
    }
  }

  // Menu methods
  toggleMenu(candidateId: string) {
    const current = new Set(this.openMenus());
    if (current.has(candidateId)) {
      current.delete(candidateId);
    } else {
      current.clear(); // Close other menus
      current.add(candidateId);
    }
    this.openMenus.set(current);
  }

  // Action methods
  viewCandidate(candidateId: string) {
    this.router.navigate(['/candidates', candidateId]);
    this.closeAllMenus();
  }

  editCandidate(candidateId: string) {
    // TODO: Navigate to candidate edit page
    console.log('Edit candidate:', candidateId);
    this.closeAllMenus();
  }

  viewCandidateInterviews(candidateId: string) {
    // TODO: Navigate to candidate interviews page
    console.log('View candidate interviews:', candidateId);
    this.closeAllMenus();
  }

  scheduleInterview(candidateId: string) {
    // TODO: Open schedule interview modal
    console.log('Schedule interview for candidate:', candidateId);
    this.closeAllMenus();
  }

  toggleCandidateStatus(candidateId: string) {
    // TODO: Implement candidate status toggle
    console.log('Toggle candidate status:', candidateId);
    this.closeAllMenus();
  }

  exportCandidates() {
    // TODO: Implement candidates export
    console.log('Export all candidates');
  }

  exportSelected() {
    // TODO: Implement selected candidates export
    console.log('Export selected candidates:', this.selectedCandidates());
  }

  toggleSelectedStatus() {
    // TODO: Implement bulk status toggle
    console.log('Toggle status for selected candidates:', this.selectedCandidates());
  }

  private closeAllMenus() {
    this.openMenus.set(new Set());
  }

  // Utility methods for template
  formatExperienceLevel(level: string | null): string {
    if (!level) return 'Not specified';
    
    const levelMap: Record<string, string> = {
      'entry': 'Entry Level',
      'mid': 'Mid Level', 
      'senior': 'Senior Level',
      'executive': 'Executive'
    };
    
    return levelMap[level.toLowerCase()] || level;
  }

  formatWorkType(workType: string | null): string {
    if (!workType) return 'Not specified';
    
    const typeMap: Record<string, string> = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'onsite': 'On-site'
    };
    
    return typeMap[workType.toLowerCase()] || workType;
  }

  getExperienceLevelClasses(level: string | null): string {
    if (!level) return 'bg-gray-100 text-gray-800';
    
    const classMap: Record<string, string> = {
      'entry': 'bg-green-100 text-green-800',
      'mid': 'bg-blue-100 text-blue-800',
      'senior': 'bg-purple-100 text-purple-800',
      'executive': 'bg-red-100 text-red-800'
    };
    
    return classMap[level.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  calculateProfileCompletion(candidate: Candidate): number {
    const fields = [
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      candidate.phone,
      candidate.currentJobTitle,
      candidate.currentCompany,
      candidate.experienceLevel,
      candidate.skills.length > 0,
      candidate.resumeUrl
    ];
    
    const completedFields = fields.filter(field => field && field !== '').length;
    return Math.round((completedFields / fields.length) * 100);
  }

  getPageNumbers(): number[] {
    const pagination = this.pagination();
    if (!pagination) return [];
    
    const { currentPage, totalPages } = pagination;
    const pages: number[] = [];
    
    // Show up to 5 page numbers
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
