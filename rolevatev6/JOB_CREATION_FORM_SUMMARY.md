# Multi-Step Job Creation Form with AI Enhancement

## Overview
A comprehensive, AI-powered job creation form with 7 steps, built with Next.js, GraphQL, and shadcn/ui components.

## Features

### 🎨 Design & UI
- **Clean Apple-style design** with primary color branding
- **Multi-step progress indicator** with animated transitions
- **Responsive layout** optimized for all screen sizes
- **Modern components** using shadcn/ui library
- **Gradient accents** using primary-600 to primary-700
- **Smooth animations** and transitions throughout

### 🤖 AI-Powered Enhancements
1. **Job Title Enhancement** - `rewriteJobTitle` mutation
2. **Job Description Enhancement** - `rewriteJobDescription` mutation
3. **Requirements Polishing** - `polishRequirements` mutation
4. **Responsibilities Enhancement** - `polishResponsibilities` mutation
5. **Benefits Enhancement** - `polishBenefits` mutation
6. **Skills Suggestions** - `suggestSkills` mutation
7. **Qualifications Enhancement** - `polishQualifications` mutation

### 📝 Form Steps

#### Step 1: Basic Information
- Job Title (with AI enhancement)
- Job Type (Full Time, Part Time, Contract, Remote)
- Work Type (Onsite, Remote, Hybrid)
- Job Level (Entry, Mid, Senior, Executive)

#### Step 2: Compensation & Timeline
- Salary Range (Min/Max with AI suggestions)
- Experience Required (years)
- Application Deadline
- Number of Openings

#### Step 3: Job Details
- Job Description (with AI enhancement)
- Key Responsibilities (with AI enhancement)
- Location

#### Step 4: Requirements & Skills
- Requirements/Qualifications (with AI enhancement)
- Required Skills (with AI suggestions - adds as tags)

#### Step 5: Benefits & Company
- Benefits & Perks (with AI enhancement)
- Company Culture description

#### Step 6: AI Settings (Optional)
- AI Model selection
- Tone customization (Professional, Friendly, Casual, Formal, Enthusiastic)
- Temperature control (0.1 - 1.0)
- Enable/disable AI features

#### Step 7: Review & Publish
- Complete preview of all entered data
- Save as Draft option
- Publish Job option
- Edit capability for any section

## GraphQL Integration

### Endpoint
```
http://localhost:4005/graphql
```

### Main Mutation
```graphql
mutation CreateJob($input: CreateJobInput!) {
  createJob(input: $input) {
    id
    title
    slug
    status
    createdAt
  }
}
```

### AI Enhancement Mutations

#### 1. Rewrite Job Title
```graphql
mutation RewriteJobTitle($input: JobTitleRewriteRequestDto!) {
  rewriteJobTitle(input: $input) {
    rewrittenTitle
    originalTitle
  }
}
```

#### 2. Rewrite Job Description
```graphql
mutation RewriteJobDescription($input: JobDescriptionRewriteInput!) {
  rewriteJobDescription(input: $input) {
    rewrittenDescription
    originalDescription
  }
}
```

#### 3. Polish Requirements
```graphql
mutation PolishRequirements($input: RequirementsPolishRequestDto!) {
  polishRequirements(input: $input) {
    polishedRequirements
    originalRequirements
  }
}
```

#### 4. Polish Responsibilities
```graphql
mutation PolishResponsibilities($input: PolishResponsibilitiesInput!) {
  polishResponsibilities(input: $input) {
    polishedResponsibilities
    originalResponsibilities
  }
}
```

#### 5. Polish Benefits
```graphql
mutation PolishBenefits($input: PolishBenefitsInput!) {
  polishBenefits(input: $input) {
    polishedBenefits
    originalBenefits
  }
}
```

#### 6. Suggest Skills
```graphql
mutation SuggestSkills($input: SuggestSkillsInput!) {
  suggestSkills(input: $input) {
    skills
  }
}
```

#### 7. Polish Qualifications
```graphql
mutation PolishQualifications($input: PolishQualificationsInput!) {
  polishQualifications(input: $input) {
    polishedQualifications
    originalQualifications
  }
}
```

## Input Schema

