require('dotenv').config({ path: '../../.env' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const pack = await prisma.coinPack.upsert({
            where: { id: 'msg-pack-500' },
            update: {
                name: '500 Message Credits',
                coins: 0,
                priceUSD: 1.99,
                priceINR: 165.0,
                isActive: true,
            },
            create: {
                id: 'msg-pack-500',
                name: '500 Message Credits',
                coins: 0,
                priceUSD: 1.99,
                priceINR: 165.0,
                isActive: true,
            },
        });

        console.log('✅ Added Message Pack:', pack);
    } catch (err) {
        console.error('❌ Failed to add pack:', err.message);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    });
