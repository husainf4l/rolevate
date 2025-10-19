# Data Flow Diagrams

## Overview: How Experience & Education Data Flows

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CV ANALYSIS FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

1. USER SUBMITS CV
   │
   ├─> NestJS receives application
   │   └─> Creates Application record (status: PENDING)
   │
   ├─> NestJS uploads CV to S3
   │   └─> s3://4wk-garage-media/cvs/application-{id}.pdf
   │
   └─> NestJS triggers FastAPI
       └─> POST http://localhost:8000/analyze-cv


2. FASTAPI ANALYZES CV
   │
   ├─> Downloads CV from S3
   ├─> Extracts text (PDF/DOCX parsing)
   └─> GPT-4 extracts structured data
       │
       ├─> Basic info: name, email, phone, location, bio
       ├─> Skills: ["JavaScript", "React", "Node.js"]
       ├─> URLs: LinkedIn, GitHub, Portfolio
       │
       ├─> Experience (STRUCTURED):
       │   [
       │     {
       │       company: "Google",
       │       position: "Senior Engineer",
       │       startDate: "2020-03",
       │       endDate: null,
       │       isCurrent: true,
       │       description: "Built microservices..."
       │     },
       │     { ... }
       │   ]
       │
       └─> Education (STRUCTURED):
           [
             {
               institution: "MIT",
               degree: "Master of Science",
               fieldOfStudy: "Computer Science",
               startDate: "2015-09",
               endDate: "2017-06",
               grade: "3.9/4.0"
             },
             { ... }
           ]


3. FASTAPI POSTS BACK TO NESTJS
   │
   └─> GraphQL Mutation: updateApplicationAnalysis
       │
       ├─> Headers:
       │   └─> X-API-Key: SYSTEM_API_KEY
       │
       └─> Variables:
           {
             applicationId: "uuid",
             cvAnalysisScore: 85,
             candidateInfo: {
               firstName, lastName, email, phone,
               skills: [...],
               experience: [...],  // Structured arrays!
               education: [...]    // Structured arrays!
             }
           }


4. NESTJS PROCESSES DATA
   │
   ├─> updateApplicationAnalysis() receives data
   │
   ├─> Updates Application record
   │   └─> Sets cvAnalysisScore, analyzedAt, status: ANALYZED
   │
   ├─> Checks if CandidateProfile exists
   │   │
   │   ├─> If NO: Creates new CandidateProfile
   │   │   └─> Saves basic fields (firstName, lastName, phone, etc.)
   │   │
   │   └─> If YES: Updates existing CandidateProfile
   │       └─> Updates changed fields only
   │
   ├─> Processes Work Experience
   │   │
   │   └─> processWorkExperience(profileId, experienceData, manager)
   │       │
   │       ├─> Is it a STRING?
   │       │   └─> Save to candidate_profile.experience
   │       │
   │       └─> Is it an ARRAY?
   │           │
   │           ├─> DELETE old work_experience records
   │           │   └─> WHERE candidateProfileId = profileId
   │           │
   │           ├─> FOR EACH experience in array:
   │           │   └─> INSERT INTO work_experience
   │           │       (candidateProfileId, company, position,
   │           │        startDate, endDate, isCurrent, description)
   │           │
   │           └─> Generate summary text
   │               └─> "Senior Engineer at Google; Developer at Microsoft"
   │               └─> Save to candidate_profile.experience
   │
   └─> Processes Education
       │
       └─> processEducation(profileId, educationData, manager)
           │
           ├─> Is it a STRING?
           │   └─> Save to candidate_profile.education
           │
           └─> Is it an ARRAY?
               │
               ├─> DELETE old education records
               │   └─> WHERE candidateProfileId = profileId
               │
               ├─> FOR EACH education in array:
               │   └─> INSERT INTO education
               │       (candidateProfileId, institution, degree,
               │        fieldOfStudy, startDate, endDate, grade)
               │
               └─> Generate summary text
                   └─> "MS in CS from MIT; BS from Stanford"
                   └─> Save to candidate_profile.education


5. FINAL DATABASE STATE
   │
   ├─> application table:
   │   └─> { id, cvAnalysisScore: 85, status: "ANALYZED", ... }
   │
   ├─> candidate_profile table:
   │   └─> {
   │         id, firstName, lastName, phone, skills: [...],
   │         experience: "Senior Engineer at Google; ...",
   │         education: "MS in CS from MIT; ..."
   │       }
   │
   ├─> work_experience table:
   │   ├─> { id: 1, candidateProfileId, company: "Google", ... }
   │   └─> { id: 2, candidateProfileId, company: "Microsoft", ... }
   │
   └─> education table:
       ├─> { id: 1, candidateProfileId, institution: "MIT", ... }
       └─> { id: 2, candidateProfileId, institution: "Stanford", ... }


