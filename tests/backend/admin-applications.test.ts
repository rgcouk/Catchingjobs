import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import createAdminRouter from '../../server/routes/admin.js';

const mockPrisma = {
  application: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
};

const app = express();
app.use(express.json());
// apply middleware manually as it would be in index
app.use((req: any, res: any, next: any) => {
  req.auth = { userId: 'admin123' };
  next();
});
app.use('/api/admin', createAdminRouter(mockPrisma as any));

describe('Admin Applications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/admin/applications', () => {
    it('should return a list of applications and total count', async () => {
      mockPrisma.application.findMany.mockResolvedValue([{ id: 1, name: 'John Doe' }]);
      mockPrisma.application.count.mockResolvedValue(1);

      const response = await request(app).get('/api/admin/applications?skip=0&take=10');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        data: [{ id: 1, name: 'John Doe' }],
        total: 1,
        skip: 0,
        take: 10,
      });

      expect(mockPrisma.application.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: { user: true, jobPosting: true },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('GET /api/admin/applications/:id', () => {
    it('should return a single application if found', async () => {
      mockPrisma.application.findUnique.mockResolvedValue({ id: 1, name: 'John Doe' });

      const response = await request(app).get('/api/admin/applications/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: 'John Doe' });
      expect(mockPrisma.application.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { user: true, jobPosting: true },
      });
    });

    it('should return 404 if application not found', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      const response = await request(app).get('/api/admin/applications/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Application not found' });
    });
  });

  describe('PATCH /api/admin/applications/:id', () => {
    it('should update an application', async () => {
      mockPrisma.application.update.mockResolvedValue({ id: 1, name: 'John Doe', status: 'APPROVED' });

      const response = await request(app)
        .patch('/api/admin/applications/1')
        .send({ status: 'APPROVED', user: { id: 'x' }, createdAt: '2023-01-01' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: 'John Doe', status: 'APPROVED' });
      
      // Should strip user and createdAt from update payload
      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { status: 'APPROVED' }, // stripped other fields
      });
    });
  });
});
