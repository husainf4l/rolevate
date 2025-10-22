'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
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
  description: string;
  shortDescription: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  skills: string[];
  experience: string;
  education: string;
  jobLevel: string;
  workType: string;
  industry: string;
  companyDescription: string;
  status: string;
  company: {
    id: string;
    name: string;
  };
  cvAnalysisPrompt?: string;
  interviewPrompt?: string;
  aiSecondInterviewPrompt?: string;
  interviewLanguage: string;
  featured: boolean;
  applicants: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  postedBy: {
    id: string;
    name: string;
    email: string;
  };
}

export default function JobDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchJob();
  }, [router, jobId]);

  const fetchJob = async () => {
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
            query GetJob($id: ID!) {
              job(id: $id) {
                id
                slug
                title
                department
                location
                salary
                type
                deadline
                description
                shortDescription
                responsibilities
                requirements
                benefits
                skills
                experience
                education
                jobLevel
                workType
                industry
                companyDescription
                status
                company {
                  id
                  name
                }
                cvAnalysisPrompt
                interviewPrompt
                aiSecondInterviewPrompt
                interviewLanguage
                featured
                applicants
                views
                createdAt
                updatedAt
                postedBy {
                  id
                  name
                  email
                }
              }
            }
          `,
          variables: { id: jobId }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error fetching job: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.job) {
        setJob(data.data.job);
        setEditFormData({
          ...data.data.job,
          skills: data.data.job.skills?.join(', ') || '',
        });
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      showToast('Error fetching job', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const skillsArray = editFormData.skills
        ? editFormData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s)
        : [];

      const input: any = {
        title: editFormData.title,
        department: editFormData.department,
        location: editFormData.location,
        salary: editFormData.salary,
        type: editFormData.type,
        deadline: editFormData.deadline,
        description: editFormData.description,
        shortDescription: editFormData.shortDescription,
        responsibilities: editFormData.responsibilities,
        requirements: editFormData.requirements,
        benefits: editFormData.benefits,
        skills: skillsArray,
        experience: editFormData.experience,
        education: editFormData.education,
        jobLevel: editFormData.jobLevel,
        workType: editFormData.workType,
        industry: editFormData.industry,
        companyDescription: editFormData.companyDescription,
        status: editFormData.status,
        featured: editFormData.featured,
      };

      if (editFormData.cvAnalysisPrompt) input.cvAnalysisPrompt = editFormData.cvAnalysisPrompt;
      if (editFormData.interviewPrompt) input.interviewPrompt = editFormData.interviewPrompt;
      if (editFormData.aiSecondInterviewPrompt) input.aiSecondInterviewPrompt = editFormData.aiSecondInterviewPrompt;
      if (editFormData.interviewLanguage) input.interviewLanguage = editFormData.interviewLanguage;

      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
              updateJob(id: $id, input: $input) {
                id
                title
                status
                updatedAt
              }
            }
          `,
          variables: {
            id: jobId,
            input
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error updating job: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.updateJob) {
        showToast('Job updated successfully!', 'success');
        setShowEditModal(false);
        fetchJob();
      }
    } catch (error) {
      console.error('Error updating job:', error);
      showToast('Error updating job', 'error');
    }
  };

  const handleDelete = async () => {
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
            mutation RemoveJob($id: ID!) {
              removeJob(id: $id) {
                id
                title
              }
            }
          `,
          variables: { id: jobId }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error deleting job: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.removeJob) {
        showToast('Job deleted successfully!', 'success');
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      showToast('Error deleting job', 'error');
    }
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

  if (!job) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center text-red-600">Job not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Job Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/jobs')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Back to List
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Basic Information</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Job Title</label>
              <p className="text-lg font-semibold">{job.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Company</label>
              <p className="text-lg">{job.company.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Department</label>
              <p className="text-lg">{job.department}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Location</label>
              <p className="text-lg">{job.location}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Salary</label>
              <p className="text-lg">{job.salary}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Industry</label>
              <p className="text-lg">{job.industry}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className="text-lg">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(job.status)}`}>
                  {job.status}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Job Type</label>
              <p className="text-lg">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {job.type.replace('_', ' ')}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Job Level</label>
              <p className="text-lg">{job.jobLevel}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Work Type</label>
              <p className="text-lg">{job.workType}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Experience Required</label>
              <p className="text-lg">{job.experience}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Education Required</label>
              <p className="text-lg">{job.education}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Deadline</label>
              <p className="text-lg">{new Date(job.deadline).toLocaleDateString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Featured</label>
              <p className="text-lg">
                <span className={`px-2 py-1 rounded text-sm ${job.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                  {job.featured ? 'Yes' : 'No'}
                </span>
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Skills Required</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {job.skills && job.skills.length > 0 ? (
                  job.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills listed</p>
                )}
              </div>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Descriptions</h2>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Short Description</label>
              <p className="text-sm mt-2 p-4 bg-gray-50 rounded">{job.shortDescription}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Full Description</label>
              <p className="text-sm mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{job.description}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Responsibilities</label>
              <p className="text-sm mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{job.responsibilities}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Requirements</label>
              <p className="text-sm mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{job.requirements}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Benefits</label>
              <p className="text-sm mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{job.benefits}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Company Description</label>
              <p className="text-sm mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{job.companyDescription}</p>
            </div>

            {(job.cvAnalysisPrompt || job.interviewPrompt || job.aiSecondInterviewPrompt) && (
              <>
                <div className="col-span-2">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b">AI Prompts</h2>
                </div>

                {job.cvAnalysisPrompt && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">CV Analysis Prompt</label>
                    <p className="text-sm mt-2 p-4 bg-blue-50 rounded whitespace-pre-wrap">{job.cvAnalysisPrompt}</p>
                  </div>
                )}

                {job.interviewPrompt && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Interview Prompt</label>
                    <p className="text-sm mt-2 p-4 bg-blue-50 rounded whitespace-pre-wrap">{job.interviewPrompt}</p>
                  </div>
                )}

                {job.aiSecondInterviewPrompt && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-500">Second Interview Prompt</label>
                    <p className="text-sm mt-2 p-4 bg-blue-50 rounded whitespace-pre-wrap">{job.aiSecondInterviewPrompt}</p>
                  </div>
                )}
              </>
            )}

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Statistics</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Applicants</label>
              <p className="text-lg font-semibold text-primary-600">{job.applicants}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Views</label>
              <p className="text-lg font-semibold">{job.views}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Interview Language</label>
              <p className="text-lg">{job.interviewLanguage}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Slug</label>
              <p className="text-sm text-gray-600">{job.slug}</p>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Posted By</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg">{job.postedBy.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{job.postedBy.email}</p>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">System Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="text-lg">{new Date(job.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Updated At</label>
              <p className="text-lg">{new Date(job.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal - Using same structure as create but with edit */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Job"
        size="xl"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={editFormData.title || ''}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
              <input
                type="text"
                value={editFormData.department || ''}
                onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
              <input
                type="text"
                value={editFormData.location || ''}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary *</label>
              <input
                type="text"
                value={editFormData.salary || ''}
                onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
              <select
                value={editFormData.type || ''}
                onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
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
                value={editFormData.jobLevel || ''}
                onChange={(e) => setEditFormData({ ...editFormData, jobLevel: e.target.value })}
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
                value={editFormData.workType || ''}
                onChange={(e) => setEditFormData({ ...editFormData, workType: e.target.value })}
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
                value={editFormData.status || ''}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
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
                value={editFormData.industry || ''}
                onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience *</label>
              <input
                type="text"
                value={editFormData.experience || ''}
                onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education *</label>
              <input
                type="text"
                value={editFormData.education || ''}
                onChange={(e) => setEditFormData({ ...editFormData, education: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline *</label>
              <input
                type="date"
                value={editFormData.deadline ? editFormData.deadline.split('T')[0] : ''}
                onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated) *</label>
            <input
              type="text"
              value={editFormData.skills || ''}
              onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Description *</label>
            <textarea
              value={editFormData.shortDescription || ''}
              onChange={(e) => setEditFormData({ ...editFormData, shortDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              value={editFormData.description || ''}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsibilities *</label>
            <textarea
              value={editFormData.responsibilities || ''}
              onChange={(e) => setEditFormData({ ...editFormData, responsibilities: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requirements *</label>
            <textarea
              value={editFormData.requirements || ''}
              onChange={(e) => setEditFormData({ ...editFormData, requirements: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Benefits *</label>
            <textarea
              value={editFormData.benefits || ''}
              onChange={(e) => setEditFormData({ ...editFormData, benefits: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Description *</label>
            <textarea
              value={editFormData.companyDescription || ''}
              onChange={(e) => setEditFormData({ ...editFormData, companyDescription: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              required
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editFormData.featured || false}
                onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Featured Job</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            Save Changes
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
        <p className="mb-6">
          Are you sure you want to delete <strong>{job.title}</strong> at <strong>{job.company.name}</strong>? This action cannot be undone.
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
      </Modal>
    </div>
  );
}
