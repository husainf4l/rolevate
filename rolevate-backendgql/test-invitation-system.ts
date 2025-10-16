/**
 * Test script for Company Invitation System
 * 
 * This script tests:
 * 1. Creating an invitation link
 * 2. Validating the invitation code
 * 3. Getting invitation details
 * 4. Listing company invitations
 * 5. Accepting an invitation
 * 6. Cancelling an invitation
 */

const GRAPHQL_URL = 'http://localhost:4005/graphql';

// You'll need to update these with real values from your database
const TEST_COMPANY_ID = 'your-company-id-here';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'your-password-here';

// Store the JWT token and invitation code
let authToken: string;
let invitationCode: string;

async function makeGraphQLRequest(query: string, variables: any = {}, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();
  
  if (result.errors) {
    console.error('❌ GraphQL Errors:', JSON.stringify(result.errors, null, 2));
    throw new Error('GraphQL request failed');
  }

  return result.data;
}

async function login() {
  console.log('\n1️⃣  Testing Login...');
  
  const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        accessToken
        user {
          id
          email
          name
          companyId
        }
      }
    }
  `;

  const data = await makeGraphQLRequest(query, {
    email: TEST_USER_EMAIL,
    password: TEST_PASSWORD,
  });

  authToken = data.login.accessToken;
  console.log('✅ Login successful');
  console.log('   User:', data.login.user.name);
  console.log('   Company ID:', data.login.user.companyId);
  
  return data.login;
}

async function createInvitation() {
  console.log('\n2️⃣  Testing Create Invitation...');
  
  const query = `
    mutation CreateCompanyInvitation($companyId: ID!, $input: CreateInvitationInput!) {
      createCompanyInvitation(companyId: $companyId, input: $input) {
        id
        code
        email
        userType
        status
        invitationLink
        expiresAt
        createdAt
      }
    }
  `;

  const data = await makeGraphQLRequest(query, {
    companyId: TEST_COMPANY_ID,
    input: {
      // userType defaults to BUSINESS
      expiresInHours: 168, // 7 days
      email: 'newbusinessuser@example.com', // Optional
    },
  }, authToken);

  invitationCode = data.createCompanyInvitation.code;
  console.log('✅ Invitation created successfully');
  console.log('   Invitation Code:', invitationCode);
  console.log('   User Type:', data.createCompanyInvitation.userType, '(defaults to BUSINESS)');
  console.log('   Invitation Link:', data.createCompanyInvitation.invitationLink);
  console.log('   Expires At:', data.createCompanyInvitation.expiresAt);
  
  return data.createCompanyInvitation;
}

async function validateInvitation() {
  console.log('\n3️⃣  Testing Validate Invitation...');
  
  const query = `
    mutation ValidateInvitationCode($code: String!) {
      validateInvitationCode(code: $code)
    }
  `;

  const data = await makeGraphQLRequest(query, {
    code: invitationCode,
  });

  console.log('✅ Invitation validation result:', data.validateInvitationCode);
  
  return data.validateInvitationCode;
}

async function getInvitation() {
  console.log('\n4️⃣  Testing Get Invitation Details...');
  
  const query = `
    query GetInvitation($code: String!) {
      getInvitation(code: $code) {
        id
        code
        email
        userType
        status
        invitationLink
        expiresAt
        usedAt
        createdAt
        companyId
      }
    }
  `;

  const data = await makeGraphQLRequest(query, {
    code: invitationCode,
  });

  console.log('✅ Invitation details retrieved');
  console.log('   Status:', data.getInvitation.status);
  console.log('   User Type:', data.getInvitation.userType);
  console.log('   Used At:', data.getInvitation.usedAt || 'Not used yet');
  
  return data.getInvitation;
}

async function listInvitations() {
  console.log('\n5️⃣  Testing List Company Invitations...');
  
  const query = `
    query ListCompanyInvitations($companyId: ID!) {
      listCompanyInvitations(companyId: $companyId) {
        id
        code
        email
        userType
        status
        invitationLink
        expiresAt
        usedAt
        createdAt
      }
    }
  `;

  const data = await makeGraphQLRequest(query, {
    companyId: TEST_COMPANY_ID,
  }, authToken);

  console.log('✅ Company invitations retrieved');
  console.log(`   Total invitations: ${data.listCompanyInvitations.length}`);
  
  data.listCompanyInvitations.forEach((inv: any, index: number) => {
    console.log(`   ${index + 1}. ${inv.status} - ${inv.userType} - ${inv.email || 'No email'} - ${inv.code.slice(0, 8)}...`);
  });
  
  return data.listCompanyInvitations;
}

async function acceptInvitation() {
  console.log('\n6️⃣  Testing Accept Invitation...');
  console.log('   ⚠️  Note: This requires a second user account to test properly');
  console.log('   ⚠️  Skipping for now - you can test manually');
  
  // Uncomment this when you have a second user to test with:
  /*
  const query = `
    mutation AcceptCompanyInvitation($code: String!) {
      acceptCompanyInvitation(code: $code) {
        id
        status
        usedAt
      }
    }
  `;

  const data = await makeGraphQLRequest(query, {
    code: invitationCode,
  }, secondUserToken); // Need a different user's token

  console.log('✅ Invitation accepted');
  console.log('   Status:', data.acceptCompanyInvitation.status);
  console.log('   Used At:', data.acceptCompanyInvitation.usedAt);
  
  return data.acceptCompanyInvitation;
  */
}

async function cancelInvitation() {
  console.log('\n7️⃣  Testing Cancel Invitation...');
  
  const query = `
    mutation CancelInvitation($invitationId: ID!) {
      cancelInvitation(invitationId: $invitationId) {
        id
        status
      }
    }
  `;

  // We'll use the invitation we just created
  const invitations = await listInvitations();
  const invitationId = invitations[0].id;

  const data = await makeGraphQLRequest(query, {
    invitationId,
  }, authToken);

  console.log('✅ Invitation cancelled');
  console.log('   New status:', data.cancelInvitation.status);
  
  return data.cancelInvitation;
}

async function runTests() {
  console.log('🚀 Starting Invitation System Tests\n');
  console.log('=' .repeat(60));

  try {
    // Login first
    await login();

    // Create an invitation
    await createInvitation();

    // Validate the invitation code
    await validateInvitation();

    // Get invitation details
    await getInvitation();

    // List all company invitations
    await listInvitations();

    // Note about accepting invitation
    await acceptInvitation();

    // Cancel the invitation
    await cancelInvitation();

    console.log('\n' + '=' .repeat(60));
    console.log('✅ All tests completed successfully!\n');
    console.log('📝 Summary:');
    console.log('   - Invitation creation: ✅');
    console.log('   - Invitation validation: ✅');
    console.log('   - Invitation details retrieval: ✅');
    console.log('   - Company invitations listing: ✅');
    console.log('   - Invitation acceptance: ⚠️  (needs second user)');
    console.log('   - Invitation cancellation: ✅');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Instructions
console.log(`
╔════════════════════════════════════════════════════════════╗
║  Company Invitation System Test Script                     ║
╚════════════════════════════════════════════════════════════╝

Before running this script, please update the following variables:

1. TEST_COMPANY_ID: Your company's ID from the database
2. TEST_USER_EMAIL: Email of a user in that company
3. TEST_PASSWORD: Password for that user

To run this script:
  ts-node test-invitation-system.ts

Or with tsx:
  npx tsx test-invitation-system.ts
`);

// Uncomment to run the tests
// runTests();
