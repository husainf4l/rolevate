# Job Application Page

This directory contains the job application page for the Rolevate platform.

## Route

`/jobs/[slug]/apply` - Job application page for a specific job

## Features

### 1. **Job Information Display**
- Shows the job title, company, location, and job type
- Provides context about the position being applied for

### 2. **Application Form**
Comprehensive form with the following sections:

#### Personal Information
- Full Name (required)
- Email Address (required)
- Phone Number (required)
- LinkedIn Profile (optional)
- Portfolio/Website (optional)

#### Resume/CV Upload
- File upload with drag-and-drop support
- Accepts PDF and Word documents (.pdf, .doc, .docx)
- Maximum file size: 5MB
- Real-time validation

#### Cover Letter (Optional)
- Text area for detailed cover letter
- No minimum length requirement
- Helps candidates explain their interest and qualifications

#### Additional Information
- Notice Period (optional)

### 3. **Form Validation**
- Client-side validation for all required fields
- Email format validation
- File type and size validation
- Inline error messages
- Clear error feedback

### 4. **Authentication Flow**
- **Anonymous Applications Supported**: Users can apply without creating an account
- Pre-fills form data for authenticated users
- Shows information banner for guest users about account benefits
- Encourages account creation for application tracking
- Different success flow for authenticated vs. anonymous users

### 5. **User Experience**
- Loading states with skeleton loaders
- Error handling with clear messages
- Success confirmation with redirect options
- Responsive design for all screen sizes
- Breadcrumb navigation

### 6. **Success State**
After successful submission:
- Success confirmation message
- For **Authenticated Users**:
  - Option to view applications in user dashboard
  - Option to browse more jobs
- For **Anonymous Users**:
  - Tip about creating an account to track applications
  - Call-to-action to create account
  - Option to browse more jobs

## Usage

### From Job Detail Page
Users can click the "Apply Now" button on any job detail page to access the application form.

### Direct Access
Navigate to `/jobs/[job-slug]/apply` directly

## Technical Details

### Dependencies
- `@/services/jobs.service` - Fetches job details
- `@/services/application` - Handles application submission
- `@/hooks/useAuth` - Authentication state management
- UI components from `@/components/ui`

### Form State Management
Uses React's `useState` for form data and validation errors.

### File Handling
- File validation on selection
- File size limit: 5MB
- Supported formats: PDF, DOC, DOCX
- **Base64 encoding** for upload (Apollo Server 5 compatible)
- Uploads to S3 via GraphQL mutation

### Resume Upload Process
1. User selects file
2. File is validated (type and size)
3. File is converted to base64 string
4. Base64 is sent to GraphQL `uploadFileToS3` mutation
5. Server decodes, uploads to S3, returns URL
6. Application is created with resume URL

See [RESUME_UPLOAD_IMPLEMENTATION.md](/RESUME_UPLOAD_IMPLEMENTATION.md) for details.

## Future Enhancements

### TODO
1. **✅ Resume Upload Implementation - COMPLETED**
   - ✅ Implemented base64 file upload
   - ✅ Uploads to S3 via GraphQL
   - ✅ Returns resume URL
   - ⏳ TODO: Pass resume URL to application mutation (waiting for backend support)

2. **Extended Application Mutation**
   - Update GraphQL mutation to accept additional fields:
     - coverLetter
     - expectedSalary
     - noticePeriod
     - phone
     - linkedIn
     - portfolio
     - location

3. **Auto-save Draft**
   - Save application progress in local storage
   - Allow users to resume incomplete applications

4. **Profile Pre-fill**
   - Auto-fill form from candidate profile if exists
   - Suggest previously used information

5. **Application Preview**
   - Allow users to preview their application before submission
   - Edit option after preview

6. **Email Notifications**
   - Send confirmation email to applicant
   - Notify company of new application

7. **Application Tracking**
   - Generate tracking number
   - Allow applicants to check status

8. **Social Media Authentication**
   - Quick apply with LinkedIn
   - Import resume from LinkedIn

## Notes

- Currently, the file upload is validated but not actually uploaded to a server
- The application mutation only accepts `jobId` currently
- Session storage is used to preserve application data during authentication redirect
- The page requires the job slug to be valid and the job to exist
