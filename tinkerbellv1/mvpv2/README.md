# Tinkerbell MVP v2

> **AI-Powered B2B Marketing Campaign Generator**

Automate the entire process of creating, testing, and scaling marketing campaigns with AI. From a single URL and value proposition, Tinkerbell generates hundreds of ad ideas, scores them for viral potential, and creates production-ready assets.

## 🚀 Features

- **Smart Context Extraction**: Scrapes company website to understand business context
- **AI Persona Generation**: Creates 3 detailed buyer personas using Gemini 2.5 Flash
- **Mass Script Generation**: Generates 20 unique ad scripts per persona using guerrilla marketing techniques
- **ViralCheck Scoring**: Scores scripts based on trend data, AI prediction, and viral patterns
- **Automated Asset Creation**: 
  - Images for top 10 scripts (Imagen 4 Fast)
  - Videos for top 3 scripts (Veo 3 Fast)
- **Real-time Progress**: WebSocket updates for long-running jobs
- **Export & Download**: JSON/CSV export for all generated content

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Supabase** - PostgreSQL, Auth, Realtime, Storage
- **Next.js API Routes** - Serverless functions

### AI Services
- **Gemini 2.5 Flash** - Text generation
- **Imagen 4 Fast** - Image generation
- **Veo 3 Fast** - Video generation

## 📁 Project Structure

```
mvpv2/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Main application
│   └── api/               # API endpoints
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── dashboard/        # Dashboard components
│   ├── personas/         # Persona components
│   ├── scripts/          # Script components
│   └── assets/           # Asset components
├── lib/                   # Core libraries
│   ├── ai/               # AI integrations
│   │   ├── gemini/       # Gemini services
│   │   ├── imagen/       # Imagen services
│   │   └── veo/          # Veo services
│   ├── supabase/         # Database services
│   ├── services/         # Business logic
│   ├── queue/            # Job queue system
│   └── utils/            # Utilities
├── types/                 # TypeScript types
├── hooks/                 # React hooks
├── config/                # Configuration
├── supabase/              # Database migrations
└── docs/                  # Documentation
```

## 🔧 Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google AI API access (Gemini, Imagen, Veo)

### Installation

1. **Clone and navigate**
   ```bash
   cd mvpv2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   GOOGLE_AI_API_KEY=your_google_api_key
   ```

4. **Setup database**
   ```bash
   npm run setup-db
   ```
   
   This creates all necessary tables and RLS policies.

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Tables

- **companies** - Company information and scraped context
- **personas** - Generated buyer personas
- **script_batches** - Batch generation metadata
- **scripts** - Individual ad scripts
- **scores** - ViralCheck scoring results
- **assets** - Generated images and videos
- **jobs** - Background job queue

See [docs/DATABASE.md](./docs/DATABASE.md) for detailed schema.

## 🔄 How It Works

### 1. Ingestion
```typescript
POST /api/ingest
{
  "url": "https://company.com",
  "uvp": "We help X do Y without Z"
}
```
- Scrapes company website
- Extracts metadata, content, UVP
- Stores in Supabase

### 2. Persona Generation
```typescript
POST /api/personas/generate
{
  "companyId": "uuid"
}
```
- Uses Gemini 2.5 Flash
- Generates 3 buyer personas
- Structured JSON output

### 3. Script Generation
```typescript
POST /api/scripts/generate
{
  "personaId": "uuid",
  "batches": 4
}
```
- 4 batches × 5 scripts = 20 total
- Uses guerrilla marketing seeds
- Varies temperature per batch
- Parallel processing

### 4. Scoring (ViralCheck)
```typescript
POST /api/scores/calculate
{
  "scriptId": "uuid"
}
```
- **Trend Score**: Google Trends keyword velocity
- **LLM Score**: Gemini predictive analysis
- **Viral Score**: Pattern matching
- **Final**: `0.45*llm + 0.35*trend + 0.20*viral`

### 5. Asset Generation
```typescript
POST /api/assets/generate-images
{
  "scriptIds": ["uuid", ...]  // Top 10
}

POST /api/assets/generate-videos
{
  "scriptIds": ["uuid", ...]  // Top 3
}
```
- Images: Imagen 4 Fast (4 per script, 16:9)
- Videos: Veo 3 Fast (6s, no audio)
- Stored in Supabase Storage

## 🎯 API Endpoints

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ingest` | Ingest company URL |
| GET | `/api/personas` | List personas |
| POST | `/api/personas/generate` | Generate personas |
| GET | `/api/scripts` | List scripts |
| POST | `/api/scripts/generate` | Generate scripts |
| POST | `/api/scores/calculate` | Calculate scores |
| POST | `/api/assets/generate-images` | Generate images |
| POST | `/api/assets/generate-videos` | Generate videos |
| GET | `/api/jobs/:id` | Get job status |

See [docs/API.md](./docs/API.md) for complete API documentation.

## 🧪 Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build
npm run build
```

## 📝 Configuration

### Guerrilla Marketing Seeds

20+ seed keywords ensure diverse outputs:
```typescript
[
  "unconventional_approach",
  "surprise_element",
  "emotional_hook",
  "problem_agitate_solve",
  // ... 16 more
]
```

### Temperature Schedule

Varies creativity across batches:
```typescript
[0.2, 0.35, 0.5, 0.65, 0.8]
```

### Scoring Weights

ViralCheck formula:
```typescript
{
  llm: 0.45,
  trend: 0.35,
  viral: 0.20
}
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Self-Hosted

```bash
npm run build
npm start
```

## 📚 Documentation

- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - Detailed build plan
- [Architecture](./docs/ARCHITECTURE.md) - System architecture
- [Database](./docs/DATABASE.md) - Database schema
- [API](./docs/API.md) - API documentation
- [AI Integration](./docs/AI_INTEGRATION.md) - AI service details

## 🔐 Security

- Row-Level Security (RLS) on all tables
- User isolation via `user_id`
- Signed URLs for media assets
- API key protection
- Input validation with Zod

## 🎨 UI Features

- Responsive design (mobile, tablet, desktop)
- Real-time job progress
- Loading skeletons
- Error boundaries
- Toast notifications
- Dark mode support

## 🤝 Contributing

This is an MVP. Contributions welcome after initial release.

## 📄 License

Private - All rights reserved

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Google AI](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Version**: 0.1.0  
**Last Updated**: January 2025

For questions or support, see documentation or contact the team.