6. WHAT YOU GET
   │
   ├─> Summary text (for quick display)
   │   └─> candidate.candidateProfile.experience
   │   └─> candidate.candidateProfile.education
   │
   └─> Structured data (for queries & analytics)
       ├─> candidate.candidateProfile.workExperiences[]
       └─> candidate.candidateProfile.educations[]
```

---

## Field Name Normalization

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EXPERIENCE FIELD MAPPING                             │
└─────────────────────────────────────────────────────────────────────────┘

FastAPI sends ANY of these:              Backend normalizes to:
┌──────────────────────┐                 ┌──────────────┐
│ company              │ ───────────────>│ company      │
│ organization         │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘

┌──────────────────────┐                 ┌──────────────┐
│ position             │ ───────────────>│ position     │
│ title                │ ───────────────>│              │
│ role                 │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘

┌──────────────────────┐                 ┌──────────────┐
│ startDate            │ ───────────────>│ startDate    │
│ start_date           │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘

┌──────────────────────┐                 ┌──────────────┐
│ endDate              │ ───────────────>│ endDate      │
│ end_date             │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘

┌──────────────────────┐                 ┌──────────────┐
│ isCurrent            │ ───────────────>│ isCurrent    │
│ is_current           │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘

┌──────────────────────┐                 ┌──────────────┐
│ description          │ ───────────────>│ description  │
│ responsibilities     │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                     EDUCATION FIELD MAPPING                              │
└─────────────────────────────────────────────────────────────────────────┘

FastAPI sends ANY of these:              Backend normalizes to:
┌──────────────────────┐                 ┌──────────────┐
│ institution          │ ───────────────>│ institution  │
│ school               │ ───────────────>│              │
│ university           │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘

┌──────────────────────┐                 ┌──────────────┐
│ degree               │ ───────────────>│ degree       │
│ qualification        │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘

┌──────────────────────┐                 ┌──────────────┐
│ fieldOfStudy         │ ───────────────>│ fieldOfStudy │
│ field_of_study       │ ───────────────>│              │
│ major                │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘

┌──────────────────────┐                 ┌──────────────┐
│ endDate              │ ───────────────>│ endDate      │
│ graduationDate       │ ───────────────>│              │
└──────────────────────┘                 └──────────────┘
```

---

## Date Parsing Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATE PARSING LOGIC                                │
└─────────────────────────────────────────────────────────────────────────┘

Input: ANY date format
│
├─> Is it null/undefined?
│   └─> Return: null ✓
│
├─> Is it already a Date object?
│   └─> Return: Date object ✓
│
├─> Is it a string?
│   │
│   ├─> Is it "Present" / "Current" / "Now"?
│   │   └─> Return: null ✓ (for current positions)
│   │
│   ├─> Try: new Date(string)
│   │   │
│   │   ├─> Valid date?
│   │   │   └─> Return: Date object ✓
│   │   │
│   │   └─> Invalid date?
│   │       └─> Return: null ✓ (graceful fallback)
│   │
│   └─> Examples:
│       ├─> "2020-03-15"     → Date(2020-03-15) ✓
│       ├─> "2020-03"        → Date(2020-03-01) ✓
│       ├─> "2020"           → Date(2020-01-01) ✓
│       ├─> "Present"        → null ✓
│       └─> "invalid"        → null ✓
│
└─> Anything else?
    └─> Return: null ✓ (safe default)

Result: NEVER throws error, always returns Date | null
```

---

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPREHENSIVE ERROR HANDLING                          │
└─────────────────────────────────────────────────────────────────────────┘

1. PROCESS WORK EXPERIENCE
   │
   try {
     │
     ├─> Type check (string vs array)
     │   └─> Success: Continue
     │   └─> Error: Log warning, continue
     │
     ├─> Delete old records
     │   └─> Success: Continue
     │   └─> Error: Caught by transaction, rollback
     │
     ├─> Create new records
     │   └─> Success: Continue
     │   └─> Error: Caught by transaction, rollback
     │
     └─> Update summary
         └─> Success: Continue
         └─> Error: Caught by transaction, rollback
   }
   catch (error) {
     │
     ├─> Log error with details
     ├─> Don't throw (graceful degradation)
     └─> Process continues to education
   }


2. PROCESS EDUCATION
   │
   try {
     │
     ├─> Same error handling as experience
     │
   }
   catch (error) {
     │
     ├─> Log error with details
     ├─> Don't throw (graceful degradation)
     └─> Process continues to completion
   }


3. TRANSACTION WRAPPER
   │
   await manager.transaction(async (manager) => {
     │
     ├─> All database operations
     │   │
     │   └─> Any error?
     │       ├─> Automatic ROLLBACK
     │       └─> No partial updates
     │
     └─> Success?
         └─> COMMIT all changes
   })


4. RESULT
   │
   └─> System is RESILIENT:
       ├─> Partial data? Still processes
       ├─> Invalid dates? Converts to null
       ├─> Missing fields? Uses defaults
       ├─> DB error? Rolls back transaction
       └─> Always logs what happened
```

