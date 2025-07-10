const axios = require('axios');

const testAboutCompanyPolish = async () => {
  try {
    console.log('Testing about company polish endpoint...');
    
    const response = await axios.post('http://localhost:4005/api/aiautocomplete/rewrite-company-description', {
      aboutCompany: "We are a healthcare technology company that develops innovative solutions for hospitals and clinics. Founded in 2020, we have grown rapidly and now serve over 100 clients across the region.",
      industry: "Healthcare Technology",
      companyName: "MedTech Solutions",
      companySize: "50-100 employees",
      location: "Amman, Jordan"
    });

    console.log('✅ Success! Response received:');
    console.log('Status:', response.status);
    console.log('\n--- Polished About Company Section ---');
    console.log(response.data.polishedAboutCompany);

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

testAboutCompanyPolish();
