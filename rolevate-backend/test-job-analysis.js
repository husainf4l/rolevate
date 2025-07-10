const axios = require('axios');

const testJobAnalysis = async () => {
  try {
    console.log('Testing job analysis endpoint...');
    
    const response = await axios.post('http://localhost:3000/api/aiautocomplete/job-analysis', {
      jobTitle: 'Sales Representative',
      department: 'Sales',
      industry: 'Healthcare',
      employeeType: 'Full-time',
      jobLevel: 'Mid-level',
      workType: 'On-site',
      location: 'Amman',
      country: 'Jordan'
    });

    console.log('✅ Success! Response received:');
    console.log('Status:', response.status);
    console.log('Salary Range:', response.data.salaryRange);
    console.log('Experience Level:', response.data.experienceLevel);
    console.log('Sources count:', response.data.sources?.length || 0);
    console.log('Response keys:', Object.keys(response.data));

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

testJobAnalysis();
