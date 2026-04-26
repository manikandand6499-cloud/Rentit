// src/ai/ai.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('search')
  search(@Body() body: { query: string }) {
    return this.aiService.search(body.query);
  }
}