// speech.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Get,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as speechService_1 from './speech.service';

@Controller('speech')
export class SpeechController {
  constructor(private readonly speechService: speechService_1.SpeechService) {}

  // ──────────────────────────────────────────
  // HEALTH CHECK
  // GET /speech/health
  // ──────────────────────────────────────────
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'Google Cloud Speech-to-Text v2',
      timestamp: new Date().toISOString(),
    };
  }

  // ──────────────────────────────────────────
  // FILE UPLOAD TRANSCRIPTION
  // POST /speech/transcribe
  //
  // Body: multipart/form-data
  //   audio              — audio file (wav, webm, mp3, ogg, flac)
  //   language           — BCP-47 code (default: en-IN)
  //   model              — chirp | chirp_2 | latest_long | latest_short
  //   alternativeLanguages — comma-separated e.g. "hi-IN,ta-IN"
  //
  // Flutter usage:
  //   var req = http.MultipartRequest('POST', Uri.parse('$base/speech/transcribe'));
  //   req.files.add(await http.MultipartFile.fromPath('audio', filePath));
  //   req.fields['language'] = 'en-IN';
  //   req.fields['model'] = 'chirp_2';
  //   var res = await req.send();
  //   var body = jsonDecode(await res.stream.bytesToString());
  //   print(body['transcript']);
  // ──────────────────────────────────────────
  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('audio', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    }),
  )
  async transcribeUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body('language') language = 'en-IN',
    @Body('model') model: speechService_1.SpeechModel = 'chirp_2',
    @Body('alternativeLanguages') altLangs?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file provided. Use field name: audio');
    }

    const results = await this.speechService.transcribeFile(file.buffer, {
      languageCode: language,
      model,
      alternativeLanguageCodes: altLangs
        ? altLangs.split(',').map((l) => l.trim())
        : undefined,
      enableAutoPunctuation: true,
      enableWordTimeOffsets: false,
    });

    const fullTranscript = results.map((r) => r.transcript).join(' ');
    const avgConfidence =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.confidence, 0) / results.length
        : 0;

    return {
      success: true,
      transcript: fullTranscript,
      confidence: Math.round(avgConfidence * 100) / 100,
      segments: results,
      language: results[0]?.languageCode ?? language,
      model,
      wordCount: fullTranscript.split(/\s+/).filter(Boolean).length,
    };
  }

  // ──────────────────────────────────────────
  // RAW BASE64 TRANSCRIPTION
  // POST /speech/transcribe-raw
  //
  // Body: JSON
  //   audioBase64  — base64 encoded audio bytes
  //   language     — BCP-47 code (default: en-IN)
  //   encoding     — LINEAR16 | WEBM_OPUS | OGG_OPUS | MP3 | FLAC
  //   sampleRate   — e.g. 16000
  //   model        — chirp_2 (default)
  //
  // Flutter usage:
  //   final bytes = await file.readAsBytes();
  //   final base64Audio = base64Encode(bytes);
  //   await http.post(Uri.parse('$base/speech/transcribe-raw'),
  //     headers: {'Content-Type': 'application/json'},
  //     body: jsonEncode({
  //       'audioBase64': base64Audio,
  //       'language': 'en-IN',
  //       'encoding': 'LINEAR16',
  //       'sampleRate': 16000,
  //     }),
  //   );
  // ──────────────────────────────────────────
  @Post('transcribe-raw')
  async transcribeRaw(
    @Body('audioBase64') audioBase64: string,
    @Body('language') language = 'en-IN',
    @Body('encoding') encoding: speechService_1.AudioEncoding = 'LINEAR16',
    @Body('sampleRate') sampleRate = 16000,
    @Body('model') model: speechService_1.SpeechModel = 'chirp_2',
    @Body('alternativeLanguages') altLangs?: string,
  ) {
    if (!audioBase64) {
      throw new BadRequestException('audioBase64 field is required');
    }

    let buffer: Buffer;
    try {
      buffer = Buffer.from(audioBase64, 'base64');
    } catch {
      throw new BadRequestException('Invalid base64 audio data');
    }

    if (buffer.length === 0) {
      throw new BadRequestException('Audio buffer is empty');
    }

    const results = await this.speechService.transcribeFile(buffer, {
      languageCode: language,
      encoding,
      sampleRateHertz: sampleRate,
      model,
      enableAutoPunctuation: true,
      alternativeLanguageCodes: altLangs
        ? altLangs.split(',').map((l) => l.trim())
        : undefined,
    });

    const fullTranscript = results.map((r) => r.transcript).join(' ');

    return {
      success: true,
      transcript: fullTranscript,
      confidence: results[0]?.confidence ?? 0,
      language: results[0]?.languageCode ?? language,
      model,
      wordCount: fullTranscript.split(/\s+/).filter(Boolean).length,
    };
  }

  // ──────────────────────────────────────────
  // SUPPORTED LANGUAGES LIST
  // GET /speech/languages
  // ──────────────────────────────────────────
  @Get('languages')
  getSupportedLanguages() {
    return {
      recommended: [
        { code: 'en-IN', label: 'English (India)' },
        { code: 'hi-IN', label: 'Hindi' },
        { code: 'ta-IN', label: 'Tamil' },
        { code: 'te-IN', label: 'Telugu' },
        { code: 'ml-IN', label: 'Malayalam' },
        { code: 'kn-IN', label: 'Kannada' },
        { code: 'bn-IN', label: 'Bengali' },
        { code: 'mr-IN', label: 'Marathi' },
        { code: 'gu-IN', label: 'Gujarati' },
        { code: 'pa-IN', label: 'Punjabi' },
      ],
      models: {
        chirp_2: 'Fastest + top accuracy — recommended for most use cases',
        chirp: 'Highest accuracy for long recordings (> 1 min)',
        latest_short: 'Optimized for short voice commands (< 60s)',
        latest_long: 'Optimized for long recordings',
      },
    };
  }
}