'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { showToast } from '@/components/ToastContainer';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
  bio?: string;
  skills: string[];
  experience?: string;
  education?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeUrl?: string;
  availability?: string;
  salaryExpectation?: string;
  preferredWorkType?: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CandidateDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const candidateId = params.id as string;
  const [candidate, setCandidate] = useState<Candidate | null>(null);
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

    fetchCandidate();
  }, [router, candidateId]);

  const fetchCandidate = async () => {
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
            query GetCandidate($id: ID!) {
              candidateProfile(id: $id) {
                id
                firstName
                lastName
                phone
                location
                bio
                skills
                experience
                education
                linkedinUrl
                githubUrl
                portfolioUrl
                resumeUrl
                availability
                salaryExpectation
                preferredWorkType
                user {
                  id
                  email
                  name
                }
                createdAt
                updatedAt
              }
            }
          `,
          variables: { id: candidateId }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error fetching candidate: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.candidateProfile) {
        setCandidate(data.data.candidateProfile);
        setEditFormData({
          ...data.data.candidateProfile,
          skills: data.data.candidateProfile.skills?.join(', ') || '',
        });
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
      showToast('Error fetching candidate', 'error');
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

      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation UpdateCandidateProfile($id: ID!, $input: UpdateCandidateProfileInput!) {
              updateCandidateProfile(id: $id, input: $input) {
                id
                firstName
                lastName
                phone
                location
                bio
                skills
                experience
                education
                linkedinUrl
                githubUrl
                portfolioUrl
                resumeUrl
                availability
                salaryExpectation
                preferredWorkType
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            id: candidateId,
            input: {
              firstName: editFormData.firstName,
              lastName: editFormData.lastName,
              phone: editFormData.phone || undefined,
              location: editFormData.location || undefined,
              bio: editFormData.bio || undefined,
              skills: skillsArray.length > 0 ? skillsArray : undefined,
              experience: editFormData.experience || undefined,
              education: editFormData.education || undefined,
              linkedinUrl: editFormData.linkedinUrl || undefined,
              githubUrl: editFormData.githubUrl || undefined,
              portfolioUrl: editFormData.portfolioUrl || undefined,
              resumeUrl: editFormData.resumeUrl || undefined,
              availability: editFormData.availability || undefined,
              salaryExpectation: editFormData.salaryExpectation || undefined,
              preferredWorkType: editFormData.preferredWorkType || undefined,
            }
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error updating candidate: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.updateCandidateProfile) {
        showToast('Candidate updated successfully!', 'success');
        setShowEditModal(false);
        fetchCandidate();
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
      showToast('Error updating candidate', 'error');
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
            mutation RemoveCandidateProfile($id: ID!) {
              removeCandidateProfile(id: $id) {
                id
                firstName
                lastName
              }
            }
          `,
          variables: { id: candidateId }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error deleting candidate: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.removeCandidateProfile) {
        showToast('Candidate deleted successfully!', 'success');
        router.push('/candidates');
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      showToast('Error deleting candidate', 'error');
    }
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

  if (!candidate) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center text-red-600">Candidate not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Candidate Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/candidates')}
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

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Personal Information</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500">First Name</label>
              <p className="text-lg font-semibold">{candidate.firstName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Last Name</label>
              <p className="text-lg font-semibold">{candidate.lastName}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{candidate.user.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg">{candidate.phone || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Location</label>
              <p className="text-lg">{candidate.location || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Availability</label>
              <p className="text-lg">
                <span className={`px-2 py-1 rounded text-sm font-medium ${
                  candidate.availability === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                  candidate.availability === 'LOOKING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {candidate.availability || 'N/A'}
                </span>
              </p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Bio</label>
              <p className="text-lg mt-2">{candidate.bio || 'N/A'}</p>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Professional Information</h2>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Skills</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {candidate.skills && candidate.skills.length > 0 ? (
                  candidate.skills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm">
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills listed</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Experience</label>
              <p className="text-lg">{candidate.experience || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Education</label>
              <p className="text-lg">{candidate.education || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Preferred Work Type</label>
              <p className="text-lg">{candidate.preferredWorkType || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Salary Expectation</label>
              <p className="text-lg">{candidate.salaryExpectation || 'N/A'}</p>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Links & Resources</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">LinkedIn</label>
              <p className="text-lg">
                {candidate.linkedinUrl ? (
                  <a href={candidate.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {candidate.linkedinUrl}
                  </a>
                ) : 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">GitHub</label>
              <p className="text-lg">
                {candidate.githubUrl ? (
                  <a href={candidate.githubUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {candidate.githubUrl}
                  </a>
                ) : 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Portfolio</label>
              <p className="text-lg">
                {candidate.portfolioUrl ? (
                  <a href={candidate.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {candidate.portfolioUrl}
                  </a>
                ) : 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Resume</label>
              <p className="text-lg">
                {candidate.resumeUrl ? (
                  <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    View Resume
                  </a>
                ) : 'N/A'}
              </p>
            </div>

            <div className="col-span-2">
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">System Information</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="text-lg">{new Date(candidate.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Updated At</label>
              <p className="text-lg">{new Date(candidate.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Candidate Profile"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={editFormData.firstName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={editFormData.lastName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={editFormData.phone || ''}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={editFormData.location || ''}
                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={editFormData.availability || ''}
                onChange={(e) => setEditFormData({ ...editFormData, availability: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select availability</option>
                <option value="AVAILABLE">Available</option>
                <option value="LOOKING">Looking</option>
                <option value="NOT_AVAILABLE">Not Available</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Work Type</label>
              <select
                value={editFormData.preferredWorkType || ''}
                onChange={(e) => setEditFormData({ ...editFormData, preferredWorkType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select work type</option>
                <option value="ONSITE">On-site</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
              <input
                type="text"
                value={editFormData.experience || ''}
                onChange={(e) => setEditFormData({ ...editFormData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 5 years"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation</label>
              <input
                type="text"
                value={editFormData.salaryExpectation || ''}
                onChange={(e) => setEditFormData({ ...editFormData, salaryExpectation: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., $80,000 - $100,000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              value={editFormData.skills || ''}
              onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="JavaScript, React, Node.js"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={editFormData.bio || ''}
              onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
            <input
              type="text"
              value={editFormData.education || ''}
              onChange={(e) => setEditFormData({ ...editFormData, education: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Bachelor's in Computer Science"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={editFormData.linkedinUrl || ''}
                onChange={(e) => setEditFormData({ ...editFormData, linkedinUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                type="url"
                value={editFormData.githubUrl || ''}
                onChange={(e) => setEditFormData({ ...editFormData, githubUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://github.com/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
              <input
                type="url"
                value={editFormData.portfolioUrl || ''}
                onChange={(e) => setEditFormData({ ...editFormData, portfolioUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://portfolio.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
              <input
                type="url"
                value={editFormData.resumeUrl || ''}
                onChange={(e) => setEditFormData({ ...editFormData, resumeUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://resume.com/file.pdf"
              />
            </div>
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
          Are you sure you want to delete <strong>{candidate.firstName} {candidate.lastName}</strong>? This action cannot be undone.
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
