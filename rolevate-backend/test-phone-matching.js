// Quick test to verify phone number matching logic
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPhoneMatching() {
    try {
        console.log('Testing phone number matching logic...');

        // Sample test phones
        const testPhone = "+962 07 96946071";
        const cleanPhone = testPhone.replace(/[\+\s\-\(\)]/g, '');

        console.log('Original phone:', testPhone);
        console.log('Clean phone:', cleanPhone);

        // Check if there are any candidates with phones that might match
        const candidates = await prisma.candidateProfile.findMany({
            select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true
            },
            take: 10
        });

        console.log('\nFound candidates:');
        candidates.forEach(candidate => {
            const candidateCleanPhone = candidate.phone?.replace(/[\+\s\-\(\)]/g, '') || '';
            const matches = candidate.phone === cleanPhone ||
                candidate.phone === testPhone ||
                candidate.phone?.includes(cleanPhone) ||
                candidate.phone?.includes(testPhone) ||
                candidate.phone?.endsWith(cleanPhone.slice(-8));

            console.log(`- ${candidate.firstName} ${candidate.lastName}: ${candidate.phone} (clean: ${candidateCleanPhone}) - Matches: ${matches}`);
        });

        // Check for applications
        const applications = await prisma.application.findMany({
            include: {
                candidate: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        phone: true
                    }
                },
                job: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            },
            take: 5
        });

        console.log('\nFound applications:');
        applications.forEach(app => {
            const candidateCleanPhone = app.candidate.phone?.replace(/[\+\s\-\(\)]/g, '') || '';
            console.log(`- Job: ${app.job.title}, Candidate: ${app.candidate.firstName} ${app.candidate.lastName}, Phone: ${app.candidate.phone} (clean: ${candidateCleanPhone})`);
        });

    } catch (error) {
        console.error('Error testing phone matching:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPhoneMatching();
