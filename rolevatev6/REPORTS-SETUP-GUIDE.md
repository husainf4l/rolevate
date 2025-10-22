# Reports Feature - Setup Guide

## Understanding the Two-Step Process

The reports feature works in two steps:

### Step 1: Create Report Definitions
Reports must first be **defined** in the system. A report definition includes:
- Name and description
- Type (ANALYTICS, PERFORMANCE, COMPLIANCE, etc.)
- Category (RECRUITMENT_METRICS, CANDIDATE_PIPELINE, etc.)
- Format (PDF, EXCEL, CSV, JSON, HTML, DASHBOARD)
- Configuration and parameters

### Step 2: Generate Reports
Once a report definition exists, you can **generate** it to create the actual report data:
- Click "Generate" button in the UI
- The system executes the report query
- Results are saved with execution metadata
- Generated reports can be downloaded

---

## Quick Start: Seed Sample Reports

We've created a script that automatically creates 15 sample report definitions for you.

### Option 1: Run with Node.js (Recommended)

```bash
# Without authentication
node scripts/seed-reports.js

# With authentication (recommended)
ACCESS_TOKEN=your_jwt_token node scripts/seed-reports.js
```

### Option 2: Run with TypeScript

```bash
# Install dependencies first if needed
npm install

# Run the TypeScript version
npx ts-node scripts/seed-reports.ts
```

### Getting Your Access Token

1. Log in to your dashboard
2. Open Developer Tools (F12)
3. Go to Console
4. Run: `localStorage.getItem('access_token')`
5. Copy the token (without quotes)

---

## Sample Reports Included

The seed script creates 15 pre-configured reports:

### 📊 **Recruitment & Hiring**
1. **Monthly Recruitment Overview** (PDF)
   - Comprehensive recruitment activities overview

2. **Quarterly Hiring Performance** (Excel)
   - Time-to-hire, cost-per-hire, quality-of-hire metrics

3. **Time-to-Hire Analysis** (Excel)
   - Bottleneck identification and process optimization

4. **Cost-per-Hire Report** (PDF)
   - Financial analysis of recruitment costs

### 👥 **Candidate Management**
5. **Active Candidate Pipeline** (Dashboard)
   - Real-time pipeline status and conversion rates

6. **Candidate Funnel Analysis** (PDF)
   - Drop-off rates at each hiring stage

### 🎤 **Interview Analytics**
7. **Interview Effectiveness Report** (Excel)
   - Interview success rates and feedback scores

8. **AI Interview Insights** (PDF)
   - AI-powered analysis of interview performance

### 💼 **Job Performance**
9. **Job Posting Performance** (Dashboard)
   - Views, applications, and conversion metrics

10. **Job Success Rate Analysis** (Excel)
    - Which postings attract quality candidates

### 📈 **Trends & Analytics**
11. **Application Trends Report** (PDF)
    - Volume, sources, and quality trends

12. **Recruitment Source Analysis** (Excel)
    - Channel effectiveness comparison

### 🏢 **Company & Department**
13. **Company Recruitment Dashboard** (Dashboard)
    - Executive overview of recruitment health

14. **Department-wise Hiring Report** (PDF)
    - Breakdown by department

### ✅ **Compliance**
15. **Hiring Compliance Report** (PDF)
    - Diversity metrics and regulatory tracking

---

## Using the Reports Dashboard

### Viewing Reports
1. Navigate to `/dashboard/reports`
2. Browse all created report definitions
3. Use search to find specific reports
4. Apply filters by Status, Category, or Type

### Generating a Report
1. Find a report with status **DRAFT**
2. Click the **Generate** button
3. Wait for the status to change to **GENERATING** → **COMPLETED**
4. The page will refresh automatically

### Downloading Reports
1. Find a report with status **COMPLETED**
2. Click the **Download** button
3. Report file will be downloaded in the specified format

### Filtering Reports
- **Search**: Type to search by name or description
- **Status**: Filter by DRAFT, GENERATING, COMPLETED, FAILED, etc.
- **Category**: Choose from 26 business categories
- **Type**: Filter by ANALYTICS, PERFORMANCE, COMPLIANCE, etc.

---

## Creating Custom Reports

### Via GraphQL API

