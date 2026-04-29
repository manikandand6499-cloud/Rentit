// // src/ai/ai.service.ts
// import { Injectable } from '@nestjs/common';
// import axios from 'axios';
// import { PrismaService } from 'prisma/prisma.service';

// @Injectable()
// export class AiService {
//   constructor(private prisma: PrismaService) {}

//   async search(query: string) {
//     // STEP 1 → Gemini → Extract structured filters from any language
//     const filters = await this.getFiltersFromGemini(query);

//     console.log('🔍 Query:', query);
//     console.log('📦 Filters extracted:', JSON.stringify(filters, null, 2));

//     // STEP 2 → Build Prisma WHERE clause dynamically
//     const whereClause: any = {
//       isDeleted: false,
//       isDraft: false,
//     };

//     // 🏠 Property type — always PG for this app
//     whereClause.propertyType = {
//       in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'],
//     };

//     // 🍽 Food / Meals
//     if (filters.foodIncluded === true) {
//       whereClause.foodIncluded = true;
//     }

//     // 📍 City filter (case-insensitive partial match via raw or contains)
//     if (filters.city) {
//       whereClause.city = {
//         contains: filters.city,
//         mode: 'insensitive',
//       };
//     }

//     // 📍 Locality filter
//     if (filters.locality) {
//       whereClause.locality = {
//         contains: filters.locality,
//         mode: 'insensitive',
//       };
//     }

//     // 💰 Max price
//     if (filters.maxPrice) {
//       whereClause.price = {
//         lte: filters.maxPrice,
//       };
//     }

//     // 🛏 Room type (stored as JSON array in DB)
//     // We do a soft match on description since Prisma JSON array queries vary
//     // Use OR across known room type fields
//     if (filters.roomType && filters.roomType.length > 0) {
//       whereClause.roomType = {
//         array_contains: filters.roomType,
//       };
//     }

//     // 🚻 Gender preference
//     if (filters.gender) {
//       whereClause.preferredTenant = {
//         path: ['gender'],
//         string_contains: filters.gender,
//       };
//     }

//     // 🎯 Amenities (JSON array field)
//     if (filters.pgAmenities && filters.pgAmenities.length > 0) {
//       whereClause.pgAmenities = {
//         array_contains: filters.pgAmenities,
//       };
//     }

//     // STEP 3 → Query with fallback (if strict query returns 0, relax filters)
//     let results = await this.prisma.property.findMany({
//       where: whereClause,
//       orderBy: { createdAt: 'desc' },
//       take: 20,
//     });

//     // 🔄 FALLBACK: If no results, relax to city/locality only
//     if (results.length === 0 && (filters.city || filters.locality)) {
//       console.log('⚠️ No strict results — relaxing filters...');
//       const fallbackWhere: any = {
//         isDeleted: false,
//         isDraft: false,
//         propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
//       };
//       if (filters.city) {
//         fallbackWhere.city = { contains: filters.city, mode: 'insensitive' };
//       }
//       if (filters.locality) {
//         fallbackWhere.locality = {
//           contains: filters.locality,
//           mode: 'insensitive',
//         };
//       }
//       results = await this.prisma.property.findMany({
//         where: fallbackWhere,
//         orderBy: { createdAt: 'desc' },
//         take: 20,
//       });
//     }

//     // 🔄 FINAL FALLBACK: If still no results, return latest PGs
//     if (results.length === 0) {
//       console.log('⚠️ No results even with relaxed — returning latest PGs');
//       results = await this.prisma.property.findMany({
//         where: {
//           isDeleted: false,
//           isDraft: false,
//           propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
//         },
//         orderBy: { createdAt: 'desc' },
//         take: 20,
//       });
//     }

//     return {
//       query,
//       filters,
//       count: results.length,
//       results,
//       summary: this.buildSummary(filters, results.length),
//     };
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🟢 Gemini → Convert multilingual query → structured filters
//   // ─────────────────────────────────────────────────────────────────────
//   async getFiltersFromGemini(query: string): Promise<any> {
//     const prompt = `
// You are an AI filter extractor for a PG (Paying Guest) accommodation search app in India.

// The user can type in ANY Indian language or mix:
// - English: "2 sharing PG near OMR with food under 8000"
// - Tamil: "OMR la rendu pera room venum, saaptaadu venum, 8000 budget"
// - Tanglish: "2 share pg venum with food near metro 8k budget"
// - Hindi: "Delhi mein ladkiyon ka PG chahiye wifi ke saath"
// - Kannada: "Bangalore alli PG beku wifi saha"
// - Telugu: "Hyderabad lo PG kavali food tho"
// - Mixed: "Chennai la girls PG venum AC room 10k budget"

// Your job: Extract structured filters from any language query.

// RULES:
// 1. ALWAYS return valid JSON only — no markdown, no explanation, no code blocks
// 2. If a field is not mentioned, omit it (don't set null)
// 3. For city: translate to proper English city name (Chennai, Bangalore, Hyderabad, Delhi, Mumbai, Pune, etc.)
// 4. For locality: extract area name in English (OMR, Velachery, Koramangala, etc.)
// 5. For roomType: use array of ["Single", "Double", "Triple", "Dormitory"]
// 6. For gender: use "Boys", "Girls", or omit if not mentioned
// 7. For maxPrice: extract as integer (8000, 10000, etc.)
// 8. foodIncluded: true if food/meals/saaptaadu/khana mentioned, false only if explicitly said no food
// 9. pgAmenities: array from ["wifi", "ac", "parking", "gym", "laundry", "power backup", "cctv"]

// OUTPUT FORMAT (return ONLY this JSON, nothing else):
// {
//   "propertyType": "pg",
//   "roomType": ["Single"],
//   "foodIncluded": true,
//   "city": "Chennai",
//   "locality": "OMR",
//   "gender": "Girls",
//   "maxPrice": 8000,
//   "pgAmenities": ["wifi", "ac"]
// }

// User query: "${query}"
// `;

//     try {
//       const res = await axios.post(
//         `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//         {
//           contents: [{ parts: [{ text: prompt }] }],
//           generationConfig: {
//             temperature: 0.1,
//             topP: 0.8,
//             maxOutputTokens: 512,
//           },
//         },
//         { timeout: 10000 },
//       );

//       let text =
//         res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';

//       // Clean any markdown wrapping Gemini might add
//       text = text
//         .replace(/```json\n?/gi, '')
//         .replace(/```\n?/g, '')
//         .trim();

//       // Extract JSON object if there's surrounding text
//       const jsonMatch = text.match(/\{[\s\S]*\}/);
//       if (jsonMatch) {
//         text = jsonMatch[0];
//       }

//       const parsed = JSON.parse(text);

//       // Normalize roomType values
//       if (parsed.roomType) {
//         parsed.roomType = parsed.roomType.map((r: string) => {
//           const lower = r.toLowerCase();
//           if (lower.includes('single') || lower.includes('1')) return 'Single';
//           if (
//             lower.includes('double') ||
//             lower.includes('2') ||
//             lower.includes('two')
//           )
//             return 'Double';
//           if (lower.includes('triple') || lower.includes('3')) return 'Triple';
//           if (lower.includes('dorm')) return 'Dormitory';
//           return r;
//         });
//       }

