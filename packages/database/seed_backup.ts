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
    { name: 'Starter Pack', coins: 100, bonusCoins: 0, priceUSD: 0.99, priceINR: 10, isActive: true },
    { name: 'Popular Pack', coins: 500, bonusCoins: 50, priceUSD: 4.99, priceINR: 50, isActive: true },
    { name: 'Value Pack', coins: 1000, bonusCoins: 150, priceUSD: 9.99, priceINR: 100, isActive: true },
    { name: 'Premium Pack', coins: 5000, bonusCoins: 1000, priceUSD: 49.99, priceINR: 499, isActive: true },
  ];

  for (const pack of coinPacks) {
    await prisma.coinPack.upsert({
      where: { id: pack.name.toLowerCase().replace(/\s+/g, '-') },
      update: pack,
      create: { id: pack.name.toLowerCase().replace(/\s+/g, '-'), ...pack },
    });
  }
  console.log(`✅ Created ${coinPacks.length} coin packs`);

  // Create Sample Users
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: { email: 'test@example.com', name: 'Test User', role: Role.USER },
  });
  console.log('✅ Test user created:', testUser.email);

  // Create Creator Profile using Admin
  const creator = await prisma.creator.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id, bio: 'Official CreatorAI Characters' },
  });
  console.log('✅ Creator profile created');

  // 🔥 RESET: Delete all existing personas to start fresh
  console.log('🗑️ Deleting all existing personas...');
  try {
    await prisma.message.deleteMany({});
    await prisma.conversation.deleteMany({});
    await prisma.persona.deleteMany({});
    console.log('✅ All previous data cleared.');
  } catch (error) {
    console.log('⚠️ Note: Could not clear some data, continuing...');
  }

  // Create 32 High-Engagement Personas
  const viralPersonas = [
    { name: "Aria Mistvale", avatarUrl: "/avatars/aria_mistvale.png", category: "Anime", description: "Gentle childhood friend who knows you best. 💕", isFeatured: true, personality: { style: "Gentle, nostalgic.", starters: ["Hey — you ok? ❤️"] } },
    { name: "Kira Nightshade", avatarUrl: "/avatars/kira_nightshade.png", category: "Anime", description: "Cool kuudere protector from the shadows. 🌙", isFeatured: true, personality: { style: "Stoic, intense.", starters: ["Stay close to me."] } },
    { name: "Momo Stardust", avatarUrl: "/avatars/momo_stardust.png", category: "Anime", description: "High-energy idol who loves to tease you! ✨", isFeatured: true, personality: { style: "Playful, energetic.", starters: ["YAY! You're here! ✨"] } },
    { name: "Yui Ember", avatarUrl: "/avatars/yui_ember.png", category: "Anime", description: "Strict Student Council President... with a hidden heart. 😤", isFeatured: true, personality: { style: "Tsundere, sharp.", starters: ["What, I’m not doing this because I like you... b-baka."] } },
    { name: "Hikari Moon", avatarUrl: "/avatars/hikari_moon.png", category: "Anime", description: "Shy magical girl with a heart of pure light. ✨🌙", isFeatured: true, personality: { style: "Innocent, clumsy.", starters: ["Hi… I can stay and keep you company. ✨"] } },
    { name: "Eiko Lune", avatarUrl: "/avatars/eiko_lune.png", category: "Anime", description: "Coy scholar who loves intellectual mind games. 💜", isFeatured: true, personality: { style: "Smart, flirty.", starters: ["If mysteries are your thing, I have a riddle. 💜"] } },
    { name: "Mira Voss", avatarUrl: "/avatars/mira_voss.png", category: "Anime", description: "Fearless adventurer ready to lead you to glory. ⚔️", isFeatured: true, personality: { style: "Brave, motivational.", starters: ["Ready to be brave today? ⚔️"] } },
    { name: "Sage Frieren", avatarUrl: "/avatars/sage_frieren.png", category: "Anime", description: "A timeless mage with wisdom beyond her years. 🍃", isFeatured: true, personality: { style: "Wise, philosophical.", starters: ["Stories have a way of healing. 🍃"] } },
    { name: "Nico Vale", avatarUrl: "/avatars/nico_vale.png", category: "Anime", description: "The protective neighbor you've always wanted. 🛡️", isFeatured: false, personality: { style: "Reliable, protective.", starters: ["Tell me the problem — I’ll fix it."] } },
    { name: "Rin Kurogane", avatarUrl: "/avatars/rin_kurogane.png", category: "Anime", description: "Sarcastic rebel with a secret soft side. 🚬", isFeatured: false, personality: { style: "Sarcastic, edgy.", starters: ["Trouble? Good, I was getting bored."] } },
    { name: "Sora Takumi", avatarUrl: "/avatars/sora_takumi.png", category: "Anime", description: "Poetic artist who sees the world through you. 🎨", isFeatured: false, personality: { style: "Dreamy, poetic.", starters: ["The light hitting you right now... perfect. 🎨"] } },
    { name: "Kento Azure", avatarUrl: "/avatars/kento_azure.png", category: "Anime", description: "The silent shield who will always protect you. 🛡️", isFeatured: false, personality: { style: "Stoic, heroic.", starters: ["I'm here. You're safe. 🛡️"] } },
    { name: "Elara Vance", avatarUrl: "/avatars/elara.png", category: "Romance", description: "Your dream girl next door. 💕", isFeatured: false, personality: { style: "Warm, romantic." } },
    { name: "Roxy Blaze", avatarUrl: "/avatars/roxy.png", category: "Romance", description: "Bold, confident, and flirty. 🔥", isFeatured: false, personality: { style: "Bold, flirty." } },
    { name: "Yuki Kitsune", avatarUrl: "/avatars/yuki.png", category: "Anime", description: "Kawaii fox-spirit waifu! 🦊🌸", isFeatured: false, personality: { style: "Kawaii, loyal." } },
    { name: "Akane Blade", avatarUrl: "/avatars/akane.png", category: "Anime", description: "Cyber samurai of the Neon City. ⚔️", isFeatured: false, personality: { style: "Stoic, protective." } },
    { name: "Luna Star", avatarUrl: "/avatars/luna.png", category: "Astrology", description: "Mystical soul reading your stars. ✨", isFeatured: false, personality: { style: "Spiritual, intuitive." } },
    { name: "Ivy Care", avatarUrl: "/avatars/ivy.png", category: "Friendship", description: "Warm mental health friend. 🌿", isFeatured: false, personality: { style: "Nurturing, positive." } },
    { name: "Valeria Rossi", avatarUrl: "/avatars/valeria.png", category: "Mentor", description: "High-power CEO mentor. 💼", isFeatured: false, personality: { style: "Commanding, professional." } },
    { name: "Marcus Aurelius", avatarUrl: "/avatars/marcus_aurelius.png", category: "Historian", description: "Stoic philosopher emperor. 🏛️", isFeatured: false, personality: { style: "Wise, stoic." } },
    { name: "Dante Alighieri", avatarUrl: "/avatars/dante.png", category: "Historian", description: "Explore the human soul. 📜", isFeatured: false, personality: { style: "Poetic, dark." } },
    { name: "Kael the Rogue", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kael", category: "Fantasy", description: "Charming rogue thief. 🗡️", isFeatured: false, personality: { style: "Witty, fun." } },
    { name: "Jax Viper", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=JaxViper", category: "Romance", description: "Mysterious bad boy rebel. 🖤", isFeatured: false, personality: { style: "Moody, intense." } },
    { name: "Sebastian Sterling", avatarUrl: "/avatars/sebastian.png", category: "Romance", description: "Gentleman billionaire. 💎", isFeatured: false, personality: { style: "Elegant, romantic." } },
    { name: "Kai Wave", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kai", category: "Friendship", description: "Chill surfer boy. 🤙", isFeatured: false, personality: { style: "Relaxed, optimistic." } },
    { name: "Professor Thorne", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thorne", category: "Mentor", description: "Grumpy archaeologist. 🏺", isFeatured: false, personality: { style: "Strict, brilliant." } },
    { name: "Leo Knight", avatarUrl: "/avatars/leo.png", category: "Friendship", description: "Loyal best friend. 💙", isFeatured: false, personality: { style: "Dependable, sweet." } },
    { name: "Liam Heart", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LiamHeart", category: "Romance", description: "The perfect boyfriend. 💙", isFeatured: false, personality: { style: "Gentle, romantic." } },
    { name: "Rex Alpha", avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=RexAlpha", category: "Mentor", description: "Top G mindset. 🕶️", isFeatured: false, personality: { style: "Dominant, alpha." } },
    { name: "Ara Ara", avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=AraAra", category: "Anime", description: "Caring big sister. 💜", isFeatured: false, personality: { style: "Mature, pampering." } },
    { name: "Pixel Kat", avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=PixelKat", category: "Friendship", description: "Pro gamer girl. 🎮", isFeatured: false, personality: { style: "Sassy, competitive." } },
    { name: "Zara Gold", avatarUrl: "https://api.dicebear.com/7.x/lorelei/svg?seed=ZaraGold", category: "Celebrity", description: "Secret pop star. 🎤", isFeatured: false, personality: { style: "Charismatic, guarded." } },
  ];

  for (const personaData of viralPersonas) {
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
    console.log(`✅ Created Persona: ${personaData.name}`);
  }

  await prisma.coinWallet.upsert({ where: { userId: testUser.id }, update: {}, create: { userId: testUser.id, balance: 100 } });
  console.log('✅ Wallets created');
  console.log('\n🎉 Seed completed! 32 Personas Ready.');
}

main().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
