// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    /// 🔥 STEP 1 → Gemini → Filters
    const filters = await this.getFiltersFromGemini(query);

    /// 🔥 STEP 2 → Prisma DB Query
    const results = await this.prisma.property.findMany({
      where: {
        isDeleted: false,
        isDraft: false,

        /// 🏠 Type
        ...(filters.propertyType && {
          propertyType: filters.propertyType,
        }),

        /// 🍽 Food
        ...(filters.foodIncluded !== undefined && {
          foodIncluded: filters.foodIncluded,
        }),

        /// 📍 Location
        ...(filters.city && { city: filters.city }),
        ...(filters.locality && { locality: filters.locality }),

        /// 🛏 Room Type (JSON)
        ...(filters.roomType && {
          roomType: {
            hasSome: filters.roomType,
          },
        }),

        /// 🎯 Amenities
        ...(filters.pgAmenities && {
          pgAmenities: {
            hasSome: filters.pgAmenities,
          },
        }),
      },

      orderBy: [{ createdAt: 'desc' }],
      take: 20,
    });

    return {
      query,
      filters,
      count: results.length,
      results,
      summary: this.buildSummary(filters),
    };
  }

  /// 🟢 Gemini → Convert query to JSON
  async getFiltersFromGemini(query: string) {
    const prompt = `
User query can be Tamil + English mixed.

Examples:
- "2 share pg venum with food"
- "budget 10k ku room venum"
- "OMR la pg with food"

Convert into STRICT JSON:

{
  "propertyType": "pg | apartment | room",
  "roomType": ["1_share","2_share","3_share"],
  "foodIncluded": true,
  "city": "Chennai",
  "locality": "OMR",
  "pgAmenities": ["wifi","parking"],
  "maxPrice": 10000
}

Return ONLY JSON. No explanation.

Query:
"${query}"
`;

    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }
      );

      let text =
        res.data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      /// 🔥 CLEAN JSON (important)
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();

      return JSON.parse(text);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.log('Gemini Error:', err.response?.data || err.message);
      } else if (err instanceof Error) {
        console.log('Gemini Error:', err.message);
      } else {
        console.log('Gemini Error:', JSON.stringify(err));
      }
      return {};
    }
  }

  /// ✨ Summary for UI
  buildSummary(filters: any) {
    return `${filters.roomType?.join(', ') || ''} ${
      filters.propertyType || ''
    } ${filters.foodIncluded ? 'with food' : ''} ${
      filters.locality || filters.city || ''
    }`;
  }
}