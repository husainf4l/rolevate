const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndFixCompanySpelling() {
    console.log('🔍 Checking current company names and spellings...\n');

    try {
        // Get all companies with their current names and spellings
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                spelling: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        console.log(`📋 Found ${companies.length} companies:`);

        companies.forEach((company, index) => {
            console.log(`\n${index + 1}. ${company.name} (ID: ${company.id})`);
            console.log(`   🗣️ Current Spelling: ${company.spelling || 'NULL (not set)'}`);
        });

        // Check if there's a company with "Khawati" in the name
        const khawatiCompany = companies.find(c =>
            c.name.toLowerCase().includes('khawati')
        );

        if (khawatiCompany) {
            console.log(`\n✅ Found Khawati company: "${khawatiCompany.name}"`);
            console.log(`   Current spelling: ${khawatiCompany.spelling || 'NULL'}`);

            // Update it with the correct spelling you want
            const updatedCompany = await prisma.company.update({
                where: { id: khawatiCompany.id },
                data: {
                    spelling: 'Khawati yay'  // Using your preferred spelling
                }
            });

            console.log(`✅ Updated spelling to: "${updatedCompany.spelling}"`);
        } else {
            console.log('\n⚠️ No company with "Khawati" in name found');

            // Let's also check what the actual company names are
            console.log('\n📝 All company names in database:');
            companies.forEach(c => console.log(`   - "${c.name}"`));
        }

        // Clear any incorrect spellings I might have added
        console.log('\n🧹 Clearing any automatically generated spellings...');

        // Remove the "Pah-pie-yah Trading" spelling I incorrectly added
        const papayaCompany = companies.find(c =>
            c.name.toLowerCase().includes('papaya')
        );

        if (papayaCompany && papayaCompany.spelling === 'Pah-pie-yah Trading') {
            await prisma.company.update({
                where: { id: papayaCompany.id },
                data: {
                    spelling: null  // Clear the incorrect spelling
                }
            });
            console.log(`✅ Cleared incorrect spelling for "${papayaCompany.name}"`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndFixCompanySpelling();
