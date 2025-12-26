/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as demoService from '../src/services/demo.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🎲 Generating dummy auctions and guarantees...');

  try {
    // Generate auctions
    console.log('\n📊 Generating auctions...');
    const auctions = await demoService.generateAuctions(5);
    console.log(`✅ Created ${auctions.length} auctions`);

    // Generate guarantee requests
    console.log('\n🛡️ Generating guarantee requests...');
    const guarantees = await demoService.generateGuaranteeRequests(5);
    console.log(`✅ Created ${guarantees.length} guarantee requests`);

    console.log('\n🎉 Successfully generated dummy data!');
    console.log(`   - Auctions: ${auctions.length}`);
    console.log(`   - Guarantee Requests: ${guarantees.length}`);
  } catch (error: any) {
    console.error('❌ Error generating data:', error.message);
    if (error.message.includes('does not exist')) {
      console.error('\n⚠️  Prisma client needs to be regenerated!');
      console.error('   Run: cd backend && npx prisma generate');
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