//       return parsed;
//     } catch (err: any) {
//       console.error(
//         '❌ Gemini Error:',
//         err?.response?.data || err?.message || err,
//       );

//       // Fallback: Basic regex extraction from query
//       return this.basicExtract(query);
//     }
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🟡 Fallback: Basic keyword extractor if Gemini fails
//   // ─────────────────────────────────────────────────────────────────────
//   basicExtract(query: string): any {
//     const q = query.toLowerCase();
//     const filters: any = { propertyType: 'pg' };

//     // Food keywords (multilingual)
//     const foodWords = [
//       'food',
//       'meals',
//       'saaptaadu',
//       'saapadu',
//       'khana',
//       'anna',
//       'breakfast',
//       'lunch',
//       'dinner',
//       'tiffin',
//       'mess',
//       'oota',
//       'bhojanam',
//     ];
//     if (foodWords.some((w) => q.includes(w))) filters.foodIncluded = true;

//     // Gender keywords
//     const girlsWords = [
//       'girls',
//       'ladies',
//       'female',
//       'women',
//       'ponnu',
//       'ladki',
//       'ladkiyon',
//       'hudugiyaru',
//     ];
//     const boysWords = [
//       'boys',
//       'gents',
//       'male',
//       'men',
//       'paiyan',
//       'ladka',
//       'hudugaru',
//     ];
//     if (girlsWords.some((w) => q.includes(w))) filters.gender = 'Girls';
//     else if (boysWords.some((w) => q.includes(w))) filters.gender = 'Boys';

//     // WiFi
//     if (q.includes('wifi') || q.includes('wi-fi') || q.includes('internet')) {
//       filters.pgAmenities = [...(filters.pgAmenities || []), 'wifi'];
//     }

//     // AC
//     if (q.includes(' ac ') || q.includes('ac room') || q.includes('air con')) {
//       filters.pgAmenities = [...(filters.pgAmenities || []), 'ac'];
//     }

//     // Price extraction
//     const priceMatch = q.match(/(\d+)\s*k/);
//     if (priceMatch) filters.maxPrice = parseInt(priceMatch[1]) * 1000;
//     const priceMatch2 = q.match(/(?:under|below|within|rs\.?|₹)\s*(\d{4,6})/);
//     if (priceMatch2) filters.maxPrice = parseInt(priceMatch2[1]);

//     // Room type
//     if (
//       q.includes('single') ||
//       q.includes('1 share') ||
//       q.includes('1share')
//     ) {
//       filters.roomType = ['Single'];
//     } else if (
//       q.includes('double') ||
//       q.includes('2 share') ||
//       q.includes('2share') ||
//       q.includes('rendu pera') ||
//       q.includes('do log')
//     ) {
//       filters.roomType = ['Double'];
//     } else if (q.includes('triple') || q.includes('3 share')) {
//       filters.roomType = ['Triple'];
//     }

//     // City detection
//     const cities: Record<string, string> = {
//       chennai: 'Chennai',
//       madras: 'Chennai',
//       bangalore: 'Bangalore',
//       bengaluru: 'Bangalore',
//       hyderabad: 'Hyderabad',
//       delhi: 'Delhi',
//       mumbai: 'Mumbai',
//       pune: 'Pune',
//       kolkata: 'Kolkata',
//       ahmedabad: 'Ahmedabad',
//       coimbatore: 'Coimbatore',
//     };
//     for (const [key, val] of Object.entries(cities)) {
//       if (q.includes(key)) {
//         filters.city = val;
//         break;
//       }
//     }

//     // Common localities
//     const localities = [
//       'omr',
//       'velachery',
//       'adyar',
//       'anna nagar',
//       't nagar',
//       'tambaram',
//       'koramangala',
//       'indiranagar',
//       'whitefield',
//       'electronic city',
//       'btm',
//       'hsr',
//       'banjara hills',
//       'hitech city',
//       'gachibowli',
//       'powai',
//       'andheri',
//       'bandra',
//       'viman nagar',
//       'kothrud',
//       'hinjewadi',
//     ];
//     for (const loc of localities) {
//       if (q.includes(loc)) {
//         filters.locality = loc
//           .split(' ')
//           .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//           .join(' ');
//         break;
//       }
//     }

//     return filters;
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // ✨ Human-readable summary for the UI
//   // ─────────────────────────────────────────────────────────────────────
//   buildSummary(filters: any, count: number): string {
//     const parts: string[] = [];
//     if (filters.gender) parts.push(`${filters.gender}'s PG`);
//     else parts.push('PG');
//     if (filters.roomType?.length) parts.push(filters.roomType.join('/'));
//     if (filters.foodIncluded) parts.push('with food');
//     if (filters.locality) parts.push(`in ${filters.locality}`);
//     else if (filters.city) parts.push(`in ${filters.city}`);
//     if (filters.maxPrice) parts.push(`under ₹${filters.maxPrice}`);
//     if (filters.pgAmenities?.length) parts.push(filters.pgAmenities.join(', '));
//     return `${count} result${count !== 1 ? 's' : ''} for: ${parts.join(' · ')}`;
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🔥 NEW: Smart Recommendations endpoint
//   // ─────────────────────────────────────────────────────────────────────
//   async getRecommendations(
//     city: string,
//     budget?: number,
//     gender?: string,
//   ) {
//     const where: any = {
//       isDeleted: false,
//       isDraft: false,
//       propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
//       city: { contains: city, mode: 'insensitive' },
//     };
//     if (budget) where.price = { lte: budget };
//     if (gender) {
//       where.preferredTenant = { path: ['gender'], string_contains: gender };
//     }

//     return this.prisma.property.findMany({
//       where,
//       orderBy: { createdAt: 'desc' },
//       take: 10,
//     });
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🔥 NEW: Trending PGs in a city
//   // ─────────────────────────────────────────────────────────────────────
//   async getTrending(city?: string) {
//     const where: any = {
//       isDeleted: false,
//       isDraft: false,
//       propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
//     };
//     if (city) where.city = { contains: city, mode: 'insensitive' };

//     return this.prisma.property.findMany({
//       where,
//       orderBy: { createdAt: 'desc' },
//       take: 8,
//     });
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🔥 NEW: Similar PGs (for "You may also like" section)
//   // ─────────────────────────────────────────────────────────────────────
//   async getSimilar(propertyId: number) {
//     const property = await this.prisma.property.findUnique({
//       where: { id: propertyId },
//     });
//     if (!property) return [];

