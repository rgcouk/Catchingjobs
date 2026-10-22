import { getPrisma } from '../db.js';

export async function validateDocumentReferences(
  userId: string,
  fields: { idDocumentUri?: string | null; proofOfAddressUri?: string | null },
): Promise<boolean> {
  const values = [fields.idDocumentUri, fields.proofOfAddressUri].filter(
    (value): value is string => typeof value === 'string' && value.length > 0,
  );
  const ids: string[] = [];
  for (const value of values) {
    const match = /^\/api\/upload\/([a-zA-Z0-9_-]+)$/.exec(value);
    if (!match) return false;
    ids.push(match[1]);
  }
  if (!ids.length) return true;
  const distinctIds = [...new Set(ids)];
  return (
    (await getPrisma().privateDocument.count({
      where: { id: { in: distinctIds }, ownerId: userId },
    })) === distinctIds.length
  );
}
