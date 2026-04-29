import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import * as fs from 'fs';

@Injectable()
export class SpeechService {
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async transcribe(filePath: string): Promise<string> {
  const response = await this.openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'gpt-4o-transcribe',

    // 🔥 ADD HERE (inside same object)
   prompt: `
The user is searching for PG, hostel, or rental rooms in India.
They may speak in mixed languages like Tamil, Telugu, Kannada, Hindi, and English (Tanglish, Hinglish).
Convert speech into clear and meaningful English text.
Example:
"OMR la 2 share pg venum with food"
→ "2 sharing PG in OMR with food"
`,
  });

  // 🧹 cleanup
  fs.unlinkSync(filePath);

  return response.text;
}
}