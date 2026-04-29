import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LikeService {
  constructor(private prisma: PrismaService) {}

  // LIKE / UNLIKE toggle
async toggleLike(userId: number, propertyId: number) {
  const existing = await this.prisma.like.findFirst({
    where: {
      userId,
      propertyId,
    },
  });

  if (existing) {
    await this.prisma.like.delete({
      where: { id: existing.id },
    });

    return { liked: false };
  }

  await this.prisma.like.create({
    data: {
      userId,
      propertyId,
    },
  });

  return { liked: true };
}
  // GET USER LIKES
  async getMyLikes(userId: number) {
    return this.prisma.like.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}