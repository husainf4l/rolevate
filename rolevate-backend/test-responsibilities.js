const axios = require('axios');

const testResponsibilitiesPolish = async () => {
  try {
    console.log('Testing responsibilities polish endpoint...');
    
    const response = await axios.post('http://localhost:4005/api/aiautocomplete/rewrite-responsibilities', {
      industry: "healthcare",
      jobLevel: "mid",
      responsibilities: "Key Responsibilities:\n\n• Develop and implement strategic sales plans to achieve company targets and expand the customer base.\n• Build and maintain strong relationships with existing and potential clients through regular communication and meetings.\n• Identify new business opportunities and market trends to drive revenue growth.\n• Prepare and deliver compelling sales presentations to prospective customers.\n• Negotiate contracts and close deals while ensuring customer satisfaction."
    });

    console.log('✅ Success! Response received:');
    console.log('Status:', response.status);
    console.log('\n--- Original Responsibilities ---');
    console.log('Industry:', 'healthcare');
    console.log('Job Level:', 'mid');
    console.log('\n--- Polished Responsibilities ---');
    console.log(response.data.polishedResponsibilities);

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

testResponsibilitiesPolish();
