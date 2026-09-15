import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let prisma: PrismaClient;

export function getPrisma() {
  if (!prisma) {
    const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');
    const pool = new pg.Pool({ 
      connectionString: process.env.DATABASE_URL, 
      max: 1,
      ssl: isLocal ? undefined : { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  }
  return prisma;
}
