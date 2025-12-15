// Direct database update script - no .env needed
const { PrismaClient } = require('@prisma/client');

// Get DATABASE_URL from command line argument
const dbUrl = process.argv[2];

if (!dbUrl) {
    console.error('❌ Please provide DATABASE_URL as argument');
    process.exit(1);
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl
        }
    }
});

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
