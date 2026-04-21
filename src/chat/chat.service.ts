import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(data: {
    senderId: number;
    receiverId: number;
    propertyId: number;
    message: string;
  }) {
    return this.prisma.message.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        propertyId: data.propertyId,
        message: data.message,
      },
    });
  }

  async getMessages(propertyId: number, userId: number, otherUserId: number) {
  return this.prisma.message.findMany({
    where: {
      propertyId,
      OR: [
        {
          senderId: userId,
          receiverId: otherUserId,
        },
        {
          senderId: otherUserId,
          receiverId: userId,
        },
      ],
    },
    orderBy: { createdAt: 'asc' },
  });
}
}