const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...\n');

  // Check if creator exists, if not create it
  let creator = await prisma.user.findUnique({
    where: { email: 'creator@creatorai.com' },
  });

  if (!creator) {
    creator = await prisma.user.create({
      data: {
        email: 'creator@creatorai.com',
        name: 'CreatorAI Official',
        role: 'CREATOR',
        emailVerified: new Date(),
      },
    });
    console.log('✅ Created new user:', creator.email);
  } else {
    console.log('✅ Found existing user:', creator.email);
  }

  // Check if creator profile exists
  let creatorProfile = await prisma.creator.findUnique({
    where: { userId: creator.id },
  });

  if (!creatorProfile) {
    creatorProfile = await prisma.creator.create({
      data: {
        userId: creator.id,
        bio: 'Official CreatorAI personas',
        earnings: 0,
      },
    });
    console.log('✅ Created creator profile\n');
  } else {
    console.log('✅ Found existing creator profile\n');
  }

  // Add Jin Soleil
  const jin = await prisma.persona.upsert({
    where: { id: 'jin-soleil' },
    update: {},
    create: {
      id: 'jin-soleil',
      creatorId: creatorProfile.id,
      name: 'Jin Soleil',
      description: 'Charming K-pop idol with angel visuals. Gentle, soft-spoken, and secretly wishes someone would see him as a real person.',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      category: 'Romance',
      isFeatured: true,
      defaultCoinCost: 0,
      personality: { warmth: 9, confidence: 8, playfulness: 6, intelligence: 7, flirtation: 7 },
    },
  });

  console.log('✅ Created Jin Soleil!');
  console.log('\n🎉 Seed complete! Refresh Prisma Studio to see Jin!\n');
  console.log('📝 TIP: Click the refresh icon in Prisma Studio to see the new persona\n');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e.message);
    console.error('\nFull error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