//     return this.prisma.property.findMany({
//       where: {
//         isDeleted: false,
//         isDraft: false,
//         id: { not: propertyId },
//         city: property.city,
//         locality: property.locality,
//         propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
//       },
//       orderBy: { createdAt: 'desc' },
//       take: 6,
//     });
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🔥 NEW: Increment view count when user opens a PG
//   // NOTE: Run `npx prisma migrate dev` first to add boostScore & viewCount
//   // to the generated Prisma client. Until then this uses a raw query.
//   // ─────────────────────────────────────────────────────────────────────
//   async incrementView(propertyId: number) {
//     try {
//       // Use raw query to safely increment viewCount
//       // even if Prisma client hasn't been regenerated yet
//       await this.prisma.$executeRaw`
//         UPDATE "Property"
//         SET "viewCount" = COALESCE("viewCount", 0) + 1
//         WHERE id = ${propertyId}
//       `;
//       return { success: true, propertyId };
//     } catch (err) {
//       console.error('incrementView error:', err);
//       return { success: false };
//     }
//   }
// }










// // src/ai/ai.service.ts
// import { Injectable } from '@nestjs/common';
// import axios from 'axios';
// import { PrismaService } from 'prisma/prisma.service';

// // ─────────────────────────────────────────────────────────────────────────────
// // 🗺  COMPREHENSIVE INDIAN LANGUAGE DICTIONARY
// // ─────────────────────────────────────────────────────────────────────────────
// const LANG_DICT = {

//   // ── ROOM TYPE ──────────────────────────────────────────────────────────────
//   roomType: {
//     Single: [
//       'ondre pera','oru pera','single room','okka pera','onnu',
//       'oru peru','1 share','1share','1pera','oruthan','oru paer',
//       'ek aadmi','akele','ek sharing','ek bed','1 bed',
//       'oka manishi','okka sharing','oka bed',
//       'ondu bed','ondu jana',
//       '1 person','solo','one sharing','one person',
//     ],
//     Double: [
//       // Tamil / Tanglish — most important
//       'rendu pera','rendu peru','rendu sharing','rendu bed',
//       'iru pera','iru paer','irandam','irandaam','erandu',
//       'rendum pera','two pera','2 pera','2pera',
//       '2 share','2share','2 sharing',
//       // Hindi
//       'do log','do aadmi','do sharing','double sharing','dono',
//       'do bed','2 log','do aadmi',
//       // Telugu
//       'iddaru','rendu manishi','double sharing',
//       // Kannada
//       'eradu jana','eradu bed','iru jana',
//       // General
//       '2 person','two sharing','twin sharing','double room',
//     ],
//     Triple: [
//       'moonu pera','moondu sharing','moondru','munn pera',
//       '3 pera','3pera','munn sharing','mukkaal',
//       'teen log','teen sharing','tin log',
//       'mugguru','3 sharing','3 share',
//       '3 person','three sharing','triple sharing','triple room',
//     ],
//     Dormitory: [
//       'dorm','dormitory','hostel room','common room',
//       'pala pera','anaivarum','naangu pera plus',
//       '4+ sharing','4 sharing','4pera',
//     ],
//   },

//   // ── FOOD ───────────────────────────────────────────────────────────────────
//   food: [
//     'saaptaadu','saapadu','sapadu','saapaadu','saappaadu',
//     'unavum','unavu','unavam','sappaadu','soru',
//     'tiffin kudukka','food venum','meals venum','saappad venum',
//     'khana','khaana','bhojan','roti','khana milega',
//     'khana chahiye','meals milega','tiffin milega',
//     'bhojanam','tindi','annam','meals kavali','food kavali',
//     'oota','ootu','food beku','oota beku',
//     'kazhikkal','bhaakshanam',
//     'food','meals','breakfast','lunch','dinner','mess',
//     'with food','food included','meal included','food attach',
//   ],

//   // ── GENDER ─────────────────────────────────────────────────────────────────
//   girls: [
//     'ponnu','ponnu pg','pengal','pengal pg','penn','ponnu hostel',
//     'ladki','ladkiyon','mahila','ladies','larkiyon',
//     'ammayilu','ammayi','girls kavali',
//     'hudugiyaru','hudugi','girls beku',
//     'girls','female','women','lady','ladies pg','girls pg',
//   ],
//   boys: [
//     'paiyan','paiyanga','payyan','aambala','aanpillai','payan hostel',
//     'boys pg',
//     'ladka','ladkon','aadmi','gents','boys chahiye',
//     'abbayilu','abbayi',
//     'hudugaru','huduga',
//     'boys','male','men','gents pg',
//   ],

//   // ── AMENITIES ──────────────────────────────────────────────────────────────
//   wifi: [
//     'wifi','wi-fi','internet','broadband',
//     'internet venum','wifi venum','net venum',
//     'internet chahiye','wifi chahiye','wifi beku',
//   ],
//   ac: [
//     'ac room','a/c room','air condition','air conditioner',
//     'ac venum','ac beku','ac kavali','ac chahiye',
//     ' ac ',' a/c ','ac pg',
//   ],
//   parking: [
//     'parking','bike parking','car parking','vehicle parking',
//     'parking venum','parking beku',
//   ],
//   powerBackup: [
//     'power backup','generator','ups','current backup',
//     'current venum','light backup',
//   ],
//   laundry: ['laundry','washing machine','wash clothes'],

//   // ── CITIES ─────────────────────────────────────────────────────────────────
//   cities: {
//     Chennai: ['chennai','madras','singara chennai','namma chennai'],
//     Bangalore: ['bangalore','bengaluru','namma bengaluru','blr','banglore'],
//     Hyderabad: ['hyderabad','hyd','cyberabad','hyderbad'],
//     Delhi: ['delhi','new delhi','dilli'],
//     Mumbai: ['mumbai','bombay'],
//     Pune: ['pune','poona'],
//     Kolkata: ['kolkata','calcutta'],
//     Coimbatore: ['coimbatore','kovai','koimbatore','cbe'],
//     Madurai: ['madurai'],
//     Trichy: ['trichy','tiruchirappalli','tiruchy'],
//     Salem: ['salem'],
//     Kochi: ['kochi','cochin','ernakulam'],
//     Ahmedabad: ['ahmedabad','amdavad'],
//     Visakhapatnam: ['visakhapatnam','vizag'],
//     Nagpur: ['nagpur'],
//     Bhubaneswar: ['bhubaneswar'],
//     Chandigarh: ['chandigarh'],
//     Jaipur: ['jaipur'],
//     Lucknow: ['lucknow'],
//     Surat: ['surat'],
//   },

