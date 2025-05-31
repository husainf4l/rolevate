'use client';

import { useState } from 'react';
import { logout, isAuthenticated, getCurrentUser } from '@/services/auth.service';
import { testAuthEndpoints, getAuthDebugInfo } from '@/utils/debug-auth';

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleGetDebugInfo = () => {
    const info = getAuthDebugInfo();
    setDebugInfo(JSON.stringify(info, null, 2));
  };

  const handleTestAuth = async () => {
    setLoading(true);
    try {
      console.log('=== Testing Authentication ===');
      const authStatus = await isAuthenticated();
      console.log('Is authenticated:', authStatus);
      
      const user = await getCurrentUser();
      console.log('Current user:', user);
      
      setDebugInfo(prev => prev + '\n\nAuthentication test completed. Check console for details.');
    } catch (error) {
      console.error('Auth test error:', error);
      setDebugInfo(prev => prev + '\n\nAuthentication test failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogout = async () => {
    setLoading(true);
    try {
      console.log('=== Testing Logout ===');
      await logout();
      setDebugInfo(prev => prev + '\n\nLogout test completed. Check console for details.');
    } catch (error) {
      console.error('Logout test error:', error);
      setDebugInfo(prev => prev + '\n\nLogout test failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEndpoints = async () => {
    setLoading(true);
    try {
      console.log('=== Testing All Endpoints ===');
      await testAuthEndpoints();
      setDebugInfo(prev => prev + '\n\nEndpoint test completed. Check console for details.');
    } catch (error) {
      console.error('Endpoint test error:', error);
      setDebugInfo(prev => prev + '\n\nEndpoint test failed. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Authentication Debug Tool</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Actions</h2>
            
            <button
              onClick={handleGetDebugInfo}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded transition"
            >
              Get Debug Info
            </button>
            
            <button
              onClick={handleTestAuth}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded transition"
            >
              Test Authentication
            </button>
            
            <button
              onClick={handleTestLogout}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 px-4 py-2 rounded transition"
            >
              Test Logout
            </button>
            
            <button
              onClick={handleTestEndpoints}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-4 py-2 rounded transition"
            >
              Test All Endpoints
            </button>

            {loading && (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Debug Output</h2>
            <textarea
              value={debugInfo}
              readOnly
              className="w-full h-96 bg-gray-800 text-green-400 font-mono text-sm p-4 rounded border border-gray-700 resize-none"
              placeholder="Debug information will appear here..."
            />
            
            <button
              onClick={() => setDebugInfo('')}
              className="mt-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-sm transition"
            >
              Clear Output
            </button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-gray-800 rounded border border-gray-700">
          <h3 className="text-lg font-semibold mb-2">Instructions</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Open browser dev tools (F12) and check the Console tab</li>
            <li>• Click "Get Debug Info" to see current authentication state</li>
            <li>• Click "Test Authentication" to check if you're logged in</li>
            <li>• Click "Test Logout" to test the logout functionality</li>
            <li>• Click "Test All Endpoints" to test multiple auth endpoints</li>
            <li>• All detailed output will be in the browser console</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
