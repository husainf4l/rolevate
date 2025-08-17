const axios = require('axios');

const API_BASE = 'http://localhost:4005/api';

async function debugRoomCreationSpelling() {
    console.log('🐛 DEBUG: Testing Room Creation with Company Spelling...\n');

    try {
        // First, let's check what companies exist and add spelling to one
        console.log('1. Setting up test data with company spelling...');

        // Use the direct database test first
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        try {
            // Find Papaya Trading company and update it with spelling
            const company = await prisma.company.findFirst({
                where: {
                    name: {
                        contains: 'papaya',
                        mode: 'insensitive'
                    }
                }
            });

            if (company) {
                console.log(`✅ Found company: ${company.name} (ID: ${company.id})`);

                // Update with spelling
                const updatedCompany = await prisma.company.update({
                    where: { id: company.id },
                    data: {
                        spelling: 'Pah-pie-yah Trading'
                    }
                });

                console.log(`✅ Updated company spelling: "${updatedCompany.spelling}"`);
            } else {
                console.log('⚠️ Papaya Trading company not found');
            }

            await prisma.$disconnect();
        } catch (dbError) {
            console.error('❌ Database update error:', dbError.message);
            return;
        }

        console.log('\n2. Testing room creation with existing application...');

        // Now test room creation with known working parameters
        const testParams = {
            jobId: 'cmdgkhmon001dj6hi33y92v3i',  // Valid job ID from Papaya Trading
            phone: '962796026659'                // Valid phone number for Maria Fatol
        };

        console.log(`📡 Creating room with:`);
        console.log(`   Job ID: ${testParams.jobId}`);
        console.log(`   Phone: ${testParams.phone}`);

        const roomResponse = await axios.post(`${API_BASE}/room/create-new-room`, testParams);

        console.log('\n3. Analyzing room response for company spelling...');
        console.log('=====================================');

        const responseData = roomResponse.data;

        // Check if interviewContext exists
        if (responseData.interviewContext) {
            console.log('✅ Interview Context Found:');
            console.log(`   📋 Candidate: ${responseData.interviewContext.candidateName}`);
            console.log(`   💼 Job: ${responseData.interviewContext.jobName}`);
            console.log(`   🏢 Company Name: ${responseData.interviewContext.companyName}`);
            console.log(`   🗣️ Company Spelling: ${responseData.interviewContext.companySpelling || 'NOT FOUND ❌'}`);
            console.log(`   🌐 Interview Language: ${responseData.interviewContext.interviewLanguage}`);

            if (responseData.interviewContext.companySpelling) {
                console.log('\n🎉 SUCCESS: Company spelling is included in metadata!');
                console.log(`🤖 AI Agent will pronounce: "${responseData.interviewContext.companyName}" as "${responseData.interviewContext.companySpelling}"`);
            } else {
                console.log('\n❌ ISSUE: Company spelling not found in metadata');
                console.log('This means the room service is not including the spelling field');
            }
        } else {
            console.log('❌ No interviewContext found in response');
        }

        // Check the room metadata directly
        if (responseData.room && responseData.room.metadata) {
            console.log('\n4. Checking raw room metadata...');
            console.log('=====================================');

            const metadata = responseData.room.metadata;
            console.log('Raw metadata keys:', Object.keys(metadata));

            console.log(`   📋 candidateName: ${metadata.candidateName}`);
            console.log(`   💼 jobName: ${metadata.jobName}`);
            console.log(`   🏢 companyName: ${metadata.companyName}`);
            console.log(`   🗣️ companySpelling: ${metadata.companySpelling || 'NOT FOUND ❌'}`);
        }

        console.log('\n5. Testing LiveKit server metadata...');
        console.log('=====================================');

        // Get the room name from response
        const roomName = responseData.room?.name;
        if (roomName) {
            try {
                const statusResponse = await axios.get(`${API_BASE}/room/livekit-status?roomName=${roomName}`);

                if (statusResponse.data.room?.metadata) {
                    const liveKitMetadata = JSON.parse(statusResponse.data.room.metadata);

                    console.log('✅ LiveKit Metadata Found:');
                    console.log(`   📋 candidateName: ${liveKitMetadata.candidateName}`);
                    console.log(`   💼 jobName: ${liveKitMetadata.jobName}`);
                    console.log(`   🏢 companyName: ${liveKitMetadata.companyName}`);
                    console.log(`   🗣️ companySpelling: ${liveKitMetadata.companySpelling || 'NOT FOUND ❌'}`);

                    if (liveKitMetadata.companySpelling) {
                        console.log('\n🎉 COMPLETE SUCCESS: Company spelling is available on LiveKit server!');
                        console.log('🤖 AI agents can now access pronunciation guidance!');
                    } else {
                        console.log('\n❌ Company spelling not transmitted to LiveKit server');
                    }
                } else {
                    console.log('❌ No metadata found on LiveKit server');
                }
            } catch (statusError) {
                console.log(`❌ Error checking LiveKit status: ${statusError.message}`);
            }
        }

    } catch (error) {
        console.error('❌ Debug test failed:', error.response?.data || error.message);

        if (error.response?.status === 404) {
            console.log('💡 Tip: The jobId and phone combination might not exist in database');
        }
    }
}

// Run debug test
debugRoomCreationSpelling();
