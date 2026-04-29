// speech.module.ts
// Includes: SpeechModule + SpeechGateway (WebSocket for real-time streaming)
//
// INSTALL:
//   npm install @google-cloud/speech @nestjs/websockets @nestjs/platform-socket.io socket.io multer @types/multer
//
// ENV:
//   GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
//   GOOGLE_CLOUD_PROJECT_ID=your-project-id
//
// Add to app.module.ts:
//   imports: [SpeechModule]

import { Module, Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SpeechService, StreamConfig, SpeechModel, AudioEncoding, TranscriptResult } from './speech.service';
import { SpeechController } from './speech.controller';

// ─────────────────────────────────────────────
// WEBSOCKET GATEWAY
// Namespace: /speech
//
// Client → Server events:
//   start_stream   { language?, model?, encoding?, sampleRate?, alternativeLanguages? }
//   audio_chunk    Buffer | ArrayBuffer | base64 string
//   stop_stream    (no payload)
//
// Server → Client events:
//   stream_ready   { message, model, language }
//   transcript     TranscriptResult { transcript, confidence, isFinal, languageCode }
//   stream_error   { message, code }
//   stream_ended   { finalTranscript, wordCount }
//
// Flutter usage:
//   final socket = io('$base/speech',
//     OptionBuilder().setTransports(['websocket']).build());
//
//   socket.on('connect', (_) => socket.emit('start_stream', {
//     'language': 'en-IN', 'model': 'chirp_2',
//     'encoding': 'LINEAR16', 'sampleRate': 16000,
//   }));
//
//   socket.on('transcript', (data) {
//     if (data['isFinal']) print('✅ ${data['transcript']}');
//     else print('… ${data['transcript']}');
//   });
//
//   // Send mic chunks:
//   final stream = await AudioRecorder().startStream(RecordConfig(
//     encoder: AudioEncoder.pcm16bits, sampleRate: 16000, numChannels: 1));
//   stream.listen((chunk) => socket.emit('audio_chunk', chunk));
//
//   // Done:
//   socket.emit('stop_stream');
//   socket.on('stream_ended', (d) => print('Final: ${d['finalTranscript']}'));
// ─────────────────────────────────────────────

interface SessionState {
  recognizeStream: any;
  finalTranscripts: string[];
  config: StreamConfig;
  startedAt: Date;
}

