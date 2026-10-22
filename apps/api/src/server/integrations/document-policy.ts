export const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
export function validDocumentContent(bytes: Uint8Array, type: string): boolean {
  const b = Buffer.from(bytes.subarray(0, 12));
  switch (type) {
    case 'application/pdf':
      return b.subarray(0, 5).toString() === '%PDF-';
    case 'image/jpeg':
      return b[0] === 255 && b[1] === 216 && b[2] === 255;
    case 'image/png':
      return b.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    case 'image/webp':
      return b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP';
    default:
      return false;
  }
}
export const documentUrl = (id: string) => `/api/upload/${encodeURIComponent(id)}`;