### CreateJobInput
```typescript
{
  title: string;              // Required
  description: string;        // Required
  location: string;          // Required
  type: JobType;            // Required (FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP)
  workType: WorkType;       // Required (REMOTE, HYBRID, ONSITE)
  jobLevel: JobLevel;       // Required (ENTRY, MID, SENIOR, LEAD, EXECUTIVE)
  salaryMin?: number;       // Optional
  salaryMax?: number;       // Optional
  skills: string[];         // Array of skills
  requirements?: string;    // Optional
  responsibilities?: string; // Optional
  benefits?: string;        // Optional
  experienceYears?: number; // Optional
  numberOfOpenings?: number; // Optional
  applicationDeadline?: string; // ISO date string
  status?: JobStatus;       // DRAFT, PUBLISHED, CLOSED, ARCHIVED
  postedById: string;       // User ID
}
```

## AI Settings

### Available AI Models
- gpt-4o
- gpt-4o-mini
- gpt-4-turbo

### Tone Options
- Professional (default)
- Friendly
- Casual
- Formal
- Enthusiastic

### Temperature Range
- Min: 0.1 (more focused and deterministic)
- Max: 1.0 (more creative and diverse)
- Default: 0.7

## Key Features

### 1. Form Validation
- Required fields marked with red asterisk
- Client-side validation before submission
- Error messages displayed clearly

### 2. Skills Management
- Dynamic skill tags
- Add/remove skills with visual feedback
- AI-powered skill suggestions based on job title and description

### 3. AI Enhancement Workflow
1. User enters initial content
2. Clicks "AI Enhance" button
3. Loading state shows with spinner
4. AI-generated content replaces original
5. User can further edit if needed

### 4. Progress Tracking
- Visual step indicator with completion marks
- Current step highlighted with ring effect
- Completed steps show checkmark icon
- Gradient progress bars between steps

### 5. Navigation
- Next/Previous buttons with icons
- Keyboard-friendly navigation
- Auto-scroll to top on step change

### 6. Review Step
- Comprehensive preview of all data
- Organized in sections
- Edit capability for each section
- Visual indicators for empty fields

## Styling Details

### Color Scheme
- Primary: `primary-600` to `primary-700`
- Gradients: `from-primary-600 to-primary-700`
- Shadows: `shadow-primary-200`
- Accents: `ring-primary-200` for focus states

### Component Styling
- **Buttons**: Rounded-xl, gradient backgrounds, shadow effects
- **Inputs**: Rounded-xl borders, primary-500 focus rings
- **Cards**: Rounded-3xl with shadow-2xl
- **Select**: Rounded-xl with transition effects
- **Labels**: Font-medium, text-gray-700

### Animations
- 200ms duration for smooth transitions
- Scale effect on current step indicator
- Hover effects on interactive elements
- Loading spinners for AI operations

## File Location
```
/home/husain/rolevate/rolevatev6/src/app/dashboard/jobs/create/page.tsx
```

## Dependencies
- Next.js (App Router)
- React
- Apollo Client (@apollo/client)
- GraphQL (gql)
- lucide-react (icons)
- shadcn/ui components:
  - Button
  - Input
  - Label
  - Textarea
  - Card
  - Select
  - Badge

## Usage

### Creating a Job
1. Navigate to `/dashboard/jobs/create`
2. Fill in basic information (Step 1)
3. Use AI enhance buttons to improve content
4. Progress through all 7 steps
5. Review on final step
6. Choose "Save as Draft" or "Publish Job"

### AI Enhancement Tips
- Enter initial content before using AI
- Provide job title and description for better AI suggestions
- Customize AI settings for specific tone/style
- Edit AI-generated content as needed

## Future Enhancements
- [ ] Auto-save drafts
- [ ] Template library
- [ ] Bulk job creation
- [ ] Job duplication
- [ ] Custom AI prompts
- [ ] Preview in different formats
- [ ] Integration with ATS systems
- [ ] Analytics for job performance

## Best Practices
1. Always use AI enhancement for professional content
2. Review AI suggestions before publishing
3. Add specific skills relevant to your industry
4. Set realistic salary ranges
5. Include comprehensive benefits information
6. Save as draft while working on complex postings
7. Use professional tone for executive positions
8. Be specific in requirements and qualifications

---

**Last Updated**: October 17, 2025
**Status**: Production Ready ✅
**Version**: 1.0.0
