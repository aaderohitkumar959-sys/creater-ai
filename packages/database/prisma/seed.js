const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const personasData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'seed-personas.json'), 'utf-8')
);

async function main() {
    console.log('🌱 Seeding database with 20 premium personas...\n');

    try {
        // Create default creator
        const hashedPassword = await argon2.hash('CreatorAI2024!');
        const creator = await prisma.user.upsert({
            where: { email: 'creator@creatorai.com' },
            update: {},
            create: {
                email: 'creator@creatorai.com',
                name: 'CreatorAI Official',
                password: hashedPassword,
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
                isVerified: true,
                totalEarnings: 0,
            },
        });

        console.log(`✅ Creator account: ${creator.email}\n`);

        // Seed all 20 personas
        let successCount = 0;
        for (const p of personasData) {
            try {
                await prisma.persona.upsert({
                    where: { id: p.id },
                    update: {
                        name: p.name,
                        description: p.description,
                        avatarUrl: p.avatarUrl,
                        category: p.category,
                        personality: p.personality,
                        backstory: p.backstory,
                        systemPrompt: p.systemPrompt,
                        greetingMessage: p.greetingMessage,
                        isPremium: p.isPremium,
                        isFeatured: p.isFeatured,
                        defaultCoinCost: p.defaultCoinCost,
                        traits: p.traits,
                    },
                    create: {
                        id: p.id,
                        creatorId: creatorProfile.id,
                        name: p.name,
                        description: p.description,
                        avatarUrl: p.avatarUrl,
                        category: p.category,
                        personality: p.personality,
                        backstory: p.backstory,
                        systemPrompt: p.systemPrompt,
                        greetingMessage: p.greetingMessage,
                        isPremium: p.isPremium,
                        isFeatured: p.isFeatured,
                        defaultCoinCost: p.defaultCoinCost,
                        traits: p.traits,
                        messageCount: 0,
                        likeCount: 0,
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
                password: await argon2.hash('Demo1234!'),
                role: 'USER',
                emailVerified: new Date(),
            },
        });

        // Update user coins through direct query (if coins field exists on User model)
        try {
            await prisma.user.update({
                where: { id: demoUser.id },
                data: { coins: 1000 },
            });
        } catch (e) {
            // Coins might not be on User model, skip
        }

        // Create coin wallet
        try {
            await prisma.coinWallet.upsert({
                where: { userId: demoUser.id },
                update: { balance: 1000 },
                create: {
                    userId: demoUser.id,
                    balance: 1000,
                    lifetimeEarnings: 0,
                    lifetimeSpent: 0,
                },
            });
        } catch (e) {
            console.warn('Could not create coin wallet:', e.message);
        }

        console.log(`\n✅ Demo user: ${demoUser.email} (Password: Demo1234!)`);
        console.log(`\n🎉 Successfully seeded ${successCount}/${personasData.length} personas!`);
        console.log(`\n📊 Breakdown:`);
        console.log(`  - Featured: ${personasData.filter(p => p.isFeatured).length}`);
        console.log(`  - Premium ($): ${personasData.filter(p => p.isPremium).length}`);
        console.log(`  - Free: ${personasData.filter(p => !p.isPremium).length}\n`);

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
