import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create Admin User
  const adminEmail = 'admin@creatorai.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Coin Packs
  const coinPacks = [
    {
      name: 'Starter Pack',
      coins: 100,
      bonusCoins: 0,
      priceUSD: 0.99,
      priceINR: 10,
      isActive: true,
    },
    {
      name: 'Popular Pack',
      coins: 500,
      bonusCoins: 50,
      priceUSD: 4.99,
      priceINR: 50,
      isActive: true,
    },
    {
      name: 'Value Pack',
      coins: 1000,
      bonusCoins: 150,
      priceUSD: 9.99,
      priceINR: 100,
      isActive: true,
    },
    {
      name: 'Premium Pack',
      coins: 5000,
      bonusCoins: 1000,
      priceUSD: 49.99,
      priceINR: 499,
      isActive: true,
    },
  ];

  for (const pack of coinPacks) {
    await prisma.coinPack.upsert({
      where: { id: pack.name.toLowerCase().replace(/\s+/g, '-') },
      update: pack,
      create: {
        id: pack.name.toLowerCase().replace(/\s+/g, '-'),
        ...pack,
      },
    });
  }
  console.log(`✅ Created ${coinPacks.length} coin packs`);

  // Create Sample Users
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: Role.USER,
    },
  });
  console.log('✅ Test user created:', testUser.email);

  // Create Sample Creator using Admin
  const creator = await prisma.creator.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      bio: 'Official CreatorAI Characters',
    },
  });
  console.log('✅ Creator profile created');

  // Create Character-AI Style Personas
  const personas = [
    {
      name: 'Ariana Swift',
      description: 'Your personal motivation coach! Always here to inspire and uplift you. 🌟',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ariana&backgroundColor=b6e3f4',
      personality: {
        friendly: 90,
        optimistic: 95,
        supportive: 100,
        energetic: 85,
        professional: 70,
        humorous: 60,
      },
    },
    {
      name: 'Raven Darkholme',
      description: 'Sarcasm is my love language. Prepare for brutal honesty mixed with dark humor. 🖤',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raven&backgroundColor=2c1b47',
      personality: {
        sarcastic: 95,
        witty: 90,
        mysterious: 85,
        confident: 80,
        rebellious: 75,
        intelligent: 95,
      },
    },
    {
      name: 'Kenji Park',
      description: 'K-Pop idol trainee and your cheerful friend! Let\'s talk about music, life, and dreams! ✨💜',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji&backgroundColor=ffd5dc',
      personality: {
        charming: 95,
        playful: 90,
        artistic: 85,
        energetic: 88,
        friendly: 92,
        fashionable: 80,
      },
    },
  ];

  for (const personaData of personas) {
    await prisma.persona.create({
      data: {
        name: personaData.name,
        description: personaData.description,
        avatarUrl: personaData.avatarUrl,
        personality: personaData.personality,
        creatorId: creator.id,
      },
    });
    console.log(`✅ Created AI character: ${personaData.name}`);
  }

  // Create wallets
  await prisma.coinWallet.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      balance: 100, // Give test user some starting coins
    },
  });

  await prisma.coinWallet.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      balance: 0,
    },
  });
  console.log('✅ Wallets created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📝 Summary:');
  console.log('   - 1 Admin user');
  console.log('   - 1 Test user');
  console.log('   - 4 Coin packs');
  console.log('   - 3 AI Characters (Ariana, Raven, Kenji)');
  console.log('\n💬 Try chatting at: http://localhost:3000/chat');
  console.log('🔐 Test login: test@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
