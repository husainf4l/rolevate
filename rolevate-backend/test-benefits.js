const axios = require('axios');

const testBenefitsPolish = async () => {
  try {
    console.log('Testing benefits polish endpoint...');
    
    const response = await axios.post('http://localhost:4005/api/aiautocomplete/rewrite-benefits', {
      benefits: "health insurance, paid time off, free lunch, gym membership, work from home"
    });

    console.log('✅ Success! Response received:');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));

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

testBenefitsPolish();
