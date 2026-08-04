import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/catchingjobs';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.application.deleteMany({
    where: {
      email: {
        contains: 'placeholder.clerk.com',
      },
    },
  });
  console.log(`Deleted ${result.count} dummy applications from the template/webhook.`);
  
  // also delete template users if any
  const users = await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'placeholder.clerk.com',
      },
    }
  });
  console.log(`Deleted ${users.count} dummy users.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
