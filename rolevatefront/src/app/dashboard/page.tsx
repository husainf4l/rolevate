"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Mock data for the dashboard
const dashboardStats = {
  totalCVs: 427,
  newCVsToday: 18,
  matchRate: 72,
  averageScore: 68,
  interviewsScheduled: 12,
  pendingReviews: 38
}

// Function to generate initials avatar from name
const getInitials = (name: string) => {
  const nameParts = name.split(' ');
  return nameParts.length > 1 
    ? `${nameParts[0][0]}${nameParts[1][0]}` 
    : nameParts[0].substring(0, 2);
};

// Function to get a consistent color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
    'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-teal-500'
  ];
  
  // Simple hash function to get a consistent color for a name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Demo data for top candidates by category
const topCandidatesByCategory = [
  {
    category: "Software Engineering",
    candidates: [
      { id: 1, name: "Jordan Lee", score: 95, skills: ["React", "Node.js", "AWS"], experience: "8 years", location: "New York" },
      { id: 2, name: "Sara Miller", score: 92, skills: ["Python", "Django", "ML"], experience: "6 years", location: "San Francisco" },
      { id: 3, name: "Raj Patel", score: 89, skills: ["Java", "Spring", "Kubernetes"], experience: "7 years", location: "Austin" },
    ]
  },
  {
    category: "Data Science",
    candidates: [
      { id: 4, name: "Emily Chen", score: 97, skills: ["Python", "TensorFlow", "SQL"], experience: "5 years", location: "Boston" },
      { id: 5, name: "David Kim", score: 94, skills: ["R", "PyTorch", "Big Data"], experience: "7 years", location: "Seattle" },
      { id: 6, name: "Olivia Johnson", score: 91, skills: ["Statistics", "Python", "Tableau"], experience: "4 years", location: "Chicago" },
    ]
  },
  {
    category: "UX/UI Design",
    candidates: [
      { id: 7, name: "Miguel Santos", score: 96, skills: ["Figma", "Adobe XD", "Prototyping"], experience: "6 years", location: "Los Angeles" },
      { id: 8, name: "Aisha Patel", score: 93, skills: ["UI Design", "Research", "Sketch"], experience: "5 years", location: "Toronto" },
      { id: 9, name: "Thomas Wright", score: 90, skills: ["Design Systems", "Interaction", "Usability"], experience: "7 years", location: "Portland" },
    ]
  },
  {
    category: "Marketing",
    candidates: [
      { id: 10, name: "Sophia Martinez", score: 94, skills: ["Digital Marketing", "SEO", "Analytics"], experience: "6 years", location: "Miami" },
      { id: 11, name: "Liam Johnson", score: 91, skills: ["Content Strategy", "Social Media", "Branding"], experience: "5 years", location: "Atlanta" },
      { id: 12, name: "Zoe Williams", score: 89, skills: ["Email Marketing", "Growth", "CRO"], experience: "4 years", location: "Denver" },
    ]
  },
  {
    category: "Product Management",
    candidates: [
      { id: 13, name: "Alex Rivera", score: 97, skills: ["Agile", "Roadmapping", "Analytics"], experience: "8 years", location: "San Diego" },
      { id: 14, name: "Jasmine Wong", score: 95, skills: ["Product Strategy", "UX", "B2B"], experience: "7 years", location: "Vancouver" },
      { id: 15, name: "Daniel Taylor", score: 92, skills: ["Growth", "Data Analysis", "User Research"], experience: "6 years", location: "Austin" },
    ]
  }
]