//   // ── LOCALITIES ─────────────────────────────────────────────────────────────
//   // Sorted by specificity (longer names first to avoid partial matches)
//   localities: [
//     // Chennai – South
//     'west tambaram','east tambaram','tambaram sanatorium',
//     'tambaram','chrompet','chromepet','pallavaram',
//     'medavakkam','madipakkam','perumbakkam',
//     'sholinganallur','perungudi','thoraipakkam',
//     'navalur','siruseri','kelambakkam',
//     'old mahabalipuram road','east coast road',
//     'omr','ecr',
//     // Chennai – Central/North
//     'anna nagar','kk nagar','ashok nagar','vadapalani',
//     't nagar','tnagar','nungambakkam','egmore',
//     'kilpauk','chetpet','perambur','villivakkam',
//     'ambattur','avadi','padi','mogappair',
//     'kolathur','madhavaram','tondiarpet',
//     // Chennai – South-Central
//     'adyar','besant nagar','thiruvanmiyur',
//     'mylapore','alwarpet','mandaveli',
//     'royapettah','triplicane','sowcarpet',
//     'porur','guindy','saidapet','kotturpuram',
//     'poonamallee','mangadu',
//     // Bangalore
//     'electronic city','jp nagar','btm layout',
//     'hsr layout','koramangala','indiranagar',
//     'whitefield','marathahalli','jayanagar',
//     'banashankari','rajajinagar','malleshwaram',
//     'hebbal','yelahanka','kr puram','sarjapur',
//     'bellandur','kadugodi','mahadevapura',
//     'btm','hsr',
//     // Hyderabad
//     'banjara hills','jubilee hills','hitech city',
//     'gachibowli','kondapur','kukatpally',
//     'ameerpet','secunderabad','begumpet',
//     'madhapur','sr nagar',
//     // Delhi / NCR
//     'dwarka','rohini','janakpuri','laxmi nagar',
//     'noida','gurgaon','gurugram','faridabad',
//     // Mumbai
//     'vile parle','navi mumbai',
//     'powai','andheri','bandra','thane',
//     'borivali','malad','goregaon','kurla',
//     // Pune
//     'viman nagar','pimple saudagar',
//     'kothrud','hinjewadi','baner','wakad',
//     'aundh','kharadi','hadapsar',
//   ],
// } as const;

// // ─────────────────────────────────────────────────────────────────────────────
// // Helper
// // ─────────────────────────────────────────────────────────────────────────────
// function matchesAny(query: string, words: readonly string[]): boolean {
//   return words.some((w) => query.includes(w));
// }

// function capitalize(s: string): string {
//   return s
//     .split(' ')
//     .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//     .join(' ');
// }

// @Injectable()
// export class AiService {
//   constructor(private prisma: PrismaService) {}

//   // ─────────────────────────────────────────────────────────────────────
//   // 🔍 MAIN SEARCH
//   // ─────────────────────────────────────────────────────────────────────
//   async search(query: string) {
//     const q = query.toLowerCase().trim();

//     // Run Gemini + local extractor in parallel
//     const [geminiFilters, localFilters] = await Promise.all([
//       this.getFiltersFromGemini(q).catch(() => ({})),
//       Promise.resolve(this.localExtract(q)),
//     ]);

//     // Merge — local dictionary wins for location/roomType (more reliable)
//     const filters: any = {
//       ...geminiFilters,
//       ...(localFilters.locality   && { locality: localFilters.locality }),
//       ...(localFilters.city       && { city: localFilters.city }),
//       ...(localFilters.roomType   && { roomType: localFilters.roomType }),
//       ...(localFilters.foodIncluded !== undefined && { foodIncluded: localFilters.foodIncluded }),
//       ...(localFilters.gender     && { gender: localFilters.gender }),
//       ...(localFilters.maxPrice   && { maxPrice: localFilters.maxPrice }),
//       ...(localFilters.pgAmenities?.length && { pgAmenities: localFilters.pgAmenities }),
//     };

//     console.log('🔍 Query:', query);
//     console.log('🤖 Gemini:', JSON.stringify(geminiFilters));
//     console.log('📖 Local:', JSON.stringify(localFilters));
//     console.log('✅ Final:', JSON.stringify(filters));

//     const results = await this.queryWithFallback(filters, q);

//     return {
//       query,
//       filters,
//       count: results.length,
//       results,
//       summary: this.buildSummary(filters, results.length),
//     };
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🗄  4-TIER FALLBACK QUERY
//   // ─────────────────────────────────────────────────────────────────────
//   private async queryWithFallback(filters: any, rawQuery: string) {
//     const baseWhere = {
//       isDeleted: false,
//       isDraft: false,
//       propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
//     };

//     // TIER 1 — Full strict query
//     const t1 = await this.prisma.property.findMany({
//       where: this.buildWhere(filters, baseWhere),
//       orderBy: { createdAt: 'desc' },
//       take: 20,
//     });
//     if (t1.length > 0) { console.log(`✅ T1: ${t1.length}`); return t1; }

//     // TIER 2 — Location only (OR across locality/landmark/street/city)
//     if (filters.locality || filters.city) {
//       console.log('⚠️ T2: location-only...');
//       const locOr = this.buildLocationOr(filters);
//       const t2 = await this.prisma.property.findMany({
//         where: { ...baseWhere, OR: locOr },
//         orderBy: { createdAt: 'desc' },
//         take: 20,
//       });
//       if (t2.length > 0) { console.log(`✅ T2: ${t2.length}`); return t2; }
//     }

//     // TIER 3 — Raw word search across all location fields
//     console.log('⚠️ T3: raw word search...');
//     const words = rawQuery
//       .split(/[\s,]+/)
//       .filter((w) => w.length > 3 && !['venum','beku','kavali','chahiye','wala','vala'].includes(w))
//       .slice(0, 6);

//     if (words.length > 0) {
//       const wordOr: any[] = words.flatMap((word) => [
//         { locality:     { contains: word, mode: 'insensitive' } },
//         { city:         { contains: word, mode: 'insensitive' } },
//         { landmark:     { contains: word, mode: 'insensitive' } },
//         { street:       { contains: word, mode: 'insensitive' } },
//         { propertyName: { contains: word, mode: 'insensitive' } },
//       ]);
//       const t3 = await this.prisma.property.findMany({
//         where: { ...baseWhere, OR: wordOr },
//         orderBy: { createdAt: 'desc' },
//         take: 20,
//       });
//       if (t3.length > 0) { console.log(`✅ T3: ${t3.length}`); return t3; }
//     }

//     // TIER 4 — Latest PGs (never show empty screen)
//     console.log('⚠️ T4: latest PGs');
//     return this.prisma.property.findMany({
//       where: baseWhere,
//       orderBy: { createdAt: 'desc' },
//       take: 20,
//     });
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🏗  BUILD WHERE CLAUSE
//   // ─────────────────────────────────────────────────────────────────────
//   private buildWhere(filters: any, base: any): any {
//     const where: any = { ...base };

//     // Location — use OR so "Tambaram" matches "West Tambaram" etc.
//     if (filters.locality || filters.city) {
//       where.OR = this.buildLocationOr(filters);
//     }

//     if (filters.foodIncluded === true)   where.foodIncluded = true;
//     if (filters.maxPrice > 0)            where.price = { lte: filters.maxPrice };
//     if (filters.gender)                  where.preferredTenant = { path: ['gender'], string_contains: filters.gender };
//     if (filters.roomType?.length)        where.roomType = { array_contains: filters.roomType };
//     if (filters.pgAmenities?.length)     where.pgAmenities = { array_contains: filters.pgAmenities };

//     return where;
//   }

//   private buildLocationOr(filters: any): any[] {
//     const or: any[] = [];
//     if (filters.locality) {
//       or.push({ locality: { contains: filters.locality, mode: 'insensitive' } });
//       or.push({ landmark: { contains: filters.locality, mode: 'insensitive' } });
//       or.push({ street:   { contains: filters.locality, mode: 'insensitive' } });
//     }
//     if (filters.city) {
//       or.push({ city: { contains: filters.city, mode: 'insensitive' } });
//     }
//     return or;
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 📖 LOCAL DICTIONARY EXTRACTOR (no API, instant)
//   // ─────────────────────────────────────────────────────────────────────
//   localExtract(query: string): any {
//     const q = ' ' + query.toLowerCase().trim() + ' ';
//     const filters: any = {};

