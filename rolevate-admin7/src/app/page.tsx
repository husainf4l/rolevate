'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token) {
      router.push('/login');
    } else if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="w-64 bg-primary-600 text-white min-h-screen">
        <div className="p-4">
          <h2 className="text-xl font-bold">Dashboard</h2>
          {user && <p className="text-sm">Welcome, {user.email}</p>}
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
      {/* Main content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Welcome to Rolevate Super Admin</h1>
        <p className="mt-4">Manage subscriptions, companies, candidates, and more.</p>
        {user && <p className="mt-4">Logged in as: {user.email}</p>}
      </div>
    </div>
  );
}
