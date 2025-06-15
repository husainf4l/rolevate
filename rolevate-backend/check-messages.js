// Quick script to check WhatsApp messages in database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMessages() {
    try {
        console.log('🔍 Checking WhatsApp messages in database...');

        // Get all conversations
        const conversations = await prisma.whatsAppConversation.findMany({
            include: {
                messages: {
                    orderBy: { timestamp: 'desc' },
                    take: 5
                }
            }
        });

        console.log(`📊 Found ${conversations.length} conversations`);

        for (const conv of conversations) {
            console.log(`\n📱 Conversation: ${conv.phoneNumber}`);
            console.log(`   Contact: ${conv.contactName || 'Unknown'}`);
            console.log(`   Last message: ${conv.lastMessageAt}`);
            console.log(`   Messages: ${conv.messages.length}`);

            for (const msg of conv.messages) {
                console.log(`   📨 ${msg.direction}: ${msg.content} (${msg.timestamp})`);
            }
        }

        // Get recent messages
        const recentMessages = await prisma.whatsAppMessage.findMany({
            orderBy: { timestamp: 'desc' },
            take: 10
        });

        console.log(`\n📨 Recent messages (${recentMessages.length}):`);
        for (const msg of recentMessages) {
            console.log(`${msg.direction} | ${msg.from} → ${msg.to || 'N/A'} | ${msg.type} | ${msg.content} | ${msg.timestamp}`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkMessages();
