'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { showToast } from '@/components/ToastContainer';

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    company: {
      id: string;
      name: string;
    };
    location: string;
    type: string;
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
  cvAnalysisResults?: any;
  analyzedAt?: string;
  aiCvRecommendations?: string;
  aiInterviewRecommendations?: string;
  aiSecondInterviewRecommendations?: string;
  recommendationsGeneratedAt?: string;
  companyNotes?: string;
  source?: string;
  notes?: string;
  aiAnalysis?: any;
  interviewScheduled: boolean;
  reviewedAt?: string;
  interviewScheduledAt?: string;
  interviewedAt?: string;
  rejectedAt?: string;
  acceptedAt?: string;
  interviewLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.id as string;
  const [application, setApplication] = useState<Application | null>(null);
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

    fetchApplication();
  }, [router, applicationId]);

  const fetchApplication = async () => {
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
            query GetApplication($id: ID!) {
              application(id: $id) {
                id
                job {
                  id
                  title
                  company {
                    id
                    name
                  }
                  location
                  type
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
                cvAnalysisResults
                analyzedAt
                aiCvRecommendations
                aiInterviewRecommendations
                aiSecondInterviewRecommendations
                recommendationsGeneratedAt
                companyNotes
                source
                notes
                aiAnalysis
                interviewScheduled
                reviewedAt
                interviewScheduledAt
                interviewedAt
                rejectedAt
                acceptedAt
                interviewLanguage
                createdAt
                updatedAt
              }
            }
          `,
          variables: { id: applicationId }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error fetching application: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.application) {
        setApplication(data.data.application);
        setEditFormData({
          status: data.data.application.status,
          expectedSalary: data.data.application.expectedSalary || '',
          noticePeriod: data.data.application.noticePeriod || '',
          source: data.data.application.source || '',
          notes: data.data.application.notes || '',
          coverLetter: data.data.application.coverLetter || '',
          resumeUrl: data.data.application.resumeUrl || '',
          interviewScheduled: data.data.application.interviewScheduled,
          interviewLanguage: data.data.application.interviewLanguage,
          companyNotes: data.data.application.companyNotes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      showToast('Error fetching application', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const input: any = {
        status: editFormData.status,
        interviewScheduled: editFormData.interviewScheduled,
        interviewLanguage: editFormData.interviewLanguage,
      };

      if (editFormData.expectedSalary) input.expectedSalary = editFormData.expectedSalary;
      if (editFormData.noticePeriod) input.noticePeriod = editFormData.noticePeriod;
      if (editFormData.source) input.source = editFormData.source;
      if (editFormData.notes) input.notes = editFormData.notes;
      if (editFormData.coverLetter) input.coverLetter = editFormData.coverLetter;
      if (editFormData.resumeUrl) input.resumeUrl = editFormData.resumeUrl;
      if (editFormData.companyNotes) input.companyNotes = editFormData.companyNotes;

      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateApplication($id: ID!, $input: UpdateApplicationInput!) {
              updateApplication(id: $id, input: $input) {
                id
                status
                updatedAt
              }
            }
          `,
          variables: {
            id: applicationId,
            input
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error updating application: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.updateApplication) {
        showToast('Application updated successfully!', 'success');
        setShowEditModal(false);
        fetchApplication();
      }
    } catch (error) {
      console.error('Error updating application:', error);
      showToast('Error updating application', 'error');
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
            mutation RemoveApplication($id: ID!) {
              removeApplication(id: $id) {
                id
              }
            }
          `,
          variables: { id: applicationId }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error deleting application: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.removeApplication) {
        showToast('Application deleted successfully!', 'success');
        router.push('/applications');
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

  if (!application) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center text-red-600">Application not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Application Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/applications')}
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
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Job Information</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Job Title</label>
              <p className="text-lg font-semibold">{application.job.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Company</label>
              <p className="text-lg">{application.job.company.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Location</label>
              <p className="text-lg">{application.job.location || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Job Type</label>
              <p className="text-lg">{application.job.type || 'N/A'}</p>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Candidate Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Candidate Name</label>
              <p className="text-lg font-semibold">{application.candidate.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{application.candidate.email}</p>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Application Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Status</label>
              <p className="text-lg">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(application.status)}`}>
                  {application.status}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Applied At</label>
              <p className="text-lg">{new Date(application.appliedAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Expected Salary</label>
              <p className="text-lg">{application.expectedSalary || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Notice Period</label>
              <p className="text-lg">{application.noticePeriod || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Source</label>
              <p className="text-lg">{application.source || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Interview Scheduled</label>
              <p className="text-lg">
                <span className={`px-2 py-1 rounded text-sm ${application.interviewScheduled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {application.interviewScheduled ? 'Yes' : 'No'}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Interview Language</label>
              <p className="text-lg">{application.interviewLanguage}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Resume</label>
              <p className="text-lg">
                {application.resumeUrl ? (
                  <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    View Resume
                  </a>
                ) : 'N/A'}
              </p>
            </div>

            {application.coverLetter && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">Cover Letter</label>
                <p className="text-sm mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{application.coverLetter}</p>
              </div>
            )}

            {application.notes && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}

            {application.companyNotes && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">Company Notes</label>
                <p className="text-sm mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{application.companyNotes}</p>
              </div>
            )}

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">AI Analysis & Scores</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">CV Score</label>
              <p className="text-lg font-semibold">{application.cvScore?.toFixed(2) || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">CV Analysis Score</label>
              <p className="text-lg font-semibold">{application.cvAnalysisScore?.toFixed(2) || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">First Interview Score</label>
              <p className="text-lg font-semibold">{application.firstInterviewScore?.toFixed(2) || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Second Interview Score</label>
              <p className="text-lg font-semibold">{application.secondInterviewScore?.toFixed(2) || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Final Score</label>
              <p className="text-lg font-semibold text-primary-600">{application.finalScore?.toFixed(2) || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Analyzed At</label>
              <p className="text-lg">{application.analyzedAt ? new Date(application.analyzedAt).toLocaleString() : 'N/A'}</p>
            </div>

            {application.aiCvRecommendations && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">AI CV Recommendations</label>
                <p className="text-sm mt-2 p-4 bg-blue-50 rounded whitespace-pre-wrap">{application.aiCvRecommendations}</p>
              </div>
            )}

            {application.aiInterviewRecommendations && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">AI Interview Recommendations</label>
                <p className="text-sm mt-2 p-4 bg-blue-50 rounded whitespace-pre-wrap">{application.aiInterviewRecommendations}</p>
              </div>
            )}

            {application.aiSecondInterviewRecommendations && (
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-500">AI Second Interview Recommendations</label>
                <p className="text-sm mt-2 p-4 bg-blue-50 rounded whitespace-pre-wrap">{application.aiSecondInterviewRecommendations}</p>
              </div>
            )}

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Timeline</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Reviewed At</label>
              <p className="text-lg">{application.reviewedAt ? new Date(application.reviewedAt).toLocaleString() : 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Interview Scheduled At</label>
              <p className="text-lg">{application.interviewScheduledAt ? new Date(application.interviewScheduledAt).toLocaleString() : 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Interviewed At</label>
              <p className="text-lg">{application.interviewedAt ? new Date(application.interviewedAt).toLocaleString() : 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Accepted At</label>
              <p className="text-lg">{application.acceptedAt ? new Date(application.acceptedAt).toLocaleString() : 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Rejected At</label>
              <p className="text-lg">{application.rejectedAt ? new Date(application.rejectedAt).toLocaleString() : 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Recommendations Generated At</label>
              <p className="text-lg">{application.recommendationsGeneratedAt ? new Date(application.recommendationsGeneratedAt).toLocaleString() : 'N/A'}</p>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">System Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="text-lg">{new Date(application.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Updated At</label>
              <p className="text-lg">{new Date(application.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Application"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={editFormData.status}
                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
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
                value={editFormData.interviewLanguage}
                onChange={(e) => setEditFormData({ ...editFormData, interviewLanguage: e.target.value })}
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
                value={editFormData.expectedSalary}
                onChange={(e) => setEditFormData({ ...editFormData, expectedSalary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., $80,000 - $100,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period</label>
              <input
                type="text"
                value={editFormData.noticePeriod}
                onChange={(e) => setEditFormData({ ...editFormData, noticePeriod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 2 weeks"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <input
                type="text"
                value={editFormData.source}
                onChange={(e) => setEditFormData({ ...editFormData, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., LinkedIn, Indeed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
              <input
                type="url"
                value={editFormData.resumeUrl}
                onChange={(e) => setEditFormData({ ...editFormData, resumeUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={editFormData.interviewScheduled}
                onChange={(e) => setEditFormData({ ...editFormData, interviewScheduled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Interview Scheduled</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
            <textarea
              value={editFormData.coverLetter}
              onChange={(e) => setEditFormData({ ...editFormData, coverLetter: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder="Candidate's cover letter..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={editFormData.notes}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="Internal notes..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Notes</label>
            <textarea
              value={editFormData.companyNotes}
              onChange={(e) => setEditFormData({ ...editFormData, companyNotes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={2}
              placeholder="Company-specific notes..."
            />
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
          Are you sure you want to delete this application from <strong>{application.candidate.name}</strong> for <strong>{application.job.title}</strong>? This action cannot be undone.
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
