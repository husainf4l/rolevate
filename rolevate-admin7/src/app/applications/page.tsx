'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { showToast } from '@/components/ToastContainer';

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  candidate: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  appliedAt: string;
  coverLetter?: string;
  resumeUrl?: string;
  expectedSalary?: string;
  noticePeriod?: string;
  cvAnalysisScore?: number;
  cvScore?: number;
  firstInterviewScore?: number;
  secondInterviewScore?: number;
  finalScore?: number;
  source?: string;
  notes?: string;
  interviewScheduled: boolean;
  interviewLanguage: string;
  createdAt: string;
  updatedAt: string;
}

interface Job {
  id: string;
  title: string;
  company: {
    name: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

  // Form state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [createFormData, setCreateFormData] = useState({
    jobId: '',
    candidateId: '',
    status: 'PENDING',
    coverLetter: '',
    resumeUrl: '',
    expectedSalary: '',
    noticePeriod: '',
    source: '',
    notes: '',
    interviewScheduled: false,
    interviewLanguage: 'en',
    // For new candidates
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    portfolioUrl: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchApplications();
    fetchJobs();
    fetchUsers();
  }, [router]);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, currentPage, pageSize]);

  const fetchApplications = async () => {
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
            query GetApplications {
              applications {
                id
                job {
                  id
                  title
                  company {
                    name
                  }
                }
                  candidate {
                    id
                    name
                    email
                  }
                  status
                  appliedAt
                  coverLetter
                  resumeUrl
                  expectedSalary
                  noticePeriod
                  cvAnalysisScore
                  cvScore
                  firstInterviewScore
                  secondInterviewScore
                  finalScore
                  source
                  notes
                  interviewScheduled
                  interviewLanguage
                  createdAt
                  updatedAt
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error fetching applications: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.applications) {
        setApplications(data.data.applications);
        setTotalItems(data.data.applications.length);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      showToast('Error fetching applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
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
            query GetJobs {
              jobs {
                id
                title
                company {
                  name
                }
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
      if (data.data?.jobs) {
        setJobs(data.data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const fetchUsers = async () => {
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
            query GetUsers {
              users {
                id
                name
                email
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
      if (data.data?.users) {
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(app =>
        app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job.company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    setTotalItems(filtered.length);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setFilteredApplications(filtered.slice(startIndex, endIndex));
  };

  const handleCreate = async () => {
    const token = localStorage.getItem('token');
    
    if (!createFormData.jobId) {
      showToast('Please select a job', 'error');
      return;
    }

    // If candidateId is provided, use it. Otherwise, candidate info must be provided for new candidate creation
    if (!createFormData.candidateId) {
      if (!createFormData.firstName || !createFormData.lastName || !createFormData.email) {
        showToast('Please select an existing candidate or provide first name, last name, and email for new candidate', 'error');
        return;
      }
    }
    
    try {
      const input: any = {
        jobId: createFormData.jobId,
        status: createFormData.status,
        interviewScheduled: createFormData.interviewScheduled,
        interviewLanguage: createFormData.interviewLanguage,
      };

      if (createFormData.candidateId) {
        input.candidateId = createFormData.candidateId;
      } else {
        // New candidate fields
        input.firstName = createFormData.firstName;
        input.lastName = createFormData.lastName;
        input.email = createFormData.email;
        if (createFormData.phone) input.phone = createFormData.phone;
        if (createFormData.linkedin) input.linkedin = createFormData.linkedin;
        if (createFormData.portfolioUrl) input.portfolioUrl = createFormData.portfolioUrl;
      }

      if (createFormData.coverLetter) input.coverLetter = createFormData.coverLetter;
      if (createFormData.resumeUrl) input.resumeUrl = createFormData.resumeUrl;
      if (createFormData.expectedSalary) input.expectedSalary = createFormData.expectedSalary;
      if (createFormData.noticePeriod) input.noticePeriod = createFormData.noticePeriod;
      if (createFormData.source) input.source = createFormData.source;
      if (createFormData.notes) input.notes = createFormData.notes;

      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateApplication($input: CreateApplicationInput!) {
              createApplication(input: $input) {
                id
                status
                appliedAt
              }
            }
          `,
          variables: { input }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error creating application: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.createApplication) {
        showToast('Application created successfully!', 'success');
        setShowCreateModal(false);
        setCreateFormData({
          jobId: '',
          candidateId: '',
          status: 'PENDING',
          coverLetter: '',
          resumeUrl: '',
          expectedSalary: '',
          noticePeriod: '',
          source: '',
          notes: '',
          interviewScheduled: false,
          interviewLanguage: 'en',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          linkedin: '',
          portfolioUrl: '',
        });
        fetchApplications();
      }
    } catch (error) {
      console.error('Error creating application:', error);
      showToast('Error creating application', 'error');
    }
  };

  const handleDelete = async () => {
    if (!selectedApplication) return;
    
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
            mutation RemoveApplication($id: ID!) {
              removeApplication(id: $id) {
                id
              }
            }
          `,
          variables: { id: selectedApplication.id }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error deleting application: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.removeApplication) {
        showToast('Application deleted successfully!', 'success');
        setShowDeleteModal(false);
        setSelectedApplication(null);
        fetchApplications();
      }
    } catch (error) {
      console.error('Error deleting application:', error);
      showToast('Error deleting application', 'error');
    }
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      REVIEWED: 'bg-blue-100 text-blue-800',
      SHORTLISTED: 'bg-purple-100 text-purple-800',
      INTERVIEWED: 'bg-indigo-100 text-indigo-800',
      OFFERED: 'bg-green-100 text-green-800',
      HIRED: 'bg-green-200 text-green-900',
      ANALYZED: 'bg-cyan-100 text-cyan-800',
      REJECTED: 'bg-red-100 text-red-800',
      WITHDRAWN: 'bg-gray-100 text-gray-800',
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
          <h1 className="text-2xl font-bold">Applications Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Create Application
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by job, company, candidate, email, or status..."
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
                <option value="PENDING">Pending</option>
                <option value="REVIEWED">Reviewed</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="INTERVIEWED">Interviewed</option>
                <option value="OFFERED">Offered</option>
                <option value="HIRED">Hired</option>
                <option value="ANALYZED">Analyzed</option>
                <option value="REJECTED">Rejected</option>
                <option value="WITHDRAWN">Withdrawn</option>
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
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Scores
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{application.job.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.job.company.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{application.candidate.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{application.candidate.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(application.status)}`}>
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-500">
                        {application.cvScore && <div>CV: {application.cvScore.toFixed(1)}</div>}
                        {application.firstInterviewScore && <div>Int1: {application.firstInterviewScore.toFixed(1)}</div>}
                        {application.finalScore && <div>Final: {application.finalScore.toFixed(1)}</div>}
                        {!application.cvScore && !application.firstInterviewScore && !application.finalScore && <span>N/A</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/applications/${application.id}`)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
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

          {filteredApplications.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No applications found
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
        title="Create Application"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job *</label>
            <select
              value={createFormData.jobId}
              onChange={(e) => setCreateFormData({ ...createFormData, jobId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Select a job</option>
              {jobs.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title} - {job.company.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Existing Candidate (Optional)</label>
            <select
              value={createFormData.candidateId}
              onChange={(e) => setCreateFormData({ ...createFormData, candidateId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Create new candidate or select existing</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {!createFormData.candidateId && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">New Candidate Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={createFormData.firstName}
                    onChange={(e) => setCreateFormData({ ...createFormData, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={createFormData.lastName}
                    onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <input
                    type="url"
                    value={createFormData.linkedin}
                    onChange={(e) => setCreateFormData({ ...createFormData, linkedin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
                  <input
                    type="url"
                    value={createFormData.portfolioUrl}
                    onChange={(e) => setCreateFormData({ ...createFormData, portfolioUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://portfolio.com"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Application Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={createFormData.status}
                  onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PENDING">Pending</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="SHORTLISTED">Shortlisted</option>
                  <option value="INTERVIEWED">Interviewed</option>
                  <option value="OFFERED">Offered</option>
                  <option value="HIRED">Hired</option>
                  <option value="ANALYZED">Analyzed</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Salary</label>
                <input
                  type="text"
                  value={createFormData.expectedSalary}
                  onChange={(e) => setCreateFormData({ ...createFormData, expectedSalary: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., $80,000 - $100,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
                <input
                  type="text"
                  value={createFormData.noticePeriod}
                  onChange={(e) => setCreateFormData({ ...createFormData, noticePeriod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 2 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input
                  type="text"
                  value={createFormData.source}
                  onChange={(e) => setCreateFormData({ ...createFormData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., LinkedIn, Indeed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                <input
                  type="url"
                  value={createFormData.resumeUrl}
                  onChange={(e) => setCreateFormData({ ...createFormData, resumeUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={createFormData.interviewScheduled}
                  onChange={(e) => setCreateFormData({ ...createFormData, interviewScheduled: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Interview Scheduled</span>
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
              <textarea
                value={createFormData.coverLetter}
                onChange={(e) => setCreateFormData({ ...createFormData, coverLetter: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={3}
                placeholder="Candidate's cover letter..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={createFormData.notes}
                onChange={(e) => setCreateFormData({ ...createFormData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                rows={2}
                placeholder="Internal notes..."
              />
            </div>
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
            Create Application
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
        {selectedApplication && (
          <>
            <p className="mb-6">
              Are you sure you want to delete the application from <strong>{selectedApplication.candidate.name}</strong> for <strong>{selectedApplication.job.title}</strong>? This action cannot be undone.
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
