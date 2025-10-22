# RoleVate Models Documentation

This directory contains all the data models for the RoleVate application, following Flutter/Dart best practices.

## Model Structure

### Enums (`enums.dart`)

All enumeration types with helper methods for JSON serialization and display names:

#### UserType
- `SYSTEM` - System user
- `CANDIDATE` - Job seeker
- `BUSINESS` - Company/employer
- `ADMIN` - Administrator

#### JobType
- `FULL_TIME` - Full-time position
- `PART_TIME` - Part-time position
- `CONTRACT` - Contract-based
- `REMOTE` - Remote position

#### JobLevel
- `ENTRY` - Entry level
- `MID` - Mid level
- `SENIOR` - Senior level
- `EXECUTIVE` - Executive level

#### WorkType
- `ONSITE` - On-site work
- `REMOTE` - Remote work
- `HYBRID` - Hybrid (mix of onsite and remote)

#### JobStatus
- `DRAFT` - Job not yet published
- `ACTIVE` - Job is active and accepting applications
- `PAUSED` - Job temporarily paused
- `CLOSED` - Job closed manually
- `EXPIRED` - Job deadline passed
- `DELETED` - Job soft deleted

#### ApplicationStatus
- `PENDING` - Application submitted, awaiting review
- `REVIEWED` - Application reviewed by company
- `SHORTLISTED` - Candidate shortlisted
- `INTERVIEWED` - Candidate interviewed
- `OFFERED` - Job offer extended
- `HIRED` - Candidate hired
- `ANALYZED` - AI analysis completed
- `REJECTED` - Application rejected
- `WITHDRAWN` - Application withdrawn by candidate

---

### User Model (`user.dart`)

Represents both candidate and business users.

**Fields:**
- `id` (String, required) - Unique identifier
- `userType` (UserType, required) - Type of user
- `email` (String?, optional) - User email
- `name` (String?, optional) - User full name
- `phone` (String?, optional) - Contact phone
- `avatar` (String?, optional) - Avatar URL
- `isActive` (bool, required) - Account status
- `company` (Company?, optional) - Associated company (for business users)
- `createdAt` (DateTime, required) - Creation timestamp
- `updatedAt` (DateTime, required) - Last update timestamp

**Methods:**
- `fromJson(Map<String, dynamic>)` - Create from JSON
- `toJson()` - Convert to JSON
- `copyWith(...)` - Create modified copy
- `get initials` - Get user initials for avatar
- `get isBusiness` - Check if business user
- `get isCandidate` - Check if candidate
- `get isAdmin` - Check if admin

---

### Company Model (`company.dart`)

Represents a company/employer.

**Fields:**
- `id` (String, required) - Unique identifier
- `name` (String, required) - Company name
- `description` (String?, optional) - Company description
- `website` (String?, optional) - Company website
- `email` (String?, optional) - Contact email
- `phone` (String?, optional) - Contact phone
- `logo` (String?, optional) - Logo URL
- `industry` (String?, optional) - Industry sector
- `size` (String?, optional) - Company size
- `founded` (DateTime?, optional) - Founded date
- `location` (String?, optional) - Location
- `addressId` (String?, optional) - Address reference
- `createdAt` (DateTime, required) - Creation timestamp
- `updatedAt` (DateTime, required) - Last update timestamp

**Methods:**
- `fromJson(Map<String, dynamic>)` - Create from JSON
- `toJson()` - Convert to JSON
- `copyWith(...)` - Create modified copy

---

### Job Model (`job.dart`)

Represents a job posting.

**Fields:**
- `id` (String, required) - Unique identifier
- `slug` (String, required) - URL-friendly identifier
- `title` (String, required) - Job title
- `department` (String, required) - Department
- `location` (String, required) - Job location
- `salary` (String, required) - Salary range
- `type` (JobType, required) - Job type
- `deadline` (DateTime, required) - Application deadline
- `description` (String, required) - Full description
- `shortDescription` (String, required) - Brief summary
- `responsibilities` (String, required) - Job responsibilities
- `requirements` (String, required) - Job requirements
- `benefits` (String, required) - Benefits offered
- `skills` (List<String>, required) - Required skills
- `experience` (String, required) - Experience requirement
- `education` (String, required) - Education requirement
- `jobLevel` (JobLevel, required) - Job level
- `workType` (WorkType, required) - Work type
- `industry` (String, required) - Industry
- `companyDescription` (String, required) - Company info
- `status` (JobStatus, required) - Job status
- `company` (Company, required) - Company posting the job
- `cvAnalysisPrompt` (String?, optional) - AI CV analysis prompt
- `interviewPrompt` (String?, optional) - AI interview prompt
- `aiSecondInterviewPrompt` (String?, optional) - AI second interview prompt
- `interviewLanguage` (String, required) - Interview language
- `featured` (bool, required) - Is featured job
- `applicants` (double, required) - Number of applicants
- `views` (double, required) - Number of views
- `featuredJobs` (bool, required) - Is in featured list
- `createdAt` (DateTime, required) - Creation timestamp
- `updatedAt` (DateTime, required) - Last update timestamp
- `postedBy` (User, required) - User who posted the job

