'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { showToast } from '@/components/ToastContainer';

interface Job {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  salary: string;
  type: string;
  deadline: string;
  status: string;
  jobLevel: string;
  workType: string;
  industry: string;
  company: {
    id: string;
    name: string;
  };
  applicants: number;
  views: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Company {
  id: string;
  name: string;
}

export default function JobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [createFormData, setCreateFormData] = useState({
    companyId: '',
    title: '',
    department: '',
    location: '',
    salary: '',
    type: 'FULL_TIME',
    deadline: '',
    description: '',
    shortDescription: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    skills: '',
    experience: '',
    education: '',
    jobLevel: 'MID',
    workType: 'ONSITE',
    industry: '',
    companyDescription: '',
    status: 'ACTIVE',
    cvAnalysisPrompt: '',
    interviewPrompt: '',
    aiSecondInterviewPrompt: '',
    interviewLanguage: 'en',
    featured: false,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchJobs();
    fetchCompanies();
  }, [router]);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, statusFilter, typeFilter, currentPage, pageSize]);

  const fetchJobs = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetJobs {
              jobs {
                id
                slug
                title
                department
                location
                salary
                type
                deadline
                status
                jobLevel
                workType
                industry
                company {
                  id
                  name
                }
                applicants
                views
                featured
                createdAt
                updatedAt
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error fetching jobs: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.jobs) {
        setJobs(data.data.jobs);
        setTotalItems(data.data.jobs.length);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showToast('Error fetching jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetCompanies {
              companies {
                id
                name
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
      if (data.data?.companies) {
        setCompanies(data.data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.industry.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(job => job.type === typeFilter);
    }
    
    setTotalItems(filtered.length);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredJobs(filtered.slice(startIndex, endIndex));
  };

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    
    if (!createFormData.companyId || !createFormData.title || !createFormData.department) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    try {
      const skillsArray = createFormData.skills
        ? createFormData.skills.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const input: any = {
        title: createFormData.title,
        department: createFormData.department,
        location: createFormData.location,
        salary: createFormData.salary,
        type: createFormData.type,
        deadline: createFormData.deadline,
        description: createFormData.description,
        shortDescription: createFormData.shortDescription,
        responsibilities: createFormData.responsibilities,
        requirements: createFormData.requirements,
        benefits: createFormData.benefits,
        skills: skillsArray,
        experience: createFormData.experience,
        education: createFormData.education,
        jobLevel: createFormData.jobLevel,
        workType: createFormData.workType,
        industry: createFormData.industry,
        companyDescription: createFormData.companyDescription,
        status: createFormData.status,
        featured: createFormData.featured,
      };

      if (createFormData.cvAnalysisPrompt) input.cvAnalysisPrompt = createFormData.cvAnalysisPrompt;
      if (createFormData.interviewPrompt) input.interviewPrompt = createFormData.interviewPrompt;
      if (createFormData.aiSecondInterviewPrompt) input.aiSecondInterviewPrompt = createFormData.aiSecondInterviewPrompt;
      if (createFormData.interviewLanguage) input.interviewLanguage = createFormData.interviewLanguage;

      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateJob($companyId: ID!, $input: CreateJobInput!) {
              createJob(companyId: $companyId, input: $input) {
                id
                title
                slug
                status
              }
            }
          `,
          variables: {
            companyId: createFormData.companyId,
            input
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error creating job: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.createJob) {
        showToast('Job created successfully!', 'success');
        setShowCreateModal(false);
        resetCreateForm();
        fetchJobs();
      }
    } catch (error) {
      console.error('Error creating job:', error);
      showToast('Error creating job', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedJob) return;
    
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation DeleteJob($id: ID!) {
              deleteJob(id: $id)
            }
          `,
          variables: { id: selectedJob.id }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error deleting job: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.deleteJob === true) {
        showToast('Job deleted successfully!', 'success');
        setShowDeleteModal(false);
        setSelectedJob(null);
        fetchJobs();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      showToast('Error deleting job', 'error');
    }
  };

  const resetCreateForm = () => {
    setCreateFormData({
      companyId: '',
      title: '',
      department: '',
      location: '',
      salary: '',
      type: 'FULL_TIME',
      deadline: '',
      description: '',
      shortDescription: '',
      responsibilities: '',
      requirements: '',
      benefits: '',
      skills: '',
      experience: '',
      education: '',
      jobLevel: 'MID',
      workType: 'ONSITE',
      industry: '',
      companyDescription: '',
      status: 'ACTIVE',
      cvAnalysisPrompt: '',
      interviewPrompt: '',
      aiSecondInterviewPrompt: '',
      interviewLanguage: 'en',
      featured: false,
    });
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      DRAFT: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PAUSED: 'bg-yellow-100 text-yellow-800',
      CLOSED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-orange-100 text-orange-800',
      DELETED: 'bg-red-200 text-red-900',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Jobs Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Create Job
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by title, company, department, location, or industry..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CLOSED">Closed</option>
                <option value="EXPIRED">Expired</option>
                <option value="DELETED">Deleted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type Filter</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      <div className="text-xs text-gray-500">{job.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.company.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {job.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(job.status)}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.applicants}</div>
                      <div className="text-xs text-gray-500">{job.views} views</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(job.deadline).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/jobs/${job.id}`)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(job);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No jobs found
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            hasNextPage={currentPage < Math.ceil(totalItems / pageSize)}
            hasPreviousPage={currentPage > 1}
          />
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Job"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <select
                value={createFormData.companyId}
                onChange={(e) => setCreateFormData({ ...createFormData, companyId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              >
                <option value="">Select a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={createFormData.title}
                onChange={(e) => setCreateFormData({ ...createFormData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input
                type="text"
                value={createFormData.department}
                onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={createFormData.location}
                onChange={(e) => setCreateFormData({ ...createFormData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
              <input
                type="text"
                value={createFormData.salary}
                onChange={(e) => setCreateFormData({ ...createFormData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., $80,000 - $100,000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
              <select
                value={createFormData.type}
                onChange={(e) => setCreateFormData({ ...createFormData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Level *</label>
              <select
                value={createFormData.jobLevel}
                onChange={(e) => setCreateFormData({ ...createFormData, jobLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ENTRY">Entry</option>
                <option value="MID">Mid</option>
                <option value="SENIOR">Senior</option>
                <option value="EXECUTIVE">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Type *</label>
              <select
                value={createFormData.workType}
                onChange={(e) => setCreateFormData({ ...createFormData, workType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ONSITE">On-site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={createFormData.status}
                onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
              <input
                type="text"
                value={createFormData.industry}
                onChange={(e) => setCreateFormData({ ...createFormData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Required *</label>
              <input
                type="text"
                value={createFormData.experience}
                onChange={(e) => setCreateFormData({ ...createFormData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 3-5 years"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education Required *</label>
              <input
                type="text"
                value={createFormData.education}
                onChange={(e) => setCreateFormData({ ...createFormData, education: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., Bachelor's Degree"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
              <input
                type="date"
                value={createFormData.deadline}
                onChange={(e) => setCreateFormData({ ...createFormData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interview Language</label>
              <select
                value={createFormData.interviewLanguage}
                onChange={(e) => setCreateFormData({ ...createFormData, interviewLanguage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills Required (comma-separated) *</label>
            <input
              type="text"
              value={createFormData.skills}
              onChange={(e) => setCreateFormData({ ...createFormData, skills: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="JavaScript, React, Node.js"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
            <textarea
              value={createFormData.shortDescription}
              onChange={(e) => setCreateFormData({ ...createFormData, shortDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Description *</label>
            <textarea
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities *</label>
            <textarea
              value={createFormData.responsibilities}
              onChange={(e) => setCreateFormData({ ...createFormData, responsibilities: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements *</label>
            <textarea
              value={createFormData.requirements}
              onChange={(e) => setCreateFormData({ ...createFormData, requirements: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits *</label>
            <textarea
              value={createFormData.benefits}
              onChange={(e) => setCreateFormData({ ...createFormData, benefits: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description *</label>
            <textarea
              value={createFormData.companyDescription}
              onChange={(e) => setCreateFormData({ ...createFormData, companyDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              required
            />
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">AI Prompts (Optional)</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CV Analysis Prompt</label>
                <textarea
                  value={createFormData.cvAnalysisPrompt}
                  onChange={(e) => setCreateFormData({ ...createFormData, cvAnalysisPrompt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Custom prompt for AI CV analysis..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interview Prompt</label>
                <textarea
                  value={createFormData.interviewPrompt}
                  onChange={(e) => setCreateFormData({ ...createFormData, interviewPrompt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Custom prompt for AI interview..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Second Interview Prompt</label>
                <textarea
                  value={createFormData.aiSecondInterviewPrompt}
                  onChange={(e) => setCreateFormData({ ...createFormData, aiSecondInterviewPrompt: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                  placeholder="Custom prompt for AI second interview..."
                />
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={createFormData.featured}
                onChange={(e) => setCreateFormData({ ...createFormData, featured: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Featured Job</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Create Job
          </button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
      >
        {selectedJob && (
          <>
            <p className="mb-6">
              Are you sure you want to delete <strong>{selectedJob.title}</strong> at <strong>{selectedJob.company.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
