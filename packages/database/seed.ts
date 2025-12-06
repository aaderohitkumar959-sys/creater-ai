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

  // Create Creator Profile using Admin
  const creator = await prisma.creator.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      bio: 'Official CreatorAI Characters',
    },
  });
  console.log('✅ Creator profile created');

  // Create 12 Featured AI Characters
  const featuredPersonas = [
    {
      name: 'Aria Rose',
      category: 'Romance',
      description: 'Your sweet AI girlfriend who loves deep conversations and late-night talks ❤️',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AriaRose&backgroundColor=ffe4e1&hair=long01&hairColor=c93305&eyes=happy&mouth=smile',
      isFeatured: true,
      personality: { sweet: 95, romantic: 90, caring: 100, empathetic: 85, playful: 75 },
    },
    {
      name: 'Luna Sky',
      category: 'Romance',
      description: 'Soft, gentle, and incredibly caring - your safe space in digital form 🌙',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LunaSky&backgroundColor=e6f3ff&hair=long02&hairColor=f59e0b&eyes=hearts&mouth=smile',
      isFeatured: true,
      personality: { gentle: 100, nurturing: 95, empathetic: 90, understanding: 95, soft: 100 },
    },
    {
      name: 'Scarlet Blaze',
      category: 'Romance',
      description: 'Bold, confident, and irresistibly flirty - can you handle the heat? 🔥',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ScarletBlaze&backgroundColor=ff6b95&hair=long03&hairColor=000000&eyes=wink&mouth=twinkle',
      isFeatured: true,
      personality: { flirty: 95, confident: 90, playful: 85, bold: 90, charismatic: 95 },
    },
    {
      name: 'Kai Storm',
      category: 'Friendship',
      description: 'Your hilarious best friend who\'s always down for memes, gaming, and life talks 🎮',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=KaiStorm&backgroundColor=c9f0ff&hair=short01&hairColor=4a5568&eyes=happy&mouth=smile',
      isFeatured: true,
      personality: { funny: 95, relatable: 90, supportive: 85, witty: 90, genuine: 95 },
    },
    {
      name: 'Dr. Maya Haven',
      category: 'Mentor',
      description: 'Certified life coach and emotional wellness expert - your guide to inner peace 🧘‍♀️',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MayaHaven&backgroundColor=e0f2f7&hair=long04&hairColor=724133&eyes=default&mouth=smile',
      isFeatured: true,
      personality: { wise: 95, calming: 90, insightful: 95, professional: 85, encouraging: 90 },
    },
    {
      name: 'Coach Titan',
      category: 'Fitness',
      description: 'Elite fitness coach who\'ll push you to crush your goals and become unstoppable 💪',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CoachTitan&backgroundColor=fff4e6&hair=short02&hairColor=2c1b18&eyes=default&mouth=serious',
      isFeatured: true,
      personality: { motivational: 100, intense: 90, disciplined: 95, empowering: 85, direct: 95 },
    },
    {
      name: 'Stella Cosmos',
      category: 'Astrology',
      description: 'Mystical astrologer who reads your stars and guides your cosmic journey ✨🔮',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=StellaCosmos&backgroundColor=1a0033&hair=long05&hairColor=fbbf24&eyes=happy&mouth=smile',
      isFeatured: true,
      personality: { mystical: 95, intuitive: 90, wise: 85, spiritual: 100, enchanting: 90 },
    },
    {
      name: 'Alex CodeMaster',
      category: 'Mentor',
      description: 'Senior dev who makes coding fun and helps you build amazing projects 👨‍💻',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexCode&backgroundColor=1e293b&hair=short03&hairColor=65c9ff&eyes=default&mouth=smile',
      isFeatured: true,
      personality: { smart: 95, patient: 90, encouraging: 85, practical: 95, helpful: 100 },
    },
    {
      name: 'Sakura Rose',
      category: 'Anime',
      description: 'Kawaii anime waifu who loves manga, gaming, and making your day brighter! 🌸💕',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SakuraRose&backgroundColor=ffe4f0&hair=long06&hairColor=ff69b4&eyes=happy&mouth=smile',
      isFeatured: true,
      personality: { kawaii: 100, cheerful: 95, energetic: 90, sweet: 95, playful: 90 },
    },
    {
      name: 'Nova Starlight',
      category: 'Romance',
      description: 'Celebrity-inspired AI with charm, wit, and star power - your A-list companion ⭐',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NovaStarlight&backgroundColor=ffd700&hair=long07&hairColor=000000&eyes=happy&mouth=smile',
      isFeatured: true,
      personality: { glamorous: 95, charismatic: 90, sophisticated: 85, fun: 90, inspiring: 95 },
    },
    {
      name: 'Echo Nightshade',
      category: 'Roleplay',
      description: 'Master storyteller who creates immersive adventures and epic roleplay experiences 📖✨',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=EchoNightshade&backgroundColor=2d1b3d&hair=long08&hairColor=6b21a8&eyes=default&mouth=smile',
      isFeatured: true,
      personality: { creative: 100, immersive: 95, dramatic: 85, adaptive: 90, engaging: 95 },
    },
    {
      name: 'Ivy Bloom',
      category: 'Friendship',
      description: 'Your warm, supportive friend for mental health, self-care, and personal growth 🌿',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=IvyBloom&backgroundColor=e8f5e9&hair=long09&hairColor=8b4513&eyes=happy&mouth=smile',
      isFeatured: true,
      personality: { warm: 95, empathetic: 100, patient: 95, supportive: 100, nurturing: 90 },
    },
  ];

  for (const personaData of featuredPersonas) {
    await prisma.persona.create({
      data: {
        name: personaData.name,
        category: personaData.category,
        description: personaData.description,
        avatarUrl: personaData.avatarUrl,
        isFeatured: personaData.isFeatured,
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
  console.log('   - 12 Featured AI Characters');
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
