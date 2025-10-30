'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Pagination from '@/components/Pagination';
import Modal from '@/components/Modal';
import Loading from '@/components/Loading';
import { showToast } from '@/components/ToastContainer';

interface Company {
  id: string;
  name: string;
  email: string;
  industry: string;
  size: string;
  location: string;
  createdAt: string;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    size: '',
    location: '',
    description: '',
    logo: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchCompanies();
  }, [router, currentPage, pageSize, searchTerm]);

  const fetchCompanies = async () => {
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
            query GetCompanies {
              companies {
                id
                name
                email
                industry
                size
                location
                createdAt
              }
            }
          `,
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error fetching companies: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.companies) {
        let filteredCompanies = data.data.companies;
        
        // Client-side filtering for search
        if (searchTerm) {
          filteredCompanies = filteredCompanies.filter((company: Company) =>
            company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.location?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setTotalItems(filteredCompanies.length);
        
        // Client-side pagination
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);
        
        setCompanies(paginatedCompanies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      showToast('Error fetching companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!createFormData.name) {
      showToast('Company name is required', 'warning');
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
            mutation CreateCompany($input: CreateCompanyInput!) {
              createCompany(input: $input) {
                id
                name
                email
                industry
                size
                location
                createdAt
              }
            }
          `,
          variables: {
            input: {
              name: createFormData.name,
              email: createFormData.email || undefined,
              phone: createFormData.phone || undefined,
              website: createFormData.website || undefined,
              industry: createFormData.industry || undefined,
              size: createFormData.size || undefined,
              location: createFormData.location || undefined,
              description: createFormData.description || undefined,
              logo: createFormData.logo || undefined,
            }
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error creating company: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.createCompany) {
        showToast('Company created successfully!', 'success');
        setShowCreateModal(false);
        setCreateFormData({
          name: '',
          email: '',
          phone: '',
          website: '',
          industry: '',
          size: '',
          location: '',
          description: '',
          logo: '',
        });
        fetchCompanies();
      }
    } catch (error) {
      console.error('Error creating company:', error);
      showToast('Error creating company', 'error');
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
            mutation RemoveCompany($id: ID!) {
              removeCompany(id: $id) {
                id
                name
              }
            }
          `,
          variables: { id }
        }),
      });
      
      const data = await response.json();
      
      if (data.errors) {
        showToast('Error deleting company: ' + data.errors[0].message, 'error');
        return;
      }
      
      if (data.data?.removeCompany) {
        showToast('Company deleted successfully!', 'success');
        fetchCompanies();
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      showToast('Error deleting company', 'error');
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  if (loading && companies.length === 0) {
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
          <h1 className="text-3xl font-bold">Companies Management</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
          >
            + Create Company
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search companies by name, email, industry, or location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {loading ? (
            <Loading />
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No companies found matching your search.' : 'No companies found. Create one to get started!'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companies.map((company) => (
                      <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{company.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.email || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.industry || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.size || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.location || 'N/A'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(company.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/companies/${company.id}`)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDelete(company.id, company.name)}
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
        title="Create New Company"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input
              type="text"
              value={createFormData.name}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input
              type="url"
              value={createFormData.website}
              onChange={(e) => setCreateFormData({ ...createFormData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input
              type="text"
              value={createFormData.industry}
              onChange={(e) => setCreateFormData({ ...createFormData, industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Size</label>
            <select
              value={createFormData.size}
              onChange={(e) => setCreateFormData({ ...createFormData, size: e.target.value })}
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
              value={createFormData.location}
              onChange={(e) => setCreateFormData({ ...createFormData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
            <input
              type="url"
              value={createFormData.logo}
              onChange={(e) => setCreateFormData({ ...createFormData, logo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={createFormData.description}
              onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={4}
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
            Create Company
          </button>
        </div>
      </Modal>
    </div>
  );
}
