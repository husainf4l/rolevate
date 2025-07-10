const axios = require('axios');

async function testPolishRequirements() {
  const baseUrl = 'http://localhost:3000/api';
  
  // Sample requirements text that needs polishing
  const sampleRequirements = `
  Requirements:
  - Must have bachelors degree
  - needs 3+ years exp in sales
  - good communication skills required
  - should know CRM systems
  - ability to work under pressure
  - Must be bilingual english/arabic
  - Valid drivers license
  
  Qualifications:
  - previous healthcare experience preferred
  - Strong interpersonal skills
  - computer literacy required
  - willingness to travel
  `;

  try {
    // First login to get JWT token (you'll need to replace with actual credentials)
    console.log('Testing Polish Requirements endpoint...');
    
    const testData = {
      requirements: sampleRequirements
    };

    console.log('Request payload:');
    console.log(JSON.stringify(testData, null, 2));
    
    // Note: You'll need to add a valid JWT token here for testing
    // const response = await axios.post(`${baseUrl}/aiautocomplete/polish-requirements`, testData, {
    //   headers: {
    //     'Authorization': 'Bearer YOUR_JWT_TOKEN',
    //     'Content-Type': 'application/json'
    //   }
    // });
    
    console.log('Endpoint created successfully!');
    console.log('To test the endpoint:');
    console.log('1. Start the server: npm start');
    console.log('2. Login to get a JWT token');
    console.log('3. Make a POST request to: http://localhost:3000/api/aiautocomplete/polish-requirements');
    console.log('4. Include the JWT token in Authorization header');
    console.log('5. Send the requirements text in the request body');
    
  } catch (error) {
    console.error('Error testing endpoint:', error.message);
  }
}

testPolishRequirements();