//     // ── ROOM TYPE ───────────────────────────────────────────────────────
//     if (matchesAny(q, LANG_DICT.roomType.Single as any))
//       filters.roomType = ['Single'];
//     else if (matchesAny(q, LANG_DICT.roomType.Double as any))
//       filters.roomType = ['Double'];
//     else if (matchesAny(q, LANG_DICT.roomType.Triple as any))
//       filters.roomType = ['Triple'];
//     else if (matchesAny(q, LANG_DICT.roomType.Dormitory as any))
//       filters.roomType = ['Dormitory'];

//     // Numeric: "2 sharing", "3 pera", "2 bed" etc.
//     if (!filters.roomType) {
//       const m = q.match(/\b(\d)\s*(?:share|sharing|pera|peru|paer|log|jana|manishi|bed|room|person)\b/);
//       if (m) {
//         const n = parseInt(m[1]);
//         filters.roomType =
//           n === 1 ? ['Single']
//           : n === 2 ? ['Double']
//           : n === 3 ? ['Triple']
//           : ['Dormitory'];
//       }
//     }

//     // ── FOOD ────────────────────────────────────────────────────────────
//     if (matchesAny(q, LANG_DICT.food as any))
//       filters.foodIncluded = true;

//     // ── GENDER ──────────────────────────────────────────────────────────
//     if (matchesAny(q, LANG_DICT.girls as any))
//       filters.gender = 'Girls';
//     else if (matchesAny(q, LANG_DICT.boys as any))
//       filters.gender = 'Boys';

//     // ── AMENITIES ───────────────────────────────────────────────────────
//     const amenities: string[] = [];
//     if (matchesAny(q, LANG_DICT.wifi as any))         amenities.push('wifi');
//     if (matchesAny(q, LANG_DICT.ac as any))           amenities.push('ac');
//     if (matchesAny(q, LANG_DICT.parking as any))      amenities.push('parking');
//     if (matchesAny(q, LANG_DICT.powerBackup as any))  amenities.push('power backup');
//     if (matchesAny(q, LANG_DICT.laundry as any))      amenities.push('laundry');
//     if (amenities.length) filters.pgAmenities = amenities;

//     // ── PRICE ───────────────────────────────────────────────────────────
//     const pricePatterns = [
//       /(\d+(?:\.\d+)?)\s*k\b/,
//       /(?:under|below|within|max|upto|up to)\s*(?:rs\.?|₹)?\s*(\d{4,6})/,
//       /(?:rs\.?|₹)\s*(\d{4,6})/,
//       /(\d{4,6})\s*(?:rs|rupees|budget|ku\b|lo\b|mein\b|la\b)/,
//       /(\d+)\s*(?:thousand|hajar)/,
//     ];
//     for (const pat of pricePatterns) {
//       const m = query.toLowerCase().match(pat);
//       if (m) {
//         let price = parseFloat(m[1]);
//         if (price < 500) price *= 1000;
//         filters.maxPrice = Math.round(price);
//         break;
//       }
//     }

//     // ── CITY ────────────────────────────────────────────────────────────
//     for (const [cityName, aliases] of Object.entries(LANG_DICT.cities)) {
//       if (aliases.some((alias) => q.includes(' ' + alias + ' ') || q.includes(' ' + alias) || q.includes(alias + ' '))) {
//         filters.city = cityName;
//         break;
//       }
//     }

//     // ── LOCALITY ────────────────────────────────────────────────────────
//     // Sort longest first to prevent "omr" matching before "chromepet"
//     const sorted = [...LANG_DICT.localities].sort((a, b) => b.length - a.length);
//     for (const loc of sorted) {
//       if (q.includes(loc)) {
//         filters.locality = capitalize(loc);
//         if (!filters.city) {
//           filters.city = this.inferCity(loc);
//         }
//         break;
//       }
//     }

//     return filters;
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🏙  INFER CITY FROM LOCALITY
//   // ─────────────────────────────────────────────────────────────────────
//   private inferCity(loc: string): string | undefined {
//     const l = loc.toLowerCase();
//     const map: [string[], string][] = [
//       [['omr','ecr','velachery','tambaram','chrompet','chromepet','pallavaram',
//         'medavakkam','sholinganallur','perungudi','thoraipakkam','navalur',
//         'siruseri','kelambakkam','perumbakkam','adyar','besant nagar',
//         'thiruvanmiyur','t nagar','nungambakkam','egmore','anna nagar',
//         'kk nagar','ashok nagar','vadapalani','porur','madipakkam','guindy',
//         'saidapet','mylapore','alwarpet','ambattur','avadi','mogappair',
//         'kilpauk','perambur','kolathur','madhavaram','poonamallee',
//         'mandaveli','kotturpuram','royapettah','triplicane'], 'Chennai'],
//       [['koramangala','indiranagar','whitefield','electronic city','btm',
//         'hsr','marathahalli','jp nagar','jayanagar','banashankari',
//         'rajajinagar','malleshwaram','hebbal','yelahanka','sarjapur',
//         'bellandur','mahadevapura'], 'Bangalore'],
//       [['banjara hills','jubilee hills','madhapur','hitech city','gachibowli',
//         'kondapur','kukatpally','ameerpet','secunderabad'], 'Hyderabad'],
//       [['powai','andheri','bandra','thane','borivali','malad','goregaon',
//         'vile parle','kurla'], 'Mumbai'],
//       [['viman nagar','kothrud','hinjewadi','baner','wakad','aundh',
//         'kharadi','hadapsar'], 'Pune'],
//       [['dwarka','rohini','janakpuri','laxmi nagar'], 'Delhi'],
//     ];
//     for (const [locs, city] of map) {
//       if (locs.some((x) => l.includes(x))) return city;
//     }
//     return undefined;
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🤖 GEMINI EXTRACTOR
//   // ─────────────────────────────────────────────────────────────────────
//   async getFiltersFromGemini(query: string): Promise<any> {
//     const prompt = `
// You extract PG search filters from Indian language queries. Return ONLY JSON.

// TRANSLATION GUIDE:
// - "rendu pera/sharing/iru pera/do log/iddaru/eradu jana" → roomType: ["Double"]
// - "ondre pera/oru pera/ek sharing/oka manishi/ondu jana" → roomType: ["Single"]  
// - "moonu pera/moondu/teen log/mugguru/eradu+1" → roomType: ["Triple"]
// - "saaptaadu/saapadu/khana/bhojanam/oota/tindi/food" → foodIncluded: true
// - "ponnu/pengal/ladki/mahila/ammayilu/hudugiyaru/girls" → gender: "Girls"
// - "paiyan/aambala/ladka/gents/abbayilu/hudugaru/boys" → gender: "Boys"
// - Remove location particles: "la","le","lo","mein","alli","il" from place names
// - "tambaram la" → locality: "Tambaram" (NOT "Tambaram la")
// - "8k" = maxPrice 8000, "10k" = 10000

