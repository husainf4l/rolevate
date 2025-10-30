'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { showToast } from '@/components/ToastContainer';

interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  email?: string;
  phone?: string;
  logo?: string;
  industry?: string;
  size?: string;
  founded?: string;
  location?: string;
  addressId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchCompany = async () => {
      try {
        const response = await fetch('http://127.0.0.1:4005/api/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: `
              query GetCompany($id: ID!) {
                company(id: $id) {
                  id
                  name
                  description
                  website
                  email
                  phone
                  logo
                  industry
                  size
                  founded
                  location
                  addressId
                  createdAt
                  updatedAt
                }
              }
            `,
            variables: { id: companyId }
          }),
        });
        const data = await response.json();
        if (data.data?.company) {
          setCompany(data.data.company);
          setEditFormData(data.data.company);
        }
      } catch (error) {
        console.error('Error fetching company:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [router, companyId]);

  const handleEdit = async () => {
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
            mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
              updateCompany(id: $id, input: $input) {
                id
                name
                description
                website
                email
                phone
                logo
                industry
                size
                founded
                location
                addressId
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            id: companyId,
            input: {
              name: editFormData.name,
              description: editFormData.description,
              website: editFormData.website,
              email: editFormData.email,
              phone: editFormData.phone,
              logo: editFormData.logo,
              industry: editFormData.industry,
              size: editFormData.size,
              founded: editFormData.founded,
              location: editFormData.location,
            }
          }
        }),
      });
      const data = await response.json();
      if (data.data?.updateCompany) {
        setCompany(data.data.updateCompany);
        setShowEditModal(false);
        showToast('Company updated successfully!', 'success');
      } else {
        showToast('Error updating company: ' + JSON.stringify(data.errors), 'error');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      showToast('Error updating company', 'error');
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
            mutation RemoveCompany($id: ID!) {
              removeCompany(id: $id) {
                id
                name
              }
            }
          `,
          variables: { id: companyId }
        }),
      });
      const data = await response.json();
      if (data.data?.removeCompany) {
        showToast('Company deleted successfully!', 'success');
        router.push('/companies');
      } else {
        showToast('Error deleting company: ' + JSON.stringify(data.errors), 'error');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      showToast('Error deleting company', 'error');
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

  if (!company) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="text-center text-red-600">Company not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Company Details</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/companies')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to List
            </button>
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
            >
              Edit
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {company.logo && (
              <div className="col-span-2">
                <img src={company.logo} alt={company.name} className="w-32 h-32 object-contain" />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-500">Company Name</label>
              <p className="text-lg font-semibold">{company.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <p className="text-lg">{company.email || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Phone</label>
              <p className="text-lg">{company.phone || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Website</label>
              <p className="text-lg">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                    {company.website}
                  </a>
                ) : 'N/A'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Industry</label>
              <p className="text-lg">{company.industry || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Company Size</label>
              <p className="text-lg">{company.size || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Location</label>
              <p className="text-lg">{company.location || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Founded</label>
              <p className="text-lg">{company.founded ? new Date(company.founded).toLocaleDateString() : 'N/A'}</p>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-500">Description</label>
              <p className="text-lg mt-2">{company.description || 'N/A'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Created At</label>
              <p className="text-lg">{new Date(company.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">Updated At</label>
              <p className="text-lg">{new Date(company.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Company"
      >
        <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    type="url"
                    value={editFormData.website || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    value={editFormData.industry || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
                  <select
                    value={editFormData.size || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select size</option>
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                  </select>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                  <input
                    type="url"
                    value={editFormData.logo || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, logo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={4}
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
        <p className="mb-6">Are you sure you want to delete <strong>{company.name}</strong>? This action cannot be undone.</p>
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