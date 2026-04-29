import { Module } from '@nestjs/common';
import { SpeechController } from './speech.controller';
import { SpeechService } from './speech.service';
import { AiModule } from '../ai/ai.module'; // 👈 connect AI

@Module({
  imports: [AiModule], // 🔥 important
  controllers: [SpeechController],
  providers: [SpeechService],
})
export class SpeechModule {}