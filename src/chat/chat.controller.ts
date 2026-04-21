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

 @Get(':propertyId')
get(
  @Param('propertyId') propertyId: string,
  @Query('userId') userId: string,
  @Query('otherUserId') otherUserId: string,
) {
  return this.chatService.getMessages(
    Number(propertyId),
    Number(userId),
    Number(otherUserId),
  );
}
}