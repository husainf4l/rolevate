# 🚀 Jobs API - Frontend Integration Guide

## Overview

The Rolevate Jobs API provides comprehensive job listing, search, filtering, and detailed job information for your frontend application. This guide covers all endpoints, request/response formats, and integration examples.

## 🌐 Base Configuration

```javascript
const API_BASE_URL = 'http://localhost:4005/api';

// Default headers for all requests
const defaultHeaders = {
  'Content-Type': 'application/json',
};
```

---

## 📋 API Endpoints

### 1. **Get All Jobs** (Public)

**`GET /api/jobs`**

Retrieve paginated job listings with advanced filtering and search capabilities.

#### Query Parameters

| Parameter         | Type    | Default     | Description                                                                      |
| ----------------- | ------- | ----------- | -------------------------------------------------------------------------------- |
| `search`          | string  | -           | Search in title, description, requirements, skills                               |
| `companyId`       | string  | -           | Filter by specific company                                                       |
| `experienceLevel` | enum    | -           | `ENTRY_LEVEL`, `JUNIOR`, `MID_LEVEL`, `SENIOR`, `LEAD`, `PRINCIPAL`, `EXECUTIVE` |
| `workType`        | enum    | -           | `ONSITE`, `REMOTE`, `HYBRID`                                                     |
| `location`        | string  | -           | Filter by location (partial match)                                               |
| `isActive`        | boolean | -           | Filter by active status                                                          |
| `isFeatured`      | boolean | -           | Filter by featured status                                                        |
| `page`            | number  | 1           | Page number (1-based)                                                            |
| `limit`           | number  | 10          | Items per page (max 100)                                                         |
| `sortBy`          | string  | `createdAt` | Sort field                                                                       |
| `sortOrder`       | enum    | `desc`      | `asc` or `desc`                                                                  |

#### Example Request

```javascript
const getJobs = async (filters = {}) => {
  const queryParams = new URLSearchParams();

  // Add filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/jobs?${queryParams}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  return response.json();
};

// Usage examples
const allJobs = await getJobs();

const filteredJobs = await getJobs({
  search: 'backend developer',
  experienceLevel: 'MID_LEVEL',
  workType: 'REMOTE',
  location: 'Dubai',
  page: 1,
  limit: 20,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});
```

#### Response Format