// Return ONLY this JSON (omit fields not found):
// {"roomType":["Double"],"foodIncluded":true,"city":"Chennai","locality":"Tambaram","gender":"Girls","maxPrice":8000,"pgAmenities":["wifi"]}

// Query: "${query}"`;

//     try {
//       const res = await axios.post(
//         `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
//         {
//           contents: [{ parts: [{ text: prompt }] }],
//           generationConfig: { temperature: 0.05, topP: 0.9, maxOutputTokens: 200 },
//         },
//         { timeout: 7000 },
//       );

//       let text = res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '{}';
//       text = text.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
//       const match = text.match(/\{[\s\S]*?\}/);
//       if (!match) return {};

//       const parsed = JSON.parse(match[0]);

//       // Normalize roomType
//       if (parsed.roomType) {
//         parsed.roomType = parsed.roomType.map((r: string) => {
//           const l = r.toLowerCase();
//           if (l.includes('single') || l === '1') return 'Single';
//           if (l.includes('double') || l === '2') return 'Double';
//           if (l.includes('triple') || l === '3') return 'Triple';
//           if (l.includes('dorm'))  return 'Dormitory';
//           return r;
//         }).filter(Boolean);
//       }

//       // Clean locality particles
//       if (parsed.locality) {
//         parsed.locality = parsed.locality
//           .replace(/\s+(la|le|lo|mein|alli|il|near)$/i, '')
//           .trim();
//       }

//       return parsed;
//     } catch (err: any) {
//       console.error('❌ Gemini failed:', err?.message);
//       return {};
//     }
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // ✨ SUMMARY
//   // ─────────────────────────────────────────────────────────────────────
//   buildSummary(filters: any, count: number): string {
//     const parts: string[] = [];
//     if (filters.gender) parts.push(`${filters.gender}'s PG`);
//     else parts.push('PG');
//     if (filters.roomType?.length) parts.push(filters.roomType.join('/') + ' room');
//     if (filters.foodIncluded) parts.push('with food');
//     if (filters.locality) parts.push(`in ${filters.locality}`);
//     else if (filters.city) parts.push(`in ${filters.city}`);
//     if (filters.maxPrice) parts.push(`under ₹${filters.maxPrice.toLocaleString('en-IN')}`);
//     if (filters.pgAmenities?.length) parts.push(filters.pgAmenities.join(', '));
//     return `${count} result${count !== 1 ? 's' : ''} · ${parts.join(' · ')}`;
//   }

//   // ─────────────────────────────────────────────────────────────────────
//   // 🌟 RECOMMENDATIONS / TRENDING / SIMILAR / VIEW
//   // ─────────────────────────────────────────────────────────────────────
//   async getRecommendations(city: string, budget?: number, gender?: string) {
//     const where: any = {
//       isDeleted: false, isDraft: false,
//       propertyType: { in: ['pg','PG','Pg','hostel','Hostel'] },
//       city: { contains: city, mode: 'insensitive' },
//     };
//     if (budget) where.price = { lte: budget };
//     if (gender) where.preferredTenant = { path: ['gender'], string_contains: gender };
//     return this.prisma.property.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10 });
//   }

//   async getTrending(city?: string) {
//     const where: any = {
//       isDeleted: false, isDraft: false,
//       propertyType: { in: ['pg','PG','Pg','hostel','Hostel'] },
//     };
//     if (city) where.city = { contains: city, mode: 'insensitive' };
//     return this.prisma.property.findMany({ where, orderBy: { createdAt: 'desc' }, take: 8 });
//   }

//   async getSimilar(propertyId: number) {
//     const p = await this.prisma.property.findUnique({ where: { id: propertyId } });
//     if (!p) return [];
//     return this.prisma.property.findMany({
//       where: {
//         isDeleted: false, isDraft: false,
//         id: { not: propertyId },
//         city: p.city,
//         locality: { contains: p.locality, mode: 'insensitive' },
//         propertyType: { in: ['pg','PG','Pg','hostel','Hostel'] },
//       },
//       orderBy: { createdAt: 'desc' },
//       take: 6,
//     });
//   }

//   async incrementView(propertyId: number) {
//     try {
//       await this.prisma.$executeRaw`
//         UPDATE "Property" SET "viewCount" = COALESCE("viewCount", 0) + 1
//         WHERE id = ${propertyId}
//       `;
//       return { success: true };
//     } catch { return { success: false }; }
//   }
// }




// src/ai/ai.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'prisma/prisma.service';

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`;

const SUPPORTED_CITIES = ['Chennai', 'Coimbatore', 'Hyderabad', 'Bangalore'];

// ─────────────────────────────────────────────────────────────────────────────
// Pure Gemini call helper
// ─────────────────────────────────────────────────────────────────────────────
async function callGemini(prompt: string, maxTokens = 300): Promise<string> {
  const res = await axios.post(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.05, topP: 0.95, maxOutputTokens: maxTokens },
    },
    { timeout: 10000 },
  );
  return res.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

function extractJson(raw: string): any {
  const clean = raw.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
  const match = clean.match(/\{[\s\S]*\}/);
  if (!match) return {};
  return JSON.parse(match[0]);
}

@Injectable()
export class AiService {
  constructor(private prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────────────
  // 🔍 MAIN SEARCH — 100% AI, zero hardcoded keywords
  // ─────────────────────────────────────────────────────────────────────
  async search(query: string) {
    // Step 1: Gemini extracts all filters from the query in any language
    const filters = await this.extractFiltersWithGemini(query);

    console.log('🔍 Query:', query);
    console.log('✅ AI Filters:', JSON.stringify(filters, null, 2));

    // Step 2: Smart 4-tier DB query with progressive fallback
    const results = await this.queryWithFallback(filters, query);

    // Step 3: AI generates a human-readable summary
    const summary = this.buildSummary(filters, results.length);

    return { query, filters, count: results.length, results, summary };
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🤖 GEMINI: Extract structured filters from ANY language query
  // ─────────────────────────────────────────────────────────────────────
  private async extractFiltersWithGemini(query: string): Promise<any> {
    const prompt = `
You are an expert NLP model for a PG (Paying Guest) accommodation search app in India.
This app only serves 4 cities: Chennai, Coimbatore, Hyderabad, Bangalore.

Your task: Parse the user's query — written in ANY language or mix (Tamil, Tanglish, Hindi, Telugu, Kannada, Malayalam, Bengali, English, or any combination) — and extract structured search filters.

=== LANGUAGE UNDERSTANDING ===

ROOM TYPE patterns (map to exact values: Single / Double / Triple / Dormitory):
- Single (1 person): "single", "1 share", "1 sharing", "1 bed", "1 person", "oru pera", "ondre pera", "okka pera", "ek sharing", "eka jana", "oka manishi", "ondu jana", "akele", "solo room"
- Double (2 persons): "double", "2 share", "2 sharing", "2 bed", "2 person", "rendu pera", "rendu sharing", "iru pera", "erandu", "irandam", "do log", "do sharing", "iddaru", "eradu jana", "twin sharing", "two sharing"
- Triple (3 persons): "triple", "3 share", "3 sharing", "moonu pera", "moondu", "teen log", "mugguru", "three sharing"
- Dormitory (4+): "dorm", "dormitory", "4 share", "4+", "common room"

