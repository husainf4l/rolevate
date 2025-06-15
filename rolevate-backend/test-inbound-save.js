// Test inbound message saving
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSaveInboundMessage() {
    try {
        console.log('🧪 Testing inbound message save...');

        // Simulate saving an inbound message
        const testMessage = {
            id: 'test_message_' + Date.now(),
            from: '962796026659',
            type: 'text',
            timestamp: Math.floor(Date.now() / 1000).toString()
        };

        const testContact = {
            profile: {
                name: 'Test User'
            }
        };

        const phoneNumber = testMessage.from;
        const messageContent = 'Test inbound message';
        const timestamp = new Date(parseInt(testMessage.timestamp) * 1000);

        console.log('📝 Creating conversation...');

        // Create or update conversation
        const conversation = await prisma.whatsAppConversation.upsert({
            where: { phoneNumber },
            update: {
                lastMessageAt: timestamp,
                contactName: testContact?.profile?.name || null,
                isActive: true,
                templateRequired: false
            },
            create: {
                phoneNumber,
                contactName: testContact?.profile?.name || null,
                lastMessageAt: timestamp,
                isActive: true,
                templateRequired: false
            }
        });

        console.log('✅ Conversation created:', conversation.id);

        console.log('📝 Creating message...');

        // Save the message
        const savedMessage = await prisma.whatsAppMessage.create({
            data: {
                messageId: testMessage.id,
                from: testMessage.from,
                direction: 'INBOUND',
                type: testMessage.type.toUpperCase(),
                content: messageContent,
                timestamp: timestamp,
                contactName: testContact?.profile?.name || null,
                metadata: testMessage,
                conversationId: conversation.id,
                status: 'DELIVERED'
            }
        });

        console.log('✅ Message saved successfully:', savedMessage.id);

        // Check if it was saved
        const allMessages = await prisma.whatsAppMessage.findMany({
            orderBy: { timestamp: 'desc' },
            take: 5
        });

        console.log(`📊 Total messages in DB: ${allMessages.length}`);
        allMessages.forEach(msg => {
            console.log(`   ${msg.direction}: ${msg.content} from ${msg.from} at ${msg.timestamp}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSaveInboundMessage();