**Methods:**
- `fromJson(Map<String, dynamic>)` - Create from JSON
- `toJson()` - Convert to JSON
- `get isExpired` - Check if deadline passed
- `get isActive` - Check if job is active
- `get daysRemaining` - Days until deadline
- `get formattedDeadline` - Human-readable deadline

---

### Application Model (`application.dart`)

Represents a job application.

**Fields:**
- `id` (String, required) - Unique identifier
- `job` (Job, required) - Job being applied for
- `candidate` (User, required) - Applicant
- `status` (ApplicationStatus, required) - Application status
- `appliedAt` (DateTime, required) - Application date
- `coverLetter` (String?, optional) - Cover letter
- `resumeUrl` (String?, optional) - Resume URL
- `expectedSalary` (String?, optional) - Expected salary
- `noticePeriod` (String?, optional) - Notice period
- `cvAnalysisScore` (double?, optional) - CV analysis score
- `cvScore` (double?, optional) - CV score
- `firstInterviewScore` (double?, optional) - First interview score
- `secondInterviewScore` (double?, optional) - Second interview score
- `finalScore` (double?, optional) - Final score
- `cvAnalysisResults` (Map?, optional) - CV analysis results
- `analyzedAt` (DateTime?, optional) - Analysis timestamp
- `aiCvRecommendations` (String?, optional) - AI CV recommendations
- `aiInterviewRecommendations` (String?, optional) - AI interview recommendations
- `aiSecondInterviewRecommendations` (String?, optional) - AI second interview recommendations
- `recommendationsGeneratedAt` (DateTime?, optional) - Recommendations timestamp
- `companyNotes` (String?, optional) - Company notes
- `source` (String?, optional) - Application source
- `notes` (String?, optional) - General notes
- `aiAnalysis` (Map?, optional) - AI analysis data
- `interviewScheduled` (bool, required) - Interview scheduled flag
- `reviewedAt` (DateTime?, optional) - Review timestamp
- `interviewScheduledAt` (DateTime?, optional) - Interview schedule timestamp
- `interviewedAt` (DateTime?, optional) - Interview timestamp
- `rejectedAt` (DateTime?, optional) - Rejection timestamp
- `acceptedAt` (DateTime?, optional) - Acceptance timestamp
- `interviewLanguage` (String, required) - Interview language
- `createdAt` (DateTime, required) - Creation timestamp
- `updatedAt` (DateTime, required) - Last update timestamp

**Methods:**
- `fromJson(Map<String, dynamic>)` - Create from JSON
- `toJson()` - Convert to JSON
- `get overallScore` - Calculate average score
- `get isPending` - Check if pending
- `get isInProgress` - Check if in progress
- `get isSuccessful` - Check if successful
- `get isClosed` - Check if closed
- `get daysSinceApplied` - Days since application

---

## Usage

Import all models:
```dart
import 'package:rolevateapp/models/models.dart';
```

Or import specific models:
```dart
import 'package:rolevateapp/models/user.dart';
import 'package:rolevateapp/models/job.dart';
```

### Examples

#### Creating a User from JSON:
```dart
final userData = {
  'id': '123',
  'userType': 'CANDIDATE',
  'email': 'john@example.com',
  'name': 'John Doe',
  'isActive': true,
  'createdAt': '2025-01-01T00:00:00Z',
  'updatedAt': '2025-01-01T00:00:00Z',
};

final user = User.fromJson(userData);
print(user.isCandidate); // true
print(user.initials); // JD
```

#### Creating a Job:
```dart
final jobData = await graphQLClient.query(...);
final job = Job.fromJson(jobData);

print(job.isActive); // true/false
print(job.formattedDeadline); // "Expires in 5 days"
print(job.company.name); // "TechCorp"
```

#### Working with Applications:
```dart
final application = Application.fromJson(applicationData);

print(application.status.displayName); // "Shortlisted"
print(application.overallScore); // 8.5
print(application.isPending); // false
print(application.daysSinceApplied); // 3
```

---

## Best Practices

1. **Immutability**: All models are immutable. Use `copyWith()` to create modified versions.

2. **Null Safety**: All fields are properly typed with null safety.

3. **Type Safety**: Use enums instead of strings for status fields.

4. **JSON Serialization**: All models support `fromJson()` and `toJson()`.

5. **Validation**: Enum parsing throws `ArgumentError` for invalid values.

6. **Computed Properties**: Use getters for derived data (e.g., `isExpired`, `overallScore`).

7. **Equality**: Models implement `==` and `hashCode` based on `id`.

---

## GraphQL Schema Mapping

These models directly map to the GraphQL schema from the backend API at `http://192.168.1.210:4005/api/graphql`.

All field names and types match the GraphQL schema exactly for seamless data integration.