@WebSocketGateway({
  namespace: '/speech',
  cors: { origin: '*', credentials: true },
  transports: ['websocket', 'polling'],
})
export class SpeechGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server | undefined;
  private readonly logger = new Logger(SpeechGateway.name);

  // Per-socket sessions map
  private readonly sessions = new Map<string, SessionState>();

  // Google streaming timeout is ~5 min — auto-restart warning at 4:30
  private readonly SESSION_WARN_MS = 4.5 * 60 * 1000;

  constructor(private readonly speechService: SpeechService) {}

  handleConnection(client: Socket) {
    this.logger.log(`🔌 Connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Disconnected: ${client.id}`);
    this.destroySession(client.id);
  }

  // ── START STREAM ───────────────────────────
  @SubscribeMessage('start_stream')
  handleStartStream(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      language?: string;
      model?: SpeechModel;
      encoding?: AudioEncoding;
      sampleRate?: number;
      alternativeLanguages?: string[];
    } = {},
  ) {
    // Clean up any existing session for this socket
    this.destroySession(client.id);

    const config: StreamConfig = {
      languageCode: payload.language ?? 'en-IN',
      model: payload.model ?? 'chirp_2',
      encoding: payload.encoding ?? 'LINEAR16',
      sampleRateHertz: payload.sampleRate ?? 16000,
      alternativeLanguageCodes: payload.alternativeLanguages,
      enableAutoPunctuation: true,
      enableWordTimeOffsets: false,
    };

    try {
      const recognizeStream = this.speechService.createStreamingSession(config);
      const finalTranscripts: string[] = [];

      // ── Handle Google responses ────────────
      recognizeStream.on('data', (response: any) => {
        const results: any[] = response.results ?? [];

        for (const result of results) {
          if (!result.alternatives?.length) continue;

          const alt = result.alternatives[0];
          const isFinal: boolean = result.isFinal ?? false;

          const transcriptResult: TranscriptResult = {
            transcript: alt.transcript?.trim() ?? '',
            confidence: Math.round((alt.confidence ?? 0) * 100) / 100,
            isFinal,
            languageCode: result.languageCode ?? config.languageCode,
          };

          if (isFinal && transcriptResult.transcript) {
            finalTranscripts.push(transcriptResult.transcript);
          }

          // Push to Flutter
          client.emit('transcript', transcriptResult);
        }
      });

      recognizeStream.on('error', (error: Error) => {
        this.logger.error(`Stream error [${client.id}]: ${error.message}`);

        if (error.message.includes('11') || error.message.includes('DEADLINE')) {
          client.emit('stream_error', {
            message: 'Stream session timed out. Please start a new session.',
            code: 'TIMEOUT',
          });
        } else if (error.message.includes('RESOURCE_EXHAUSTED')) {
          client.emit('stream_error', {
            message: 'API quota exceeded. Please try again later.',
            code: 'QUOTA_EXCEEDED',
          });
        } else {
          client.emit('stream_error', {
            message: error.message,
            code: 'STREAM_ERROR',
          });
        }

        this.sessions.delete(client.id);
      });

      recognizeStream.on('end', () => {
        this.logger.log(`Stream naturally ended [${client.id}]`);
      });

      this.sessions.set(client.id, {
        recognizeStream,
        finalTranscripts,
        config,
        startedAt: new Date(),
      });

      client.emit('stream_ready', {
        message: 'Streaming session started',
        model: config.model,
        language: config.languageCode,
        encoding: config.encoding,
        sampleRate: config.sampleRateHertz,
      });

      this.logger.log(
        `✅ Stream started [${client.id}] model=${config.model} lang=${config.languageCode}`,
      );
    } catch (error) {
      this.logger.error(`Failed to start stream [${client.id}]`, error);
      client.emit('stream_error', {
        message: 'Failed to initialize speech stream. Check server configuration.',
        code: 'INIT_ERROR',
      });
    }
  }

  // ── AUDIO CHUNK ────────────────────────────
  @SubscribeMessage('audio_chunk')
  handleAudioChunk(
    @ConnectedSocket() client: Socket,
    @MessageBody() chunk: Buffer | ArrayBuffer | string,
  ) {
    const session = this.sessions.get(client.id);
    if (!session?.recognizeStream) {
      client.emit('stream_error', {
        message: 'No active stream. Call start_stream first.',
        code: 'NO_SESSION',
      });
      return;
    }

    try {
      let buffer: Buffer;

      if (Buffer.isBuffer(chunk)) {
        buffer = chunk;
      } else if (chunk instanceof ArrayBuffer) {
        buffer = Buffer.from(chunk);
      } else if (typeof chunk === 'string') {
        // base64 encoded from Flutter
        buffer = Buffer.from(chunk, 'base64');
      } else {
        buffer = Buffer.from(chunk as any);
      }

      if (buffer.length > 0) {
        session.recognizeStream.write({ content: buffer });
      }
    } catch (error) {
    }
  }

  // ── STOP STREAM ────────────────────────────
  @SubscribeMessage('stop_stream')
  handleStopStream(@ConnectedSocket() client: Socket) {
    const session = this.sessions.get(client.id);
    if (!session) {
      client.emit('stream_ended', { finalTranscript: '', wordCount: 0 });
      return;
    }

    const finalTranscript = session.finalTranscripts.join(' ').trim();
    const duration = Date.now() - session.startedAt.getTime();

    this.destroySession(client.id);

    client.emit('stream_ended', {
      finalTranscript,
      wordCount: finalTranscript.split(/\s+/).filter(Boolean).length,
      durationMs: duration,
    });

    this.logger.log(
      `🛑 Stream stopped [${client.id}] — "${finalTranscript.substring(0, 80)}${finalTranscript.length > 80 ? '...' : ''}"`,
    );
  }

  // ── CLEANUP ────────────────────────────────
  private destroySession(socketId: string) {
    const session = this.sessions.get(socketId);
    if (!session) return;

    try {
      session.recognizeStream.end();
    } catch (_) {}

    try {
      session.recognizeStream.destroy();
    } catch (_) {}

    this.sessions.delete(socketId);
  }
}

// ─────────────────────────────────────────────
// MODULE
// ─────────────────────────────────────────────

@Module({
  controllers: [SpeechController],
  providers: [SpeechService, SpeechGateway],
  exports: [SpeechService],
})
export class SpeechModule {}