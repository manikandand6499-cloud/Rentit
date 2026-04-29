import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /// ✅ SEND MESSAGE
  @Post('send')
  send(@Body() body: CreateMessageDto) {
    return this.chatService.sendMessage(body);
  }

  /// ✅ CHAT LIST (MUST COME FIRST)
  @Get('list')
  getList(@Query('userId') userId: string) {
    const uid = Number(userId);

    if (!uid) {
      throw new BadRequestException('Invalid userId');
    }

    return this.chatService.getChatList(uid);
  }

  /// ✅ GET MESSAGES BETWEEN USERS
  @Get(':propertyId')
  get(
    @Param('propertyId') propertyId: string,
    @Query('userId') userId: string,
    @Query('otherUserId') otherUserId: string,
  ) {
    const pid = Number(propertyId);
    const uid = Number(userId);
    const oid = Number(otherUserId);

    if (!pid || !uid || !oid) {
      throw new BadRequestException('Invalid parameters');
    }

    return this.chatService.getMessages(pid, uid, oid);
  }
}