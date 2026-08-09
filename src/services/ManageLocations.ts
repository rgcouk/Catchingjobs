import type { PrismaClient } from '@prisma/client';
import { DomainError, NotFoundError } from './exceptions';

export class ManageLocations {
  constructor(private prisma: PrismaClient) {}

  async getLocations() {
    return this.prisma.region.findMany({
      include: { towns: true },
    });
  }

  async createLocation(body: any) {
    const {
      id,
      name,
      county,
      seoCopy,
      description,
      phoneNumber,
      type,
      regionId,
      pickupPoint,
      surrounding,
      localizedCopy,
    } = body;
    if (type === 'region') {
      return this.prisma.region.create({
        data: {
          id,
          name,
          county: county || '',
          seoCopy: seoCopy || '',
          description: description || null,
          phoneNumber: phoneNumber || null,
        },
      });
    } else if (type === 'town') {
      return this.prisma.town.create({
        data: {
          id,
          name,
          pickupPoint: pickupPoint || '',
          surrounding: surrounding || '',
          localizedCopy: localizedCopy || '',
          description: description || null,
          phoneNumber: phoneNumber || null,
          regionId,
        },
      });
    } else {
      throw new DomainError('Invalid location type', 400);
    }
  }

  async updateLocation(type: string, id: string, body: any) {
    const {
      name,
      county,
      seoCopy,
      description,
      phoneNumber,
      regionId,
      pickupPoint,
      surrounding,
      localizedCopy,
    } = body;
    if (type === 'region') {
      return this.prisma.region.update({
        where: { id },
        data: { name, county, seoCopy, description, phoneNumber },
      });
    } else if (type === 'town') {
      return this.prisma.town.update({
        where: { id },
        data: { name, pickupPoint, surrounding, localizedCopy, description, phoneNumber, regionId },
      });
    } else {
      throw new DomainError('Invalid location type', 400);
    }
  }

  async deleteLocation(type: string, id: string) {
    if (type === 'region') {
      await this.prisma.region.delete({ where: { id } });
    } else if (type === 'town') {
      await this.prisma.town.delete({ where: { id } });
    } else {
      throw new DomainError('Invalid location type', 400);
    }
  }
}
