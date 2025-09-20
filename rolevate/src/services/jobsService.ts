import { Job, JobType, ExperienceLevel, SalaryRange } from '@/types/jobs';

/**
 * Jobs Service - Handles job-related data operations
 * This service provides mock data for demonstration purposes
 * In a real application, this would connect to an API
 */
export class JobsService {
  private static mockJobs: Job[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'TechCorp',
      location: 'Amman, Jordan',
      type: 'full-time' as JobType,
      salary: '$80,000 - $120,000',
      postedAt: '2 days ago',
      description: 'We are looking for a Senior Software Engineer to join our dynamic team. You will be responsible for developing high-quality software solutions and leading technical initiatives.',
      tags: ['React', 'Node.js', 'TypeScript', 'AWS'],
      urgent: true,
      remote: false,
      companyLogo: '/placeholder.jpg',
      rating: 4.5,
      experienceLevel: 'senior' as ExperienceLevel,
      salaryRange: '80000-120000' as SalaryRange,
      category: 'Technology',
      benefits: ['Health Insurance', 'Remote Work', 'Professional Development']
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'InnovateLabs',
      location: 'Dubai, UAE',
      type: 'full-time' as JobType,
      salary: '$90,000 - $130,000',
      postedAt: '1 week ago',
      description: 'Join our product team to drive innovation and deliver exceptional user experiences. Lead cross-functional teams and shape product strategy.',
      tags: ['Product Strategy', 'Agile', 'Analytics', 'Leadership'],
      urgent: false,
      remote: true,
      rating: 4.2,
      experienceLevel: 'senior' as ExperienceLevel,
      salaryRange: '80000-120000' as SalaryRange,
      category: 'Product',
      benefits: ['Stock Options', 'Flexible Hours', 'Learning Budget']
    },
    {
      id: '3',
      title: 'UX/UI Designer',
      company: 'DesignStudio',
      location: 'Riyadh, Saudi Arabia',
      type: 'contract' as JobType,
      salary: '$60,000 - $90,000',
      postedAt: '3 days ago',
      description: 'Create beautiful and intuitive user experiences for our digital products. Work closely with product and engineering teams.',
      tags: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      urgent: false,
      remote: false,
      rating: 4.7,
      experienceLevel: 'mid' as ExperienceLevel,
      salaryRange: '50000-80000' as SalaryRange,
      category: 'Design',
      benefits: ['Creative Freedom', 'Design Tools', 'Portfolio Building']
    },
    {
      id: '4',
      title: 'Data Scientist',
      company: 'DataTech Solutions',
      location: 'Doha, Qatar',
      type: 'full-time' as JobType,
      salary: '$100,000 - $150,000',
      postedAt: '5 days ago',
      description: 'Apply advanced analytics and machine learning techniques to solve complex business problems and drive data-driven decisions.',
      tags: ['Python', 'Machine Learning', 'SQL', 'Tableau'],
      urgent: true,
      remote: true,
      rating: 4.3,
      experienceLevel: 'senior' as ExperienceLevel,
      salaryRange: '120000+' as SalaryRange,
      category: 'Data Science',
      benefits: ['Research Time', 'Conference Budget', 'Advanced Hardware']
    },
    {
      id: '5',
      title: 'DevOps Engineer',
      company: 'CloudSys',
      location: 'Amman, Jordan',
      type: 'full-time' as JobType,
      salary: '$70,000 - $100,000',
      postedAt: '1 day ago',
      description: 'Build and maintain scalable infrastructure solutions. Implement CI/CD pipelines and ensure system reliability.',
      tags: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
      urgent: false,
      remote: false,
      rating: 4.4,
      experienceLevel: 'mid' as ExperienceLevel,
      salaryRange: '50000-80000' as SalaryRange,
      category: 'DevOps',
      benefits: ['Cloud Certifications', 'Infrastructure Budget', 'On-call Compensation']
    },
    {
      id: '6',
      title: 'Marketing Manager',
      company: 'BrandBoost',
      location: 'Dubai, UAE',
      type: 'full-time' as JobType,
      salary: '$65,000 - $95,000',
      postedAt: '4 days ago',
      description: 'Develop and execute comprehensive marketing strategies to drive brand awareness and customer acquisition.',
      tags: ['Digital Marketing', 'SEO', 'Content Strategy', 'Analytics'],
      urgent: false,
      remote: true,
      rating: 4.1,
      experienceLevel: 'mid' as ExperienceLevel,
      salaryRange: '50000-80000' as SalaryRange,
      category: 'Marketing',
      benefits: ['Performance Bonuses', 'Marketing Tools', 'Team Events']
    }
  ];

  /**
   * Get all jobs with optional filtering
   */
  static getJobs(filters?: {
    searchQuery?: string;
    location?: string;
    jobType?: JobType;
    experienceLevel?: ExperienceLevel;
    salaryRange?: SalaryRange;
    remote?: boolean;
    urgent?: boolean;
  }): Job[] {
    let filteredJobs = [...this.mockJobs];

    if (filters) {
      // Apply search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query) ||
          job.description.toLowerCase().includes(query) ||
          job.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      // Apply location filter
      if (filters.location) {
        const location = filters.location.toLowerCase();
        filteredJobs = filteredJobs.filter(job =>
          job.location.toLowerCase().includes(location)
        );
      }

      // Apply job type filter
      if (filters.jobType) {
        filteredJobs = filteredJobs.filter(job => job.type === filters.jobType);
      }

      // Apply experience level filter
      if (filters.experienceLevel) {
        filteredJobs = filteredJobs.filter(job => job.experienceLevel === filters.experienceLevel);
      }

      // Apply salary range filter
      if (filters.salaryRange) {
        filteredJobs = filteredJobs.filter(job => job.salaryRange === filters.salaryRange);
      }

      // Apply remote filter
      if (filters.remote !== undefined) {
        filteredJobs = filteredJobs.filter(job => job.remote === filters.remote);
      }

      // Apply urgent filter
      if (filters.urgent !== undefined) {
        filteredJobs = filteredJobs.filter(job => job.urgent === filters.urgent);
      }
    }

    return filteredJobs;
  }

  /**
   * Get a single job by ID
   */
  static getJobById(id: string): Job | undefined {
    return this.mockJobs.find(job => job.id === id);
  }

  /**
   * Get jobs by category
   */
  static getJobsByCategory(category: string): Job[] {
    return this.mockJobs.filter(job =>
      job.category?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get featured/urgent jobs
   */
  static getUrgentJobs(): Job[] {
    return this.mockJobs.filter(job => job.urgent);
  }

  /**
   * Get remote jobs
   */
  static getRemoteJobs(): Job[] {
    return this.mockJobs.filter(job => job.remote);
  }

  /**
   * Search jobs with advanced filtering
   */
  static searchJobs(query: string, filters?: any): Job[] {
    return this.getJobs({ ...filters, searchQuery: query });
  }
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use JobsService.getJobs() instead
 */
export const getJobs = (): Job[] => {
  return JobsService.getJobs();
};