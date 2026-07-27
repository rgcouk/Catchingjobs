import { Router } from 'express';
import { put } from '@vercel/blob';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload a single file
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Only allow specific file types for safety
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed.' });
    }

    const file = req.file;
    const blob = await put(file.originalname, file.buffer, {
      access: 'public', // Using public for now, but in a real secure scenario we would use 'public' with random URLs, or client-side uploads with restricted tokens.
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    res.status(200).json(blob);
  } catch (error) {
    console.error('Blob upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;
