import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompaniesService } from '../../services/companies.service';
import { Company, CompaniesFilters } from '../../interfaces/companies.interface';
import { ButtonComponent } from '../../components/ui/button/button';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent],
  templateUrl: './companies.html',
  styleUrl: './companies.css'
})
export class CompaniesComponent implements OnInit {
  private companiesService = inject(CompaniesService);

  // Expose Math for template
  Math = Math;

  // Local state
  searchTerm = signal('');
  selectedIndustry = signal('');
  selectedSubscription = signal('');
  selectedStatus = signal('');
  currentPage = signal(1);
  itemsPerPage = signal(20);
  sortBy = signal('name');
  sortOrder = signal<'asc' | 'desc'>('asc');
  selectedCompanies = signal<string[]>([]);
  openMenus = signal<Set<string>>(new Set());
  
  // Available filter options
  industries = [
    'TECHNOLOGY', 'HEALTHCARE', 'FINANCE', 'EDUCATION', 'MANUFACTURING',
    'RETAIL', 'CONSULTING', 'REAL_ESTATE', 'MEDIA', 'TRANSPORTATION'
  ];
  
  subscriptionTypes = ['FREE', 'PREMIUM', 'ENTERPRISE'];

  ngOnInit() {
    this.loadCompanies();
  }

  get companies() {
    return this.companiesService.companies;
  }

  get pagination() {
    return this.companiesService.pagination;
  }

  get loading() {
    return this.companiesService.loading;
  }

  get error() {
    return this.companiesService.error;
  }

  loadCompanies() {
    const filters: CompaniesFilters = {
      page: this.currentPage(),
      limit: this.itemsPerPage(),
      search: this.searchTerm() || undefined,
      industry: this.selectedIndustry() || undefined,
      subscription: this.selectedSubscription() || undefined,
      isActive: this.selectedStatus() ? this.selectedStatus() === 'true' : undefined,
      sortBy: this.sortBy(),
      sortOrder: this.sortOrder()
    };

    this.companiesService.loadCompanies(filters);
  }

  onSearch() {
    this.currentPage.set(1);
    this.loadCompanies();
  }

  onFilterChange() {
    this.currentPage.set(1);
    this.loadCompanies();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCompanies();
  }

  clearFilters() {
    this.searchTerm.set('');
    this.selectedIndustry.set('');
    this.selectedSubscription.set('');
    this.selectedStatus.set('');
    this.currentPage.set(1);
    this.loadCompanies();
  }

  onItemsPerPageChange() {
    this.currentPage.set(1);
    this.loadCompanies();
  }

  onSortChange() {
    this.currentPage.set(1);
    this.loadCompanies();
  }

  setSortField(field: string) {
    if (this.sortBy() === field) {
      // Toggle sort order if same field
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default ascending order
      this.sortBy.set(field);
      this.sortOrder.set('asc');
    }
    this.currentPage.set(1);
    this.loadCompanies();
  }

  // Selection methods
  isCompanySelected(companyId: string): boolean {
    return this.selectedCompanies().includes(companyId);
  }

  toggleCompanySelection(companyId: string) {
    const selected = this.selectedCompanies();
    if (selected.includes(companyId)) {
      this.selectedCompanies.set(selected.filter(id => id !== companyId));
    } else {
      this.selectedCompanies.set([...selected, companyId]);
    }
  }

  isAllSelected(): boolean {
    const companies = this.companies();
    const selected = this.selectedCompanies();
    return companies.length > 0 && companies.every(company => selected.includes(company.id));
  }

  isPartiallySelected(): boolean {
    const companies = this.companies();
    const selected = this.selectedCompanies();
    return selected.length > 0 && !companies.every(company => selected.includes(company.id));
  }

  toggleSelectAll() {
    const companies = this.companies();
    if (this.isAllSelected()) {
      // Deselect all current page companies
      const currentPageIds = companies.map(c => c.id);
      this.selectedCompanies.set(
        this.selectedCompanies().filter(id => !currentPageIds.includes(id))
      );
    } else {
      // Select all current page companies
      const currentPageIds = companies.map(c => c.id);
      const selected = this.selectedCompanies();
      const newSelected = [...new Set([...selected, ...currentPageIds])];
      this.selectedCompanies.set(newSelected);
    }
  }

  clearSelection() {
    this.selectedCompanies.set([]);
  }

  // Bulk actions
  bulkActivate() {
    const selectedIds = this.selectedCompanies();
    if (selectedIds.length === 0) return;

    // In a real app, you'd call a bulk update API
    selectedIds.forEach(id => {
      this.companiesService.updateCompanyStatus(id, true).subscribe({
        error: (error) => console.error('Error activating company:', error)
      });
    });

    this.clearSelection();
    this.loadCompanies();
  }

  bulkDeactivate() {
    const selectedIds = this.selectedCompanies();
    if (selectedIds.length === 0) return;

    selectedIds.forEach(id => {
      this.companiesService.updateCompanyStatus(id, false).subscribe({
        error: (error) => console.error('Error deactivating company:', error)
      });
    });

    this.clearSelection();
    this.loadCompanies();
  }

  // Menu methods
  isCompanyMenuOpen(companyId: string): boolean {
    return this.openMenus().has(companyId);
  }

  toggleCompanyMenu(companyId: string) {
    const menus = new Set(this.openMenus());
    if (menus.has(companyId)) {
      menus.delete(companyId);
    } else {
      // Close all other menus and open this one
      menus.clear();
      menus.add(companyId);
    }
    this.openMenus.set(menus);
  }

  // Export functionality
  exportCompanies() {
    const companies = this.companies();
    if (companies.length === 0) return;

    const csvContent = this.generateCSV(companies);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `companies-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generateCSV(companies: Company[]): string {
    const headers = [
      'Name', 'Email', 'Industry', 'Subscription', 'Status', 'Users', 
      'Active Jobs', 'Total Jobs', 'Applications', 'Employees', 'Website', 
      'City', 'Country', 'Joined Date'
    ];

    const rows = companies.map(company => [
      company.name,
      company.email,
      company.industry,
      company.subscription,
      company.isActive ? 'Active' : 'Inactive',
      company.totalUsers.toString(),
      company.activeJobs.toString(),
      company.totalJobs.toString(),
      company.totalApplications.toString(),
      company.numberOfEmployees,
      company.website || '',
      company.address?.city || '',
      company.address?.country || '',
      this.formatDate(company.createdAt)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csvContent;
  }

  refreshData() {
    this.loadCompanies();
  }

  toggleCompanyStatus(company: Company) {
    this.companiesService.updateCompanyStatus(company.id, !company.isActive).subscribe({
      next: () => {
        this.loadCompanies(); // Reload to get updated data
      },
      error: (error) => {
        console.error('Error updating company status:', error);
      }
    });
  }

  getSubscriptionBadgeClass(subscription: string): string {
    switch (subscription) {
      case 'ENTERPRISE':
        return 'bg-purple-100 text-purple-800';
      case 'PREMIUM':
        return 'bg-blue-100 text-blue-800';
      case 'FREE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPaginationPages(): number[] {
    const pagination = this.pagination();
    if (!pagination) return [];
    
    const pages: number[] = [];
    const total = pagination.totalPages;
    const current = pagination.currentPage;
    
    // Show up to 5 pages around current page
    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
