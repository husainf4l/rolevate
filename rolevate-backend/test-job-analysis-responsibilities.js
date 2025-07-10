const axios = require('axios');

const testJobAnalysisWithResponsibilities = async () => {
  try {
    console.log('Testing job analysis endpoint with key responsibilities...');
    
    const response = await axios.post('http://localhost:4005/api/aiautocomplete/job-analysis', {
      jobTitle: 'Sales Representative',
      department: 'Sales',
      industry: 'Healthcare',
      employeeType: 'FULL_TIME',
      jobLevel: 'MID',
      workType: 'ONSITE',
      location: 'Amman',
      country: 'Jordan'
    });

    console.log('✅ Success! Response received:');
    console.log('Status:', response.status);
    console.log('Job Title:', response.data.jobTitle);
    console.log('Salary Range:', response.data.salaryRange);
    console.log('\n--- Key Responsibilities Section ---');
    console.log(response.data.jobRequirements.keyResponsibilities);
    console.log('\n--- Other Info ---');
    console.log('Qualifications count:', response.data.jobRequirements.qualifications?.length || 0);
    console.log('Sources count:', response.data.sources?.length || 0);

  } catch (error) {
    console.error('❌ Error occurred:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error message:', error.response.data.message || error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
};

testJobAnalysisWithResponsibilities();
