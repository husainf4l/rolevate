const { PrismaClient } = require('./generated/prisma');

console.log('Testing Prisma client properties...');

const prisma = new PrismaClient();

console.log('PrismaClient created successfully');
console.log('Type of prisma:', typeof prisma);

// Check if candidateProfile exists
console.log('candidateProfile property exists:', 'candidateProfile' in prisma);
console.log('candidateProfile type:', typeof prisma.candidateProfile);

// List all properties
console.log('\nInstance properties:');
const instanceProps = Object.getOwnPropertyNames(prisma);
console.log(instanceProps.filter(prop => !prop.startsWith('_')));

console.log('\nPrototype properties:');
const prototypeProps = Object.getOwnPropertyNames(Object.getPrototypeOf(prisma));
console.log(prototypeProps.filter(prop => !prop.startsWith('_')));

// Check for getter properties
console.log('\nGetter properties:');
const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(prisma), 'candidateProfile');
console.log('candidateProfile descriptor:', descriptor);

// Try to access candidateProfile
try {
  console.log('\nTrying to access candidateProfile...');
  const candidateProfileModel = prisma.candidateProfile;
  console.log('candidateProfile model:', typeof candidateProfileModel);
  console.log('candidateProfile.findFirst exists:', typeof candidateProfileModel?.findFirst);
} catch (error) {
  console.error('Error accessing candidateProfile:', error.message);
}

process.exit(0);
