import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';

@Injectable()
export class SpeechService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async transcribe(filePath: string): Promise<string> {
    try {
      const response = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(filePath),
        model: "gpt-4o-transcribe",

        // 🔥 improves Indian language accuracy
        prompt: `
User is searching for PG, hostel, rental rooms in India.
They may speak Tamil, Telugu, Kannada, Hindi, and English mixed (Tanglish, Hinglish).
Convert speech into clean meaningful English.
Example:
"OMR la 2 share pg venum with food"
→ "2 sharing PG in OMR with food"
`,
      });

      return response.text;

    } catch (error) {
      console.error("Whisper Error:", error);
      throw error;

    } finally {
      // 🧹 always delete file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }
}