// Simple database connection test
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...');

        // Test basic query
        const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
        console.log('✅ Database connected:', result);

        // Check if WhatsApp tables exist
        const tables = await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name LIKE 'whatsapp%'
        `;
        console.log('📊 WhatsApp tables:', tables);

        // Try to count messages
        try {
            const messageCount = await prisma.whatsAppMessage.count();
            console.log(`📨 Message count: ${messageCount}`);
        } catch (err) {
            console.error('❌ Error counting messages:', err.message);
        }

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();
