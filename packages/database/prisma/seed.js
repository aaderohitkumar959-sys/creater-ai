const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const personasData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seed-personas.json'), 'utf-8')
);

async function main() {
    console.log(`🌱 Seeding database with ${personasData.length} personas...\n`);

    try {
        // Create default creator
        const creator = await prisma.user.upsert({
            where: { email: 'creator@creatorai.com' },
            update: {},
            create: {
                email: 'creator@creatorai.com',
                name: 'CreatorAI Official',
                role: 'CREATOR',
                emailVerified: new Date(),
            },
        });

        const creatorProfile = await prisma.creator.upsert({
            where: { userId: creator.id },
            update: {},
            create: {
                userId: creator.id,
                bio: '✨ Official CreatorAI personas - crafted with care for the best conversations!',
                earnings: 0,
            },
        });

        console.log(`✅ Creator account: ${creator.email}\n`);

        // Seed all personas
        let successCount = 0;
        for (const p of personasData) {
            try {
                // Merge extra fields into personality JSON for the database
                const personalityBlob = {
                    ...(p.personality || {}),
                    backstory: p.backstory,
                    systemPrompt: p.systemPrompt,
                    greetingMessage: p.greetingMessage,
                    traits: p.traits,
                    isPremium: p.isPremium,
                    defaultCoinCost: p.defaultCoinCost
                };

                await prisma.persona.upsert({
                    where: { id: p.id },
                    update: {
                        name: p.name,
                        description: p.description,
                        avatarUrl: p.avatarUrl,
                        category: p.category,
                        personality: personalityBlob,
                        isFeatured: p.isFeatured || false,
                    },
                    create: {
                        id: p.id,
                        creatorId: creatorProfile.id,
                        name: p.name,
                        description: p.description,
                        avatarUrl: p.avatarUrl,
                        category: p.category,
                        personality: personalityBlob,
                        isFeatured: p.isFeatured || false,
                    },
                });
                console.log(`  ✅ ${p.name} (${p.category})`);
                successCount++;
            } catch (e) {
                console.error(`  ❌ ${p.name}: ${e.message}`);
            }
        }

        // Create demo user
        const demoUser = await prisma.user.upsert({
            where: { email: 'demo@example.com' },
            update: {},
            create: {
                email: 'demo@example.com',
                name: 'Demo User',
                role: 'USER',
                emailVerified: new Date(),
            },
        });

        // Create coin wallet
        try {
            await prisma.coinWallet.upsert({
                where: { userId: demoUser.id },
                update: { balance: 1000 },
                create: {
                    userId: demoUser.id,
                    balance: 1000,
                },
            });
        } catch (e) {
            console.warn('Could not create coin wallet:', e.message);
        }

        console.log(`\n✅ Demo user: ${demoUser.email}`);
        console.log(`\n🎉 Successfully seeded ${successCount}/${personasData.length} personas!`);

    } catch (error) {
        console.error('\n❌ Seeding failed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
