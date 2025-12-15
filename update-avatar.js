// Quick script to update Jin Soleil's avatar in your database
const { PrismaClient } = require('@creator-ai/database');

const prisma = new PrismaClient();

async function updateAvatar() {
    try {
        console.log('🔄 Updating Jin Soleil avatar...');

        const result = await prisma.persona.update({
            where: { id: 'jin-soleil' },
            data: {
                avatarUrl: 'https://i.ibb.co/gMLZqsY9/kpop-male1-image.jpg'
            }
        });

        console.log('✅ Success! Avatar updated:', result.avatarUrl);
        console.log('\n🎉 Done! Refresh your website to see the new image.');
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

updateAvatar();