FOOD patterns (foodIncluded: true):
"food", "meals", "mess", "breakfast", "lunch", "dinner", "tiffin",
"saaptaadu", "saapadu", "soru", "unavu", "sappaadu",
"khana", "khaana", "bhojan", "tiffin",
"bhojanam", "tindi", "annam",
"oota", "ootu",
"with food", "food included", "food attach", "food saathe", "food venum", "meals venum", "khana chahiye", "food kavali", "food beku"

GENDER patterns:
- Girls: "girls", "ladies", "female", "women", "ponnu", "pengal", "penn", "ladki", "ladkiyon", "mahila", "ammayilu", "ammayi", "hudugiyaru", "hudugi"
- Boys: "boys", "gents", "male", "men", "paiyan", "paiyanga", "aambala", "ladka", "ladkon", "abbayilu", "hudugaru", "huduga"

PRICE patterns (extract as integer rupees):
"8k" → 8000, "10k" → 10000, "8.5k" → 8500
"₹8000", "rs 8000", "8000 rs", "8000 rupees"
"under 8000", "below 10000", "max 8000", "upto 8000", "8000 budget"
"8000 ku" (Tamil), "8000 mein" (Hindi), "8000 lo" (Telugu), "8000 la" (Tamil)

AMENITIES (array from: wifi, ac, parking, power backup, laundry, gym, cctv):
"wifi", "wi-fi", "internet" → wifi
"ac", "a/c", "air condition", "air conditioner", "ac room", "cooling" → ac
"parking", "bike parking", "car parking" → parking
"power backup", "generator", "ups" → power backup
"laundry", "washing machine" → laundry

CITY (only these 4, detect from aliases):
- Chennai: "chennai", "madras", "singara chennai"
- Coimbatore: "coimbatore", "kovai", "cbe", "koimbatore"
- Hyderabad: "hyderabad", "hyd", "cyberabad"
- Bangalore: "bangalore", "bengaluru", "blr", "banglore", "bengalore"

LOCALITY (area/neighborhood name — extract as proper English):
- Remove language particles BEFORE and AFTER the place name:
  Particles: "la", "le", "lo", "mein", "alli", "il", "near", "ku", "nu", "close to", "next to"
  Examples:
  "tambaram la" → "Tambaram"
  "OMR la" → "OMR"
  "Velachery ku" → "Velachery"
  "Koramangala lo" → "Koramangala"
  "Ameerpet mein" → "Ameerpet"
- If locality implies a city, set that city too:
  OMR, Velachery, Tambaram, Chrompet, T Nagar, Anna Nagar, Adyar, Guindy, Porur, Madipakkam, Sholinganallur → Chennai
  RS Puram, Gandhipuram, Peelamedu, Saibaba Colony, Singanallur → Coimbatore
  Ameerpet, Gachibowli, Madhapur, HiTech City, Kukatpally, Kondapur, Banjara Hills → Hyderabad
  Koramangala, Indiranagar, Whitefield, Electronic City, BTM, HSR, Marathahalli, Hebbal → Bangalore

=== OUTPUT FORMAT ===
Return ONLY valid JSON. No markdown. No explanation. No extra text. Omit any field not clearly mentioned.

{
  "roomType": ["Double"],
  "foodIncluded": true,
  "city": "Chennai",
  "locality": "Tambaram",
  "gender": "Girls",
  "maxPrice": 8000,
  "pgAmenities": ["wifi", "ac"]
}

