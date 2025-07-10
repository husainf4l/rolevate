const testJobCreation = async () => {
  try {
    const response = await fetch('http://localhost:4005/api/jobs/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      },
      body: JSON.stringify({
        title: "Sales Representative",
        department: "Sales", 
        location: "Amman, Jordan",
        salary: "JOD 10,000 - 15,000",
        type: "FULL_TIME",
        deadline: "2025-08-09",
        description: "Full job description here...",
        shortDescription: "Brief summary of the sales role",
        responsibilities: "Key responsibilities...",
        requirements: "Required qualifications...",
        benefits: "Employee benefits...",
        skills: ["Sales", "Communication", "Negotiation"],
        experience: "3-5 years",
        education: "Bachelor's Degree",
        jobLevel: "MID",
        workType: "ONSITE",
        industry: "healthcare",
        companyDescription: "Company description...",
        aiCvAnalysisPrompt: "CV analysis prompt...",
        aiFirstInterviewPrompt: "First interview prompt...",
        aiSecondInterviewPrompt: "Second interview prompt..."
      })
    });

    if (response.ok) {
      const jobData = await response.json();
      console.log('Job created successfully:', jobData);
    } else {
      const error = await response.json();
      console.error('Error creating job:', error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Test getting all company jobs
const testGetCompanyJobs = async () => {
  try {
    const response = await fetch('http://localhost:4005/api/jobs/company/all', {
      headers: {
        'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE' // Replace with actual token
      }
    });

    if (response.ok) {
      const jobs = await response.json();
      console.log('Company jobs:', jobs);
    } else {
      const error = await response.json();
      console.error('Error fetching company jobs:', error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Test getting public jobs
const testGetPublicJobs = async () => {
  try {
    const response = await fetch('http://localhost:4005/api/jobs/public/all');

    if (response.ok) {
      const jobs = await response.json();
      console.log('Public jobs:', jobs);
    } else {
      const error = await response.json();
      console.error('Error fetching public jobs:', error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

console.log('Job API Test Script');
console.log('Update the JWT token in the script and run the tests');
