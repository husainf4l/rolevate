const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findValidApplications() {
    console.log('🔍 Finding valid applications for room creation test...\n');

    try {
        // Find applications with complete data
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
                        title: true,
                        company: {
                            select: {
                                id: true,
                                name: true,
                                spelling: true
                            }
                        }
                    }
                }
            },
            take: 5
        });

        console.log(`📋 Found ${applications.length} applications:`);

        applications.forEach((app, index) => {
            console.log(`\n${index + 1}. Application ID: ${app.id}`);
            console.log(`   📞 Phone: ${app.candidate.phone}`);
            console.log(`   👤 Candidate: ${app.candidate.firstName} ${app.candidate.lastName}`);
            console.log(`   💼 Job: ${app.job.title}`);
            console.log(`   🏢 Company: ${app.job.company.name}`);
            console.log(`   🗣️ Spelling: ${app.job.company.spelling || 'Not set'}`);
            console.log(`   🔧 Job ID: ${app.job.id}`);

            // Clean phone for testing
            const cleanPhone = app.candidate.phone?.replace(/[\+\s\-\(\)]/g, '') || '';
            console.log(`   📱 Clean Phone: ${cleanPhone}`);

            console.log(`   🧪 Test Parameters:`);
            console.log(`      jobId: '${app.job.id}'`);
            console.log(`      phone: '${cleanPhone}'`);
        });

        if (applications.length > 0) {
            console.log(`\n🎯 Recommended test parameters:`);
            const testApp = applications[0];
            const cleanPhone = testApp.candidate.phone?.replace(/[\+\s\-\(\)]/g, '') || '';
            console.log(`jobId: '${testApp.job.id}'`);
            console.log(`phone: '${cleanPhone}'`);
        }

    } catch (error) {
        console.error('❌ Error finding applications:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

findValidApplications();