```json
{
  "jobs": [
    {
      "id": "398c4ff8-05ad-4ed5-960a-ef2e7a727321",
      "title": "Senior Backend Developer - Fintech",
      "description": "We are seeking an experienced Backend Developer...",
      "requirements": "5+ years of experience with Node.js, TypeScript...",
      "responsibilities": "Design and implement scalable backend systems...",
      "benefits": "Competitive salary, health insurance, remote work...",
      "skills": ["Node.js", "TypeScript", "PostgreSQL", "AWS"],
      "experienceLevel": "SENIOR",
      "location": "Dubai, UAE",
      "workType": "HYBRID",
      "salaryMin": 15000,
      "salaryMax": 25000,
      "currency": "AED",
      "isActive": true,
      "isFeatured": false,
      "viewCount": 1,
      "applicationCount": 1,
      "createdAt": "2025-06-10T19:34:44.695Z",
      "updatedAt": "2025-06-11T00:26:07.418Z",
      "expiresAt": "2025-07-10T19:34:44.695Z",
      "publishedAt": "2025-06-10T19:34:44.695Z",
      "company": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Roxate Ltd",
        "displayName": "Roxate Technologies",
        "logo": "https://roxate.com/logo.png",
        "location": "Dubai, UAE",
        "industry": "Financial Technology"
      },
      "createdBy": {
        "id": "user-123",
        "name": "Husain Abdullah",
        "username": "husain"
      }
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 2. **Get Featured Jobs** (Public)

**`GET /api/jobs/featured`**

Get featured jobs for homepage or promotional sections.

#### Query Parameters

| Parameter | Type   | Default | Description                       |
| --------- | ------ | ------- | --------------------------------- |
| `limit`   | number | 6       | Number of featured jobs to return |

#### Example Request

```javascript
const getFeaturedJobs = async (limit = 6) => {
  const response = await fetch(`${API_BASE_URL}/jobs/featured?limit=${limit}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  return response.json();
};

// Usage
const featuredJobs = await getFeaturedJobs(8);
```

#### Response Format

```json
[
  {
    "id": "job-id",
    "title": "Featured Job Title",
    "description": "Job description..."
    // ... same structure as jobs list items
  }
]
```

---

### 3. **Get Job Statistics** (Public)

**`GET /api/jobs/stats`**

Get job statistics and analytics for dashboards.

#### Example Request

```javascript
const getJobStats = async () => {
  const response = await fetch(`${API_BASE_URL}/jobs/stats`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  return response.json();
};

// Usage
const jobStats = await getJobStats();
```

#### Response Format

```json
{
  "totalJobs": 3,
  "activeJobs": 3,
  "featuredJobs": 0,
  "totalApplications": 3,
  "recentJobs": 3,
  "distribution": {
    "byExperience": [
      {
        "level": "SENIOR",
        "count": 2
      },
      {
        "level": "MID_LEVEL",
        "count": 1
      }
    ],
    "byWorkType": [
      {
        "type": "HYBRID",
        "count": 2
      },
      {
        "type": "ONSITE",
        "count": 1
      }
    ]
  }
}
```

---

### 4. **Get Job Details** (Public)

**`GET /api/jobs/:id`**

Get detailed information about a specific job, including AI interview configuration and recent applications.

#### Example Request

```javascript
const getJobDetails = async (jobId) => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'GET',
    headers: defaultHeaders,
  });

  if (!response.ok) {
    throw new Error(`Job not found: ${response.status}`);
  }

  return response.json();
};

// Usage
const jobDetails = await getJobDetails('398c4ff8-05ad-4ed5-960a-ef2e7a727321');
```

#### Response Format

```json
{
  "id": "398c4ff8-05ad-4ed5-960a-ef2e7a727321",
  "title": "Senior Backend Developer - Fintech",
  "description": "Complete job description...",
  "requirements": "Detailed requirements...",
  "responsibilities": "List of responsibilities...",
  "benefits": "Company benefits...",
  "skills": ["Node.js", "TypeScript", "PostgreSQL"],
  "experienceLevel": "SENIOR",
  "location": "Dubai, UAE",
  "workType": "HYBRID",
  "salaryMin": 15000,
  "salaryMax": 25000,
  "currency": "AED",
  "isActive": true,
  "isFeatured": false,
  "viewCount": 2,
  "applicationCount": 1,
  "createdAt": "2025-06-10T19:34:44.695Z",
  "updatedAt": "2025-06-11T00:26:07.418Z",
  "expiresAt": "2025-07-10T19:34:44.695Z",
  "publishedAt": "2025-06-10T19:34:44.695Z",
  "company": {
    "id": "company-id",
    "name": "Roxate Ltd",
    "displayName": "Roxate Technologies",
    "logo": "https://roxate.com/logo.png",
    "location": "Dubai, UAE",
    "industry": "Financial Technology"
  },
  "createdBy": {
    "id": "user-id",
    "name": "Husain Abdullah",
    "username": "husain"
  },
  "technicalQuestions": [
    "Explain the event loop in Node.js",
    "How do you handle database transactions?"
  ],
  "behavioralQuestions": [
    "Tell me about a challenging project you worked on",
    "How do you handle tight deadlines?"
  ],
  "enableAiInterview": true,
  "aiPrompt": null,
  "interviewDuration": 30,
  "applications": [
    {
      "id": "application-id",
      "status": "CV_APPROVED",
      "appliedAt": "2025-06-10T19:34:44.708Z",
      "candidate": {
        "id": "candidate-id",
        "name": "Ahmad Al-Rashid",
        "email": "ahmad.rashid@email.com"
      }
    }
  ]
}
```

---

## 🎨 Frontend Integration Examples

### React Hook for Jobs

```javascript
import { useState, useEffect } from 'react';

const useJobs = (initialFilters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJobs = async (filters = initialFilters) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getJobs(filters);
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return {
    jobs,
    pagination,
    loading,
    error,
    refetch: fetchJobs,
  };
};

// Usage in component
const JobsList = () => {
  const { jobs, pagination, loading, error, refetch } = useJobs();
  const [filters, setFilters] = useState({});

  const handleSearch = (searchTerm) => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    refetch(newFilters);
  };

  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    refetch(newFilters);
  };

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Search and filters */}
      <input
        placeholder="Search jobs..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      <select
        onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
      >
        <option value="">All Experience Levels</option>
        <option value="ENTRY_LEVEL">Entry Level</option>
        <option value="JUNIOR">Junior</option>
        <option value="MID_LEVEL">Mid Level</option>
        <option value="SENIOR">Senior</option>
      </select>

      <select onChange={(e) => handleFilterChange('workType', e.target.value)}>
        <option value="">All Work Types</option>
        <option value="ONSITE">On-site</option>
        <option value="REMOTE">Remote</option>
        <option value="HYBRID">Hybrid</option>
      </select>

      {/* Jobs list */}
      <div className="jobs-grid">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          current={pagination.page}
          total={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};
```

### Job Card Component

```javascript
const JobCard = ({ job }) => {
  return (
    <div className="job-card">
      <div className="job-header">
        <img src={job.company.logo} alt={job.company.name} />
        <div>
          <h3>{job.title}</h3>
          <p>{job.company.displayName || job.company.name}</p>
          <p>{job.location}</p>
        </div>
      </div>

      <div className="job-details">
        <div className="badges">
          <span className="experience-badge">{job.experienceLevel}</span>
          <span className="work-type-badge">{job.workType}</span>
          {job.isFeatured && <span className="featured-badge">Featured</span>}
        </div>

        <p className="description">{job.description.substring(0, 150)}...</p>

        <div className="skills">
          {job.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="skill-tag">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && <span>+{job.skills.length - 3} more</span>}
        </div>

        {job.salaryMin && job.salaryMax && (
          <div className="salary">
            {job.currency} {job.salaryMin.toLocaleString()} -{' '}
            {job.salaryMax.toLocaleString()}
          </div>
        )}

        <div className="job-footer">
          <span className="applications">
            {job.applicationCount} applications
          </span>
          <span className="views">{job.viewCount} views</span>
          <button onClick={() => viewJobDetails(job.id)}>View Details</button>
        </div>
      </div>
    </div>
  );
};
```

### Job Details Page

```javascript
const JobDetailsPage = ({ jobId }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const jobData = await getJobDetails(jobId);
        setJob(jobData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  if (loading) return <div>Loading job details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="job-details-page">
      <div className="job-header">
        <h1>{job.title}</h1>
        <div className="company-info">
          <img src={job.company.logo} alt={job.company.name} />
          <div>
            <h2>{job.company.displayName || job.company.name}</h2>
            <p>{job.company.location}</p>
            <p>{job.company.industry}</p>
          </div>
        </div>
      </div>

      <div className="job-content">
        <div className="main-content">
          <section>
            <h3>Job Description</h3>
            <p>{job.description}</p>
          </section>

          <section>
            <h3>Requirements</h3>
            <p>{job.requirements}</p>
          </section>

          {job.responsibilities && (
            <section>
              <h3>Responsibilities</h3>
              <p>{job.responsibilities}</p>
            </section>
          )}

          {job.benefits && (
            <section>
              <h3>Benefits</h3>
              <p>{job.benefits}</p>
            </section>
          )}

          <section>
            <h3>Required Skills</h3>
            <div className="skills-list">
              {job.skills.map((skill) => (
                <span key={skill} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {job.enableAiInterview && (
            <section>
              <h3>AI Interview</h3>
              <p>This position includes an AI-powered interview session.</p>
              <p>Duration: {job.interviewDuration} minutes</p>
              {job.technicalQuestions && (
                <div>
                  <h4>Sample Technical Questions:</h4>
                  <ul>
                    {job.technicalQuestions.map((q, index) => (
                      <li key={index}>{q}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </div>

        <div className="sidebar">
          <div className="job-meta">
            <div className="meta-item">
              <strong>Experience Level:</strong>
              <span>{job.experienceLevel}</span>
            </div>
            <div className="meta-item">
              <strong>Work Type:</strong>
              <span>{job.workType}</span>
            </div>
            <div className="meta-item">
              <strong>Location:</strong>
              <span>{job.location}</span>
            </div>
            {job.salaryMin && (
              <div className="meta-item">
                <strong>Salary:</strong>
                <span>
                  {job.currency} {job.salaryMin.toLocaleString()} -{' '}
                  {job.salaryMax.toLocaleString()}
                </span>
              </div>
            )}
            <div className="meta-item">
              <strong>Posted:</strong>
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
            {job.expiresAt && (
              <div className="meta-item">
                <strong>Expires:</strong>
                <span>{new Date(job.expiresAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          <button className="apply-button">Apply Now</button>

          <div className="job-stats">
            <p>{job.applicationCount} applications</p>
            <p>{job.viewCount} views</p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🏷️ Enums and Constants

```javascript
// Experience Levels
export const EXPERIENCE_LEVELS = {
  ENTRY_LEVEL: 'Entry Level',
  JUNIOR: 'Junior',
  MID_LEVEL: 'Mid Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  PRINCIPAL: 'Principal',
  EXECUTIVE: 'Executive',
};

// Work Types
export const WORK_TYPES = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
};

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'Pending',
  CV_SCREENING: 'CV Screening',
  CV_APPROVED: 'CV Approved',
  CV_REJECTED: 'CV Rejected',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  INTERVIEW_IN_PROGRESS: 'Interview In Progress',
  INTERVIEW_COMPLETED: 'Interview Completed',
  UNDER_REVIEW: 'Under Review',
  SHORTLISTED: 'Shortlisted',
  FINAL_INTERVIEW: 'Final Interview',
  OFFER_EXTENDED: 'Offer Extended',
  OFFER_ACCEPTED: 'Offer Accepted',
  OFFER_DECLINED: 'Offer Declined',
  HIRED: 'Hired',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
  ON_HOLD: 'On Hold',
};
```

---

## 🎯 Key Features

### ✅ **Implemented Features**

- **Advanced Search**: Full-text search across job titles, descriptions, requirements, and skills
- **Multi-level Filtering**: Filter by company, experience level, work type, location, and status
- **Pagination**: Efficient pagination with configurable page sizes
- **Sorting**: Sort by any field in ascending or descending order
- **View Tracking**: Automatic view count increment when viewing job details
- **Featured Jobs**: Special endpoint for highlighted job postings
- **Real-time Statistics**: Job analytics and distribution data
- **AI Interview Integration**: AI interview configuration and questions display
- **Application Tracking**: View recent applications and candidate information

### 🔧 **Technical Features**

- **Public Endpoints**: No authentication required for job browsing
- **Optimized Queries**: Efficient database queries with proper indexing
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Proper HTTP status codes and error messages
- **Type Safety**: Full TypeScript support with proper types
- **Flexible Filtering**: Boolean, string, and enum-based filtering options

---

## 🚨 Error Handling

```javascript
const handleApiError = (error, response) => {
  if (response?.status === 404) {
    return 'Job not found';
  } else if (response?.status === 400) {
    return 'Invalid request parameters';
  } else if (response?.status >= 500) {
    return 'Server error. Please try again later.';
  } else {
    return error.message || 'An unexpected error occurred';
  }
};

// Usage in API calls
try {
  const job = await getJobDetails(jobId);
  return job;
} catch (error) {
  const errorMessage = handleApiError(error, error.response);
  throw new Error(errorMessage);
}
```

---

## 📱 Responsive Design Tips

```css
/* Jobs grid layout */
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

/* Job card responsive design */
.job-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.2s ease;
}

.job-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .jobs-grid {
    grid-template-columns: 1fr;
    padding: 0.5rem;
  }

  .job-details-page {
    flex-direction: column;
  }

  .sidebar {
    order: -1;
    margin-bottom: 2rem;
  }
}
```

---

## 🔗 Related APIs

- **Authentication API**: For user login and session management
- **Application API**: For job applications and candidate management
- **LiveKit API**: For AI interview integration
- **Public Interview API**: For candidate interview access

---

## 📞 Support

For questions or issues with the Jobs API integration, please refer to:

- **API Documentation**: Complete endpoint documentation
- **Error Codes**: HTTP status code meanings and troubleshooting
- **Example Applications**: Reference implementations
- **Development Support**: Contact the backend development team

---

**🎉 Happy coding! The Jobs API is ready for production use with all the features your recruitment platform needs.**
