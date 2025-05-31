'use client';

import { useState } from 'react';

export default function LogoutTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  
  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testLogoutWithoutAuth = async () => {
    addResult('🧪 Testing logout without authentication...');
    
    try {
      const response = await fetch('http://localhost:4005/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      addResult(`📡 Server response: ${response.status} ${response.statusText}`);
      
      if (response.status === 401) {
        addResult('✅ Got 401 as expected - user not authenticated');
        addResult('✅ Frontend should treat this as successful logout');
      } else if (response.status === 200) {
        addResult('✅ Got 200 - logout successful');
      } else {
        addResult(`⚠️ Unexpected status: ${response.status}`);
      }
      
      const responseText = await response.text().catch(() => 'Could not read response');
      addResult(`📄 Response body: ${responseText}`);
      
    } catch (error) {
      addResult(`❌ Network error: ${error}`);
      addResult('✅ Frontend should handle this gracefully and still log out');
    }
  };

  const testActualLogout = async () => {
    addResult('🧪 Testing actual logout function...');
    
    try {
      // Import logout function dynamically to avoid SSR issues
      const { logout } = await import('@/services/auth.service');
      
      await logout();
      addResult('✅ Logout function completed successfully');
      addResult('✅ Auth cache cleared, ready for redirect');
      
    } catch (error) {
      addResult(`❌ Logout function error: ${error}`);
    }
  };

  const clearResults = () => setTestResults([]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Logout Testing Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Test Actions</h2>
            
            <button
              onClick={testLogoutWithoutAuth}
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition"
            >
              Test Server Logout (No Auth)
            </button>
            
            <button
              onClick={testActualLogout}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded transition"
            >
              Test Frontend Logout Function
            </button>
            
            <button
              onClick={clearResults}
              className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition"
            >
              Clear Results
            </button>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="bg-gray-800 rounded border border-gray-700 p-4 h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-400 italic">Click a test button to see results...</p>
              ) : (
                <div className="space-y-2">
                  {testResults.map((result, index) => (
                    <div key={index} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-800 rounded border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Test Explanation</h3>
          <div className="text-sm text-gray-300 space-y-2">
            <p><strong>Test 1:</strong> Shows what happens when we call the backend logout without authentication (expects 401)</p>
            <p><strong>Test 2:</strong> Shows how our frontend logout function handles the 401 response correctly</p>
            <p><strong>Expected Result:</strong> Both tests should show that logout works even when getting 401 from backend</p>
          </div>
        </div>
      </div>
    </div>
  );
}