=== USER QUERY ===
"${query}"
`;

    try {
      const raw = await callGemini(prompt, 300);
      const parsed = extractJson(raw);

      // Validate & normalize roomType
      if (parsed.roomType) {
        const valid = ['Single', 'Double', 'Triple', 'Dormitory'];
        parsed.roomType = parsed.roomType
          .map((r: string) => {
            const l = r.toLowerCase();
            if (l.includes('single') || l === '1') return 'Single';
            if (l.includes('double') || l === '2') return 'Double';
            if (l.includes('triple') || l === '3') return 'Triple';
            if (l.includes('dorm') || l.includes('4')) return 'Dormitory';
            return valid.find((v) => v.toLowerCase() === l) ?? null;
          })
          .filter(Boolean);
        if (!parsed.roomType.length) delete parsed.roomType;
      }

      // Validate city
      if (parsed.city && !SUPPORTED_CITIES.includes(parsed.city)) {
        delete parsed.city;
      }

      // Clean locality
      if (parsed.locality) {
        parsed.locality = parsed.locality
          .replace(/\s+(la|le|lo|mein|alli|il|near|ku|nu|close to|next to)$/gi, '')
          .trim();
        // Proper case
        parsed.locality = parsed.locality
          .split(' ')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
          .join(' ');
      }

      // Validate gender
      if (parsed.gender && !['Girls', 'Boys'].includes(parsed.gender)) {
        delete parsed.gender;
      }

      // Validate maxPrice
      if (parsed.maxPrice) {
        parsed.maxPrice = Math.round(Number(parsed.maxPrice));
        if (isNaN(parsed.maxPrice) || parsed.maxPrice <= 0) delete parsed.maxPrice;
      }

      return parsed;
    } catch (err: any) {
      console.error('❌ Gemini extract failed:', err?.message);
      return {};
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🗄 SMART 4-TIER FALLBACK QUERY
  // ─────────────────────────────────────────────────────────────────────
  private async queryWithFallback(filters: any, rawQuery: string) {
    const base = {
      isDeleted: false,
      isDraft: false,
      propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel', 'PG/Hostel'] },
    };

    // TIER 1 — All filters strict
    const t1 = await this.prisma.property.findMany({
      where: this.buildWhere(filters, base),
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    if (t1.length > 0) { console.log(`✅ T1: ${t1.length} results`); return t1; }

    // TIER 2 — Location only (OR across locality / landmark / street / city)
    if (filters.locality || filters.city) {
      console.log('⚠️ T2: location-only fallback');
      const t2 = await this.prisma.property.findMany({
        where: { ...base, OR: this.locationOr(filters) },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      if (t2.length > 0) { console.log(`✅ T2: ${t2.length} results`); return t2; }
    }

    // TIER 3 — Raw word search (Gemini may have missed locality)
    console.log('⚠️ T3: raw word fallback');
    const stopWords = new Set([
      'venum', 'beku', 'kavali', 'chahiye', 'wala', 'vala', 'the', 'and',
      'with', 'near', 'from', 'have', 'for', 'not', 'this', 'that', 'want',
      'need', 'room', 'sharing', 'pg', 'hostel', 'please',
    ]);
    const words = rawQuery
      .toLowerCase()
      .split(/[\s,.\-_]+/)
      .filter((w) => w.length > 3 && !stopWords.has(w))
      .slice(0, 8);

    if (words.length > 0) {
      const wordOr: any[] = words.flatMap((word) => [
        { locality:     { contains: word, mode: 'insensitive' } },
        { city:         { contains: word, mode: 'insensitive' } },
        { landmark:     { contains: word, mode: 'insensitive' } },
        { street:       { contains: word, mode: 'insensitive' } },
        { propertyName: { contains: word, mode: 'insensitive' } },
      ]);
      const t3 = await this.prisma.property.findMany({
        where: { ...base, OR: wordOr },
        orderBy: { createdAt: 'desc' },
        take: 20,
      });
      if (t3.length > 0) { console.log(`✅ T3: ${t3.length} results`); return t3; }
    }

    // TIER 4 — Latest PGs (never show empty)
    console.log('⚠️ T4: latest PGs fallback');
    return this.prisma.property.findMany({
      where: base,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🏗 WHERE CLAUSE BUILDER
  // ─────────────────────────────────────────────────────────────────────
  private buildWhere(filters: any, base: any): any {
    const where: any = { ...base };

    // Location uses OR — "Tambaram" matches "West Tambaram", "Tambaram East", etc.
    if (filters.locality || filters.city) {
      where.OR = this.locationOr(filters);
    }

    if (filters.foodIncluded === true)  where.foodIncluded = true;
    if (filters.maxPrice > 0)           where.price = { lte: filters.maxPrice };
    if (filters.gender)                 where.preferredTenant = { path: ['gender'], string_contains: filters.gender };
    if (filters.roomType?.length)       where.roomType = { array_contains: filters.roomType };
    if (filters.pgAmenities?.length)    where.pgAmenities = { array_contains: filters.pgAmenities };

    return where;
  }

  private locationOr(filters: any): any[] {
    const or: any[] = [];
    if (filters.locality) {
      or.push({ locality: { contains: filters.locality, mode: 'insensitive' } });
      or.push({ landmark: { contains: filters.locality, mode: 'insensitive' } });
      or.push({ street:   { contains: filters.locality, mode: 'insensitive' } });
    }
    if (filters.city) {
      or.push({ city: { contains: filters.city, mode: 'insensitive' } });
    }
    return or;
  }

  // ─────────────────────────────────────────────────────────────────────
  // ✨ AI-GENERATED SUMMARY
  // ─────────────────────────────────────────────────────────────────────
  buildSummary(filters: any, count: number): string {
    const parts: string[] = [];
    if (filters.gender) parts.push(`${filters.gender}'s PG`);
    else parts.push('PG');
    if (filters.roomType?.length) parts.push(filters.roomType.join('/') + ' room');
    if (filters.foodIncluded) parts.push('with food');
    if (filters.locality) parts.push(`in ${filters.locality}`);
    else if (filters.city) parts.push(`in ${filters.city}`);
    if (filters.maxPrice) parts.push(`under ₹${filters.maxPrice.toLocaleString('en-IN')}`);
    if (filters.pgAmenities?.length) parts.push(filters.pgAmenities.join(' + '));
    return `${count} result${count !== 1 ? 's' : ''} · ${parts.join(' · ')}`;
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🤖 AI DYNAMIC SUGGESTIONS — Gemini generates context-aware chips
  // ─────────────────────────────────────────────────────────────────────
  async getDynamicSuggestions(city?: string): Promise<any[]> {
    const prompt = `
Generate 6 realistic PG search queries for the Rentit app in India.
${city ? `Focus on the city: ${city}` : 'Cover all 4 cities: Chennai, Coimbatore, Hyderabad, Bangalore'}

Each query should:
- Be in a mix of English, Tamil/Tanglish, Hindi, or Telugu (vary the languages)
- Be realistic and short (under 10 words)
- Cover different filters: room type, food, gender, budget, amenities, locality

Return ONLY a JSON array of objects. No markdown. No explanation.
[
  {"query": "rendu pera pg venum OMR la food saathe", "label": "2 share + food · OMR", "city": "Chennai"},
  {"query": "girls pg Koramangala wifi beku 8k", "label": "Girls PG · Koramangala", "city": "Bangalore"}
]
Generate exactly 6 items.`;

    try {
      const raw = await callGemini(prompt, 400);
      const clean = raw.replace(/```json\n?/gi, '').replace(/```\n?/g, '').trim();
      const match = clean.match(/\[[\s\S]*\]/);
      if (!match) return this.fallbackSuggestions(city);
      return JSON.parse(match[0]);
    } catch {
      return this.fallbackSuggestions(city);
    }
  }

  private fallbackSuggestions(city?: string): any[] {
    const base = [
      { query: "2 sharing pg with food near metro", label: "2 share + food · near metro", city: city ?? "Chennai" },
      { query: "girls pg wifi ac room 8k budget",   label: "Girls PG · WiFi + AC ₹8k",   city: city ?? "Bangalore" },
    ];
    return base;
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🌟 RECOMMENDATIONS
  // ─────────────────────────────────────────────────────────────────────
  async getRecommendations(city: string, budget?: number, gender?: string) {
    const where: any = {
      isDeleted: false, isDraft: false,
      propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
      city: { contains: city, mode: 'insensitive' },
    };
    if (budget) where.price = { lte: budget };
    if (gender) where.preferredTenant = { path: ['gender'], string_contains: gender };
    return this.prisma.property.findMany({ where, orderBy: { createdAt: 'desc' }, take: 10 });
  }


    async processWithGemini(query: string) {
    // 🔥 Dummy logic (replace with Gemini)
    return {
      filters: {
        city: 'Chennai',
        locality: 'OMR',
        roomType: 'Double',
        maxPrice: 8000,
      },
      originalQuery: query,
    };
  }





  // ─────────────────────────────────────────────────────────────────────
  // 🔥 TRENDING
  // ─────────────────────────────────────────────────────────────────────
  async getTrending(city?: string) {
    const where: any = {
      isDeleted: false, isDraft: false,
      propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
    };
    if (city) where.city = { contains: city, mode: 'insensitive' };
    return this.prisma.property.findMany({ where, orderBy: { createdAt: 'desc' }, take: 8 });
  }

  // ─────────────────────────────────────────────────────────────────────
  // 🏠 SIMILAR
  // ─────────────────────────────────────────────────────────────────────
  async getSimilar(propertyId: number) {
    const p = await this.prisma.property.findUnique({ where: { id: propertyId } });
    if (!p) return [];
    return this.prisma.property.findMany({
      where: {
        isDeleted: false, isDraft: false,
        id: { not: propertyId },
        city: p.city,
        locality: { contains: p.locality, mode: 'insensitive' },
        propertyType: { in: ['pg', 'PG', 'Pg', 'hostel', 'Hostel'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  }

  // ─────────────────────────────────────────────────────────────────────
  // 👁 VIEW TRACKING
  // ─────────────────────────────────────────────────────────────────────
  async incrementView(propertyId: number) {
    try {
      await this.prisma.$executeRaw`
        UPDATE "Property" SET "viewCount" = COALESCE("viewCount", 0) + 1
        WHERE id = ${propertyId}
      `;
      return { success: true };
    } catch { return { success: false }; }
  }
}