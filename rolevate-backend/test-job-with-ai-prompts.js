// Test script for job creation with AI prompts
const testJobWithAIPrompts = {
  title: "Sales Representative", 
  department: "Sales",
  location: "Amman, Jordan",
  salary: "JOD 10,000 - 15,000",
  type: "FULL_TIME",
  deadline: "2025-08-09",
  description: "Full job description for sales representative position...",
  shortDescription: "Join our sales team as a representative",
  responsibilities: "Key responsibilities include...",
  requirements: "Required qualifications include...",
  benefits: "Employee benefits include...",
  skills: ["Sales", "Communication", "Negotiation"],
  experience: "3-5 years",
  education: "Bachelor's Degree", 
  jobLevel: "MID",
  workType: "ONSITE",
  industry: "healthcare",
  companyDescription: "Our healthcare company description...",
  
  // All three AI prompts
  aiCvAnalysisPrompt: "Analyze the candidate CVs for this sales position...",
  aiFirstInterviewPrompt: "Conduct an initial screening interview...",
  aiSecondInterviewPrompt: "Conduct an in-depth final interview..."
};

console.log('Job data with AI prompts:', JSON.stringify(testJobWithAIPrompts, null, 2));

// Usage example:
// POST to http://localhost:4005/api/jobs/create
// With Authorization: Bearer YOUR_JWT_TOKEN
// Body: testJobWithAIPrompts
