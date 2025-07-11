const { PrismaClient } = require('@prisma/client');

console.log('=== Comparing Prisma Client Properties ===');

const prisma = new PrismaClient();

console.log('\nDirect PrismaClient instance properties:');
const allProps = Object.getOwnPropertyNames(prisma);
console.log('Total properties:', allProps.length);

// Filter for model-like properties (lowercase)
const modelProps = allProps.filter(prop => 
  !prop.startsWith('$') && 
  !prop.startsWith('_') && 
  prop === prop.toLowerCase()
);
console.log('Model properties:', modelProps);

// Check specifically for candidateProfile variations
console.log('\nChecking candidateProfile variations:');
console.log('candidateProfile:', typeof prisma.candidateProfile);
console.log('CandidateProfile:', typeof prisma.CandidateProfile);
console.log('candidate_profile:', typeof prisma.candidate_profile);

// Check user for comparison
console.log('\nComparing with user model:');
console.log('user:', typeof prisma.user);
console.log('User:', typeof prisma.User);

// Check all properties that contain 'candidate'
console.log('\nAll properties containing "candidate":');
allProps.forEach(prop => {
  if (prop.toLowerCase().includes('candidate')) {
    console.log(`${prop}: ${typeof prisma[prop]}`);
  }
});

// Check if candidateProfile is available after connect
console.log('\nTesting after $connect():');
prisma.$connect().then(() => {
  console.log('After connect - candidateProfile:', typeof prisma.candidateProfile);
  console.log('After connect - user:', typeof prisma.user);
  
  // Try accessing the findFirst method
  if (prisma.candidateProfile) {
    console.log('candidateProfile.findFirst:', typeof prisma.candidateProfile.findFirst);
  }
  
  process.exit(0);
}).catch(error => {
  console.error('Connect error:', error);
  process.exit(1);
});
