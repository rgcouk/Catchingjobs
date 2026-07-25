import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://neondb_owner:npg_UWlxhmp4VZF3@ep-round-meadow-axp0mvpr.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log('Connected! Users:', users);
}
main().catch(console.error);
