'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  status: string;
  coverLetter: string;
  expectedSalary: string;
  source: string;
  createdAt: string;
  firstName: string;
  lastName: string;
  email: string;
  job: {
    title: string;
  };
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchApplications = async () => {
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
                  status
                  coverLetter
                  expectedSalary
                  source
                  createdAt
                  firstName
                  lastName
                  email
                  job {
                    title
                  }
                }
              }
            `,
          }),
        });
        const data = await response.json();
        if (data.data?.applications) {
          setApplications(data.data.applications);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [router]);

  if (loading) {
    return (
      <div className="flex">
        <div className="w-64 bg-primary-600 text-white min-h-screen">
          <div className="p-4">
            <h2 className="text-xl font-bold">Dashboard</h2>
          </div>
          <nav className="mt-4">
            <a href="/" className="block px-4 py-2 hover:bg-primary-700">Home</a>
            <a href="/companies" className="block px-4 py-2 hover:bg-primary-700">Companies</a>
            <a href="/candidates" className="block px-4 py-2 hover:bg-primary-700">Candidates</a>
            <a href="/applications" className="block px-4 py-2 hover:bg-primary-700">Applications</a>
            <a href="/jobs" className="block px-4 py-2 hover:bg-primary-700">Jobs</a>
            <a href="/users" className="block px-4 py-2 hover:bg-primary-700">Users</a>
            <a href="/reports" className="block px-4 py-2 hover:bg-primary-700">Reports</a>
            <a href="#" className="block px-4 py-2 hover:bg-primary-700" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); }}>Logout</a>
          </nav>
        </div>
        <div className="flex-1 p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-64 bg-primary-600 text-white min-h-screen">
        <div className="p-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
        </div>
        <nav className="mt-4">
          <a href="/" className="block px-4 py-2 hover:bg-primary-700">Home</a>
          <a href="/companies" className="block px-4 py-2 hover:bg-primary-700">Companies</a>
          <a href="/candidates" className="block px-4 py-2 hover:bg-primary-700">Candidates</a>
          <a href="/applications" className="block px-4 py-2 hover:bg-primary-700">Applications</a>
          <a href="/jobs" className="block px-4 py-2 hover:bg-primary-700">Jobs</a>
          <a href="/users" className="block px-4 py-2 hover:bg-primary-700">Users</a>
          <a href="/reports" className="block px-4 py-2 hover:bg-primary-700">Reports</a>
          <a href="#" className="block px-4 py-2 hover:bg-primary-700" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); router.push('/login'); }}>Logout</a>
        </nav>
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Applications Management</h1>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{application.firstName} {application.lastName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.job.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.expectedSalary}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{application.source}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(application.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}