---

## Comparison: Before vs After

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      BEFORE (Simple Strings)                             │
└─────────────────────────────────────────────────────────────────────────┘

Database:
┌──────────────────────────────────────────────────────────────────┐
│ candidate_profile                                                 │
├──────────────────────────────────────────────────────────────────┤
│ id: 1                                                             │
│ firstName: "Ahmad"                                                │
│ lastName: "Ali"                                                   │
│ experience: "Engineer at Google; Developer at Microsoft"         │
│ education: "MS from MIT; BS from Stanford"                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ work_experience (empty)                                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ education (empty)                                                 │
└──────────────────────────────────────────────────────────────────┘

Limitations:
❌ Can't query by company
❌ Can't filter by date range
❌ Can't sort by years of experience
❌ Can't calculate total years
❌ Can't build timeline view
❌ Can't do analytics


┌─────────────────────────────────────────────────────────────────────────┐
│                 AFTER (Structured + Summaries)                           │
└─────────────────────────────────────────────────────────────────────────┘

Database:
┌──────────────────────────────────────────────────────────────────┐
│ candidate_profile                                                 │
├──────────────────────────────────────────────────────────────────┤
│ id: 1                                                             │
│ firstName: "Ahmad"                                                │
│ lastName: "Ali"                                                   │
│ experience: "Engineer at Google; Developer at Microsoft"         │
│ education: "MS from MIT; BS from Stanford"                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ work_experience                                                   │
├──────────────────────────────────────────────────────────────────┤
│ id: 1, candidateProfileId: 1                                     │
│ company: "Google"                                                 │
│ position: "Engineer"                                              │
│ startDate: 2020-03-15                                             │
│ endDate: null                                                     │
│ isCurrent: true                                                   │
├──────────────────────────────────────────────────────────────────┤
│ id: 2, candidateProfileId: 1                                     │
│ company: "Microsoft"                                              │
│ position: "Developer"                                             │
│ startDate: 2018-06-01                                             │
│ endDate: 2020-02-28                                               │
│ isCurrent: false                                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ education                                                         │
├──────────────────────────────────────────────────────────────────┤
│ id: 1, candidateProfileId: 1                                     │
│ institution: "MIT"                                                │
│ degree: "Master of Science"                                       │
│ fieldOfStudy: "Computer Science"                                 │
│ startDate: 2015-09-01                                             │
│ endDate: 2017-06-30                                               │
│ grade: "3.9/4.0"                                                  │
├──────────────────────────────────────────────────────────────────┤
│ id: 2, candidateProfileId: 1                                     │
│ institution: "Stanford"                                           │
│ degree: "Bachelor of Science"                                     │
│ fieldOfStudy: "Engineering"                                       │
│ startDate: 2011-09-01                                             │
│ endDate: 2015-06-30                                               │
└──────────────────────────────────────────────────────────────────┘

Capabilities:
✅ Query by company: "Find candidates who worked at Google"
✅ Filter by date: "Show experience from 2020-2025"
✅ Sort by years: "Most experienced first"
✅ Calculate totals: "Total years of experience"
✅ Build timeline: Visual career progression
✅ Analytics: "Top companies", "Education levels"
✅ Still have summary text for quick display!
```

---

## GraphQL Query Examples

```graphql
# Simple query - Get summary text
query GetCandidate {
  candidate(id: "123") {
    candidateProfile {
      experience    # "Engineer at Google; Developer at Microsoft"
      education     # "MS from MIT; BS from Stanford"
    }
  }
}

# Detailed query - Get structured data
query GetCandidateDetailed {
  candidate(id: "123") {
    candidateProfile {
      # Summary text
      experience
      education
      
      # Structured data
      workExperiences {
        company
        position
        startDate
        endDate
        isCurrent
        description
      }
      
      educations {
        institution
        degree
        fieldOfStudy
        startDate
        endDate
        grade
        description
      }
    }
  }
}

# Analytics query - Filter candidates
query FindExperiencedCandidates {
  candidates(filter: {
    workExperiences: {
      company: { in: ["Google", "Microsoft", "Amazon"] }
    }
  }) {
    id
    name
    candidateProfile {
      workExperiences {
        company
        position
        startDate
      }
    }
  }
}
```

---

**This is professional-grade architecture!** 🚀
