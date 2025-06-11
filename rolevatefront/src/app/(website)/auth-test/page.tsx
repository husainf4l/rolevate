// 'use client';

// import { useState } from 'react';
// import { login, getCurrentUser, logout } from '@/services/auth.Service';

// export default function AuthTestPage() {
//   const [user, setUser] = useState<any>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string>('');
//   const [credentials, setCredentials] = useState({
//     username: 'husain',
//     password: 'password123'
//   });

//   const handleLogin = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const userData = await login(credentials);
//       setUser(userData);
//       console.log('Login successful:', userData);
//     } catch (err: any) {
//       setError(err.message);
//       console.error('Login failed:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGetCurrentUser = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const userData = await getCurrentUser();
//       setUser(userData);
//       console.log('Current user:', userData);
//     } catch (err: any) {
//       setError(err.message);
//       console.error('Get current user failed:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogout = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       await logout();
//       setUser(null);
//       console.log('Logout successful');
//     } catch (err: any) {
//       setError(err.message);
//       console.error('Logout failed:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-8">
//       <h1 className="text-3xl font-bold mb-8">🔐 Authentication Test</h1>

//       {/* Login Form */}
//       <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//         <h2 className="text-xl font-semibold mb-4">Login Test</h2>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Username</label>
//             <input
//               type="text"
//               value={credentials.username}
//               onChange={(e) => setCredentials({...credentials, username: e.target.value})}
//               className="w-full p-2 border border-gray-300 rounded"
//               placeholder="husain"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium mb-1">Password</label>
//             <input
//               type="password"
//               value={credentials.password}
//               onChange={(e) => setCredentials({...credentials, password: e.target.value})}
//               className="w-full p-2 border border-gray-300 rounded"
//               placeholder="password123"
//             />
//           </div>
//           <button
//             onClick={handleLogin}
//             disabled={loading}
//             className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </div>
//       </div>

//       {/* User Info */}
//       {user && (
//         <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
//           <h2 className="text-xl font-semibold text-green-800 mb-4">✅ Logged In User</h2>
//           <div className="space-y-2 text-sm">
//             <p><strong>ID:</strong> {user.id}</p>
//             <p><strong>Username:</strong> {user.username}</p>
//             <p><strong>Name:</strong> {user.name}</p>
//             <p><strong>Email:</strong> {user.email}</p>
//             <p><strong>2FA Enabled:</strong> {user.isTwoFactorEnabled ? 'Yes' : 'No'}</p>
//           </div>
//         </div>
//       )}

//       {/* Error Display */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
//           <h2 className="text-xl font-semibold text-red-800 mb-2">❌ Error</h2>
//           <p className="text-red-700">{error}</p>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex gap-4">
//         <button
//           onClick={handleGetCurrentUser}
//           disabled={loading}
//           className="flex-1 bg-gray-600 text-white p-2 rounded hover:bg-gray-700 disabled:opacity-50"
//         >
//           Get Current User
//         </button>
//         <button
//           onClick={handleLogout}
//           disabled={loading}
//           className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50"
//         >
//           Logout
//         </button>
//       </div>

//       {/* API Info */}
//       <div className="mt-8 p-4 bg-gray-100 rounded-lg">
//         <h3 className="font-semibold mb-2">Backend API Info</h3>
//         <p className="text-sm text-gray-600">
//           Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4005'}
//         </p>
//         <p className="text-sm text-gray-600">
//           Test Credentials: husain / password123
//         </p>
//       </div>

//       {/* Integration Status */}
//       <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//         <h3 className="font-semibold text-blue-800 mb-2">🔗 Integration Status</h3>
//         <ul className="text-sm text-blue-700 space-y-1">
//           <li>✅ Backend URL: Updated to port 4005</li>
//           <li>✅ API Endpoints: Using /api/ prefix</li>
//           <li>✅ HTTP-only Cookies: Configured</li>
//           <li>✅ Authentication Service: Updated</li>
//           <li>✅ Public Interview Service: Updated</li>
//           <li>✅ LiveKit Service: Updated</li>
//         </ul>
//       </div>
//     </div>
//   );
// }