// Component for stat card
const StatCard = ({ title, value, icon, trend, changePercentage }: { title: string, value: number | string, icon: string, trend?: 'up' | 'down', changePercentage?: number }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        <span className="text-2xl">{icon}</span>
      </div>
      {trend && (
        <div className={`flex items-center ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
          <span className="text-sm font-medium">{changePercentage}%</span>
          <svg 
            className="w-5 h-5 ml-1" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d={trend === 'up' 
                ? "M12 7a1 1 0 01-1-1V5.414l-4.293 4.293a1 1 0 01-1.414-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L13 5.414V6a1 1 0 01-1 1z" 
                : "M12 13a1 1 0 011 1v1.586l4.293-4.293a1 1 0 011.414 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 011.414-1.414L11 15.586V14a1 1 0 011-1z"
              } 
              clipRule="evenodd" 
            />
          </svg>
        </div>
      )}
    </div>
    <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">{value}</h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{title}</p>
  </div>
)

// Component for candidate card
const CandidateCard = ({ candidate }: { candidate: any }) => {
  // Using randomuser.me API to generate consistent avatars based on candidate ID
  const imageUrl = `https://randomuser.me/api/portraits/men/${candidate.id}.jpg`;
  
  // State to track image loading errors
  const [imageError, setImageError] = React.useState(false);
  
  return (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0 mr-4">
        {!imageError ? (
          <Image 
            src={imageUrl}
            alt={candidate.name}
            width={48}
            height={48}
            className="rounded-full"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-medium ${getAvatarColor(candidate.name)}`}>
            {getInitials(candidate.name)}
          </div>
        )}
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {candidate.name}
        </p>
        <div className="flex flex-wrap gap-1 mt-1">
          {candidate.skills.slice(0, 2).map((skill: string, index: number) => (
            <span key={index} className="inline-block px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 2 && (
            <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
              +{candidate.skills.length - 2}
            </span>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 ml-2">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold">{candidate.score}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Job Posting
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total CVs" value={dashboardStats.totalCVs} icon="📄" trend="up" changePercentage={12} />
        <StatCard title="New Today" value={dashboardStats.newCVsToday} icon="🆕" />
        <StatCard title="Match Rate" value={`${dashboardStats.matchRate}%`} icon="🎯" trend="up" changePercentage={5} />
        <StatCard title="Average Score" value={dashboardStats.averageScore} icon="📊" />
        <StatCard title="Interviews" value={dashboardStats.interviewsScheduled} icon="🗓️" trend="up" changePercentage={8} />
        <StatCard title="Pending Review" value={dashboardStats.pendingReviews} icon="⏰" trend="down" changePercentage={3} />
      </div>

      {/* CV Processing Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">CV Processing Pipeline</h2>
          <div className="flex items-center space-x-2 text-sm">
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
              <span className="text-gray-500 dark:text-gray-400">Received</span>
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
              <span className="text-gray-500 dark:text-gray-400">Processing</span>
            </span>
            <span className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>
              <span className="text-gray-500 dark:text-gray-400">Matched</span>
            </span>
          </div>
        </div>
        
        <div className="h-80 flex items-center justify-center">
          <div className="w-full h-full flex items-end justify-between px-4">
            <div className="flex flex-col items-center">
              <div className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md" style={{ height: '65%' }}></div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Mon</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md" style={{ height: '40%' }}></div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Tue</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md" style={{ height: '80%' }}></div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Wed</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md" style={{ height: '50%' }}></div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Thu</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md" style={{ height: '70%' }}></div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Fri</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md" style={{ height: '30%' }}></div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Sat</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md" style={{ height: '20%' }}></div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Sun</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top candidates by category */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Top Candidates by Category</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {topCandidatesByCategory.map((category, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.category}</h3>
                <Link href={`/dashboard/candidates?category=${encodeURIComponent(category.category)}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
              </div>
              <div className="space-y-3">
                {category.candidates.map(candidate => (
                  <CandidateCard key={candidate.id} candidate={candidate} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
          <Link href="/dashboard/activities" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View all</Link>
        </div>
        
        <div className="space-y-4">
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-lg">📝</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">New candidate</span> applied for <span className="font-medium">Senior Developer</span> position</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10 minutes ago</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-lg">✅</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">Interview scheduled</span> with <span className="font-medium">Emily Chen</span> for Data Scientist position</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">30 minutes ago</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 text-lg">🔍</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">CV analysis completed</span> for 12 applicants</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">1 hour ago</p>
            </div>
          </div>
          
          <div className="flex">
            <div className="mr-4 flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-lg">🏆</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-900 dark:text-white"><span className="font-medium">New top candidate</span> identified for UX/UI Designer position</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}