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

  // ✅ FIX: filter to only the conversation between userId and the
  // other party, so private messages are not leaked to other users.
  async getMessages(propertyId: number, userId: number) {
    return this.prisma.message.findMany({
      where: {
        propertyId,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}