// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  async search(query: string) {
    // STEP 1 → Gemini → Extract structured filters from any language
    const filters = await this.getFiltersFromGemini(query);

    console.log('🔍 Query:', query);
    console.log('📦 Filters extracted:', JSON.stringify(filters, null, 2));

    // STEP 2 → Build Prisma WHERE clause dynamically
    const whereClause: any = {
      isDeleted: false,
      isDraft: false,
    };

    // 🏠 Property type — always PG for this app
    whereClause.propertyType = {
      in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'],
    };

    // 🍽 Food / Meals
    if (filters.foodIncluded === true) {
      whereClause.foodIncluded = true;
    }

    // 📍 City filter (case-insensitive partial match via raw or contains)
    if (filters.city) {
      whereClause.city = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    // 📍 Locality filter
    if (filters.locality) {
      whereClause.locality = {
        contains: filters.locality,
        mode: 'insensitive',
      };
    }

    // 💰 Max price
    if (filters.maxPrice) {
      whereClause.price = {
        lte: filters.maxPrice,
      };
    }

    // 🛏 Room type (stored as JSON array in DB)
    // We do a soft match on description since Prisma JSON array queries vary
    // Use OR across known room type fields
    if (filters.roomType && filters.roomType.length > 0) {
      whereClause.roomType = {
        array_contains: filters.roomType,
      };
    }

    // 🚻 Gender preference
    if (filters.gender) {
      whereClause.preferredTenant = {
        path: ['gender'],
        string_contains: filters.gender,
      };
    }

    // 🎯 Amenities (JSON array field)
    if (filters.pgAmenities && filters.pgAmenities.length > 0) {
      whereClause.pgAmenities = {
        array_contains: filters.pgAmenities,
      };
    }

    // STEP 3 → Query with fallback (if strict query returns 0, relax filters)
    let results = await this.prisma.property.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // 🔄 FALLBACK: If no results, relax to city/locality only
    if (results.length === 0 && (filters.city || filters.locality)) {
      console.log('⚠️ No strict results — relaxing filters...');
      const fallbackWhere: any = {
        isDeleted: false,
        isDraft: false,
        propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
      };
      if (filters.city) {
        fallbackWhere.city = { contains: filters.city, mode: 'insensitive' };
      }
      if (filters.locality) {
        fallbackWhere.locality = {
          contains: filters.locality,
          mode: 'insensitive',
        };
      }
      results = await this.prisma.property.findMany({
        where: fallbackWhere,
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }

    // 🔄 FINAL FALLBACK: If still no results, return latest PGs
    if (results.length === 0) {
      console.log('⚠️ No results even with relaxed — returning latest PGs');
      results = await this.prisma.property.findMany({
        where: {
          isDeleted: false,
          isDraft: false,
          propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
    }

    return {
      query,
      filters,
      count: results.length,
      results,
      summary: this.buildSummary(filters, results.length),
    };
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🟢 Gemini → Convert multilingual query → structured filters
  // ─────────────────────────────────────────────────────────────────────
  async getFiltersFromGemini(query: string): Promise<any> {
    const prompt = `
You are an AI filter extractor for a PG (Paying Guest) accommodation search app in India.

The user can type in ANY Indian language or mix:
- English: "2 sharing PG near OMR with food under 8000"
- Tamil: "OMR la rendu pera room venum, saaptaadu venum, 8000 budget"
- Tanglish: "2 share pg venum with food near metro 8k budget"
- Hindi: "Delhi mein ladkiyon ka PG chahiye wifi ke saath"
- Kannada: "Bangalore alli PG beku wifi saha"
- Telugu: "Hyderabad lo PG kavali food tho"
- Mixed: "Chennai la girls PG venum AC room 10k budget"

Your job: Extract structured filters from any language query.

RULES:
1. ALWAYS return valid JSON only — no markdown, no explanation, no code blocks
2. If a field is not mentioned, omit it (don't set null)
3. For city: translate to proper English city name (Chennai, Bangalore, Hyderabad, Delhi, Mumbai, Pune, etc.)
4. For locality: extract area name in English (OMR, Velachery, Koramangala, etc.)
5. For roomType: use array of ["Single", "Double", "Triple", "Dormitory"]
6. For gender: use "Boys", "Girls", or omit if not mentioned
7. For maxPrice: extract as integer (8000, 10000, etc.)
8. foodIncluded: true if food/meals/saaptaadu/khana mentioned, false only if explicitly said no food
9. pgAmenities: array from ["wifi", "ac", "parking", "gym", "laundry", "power backup", "cctv"]

OUTPUT FORMAT (return ONLY this JSON, nothing else):
{
  "propertyType": "pg",
  "roomType": ["Single"],
  "foodIncluded": true,
  "city": "Chennai",
  "locality": "OMR",
  "gender": "Girls",
  "maxPrice": 8000,
  "pgAmenities": ["wifi", "ac"]
}

User query: "${query}"
`;

    try {
      const res = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            topP: 0.8,
            maxOutputTokens: 512,
          },
        },
        { timeout: 10000 },
      );

      let text =
        res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';

      // Clean any markdown wrapping Gemini might add
      text = text
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      // Extract JSON object if there's surrounding text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      const parsed = JSON.parse(text);

      // Normalize roomType values
      if (parsed.roomType) {
        parsed.roomType = parsed.roomType.map((r: string) => {
          const lower = r.toLowerCase();
          if (lower.includes('single') || lower.includes('1')) return 'Single';
          if (
            lower.includes('double') ||
            lower.includes('2') ||
            lower.includes('two')
          )
            return 'Double';
          if (lower.includes('triple') || lower.includes('3')) return 'Triple';
          if (lower.includes('dorm')) return 'Dormitory';
          return r;
        });
      }

      return parsed;
    } catch (err: any) {
      console.error(
        '❌ Gemini Error:',
        err?.response?.data || err?.message || err,
      );

      // Fallback: Basic regex extraction from query
      return this.basicExtract(query);
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🟡 Fallback: Basic keyword extractor if Gemini fails
  // ─────────────────────────────────────────────────────────────────────
  basicExtract(query: string): any {
    const q = query.toLowerCase();
    const filters: any = { propertyType: 'pg' };

    // Food keywords (multilingual)
    const foodWords = [
      'food',
      'meals',
      'saaptaadu',
      'saapadu',
      'khana',
      'anna',
      'breakfast',
      'lunch',
      'dinner',
      'tiffin',
      'mess',
      'oota',
      'bhojanam',
    ];
    if (foodWords.some((w) => q.includes(w))) filters.foodIncluded = true;

    // Gender keywords
    const girlsWords = [
      'girls',
      'ladies',
      'female',
      'women',
      'ponnu',
      'ladki',
      'ladkiyon',
      'hudugiyaru',
    ];
    const boysWords = [
      'boys',
      'gents',
      'male',
      'men',
      'paiyan',
      'ladka',
      'hudugaru',
    ];
    if (girlsWords.some((w) => q.includes(w))) filters.gender = 'Girls';
    else if (boysWords.some((w) => q.includes(w))) filters.gender = 'Boys';

    // WiFi
    if (q.includes('wifi') || q.includes('wi-fi') || q.includes('internet')) {
      filters.pgAmenities = [...(filters.pgAmenities || []), 'wifi'];
    }

    // AC
    if (q.includes(' ac ') || q.includes('ac room') || q.includes('air con')) {
      filters.pgAmenities = [...(filters.pgAmenities || []), 'ac'];
    }

    // Price extraction
    const priceMatch = q.match(/(\d+)\s*k/);
    if (priceMatch) filters.maxPrice = parseInt(priceMatch[1]) * 1000;
    const priceMatch2 = q.match(/(?:under|below|within|rs\.?|₹)\s*(\d{4,6})/);
    if (priceMatch2) filters.maxPrice = parseInt(priceMatch2[1]);

    // Room type
    if (
      q.includes('single') ||
      q.includes('1 share') ||
      q.includes('1share')
    ) {
      filters.roomType = ['Single'];
    } else if (
      q.includes('double') ||
      q.includes('2 share') ||
      q.includes('2share') ||
      q.includes('rendu pera') ||
      q.includes('do log')
    ) {
      filters.roomType = ['Double'];
    } else if (q.includes('triple') || q.includes('3 share')) {
      filters.roomType = ['Triple'];
    }

    // City detection
    const cities: Record<string, string> = {
      chennai: 'Chennai',
      madras: 'Chennai',
      bangalore: 'Bangalore',
      bengaluru: 'Bangalore',
      hyderabad: 'Hyderabad',
      delhi: 'Delhi',
      mumbai: 'Mumbai',
      pune: 'Pune',
      kolkata: 'Kolkata',
      ahmedabad: 'Ahmedabad',
      coimbatore: 'Coimbatore',
    };
    for (const [key, val] of Object.entries(cities)) {
      if (q.includes(key)) {
        filters.city = val;
        break;
      }
    }

    // Common localities
    const localities = [
      'omr',
      'velachery',
      'adyar',
      'anna nagar',
      't nagar',
      'tambaram',
      'koramangala',
      'indiranagar',
      'whitefield',
      'electronic city',
      'btm',
      'hsr',
      'banjara hills',
      'hitech city',
      'gachibowli',
      'powai',
      'andheri',
      'bandra',
      'viman nagar',
      'kothrud',
      'hinjewadi',
    ];
    for (const loc of localities) {
      if (q.includes(loc)) {
        filters.locality = loc
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        break;
      }
    }

    return filters;
  }

  // ─────────────────────────────────────────────────────────────────────
  // ✨ Human-readable summary for the UI
  // ─────────────────────────────────────────────────────────────────────
  buildSummary(filters: any, count: number): string {
    const parts: string[] = [];
    if (filters.gender) parts.push(`${filters.gender}'s PG`);
    else parts.push('PG');
    if (filters.roomType?.length) parts.push(filters.roomType.join('/'));
    if (filters.foodIncluded) parts.push('with food');
    if (filters.locality) parts.push(`in ${filters.locality}`);
    else if (filters.city) parts.push(`in ${filters.city}`);
    if (filters.maxPrice) parts.push(`under ₹${filters.maxPrice}`);
    if (filters.pgAmenities?.length) parts.push(filters.pgAmenities.join(', '));
    return `${count} result${count !== 1 ? 's' : ''} for: ${parts.join(' · ')}`;
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🔥 NEW: Smart Recommendations endpoint
  // ─────────────────────────────────────────────────────────────────────
  async getRecommendations(
    city: string,
    budget?: number,
    gender?: string,
  ) {
    const where: any = {
      isDeleted: false,
      isDraft: false,
      propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
      city: { contains: city, mode: 'insensitive' },
    };
    if (budget) where.price = { lte: budget };
    if (gender) {
      where.preferredTenant = { path: ['gender'], string_contains: gender };
    }

    return this.prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🔥 NEW: Trending PGs in a city
  // ─────────────────────────────────────────────────────────────────────
  async getTrending(city?: string) {
    const where: any = {
      isDeleted: false,
      isDraft: false,
      propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
    };
    if (city) where.city = { contains: city, mode: 'insensitive' };

    return this.prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🔥 NEW: Similar PGs (for "You may also like" section)
  // ─────────────────────────────────────────────────────────────────────
  async getSimilar(propertyId: number) {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) return [];

    return this.prisma.property.findMany({
      where: {
        isDeleted: false,
        isDraft: false,
        id: { not: propertyId },
        city: property.city,
        locality: property.locality,
        propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🔥 NEW: Increment view count when user opens a PG
  // NOTE: Run `npx prisma migrate dev` first to add boostScore & viewCount
  // to the generated Prisma client. Until then this uses a raw query.
  // ─────────────────────────────────────────────────────────────────────
  async incrementView(propertyId: number) {
    try {
      // Use raw query to safely increment viewCount
      // even if Prisma client hasn't been regenerated yet
      await this.prisma.$executeRaw`
        UPDATE "Property"
        SET "viewCount" = COALESCE("viewCount", 0) + 1
        WHERE id = ${propertyId}
      `;
      return { success: true, propertyId };
    } catch (err) {
      console.error('incrementView error:', err);
      return { success: false };
    }
  }
}