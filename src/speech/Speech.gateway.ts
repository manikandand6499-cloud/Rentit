// import {
//   WebSocketGateway,
//   WebSocketServer,
//   SubscribeMessage,
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   MessageBody,
//   ConnectedSocket,
//   WsException,
// } from '@nestjs/websockets';
// import { UseGuards, Logger } from '@nestjs/common';
// import { Server, Socket } from 'socket.io';
// import { SpeechService, SpeechConfig } from './speech.service';
// import { WsJwtGuard } from '../auth/ws-jwt.guard';
// import { randomUUID } from 'crypto';

// // ── Events emitted to client ─────────────────────────
// // transcript      { transcript, isFinal, confidence, words, alternatives }
// // session_started { sessionId }
// // session_ended   { sessionId, reason }
// // error           { message, code }

// @WebSocketGateway({
//   cors: {
//     origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3001'],
//     credentials: true,
//   },
//   namespace: '/speech',
//   transports: ['websocket'],
// })
// export class SpeechGateway implements OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer() server: Server;
//   private readonly logger = new Logger(SpeechGateway.name);

//   // Map socketId → sessionId
//   private readonly socketSessions = new Map<string, string>();

//   constructor(private speechService: SpeechService) {}

//   // ── Connection lifecycle ────────────────────────────
//   async handleConnection(client: Socket) {
//     this.logger.log(`Client connected: ${client.id}`);
//   }

//   handleDisconnect(client: Socket) {
//     this.logger.log(`Client disconnected: ${client.id}`);
//     const sessionId = this.socketSessions.get(client.id);
//     if (sessionId) {
//       this.speechService.endSession(sessionId);
//       this.socketSessions.delete(client.id);
//     }
//   }

//   // ── Start streaming session ─────────────────────────
//   @UseGuards(WsJwtGuard)
//   @SubscribeMessage('start_session')
//   handleStartSession(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() config: SpeechConfig,
//   ) {
//     const user = (client as any).user;
//     const sessionId = randomUUID();

//     const results$ = this.speechService.createSession(
//       sessionId,
//       user?.sub ?? 'anonymous',
//       config ?? {},
//     );

//     this.socketSessions.set(client.id, sessionId);

//     // Stream results back to the specific client
//     results$.subscribe({
//       next: (result) => client.emit('transcript', result),
//       error: (err) => {
//         client.emit('error', { message: err.message, code: 'STT_ERROR' });
//       },
//       complete: () => {
//         client.emit('session_ended', { sessionId, reason: 'completed' });
//         this.socketSessions.delete(client.id);
//       },
//     });

//     client.emit('session_started', { sessionId });
//     this.logger.log(`Session started [${sessionId}] for socket ${client.id}`);
//   }

//   // ── Receive audio chunk ─────────────────────────────
//   @UseGuards(WsJwtGuard)
//   @SubscribeMessage('audio_chunk')
//   handleAudioChunk(
//     @ConnectedSocket() client: Socket,
//     @MessageBody() data: Buffer | ArrayBuffer,
//   ) {
//     const sessionId = this.socketSessions.get(client.id);
//     if (!sessionId) {
//       client.emit('error', {
//         message: 'No active session. Call start_session first.',
//         code: 'NO_SESSION',
//       });
//       return;
//     }

//     const buffer =
//       data instanceof ArrayBuffer ? Buffer.from(data) : data;
//     this.speechService.sendAudio(sessionId, buffer);
//   }

//   // ── End session explicitly ──────────────────────────
//   @UseGuards(WsJwtGuard)
//   @SubscribeMessage('end_session')
//   handleEndSession(@ConnectedSocket() client: Socket) {
//     const sessionId = this.socketSessions.get(client.id);
//     if (sessionId) {
//       this.speechService.endSession(sessionId);
//       this.socketSessions.delete(client.id);
//       client.emit('session_ended', { sessionId, reason: 'user_request' });
//     }
//   }
// }