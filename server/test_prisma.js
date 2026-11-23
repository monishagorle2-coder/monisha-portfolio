import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

console.log('Testing Prisma 7 Client connection to Neon PostgreSQL...');

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('1. Connecting to database via Prisma...');
    await prisma.$connect();
    console.log('✔ [PASS] Connected successfully to Neon PostgreSQL!');

    // 2. Write a clearly identified test record
    console.log('\n2. Creating a test contact submission record...');
    const testRecord = await prisma.contactSubmission.create({
      data: {
        name: 'Verification Bot (Test)',
        email: 'stage3-test@example.com',
        subject: 'Stage 3 Automated Verification',
        message: 'This is a temporary test record verifying Neon read/write capability.'
      }
    });

    console.log(`✔ [PASS] Created test submission with ID: ${testRecord.id}`);
    console.log('   Record details:', {
      id: testRecord.id,
      name: testRecord.name,
      email: testRecord.email,
      subject: testRecord.subject,
      createdAt: testRecord.createdAt
    });

    // 3. Read back the test record to verify query capability
    console.log('\n3. Reading back the test record...');
    const fetchedRecord = await prisma.contactSubmission.findUnique({
      where: { id: testRecord.id }
    });

    if (fetchedRecord && fetchedRecord.id === testRecord.id) {
      console.log('✔ [PASS] Successfully fetched test record from Neon PostgreSQL!');
    } else {
      throw new Error('Failed to retrieve test record');
    }

    // 4. Delete the test record to clean up
    console.log('\n4. Cleaning up test record...');
    await prisma.contactSubmission.delete({
      where: { id: testRecord.id }
    });
    console.log('✔ [PASS] Test record successfully deleted. Database clean!');

    // 5. Verify total count is clean
    const remainingCount = await prisma.contactSubmission.count();
    console.log(`\n5. Current contact_submissions count: ${remainingCount}`);

    console.log('\n======================================================');
    console.log('🎉 ALL PRISMA DATABASE READ/WRITE CHECKS PASSED!');
    console.log('======================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Prisma verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
