const axios = require('axios');

const testJobTitleRewrite = async () => {
  try {
    console.log('Testing job title rewrite endpoint...');
    
    const testCases = [
      {
        jobTitle: 'software guy',
        industry: 'Technology',
        company: 'Tech Company',
        jobLevel: 'Mid-level'
      },
      {
        jobTitle: 'marketing person',
        industry: 'E-commerce'
      },
      {
        jobTitle: 'guy who fixes computers',
        industry: 'IT Services'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n--- Testing: "${testCase.jobTitle}" ---`);
      
      const response = await axios.post('http://localhost:3000/api/aiautocomplete/rewrite-job-title', testCase);

      console.log('✅ Success!');
      console.log('Original:', testCase.jobTitle);
      console.log('Enhanced:', response.data.jobTitle);
      console.log('Department:', response.data.department);
    }

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

testJobTitleRewrite();
