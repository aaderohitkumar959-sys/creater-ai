#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...\n');

    // Load persona data
    const personasData = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'seed-personas.json'), 'utf-8')
    );

    // Create default creator user
    console.log('Creating default creator user...');
    const hashedPassword = await argon2.hash('CreatorAI2024!');

    const defaultCreator = await prisma.user.upsert({
        where: { email: 'creator@creatorai.com' },
        update: {},
        create: {
            email: 'creator@creatorai.com',
            name: 'CreatorAI Official',
            password: hashedPassword,
            role: 'CREATOR',
            image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200',
            emailVerified: new Date(),
        },
    });

    console.log(`✅ Created default creator: ${defaultCreator.email}`);

    // Create creator profile
    const creatorProfile = await prisma.creator.upsert({
        where: { userId: defaultCreator.id },
        update: {},
        create: {
            userId: defaultCreator.id,
            bio: 'Official CreatorAI personas - crafted with love for amazing conversations!',
            socialLinks: JSON.stringify({
                twitter: 'https://twitter.com/creatorai',
                instagram: 'https://instagram.com/creatorai',
            }),
            isVerified: true,
            totalEarnings: 0,
        },
    });

    console.log(`✅ Created creator profile for ${defaultCreator.name}\n`);

    // Create personas
    console.log(`Creating ${personasData.length} personas...\n`);

    for (const personaData of personasData) {
        try {
            const persona = await prisma.persona.upsert({
                where: { id: personaData.id },
                update: {
                    name: personaData.name,
                    description: personaData.description,
                    avatarUrl: personaData.avatarUrl,
                    category: personaData.category,
                    personality: personaData.personality,
                    backstory: personaData.backstory,
                    systemPrompt: personaData.systemPrompt,
                    greetingMessage: personaData.greetingMessage,
                    isPremium: personaData.isPremium,
                    isFeatured: personaData.isFeatured,
                    defaultCoinCost: personaData.defaultCoinCost,
                    traits: personaData.traits,
                },
                create: {
                    id: personaData.id,
                    creatorId: creatorProfile.id,
                    name: personaData.name,
                    description: personaData.description,
                    avatarUrl: personaData.avatarUrl,
                    category: personaData.category,
                    personality: personaData.personality,
                    backstory: personaData.backstory,
                    systemPrompt: personaData.systemPrompt,
                    greetingMessage: personaData.greetingMessage,
                    isPremium: personaData.isPremium,
                    isFeatured: personaData.isFeatured,
                    defaultCoinCost: personaData.defaultCoinCost,
                    traits: personaData.traits,
                    messageCount: 0,
                    likeCount: 0,
                },
            });

            console.log(`  ✅ ${persona.name} (${persona.category})`);
        } catch (error) {
            console.error(`  ❌ Failed to create ${personaData.name}:`, error.message);
        }
    }

    // Create demo user
    console.log('\nCreating demo user...');
    const demoUser = await prisma.user.upsert({
        where: { email: 'demo@example.com' },
        update: {},
        create: {
            email: 'demo@example.com',
            name: 'Demo User',
            password: await argon2.hash('Demo1234!'),
            role: 'USER',
            image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
            emailVerified: new Date(),
            coins: 1000,
        },
    });

    console.log(`✅ Created demo user: ${demoUser.email} (Password: Demo1234!)`);

    // Create coin wallet for demo user
    await prisma.coinWallet.upsert({
        where: { userId: demoUser.id },
        update: {},
        create: {
            userId: demoUser.id,
            balance: 1000,
            lifetimeEarnings: 0,
            lifetimeSpent: 0,
        },
    });

    console.log('✅ Created coin wallet for demo user');

    // Create sample conversation with Ami
    console.log('\nCreating sample conversation...');

    const ami = await prisma.persona.findUnique({ where: { id: 'ami-sweetheart' } });
    if (ami) {
        const conversation = await prisma.conversation.create({
            data: {
                userId: demoUser.id,
                personaId: ami.id,
            },
        });

        // Add welcome message
        await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: ami.id,
                content: ami.greetingMessage,
                sender: 'CREATOR',
            },
        });

        console.log(`✅ Created sample conversation with ${ami.name}`);
    }

    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Personas: ${personasData.length}`);
    console.log(`  - Featured: ${personasData.filter((p: any) => p.isFeatured).length}`);
    console.log(`  - Premium: ${personasData.filter((p: any) => p.isPremium).length}`);
    console.log(`  - Creator: creator@creatorai.com (Password: CreatorAI2024!)`);
    console.log(`  - Demo User: demo@example.com (Password: Demo1234!)\n`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
