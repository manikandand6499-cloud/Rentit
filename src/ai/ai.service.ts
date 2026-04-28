// src/ai/ai.service.ts

import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'prisma/prisma.service';
import FormData from 'form-data';

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`;

const SUPPORTED_CITIES = ['Chennai', 'Coimbatore', 'Hyderabad', 'Bangalore'];

// ─────────────────────────────────────────────
// 🔹 Gemini Call Helper
// ─────────────────────────────────────────────
async function callGemini(prompt: string, maxTokens = 300): Promise<string> {
  const res = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.05,
        topP: 0.95,
        maxOutputTokens: maxTokens,
      },
    },
    { timeout: 10000 },
  );

  return res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

function extractJson(raw: string): any {
  try {
    const clean = raw.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) return {};
    return JSON.parse(match[0]);
  } catch {
    return {};
  }
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────
  // 🎤 AUDIO → TEXT → SEARCH
  // ─────────────────────────────────────────────
  async processAudio(file: Express.Multer.File) {
    const text = await this.speechToText(file);

    if (!text) {
      return {
        text: '',
        results: [],
        count: 0,
        summary: 'Could not understand audio',
      };
    }

    const result = await this.search(text);

    return {
      text,
      ...result,
    };
  }

  // ─────────────────────────────────────────────
  // 🎤 Speech to Text (OpenAI Whisper)
  // ─────────────────────────────────────────────
  async speechToText(file: Express.Multer.File): Promise<string> {
    try {
      const form = new FormData();
      form.append('file', file.buffer, 'audio.wav');

      const res = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        form,
        {
          headers: {
            ...form.getHeaders(),
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          params: {
            model: 'gpt-4o-transcribe',
          },
        },
      );

      return res.data.text || '';
    } catch (err: any) {
      console.error('❌ STT Error:', err?.message);
      return '';
    }
  }

  // ─────────────────────────────────────────────
  // 🔍 MAIN SEARCH
  // ─────────────────────────────────────────────
  async search(query: string) {
    if (!query || query.trim() === '') {
      return {
        query: '',
        filters: {},
        results: [],
        count: 0,
        summary: 'No input provided',
      };
    }

    const filters = await this.extractFiltersWithGemini(query);

    console.log('🔍 Query:', query);
    console.log('✅ Filters:', filters);

    const results = await this.queryWithFallback(filters, query);

    return {
      query,
      filters,
      count: results.length,
      results,
      summary: this.buildSummary(filters, results.length),
    };
  }

  // ─────────────────────────────────────────────
  // 🤖 GEMINI FILTER EXTRACTION
  // ─────────────────────────────────────────────
  private async extractFiltersWithGemini(query: string): Promise<any> {
    const prompt = `
Extract PG search filters from ANY language.

Return ONLY JSON.

Example:
{
 "roomType":["Double"],
 "city":"Chennai",
 "locality":"Tambaram",
 "foodIncluded":true,
 "gender":"Girls",
 "maxPrice":8000,
 "pgAmenities":["wifi"]
}

Query: "${query}"
`;

    try {
      const raw = await callGemini(prompt);
      const parsed = extractJson(raw);

      // Normalize roomType
      if (parsed.roomType) {
        parsed.roomType = parsed.roomType.filter((r: string) =>
          ['Single', 'Double', 'Triple', 'Dormitory'].includes(r),
        );
      }

      // Validate city
      if (parsed.city && !SUPPORTED_CITIES.includes(parsed.city)) {
        delete parsed.city;
      }

      // Clean locality
      if (parsed.locality) {
        parsed.locality = parsed.locality
          .replace(/\s+(la|le|lo|mein|near)$/i, '')
          .trim();
      }

      return parsed;
    } catch (err: any) {
      console.error('❌ Gemini Error:', err?.message);
      return { propertyType: 'pg' }; // fallback fix
    }
  }

  // ─────────────────────────────────────────────
  // 🧠 SMART FALLBACK QUERY
  // ─────────────────────────────────────────────
  private async queryWithFallback(filters: any, rawQuery: string) {
    const base = {
      isDeleted: false,
      isDraft: false,
      propertyType: { in: ['pg', 'PG', 'hostel'] },
    };

    // TIER 1
    const t1 = await this.prisma.property.findMany({
      where: this.buildWhere(filters, base),
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    if (t1.length) return t1;

    // TIER 2
    if (filters.city || filters.locality) {
      const t2 = await this.prisma.property.findMany({
        where: { ...base, OR: this.locationOr(filters) },
        take: 20,
      });
      if (t2.length) return t2;
    }

    // TIER 3
    const words = rawQuery.split(' ').filter((w) => w.length > 3);

    if (words.length) {
      const or = words.flatMap((w) => [
        { city: { contains: w } },
        { locality: { contains: w } },
      ]);

      const t3 = await this.prisma.property.findMany({
        where: { ...base, OR: or },
        take: 20,
      });

      if (t3.length) return t3;
    }

    // TIER 4
    return this.prisma.property.findMany({
      where: base,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  private buildWhere(filters: any, base: any) {
    const where: any = { ...base };

    if (filters.city || filters.locality) {
      where.OR = this.locationOr(filters);
    }

    if (filters.foodIncluded) where.foodIncluded = true;
    if (filters.maxPrice) where.price = { lte: filters.maxPrice };
    if (filters.roomType?.length) {
      where.roomType = { array_contains: filters.roomType };
    }

    return where;
  }

  private locationOr(filters: any) {
    const or: any[] = [];

    if (filters.city) {
      or.push({ city: { contains: filters.city, mode: 'insensitive' } });
    }

    if (filters.locality) {
      or.push({ locality: { contains: filters.locality, mode: 'insensitive' } });
    }

    return or;
  }

  // ─────────────────────────────────────────────
  // ✨ SUMMARY
  // ─────────────────────────────────────────────
  buildSummary(filters: any, count: number): string {
    if (!count) return 'No results found';

    const parts: string[] = [];

    if (filters.roomType) parts.push(filters.roomType.join('/'));
    if (filters.city) parts.push(filters.city);
    if (filters.maxPrice) parts.push(`₹${filters.maxPrice}`);

    return `${count} PGs · ${parts.join(' · ')}`;
  }

  // ─────────────────────────────────────────────
  // 🌟 OTHER APIs
  // ─────────────────────────────────────────────

  async getRecommendations(city: string, budget?: number, gender?: string | undefined) {
    return this.prisma.property.findMany({
      where: {
        city: { contains: city },
        ...(budget && { price: { lte: budget } }),
      },
      take: 10,
    });
  }

  async getTrending(city?: string) {
    return this.prisma.property.findMany({
      where: {
        ...(city && { city: { contains: city } }),
      },
      take: 8,
    });
  }

  async getSimilar(id: number) {
    const p = await this.prisma.property.findUnique({ where: { id } });
    if (!p) return [];

    return this.prisma.property.findMany({
      where: {
        city: p.city,
        id: { not: id },
      },
      take: 6,
    });
  }

  async incrementView(id: number) {
    await this.prisma.$executeRaw`
      UPDATE "Property"
      SET "viewCount" = COALESCE("viewCount", 0) + 1
      WHERE id = ${id}
    `;
    return { success: true };
  }
}