import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('send')
  send(@Body() body: CreateMessageDto) {
    return this.chatService.sendMessage(body);
  }

  // ✅ FIX: accept userId as query param so we return only the
  // conversation between the two parties for this property.
  @Get(':propertyId')
  get(
    @Param('propertyId') propertyId: string,
    @Query('userId') userId: string,
  ) {
    return this.chatService.getMessages(Number(propertyId), Number(userId));
  }
}