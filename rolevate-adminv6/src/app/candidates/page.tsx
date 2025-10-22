'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { showToast } from '@/components/ToastContainer';

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  skills: string[];
  experience: string;
  availability: string;
  preferredWorkType: string;
  createdAt: string;
  user: {
    email: string;
  };
}

export default function CandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [createFormData, setCreateFormData] = useState({
    userId: '',
    firstName: '',
    lastName: '',
    phone: '',
    location: '',
    bio: '',
    skills: '',
    experience: '',
    education: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
    availability: '',
    salaryExpectation: '',
    preferredWorkType: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCandidates();
  }, [router, currentPage, pageSize, searchTerm]);

  const fetchCandidates = async () => {
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
            query GetCandidates {
              candidateProfiles {
                id
                firstName
                lastName
                phone
                location
                skills
                experience
                availability
                preferredWorkType
                createdAt
                user {
                  email
                }
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error fetching candidates: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.candidateProfiles) {
        let filteredCandidates = data.data.candidateProfiles;
        
        // Client-side filtering for search
        if (searchTerm) {
          filteredCandidates = filteredCandidates.filter((candidate: Candidate) =>
            candidate.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setTotalItems(filteredCandidates.length);
        
        // Client-side pagination
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);
        
        setCandidates(paginatedCandidates);
      }
    } catch (error) {
      console.error('Error fetching candidates:', error);
      showToast('Error fetching candidates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createFormData.userId || !createFormData.firstName || !createFormData.lastName) {
      showToast('User ID, First Name, and Last Name are required', 'warning');
      return;
    }

    const token = localStorage.getItem('token');
    
    try {
      const skillsArray = createFormData.skills.split(',').map(s => s.trim()).filter(s => s);
      
      const response = await fetch('http://127.0.0.1:4005/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            mutation CreateCandidateProfile($input: CreateCandidateProfileInput!) {
              createCandidateProfile(input: $input) {
                id
                firstName
                lastName
                phone
                location
                skills
                experience
                availability
                preferredWorkType
                createdAt
              }
            }
          `,
          variables: {
            input: {
              userId: createFormData.userId,
              firstName: createFormData.firstName,
              lastName: createFormData.lastName,
              phone: createFormData.phone || undefined,
              location: createFormData.location || undefined,
              bio: createFormData.bio || undefined,
              skills: skillsArray.length > 0 ? skillsArray : undefined,
              experience: createFormData.experience || undefined,
              education: createFormData.education || undefined,
              linkedinUrl: createFormData.linkedinUrl || undefined,
              githubUrl: createFormData.githubUrl || undefined,
              portfolioUrl: createFormData.portfolioUrl || undefined,
              resumeUrl: createFormData.resumeUrl || undefined,
              availability: createFormData.availability || undefined,
              salaryExpectation: createFormData.salaryExpectation || undefined,
              preferredWorkType: createFormData.preferredWorkType || undefined,
            }
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error creating candidate: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.createCandidateProfile) {
        showToast('Candidate profile created successfully!', 'success');
        setShowCreateModal(false);
        setCreateFormData({
          userId: '',
          firstName: '',
          lastName: '',
          phone: '',
          location: '',
          bio: '',
          skills: '',
          experience: '',
          education: '',
          linkedinUrl: '',
          githubUrl: '',
          portfolioUrl: '',
          resumeUrl: '',
          availability: '',
          salaryExpectation: '',
          preferredWorkType: '',
        });
        fetchCandidates();
      }
    } catch (error) {
      console.error('Error creating candidate:', error);
      showToast('Error creating candidate', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

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
          variables: { id }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error deleting candidate: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.removeCandidateProfile) {
        showToast('Candidate deleted successfully!', 'success');
        fetchCandidates();
      }
    } catch (error) {
      console.error('Error deleting candidate:', error);
      showToast('Error deleting candidate', 'error');
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  if (loading && candidates.length === 0) {
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
          <h1 className="text-3xl font-bold">Candidates Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            + Create Candidate
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search candidates by name, email, phone, location, or skills..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <Loading />
          ) : candidates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No candidates found matching your search.' : 'No candidates found. Create one to get started!'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {candidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {candidate.firstName} {candidate.lastName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.user?.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.phone || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{candidate.location || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            candidate.availability === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                            candidate.availability === 'LOOKING' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {candidate.availability || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/candidates/${candidate.id}`)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(candidate.id, `${candidate.firstName} ${candidate.lastName}`)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Candidate Profile"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
              <input
                type="text"
                value={createFormData.userId}
                onChange={(e) => setCreateFormData({ ...createFormData, userId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter user ID"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                type="text"
                value={createFormData.firstName}
                onChange={(e) => setCreateFormData({ ...createFormData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={createFormData.lastName}
                onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={createFormData.location}
                onChange={(e) => setCreateFormData({ ...createFormData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={createFormData.availability}
                onChange={(e) => setCreateFormData({ ...createFormData, availability: e.target.value })}
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
                value={createFormData.preferredWorkType}
                onChange={(e) => setCreateFormData({ ...createFormData, preferredWorkType: e.target.value })}
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
                value={createFormData.experience}
                onChange={(e) => setCreateFormData({ ...createFormData, experience: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 5 years"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              value={createFormData.skills}
              onChange={(e) => setCreateFormData({ ...createFormData, skills: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="JavaScript, React, Node.js"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={createFormData.bio}
              onChange={(e) => setCreateFormData({ ...createFormData, bio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
            <input
              type="text"
              value={createFormData.education}
              onChange={(e) => setCreateFormData({ ...createFormData, education: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Bachelor's in Computer Science"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={createFormData.linkedinUrl}
                onChange={(e) => setCreateFormData({ ...createFormData, linkedinUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
              <input
                type="url"
                value={createFormData.githubUrl}
                onChange={(e) => setCreateFormData({ ...createFormData, githubUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://github.com/..."
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
              <input
                type="url"
                value={createFormData.resumeUrl}
                onChange={(e) => setCreateFormData({ ...createFormData, resumeUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://resume.com/file.pdf"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Salary Expectation</label>
            <input
              type="text"
              value={createFormData.salaryExpectation}
              onChange={(e) => setCreateFormData({ ...createFormData, salaryExpectation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., $80,000 - $100,000"
            />
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
            Create Candidate
          </button>
        </div>
      </Modal>
    </div>
  );
}