```graphql
mutation CreateReport($input: CreateReportInput!) {
  createReport(input: $input) {
    id
    name
    status
    createdAt
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "My Custom Report",
    "description": "Description of what this report does",
    "type": "ANALYTICS",
    "category": "RECRUITMENT_METRICS",
    "format": "PDF",
    "tags": ["custom", "analytics"],
    "isPublic": false
  }
}
```

### Via Report Service (Frontend)

```typescript
import { reportService, ReportType, ReportCategory, ReportFormat } from '@/services/report.service';

const newReport = await reportService.createReport({
  name: 'My Custom Report',
  description: 'Description here',
  type: ReportType.ANALYTICS,
  category: ReportCategory.RECRUITMENT_METRICS,
  format: ReportFormat.PDF,
  tags: ['custom', 'analytics'],
  isPublic: false
});
```

---

## Available Report Types

### Types
- `ANALYTICS` - Data analysis and insights
- `PERFORMANCE` - Performance metrics and KPIs
- `COMPLIANCE` - Regulatory and compliance tracking
- `OPERATIONAL` - Operational efficiency reports
- `FINANCIAL` - Financial analysis
- `SUMMARY` - High-level overviews
- `DETAILED` - In-depth analysis
- `CUSTOM` - Custom reports

### Categories (26 total)
- **Recruitment**: RECRUITMENT_METRICS, CANDIDATE_PIPELINE, HIRING_FUNNEL
- **Interviews**: INTERVIEW_ANALYTICS
- **Performance**: TIME_TO_HIRE, COST_PER_HIRE, SOURCE_EFFECTIVENESS
- **Jobs**: JOB_PERFORMANCE, JOB_ANALYTICS, APPLICATION_TRENDS
- **Company**: COMPANY_OVERVIEW, DEPARTMENT_ANALYTICS, EMPLOYEE_METRICS
- **Communication**: COMMUNICATION_METRICS, ENGAGEMENT_ANALYTICS, RESPONSE_RATES
- **System**: SYSTEM_PERFORMANCE, SECURITY_AUDIT, ERROR_ANALYTICS
- **Financial**: BILLING_SUMMARY, REVENUE_ANALYTICS, COST_ANALYSIS
- **Other**: MARKET_ANALYSIS, CUSTOM_ANALYTICS, and more

### Formats
- `PDF` - Portable Document Format
- `EXCEL` - Excel spreadsheet
- `CSV` - Comma-separated values
- `JSON` - JSON data format
- `HTML` - HTML document
- `DASHBOARD` - Interactive dashboard view

---

## Troubleshooting

### Reports List is Empty
- Run the seed script to create sample reports
- Check if you're logged in with proper authentication
- Verify the backend is running at `http://192.168.1.210:4005`

### Cannot Generate Reports
- Ensure the report status is DRAFT or FAILED
- Check if you have proper permissions
- Look for error messages in the browser console

### Seed Script Fails
- Make sure the backend is running
- Verify the API_URL in the script matches your backend
- Use an ACCESS_TOKEN if authentication is required
- Check for error messages in the script output

---

## Next Steps

### Phase 2 (Future Enhancements)
- **Report Builder UI**: Visual interface to create custom reports
- **Scheduled Reports**: Automated report generation
- **Report Sharing**: Share reports with team members
- **Email Delivery**: Automatic email of generated reports
- **Custom Parameters**: Dynamic filters and date ranges
- **Report Templates**: Pre-built templates for common reports

---

## API Reference

### Queries
```graphql
# Get all reports (paginated)
reports(filter: ReportFilterInput): PaginatedReportResponse!

# Get single report
report(id: ID!): Report!

# Get company reports
reportsByCompany(companyId: ID!): [Report!]!

# Get user reports
reportsByUser(userId: ID!): [Report!]!
```

### Mutations
```graphql
# Create report definition
createReport(input: CreateReportInput!): Report!

# Generate report data
generateReport(id: ID!): Report!

# Update report
updateReport(id: ID!, input: UpdateReportInput!): Report!

# Archive report
archiveReport(id: ID!): Report!

# Delete report
removeReport(id: ID!): Boolean!
```

---

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify the backend logs
3. Review the REPORTS-IMPLEMENTATION.md documentation
4. Check the GraphQL schema introspection

---

**Last Updated**: October 19, 2025  
**Version**: 1.0.0
