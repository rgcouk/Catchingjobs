import type { Prisma, PrismaClient } from '@prisma/client';
import { DomainError } from './services/exceptions.js';

/** Retry only transactions PostgreSQL explicitly aborted, never arbitrary side effects. */
export async function serializable<T>(
  db: PrismaClient,
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(operation, { isolationLevel: 'Serializable' });
    } catch (error) {
      if ((error as { code?: string }).code !== 'P2034') throw error;
      if (attempt === 2) throw new DomainError('Record changed; reload and retry.', 409);
    }
  }
  throw new DomainError('Record changed; reload and retry.', 409);
}
