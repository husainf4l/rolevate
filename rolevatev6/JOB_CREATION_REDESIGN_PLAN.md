# Job Creation Page Redesign Plan

## Overview
Recreate the job creation page following the old application's proven structure but with modern GraphQL integration and Apple-style design.

## Key Features from Old App
1. **Multi-step wizard** with 5 steps:
   - Basic Information
   - Job Details
   - Interview Questions (optional)
   - AI Configuration
   - Preview & Publish

2. **AI-Powered Features**:
   - Job analysis generation (description, requirements, skills)
   - Title regeneration
   - Description rewriting
   - Requirements polishing
   - Benefits enhancement
   - Responsibilities improvement
   - AI prompts auto-generation

3. **Smart Defaults**:
   - Pull from company profile (industry, location)
   - Auto-generate content based on title/department
   - Suggest skills based on job type

## Design Principles
- **Minimal & Elegant**: No heavy shadows, clean lines
- **Compact**: Smaller form elements, efficient use of space
- **Apple-style**: Smooth transitions, subtle animations
- **Primary Colors**: Use existing primary color palette
- **Responsive**: Mobile-first approach

## Technical Stack
- **GraphQL Mutations**: Instead of REST API
- **shadcn Components**: Consistent with the rest of the app
- **lucide-react Icons**: Modern icon set
- **Apollo Client**: GraphQL client

## GraphQL Mutations Needed
```graphql
# Already defined mutations:
- createJob(input: CreateJobInput!)
- rewriteJobTitle(input: JobTitleRewriteRequestDto!)
- rewriteJobDescription(input: JobDescriptionRewriteInput!)
- polishRequirements(input: RequirementsPolishRequestDto!)
- polishResponsibilities(input: PolishResponsibilitiesInput!)
- polishBenefits(input: PolishBenefitsInput!)
- suggestSkills(input: SuggestSkillsInput!)
- polishQualifications(input: PolishQualificationsInput!)

# May need to add:
- generateJobAnalysis (for complete job analysis)
- generateAIConfiguration (for AI prompts)
```

## Component Structure
```
CreateJobPage
├── ProgressIndicator
├── Step 1: BasicInformation
├── Step 2: JobDetails
├── Step 3: InterviewQuestions
├── Step 4: AIConfiguration
├── Step 5: Preview
└── NavigationButtons
```

## Step Details

### Step 1: Basic Information
- Job Title (with AI regenerate)
- Department
- Industry
- Location
- Job Type (Full-time, Part-time, Contract, etc.)
- Work Type (Remote, Hybrid, Onsite)
- Job Level (Entry, Mid, Senior, Executive)
- Application Deadline
- Interview Language

### Step 2: Job Details
- Description (with AI enhance)
- Short Description
- Responsibilities (with AI polish)
- Requirements (with AI polish)
- Benefits (with AI enhance)
- Skills (with AI suggestions)
- Experience Level
- Education Level
- Salary Range

### Step 3: Interview Questions
- Optional custom questions for AI interviewer
- Tips and guidelines

### Step 4: AI Configuration
- CV Analysis Prompt (auto-generated)
- First Interview Prompt (auto-generated)
- Second Interview Prompt (auto-generated)
- Ability to regenerate all prompts

### Step 5: Preview & Publish
- Complete preview of job posting
- Edit any section
- Publish or Save as Draft

## UI/UX Improvements
1. **Compact Form Fields**:
   - Smaller padding (p-3 instead of p-4)
   - Tighter spacing between elements
   - Efficient grid layouts

2. **Subtle Interactions**:
   - Soft hover states
   - Smooth transitions (200ms)
   - Minimal feedback

3. **Modern Progress Indicator**:
   - Horizontal stepper
   - Subtle line connections
   - Clear current step indication

4. **AI Integration UI**:
   - Loading skeletons for AI generation
   - Inline regenerate buttons
   - Clear "AI-generated" indicators

5. **Validation**:
   - Inline error messages
   - Prevent navigation if invalid
   - Clear required field indicators

## Implementation Plan
1. ✅ Backup current file
2. ⏳ Create new file with:
   - Type definitions
   - GraphQL mutations
   - Main component with state management
   - Progress indicator component
   - All 5 step components inline
   - Navigation logic
   - Form validation
   - AI integration
3. ⏳ Test GraphQL integration
4. ⏳ Polish UI/UX
5. ⏳ Add loading states
6. ⏳ Add error handling

## File Size Target
- Target: < 1000 lines
- Strategy: Inline components, shared logic, efficient code

---

**Status**: Planning Complete
**Next**: Implementation
