import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SpeechService } from './speech.service';
import { AiService } from '../ai/ai.service';

@Controller('speech')
export class SpeechController {
  constructor(
    private speechService: SpeechService,
    private aiService: AiService,
  ) {}

  // 🎤 Only speech → text
  @Post('transcribe')
  @UseInterceptors(FileInterceptor('file'))
  async transcribe(@UploadedFile() file: Express.Multer.File) {
    const text = await this.speechService.transcribe(file.path);

    return {
      success: true,
      text,
    };
  }

  // 🔥 Full flow: speech → AI search
  @Post('voice-search')
  @UseInterceptors(FileInterceptor('file'))
  async voiceSearch(@UploadedFile() file: Express.Multer.File) {
    const text = await this.speechService.transcribe(file.path);

    const aiResult = await this.aiService.processWithGemini(text);

    return {
      success: true,
      text,
      ...aiResult,
    };
  }
}