export interface Company {
  id: string;
  name: string;
  email: string;
  industry: string;
  numberOfEmployees: string;
  website: string;
  description: string;
  logo?: string;
  subscription: 'FREE' | 'PREMIUM' | 'ENTERPRISE';
  totalUsers: number;
  isActive: boolean;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  address: {
    id?: string;
    street: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
    companyId?: string;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  users: CompanyUser[];
  createdAt: string;
  updatedAt: string;
}

export interface CompanyUser {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  userType: 'COMPANY';
}

export interface CompaniesResponse {
  companies: Company[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CompaniesFilters {
  page?: number;
  limit?: number;
  search?: string;
  industry?: string;
  subscription?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
