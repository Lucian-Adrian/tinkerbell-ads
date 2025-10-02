# Tinkerbell - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

This guide will get you up and running with Tinkerbell development immediately.

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 18+ installed
- ✅ Git installed
- ✅ A Supabase account (free tier is fine)
- ✅ A Gemini API key from Google AI Studio
- ✅ Redis installed locally OR use Upstash (free tier)

## Step 1: Create Next.js Project (2 minutes)

```bash
# Create the project
npx create-next-app@latest tinkerbell --typescript --tailwind --app --eslint

# Navigate into directory
cd tinkerbell

# Install core dependencies
npm install @supabase/supabase-js @supabase/ssr @google/generative-ai zod bull ioredis swr axios react-hook-form @hookform/resolvers lucide-react recharts date-fns clsx tailwind-merge cheerio
```

## Step 2: Set Up Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for database to be ready (~2 minutes)
3. Go to Project Settings → API
4. Copy your:
   - Project URL
   - Anon/Public key
   - Service Role key (keep secret!)

## Step 3: Configure Environment (1 minute)

Create .env.local in your project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Gemini AI
GEMINI_API_KEY=your-gemini-key-here
GEMINI_MODEL=gemini-2.0-flash-exp

# Redis
REDIS_URL=redis://localhost:6379

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Step 4: Set Up Database (3 minutes)

1. In Supabase Dashboard, go to SQL Editor
2. Copy the migration from DEVELOPMENT_PLAN.md (Section 0.3)
3. Run each migration in order:
   - 20250101000000_init_schema.sql
   - 20250101000002_rls_policies.sql
   - 20250101000003_functions.sql

## Step 5: Create Initial Files (5 minutes)

Create these essential files:

### 1. Supabase Client
src/lib/supabase/client.ts:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2. Supabase Server
src/lib/supabase/server.ts:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {}
        },
      },
    }
  )
}
```

### 3. AI Config
src/config/ai-config.ts:
```typescript
export const AI_CONFIG = {
  gemini: {
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    temperature: 0.7,
    maxTokens: 8192,
  },
} as const
```

## Step 6: Test Your Setup (2 minutes)

### Test Database Connection

Create src/app/test/page.tsx:
```typescript
import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('companies').select('count')
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Connection Test</h1>
      {error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <p className="text-green-500">✅ Database connected!</p>
      )}
    </div>
  )
}
```

Visit http://localhost:3000/test

## Step 7: Start Development (1 minute)

```bash
# Terminal 1: Start Next.js dev server
npm run dev

# Terminal 2: Start Redis (if local)
redis-server

# Terminal 3: Start worker (once implemented)
# npm run worker
```

## 🎯 What to Build First

Follow this order from the DEVELOPMENT_PLAN.md:

### Week 1: Foundation
1. ✅ Complete setup above
2. Create folder structure (copy from plan)
3. Set up middleware for auth
4. Create basic UI components

### Week 2: Authentication & Input
1. Build login/signup pages
2. Create company input form
3. Implement web scraper
4. Test end-to-end

### Week 3: AI Integration
1. Set up worker system
2. Implement persona generation
3. Test with real company data

### Week 4: Script Generation
1. Build script service
2. Create 5 creative angle prompts
3. Test generation quality

### Week 5: Scoring
1. Implement scoring service
2. Create dashboard to view results

## 📁 Key Files Reference

All code is in the **DEVELOPMENT_PLAN.md**. Key sections:

- **Section 0.2**: Complete folder structure
- **Section 0.3**: Database schema
- **Section 1.1**: Authentication
- **Section 1.2**: Company scraping
- **Section 1.3**: Worker setup
- **Section 1.4**: Persona generation
- **Section 1.5**: Script generation
- **Section 1.6**: Scoring system

## 🐛 Common Issues

### "Module not found"
- Run 
pm install again
- Check TypeScript paths in 	sconfig.json

### "Database connection failed"
- Verify .env.local has correct Supabase URL
- Check if Supabase project is active

### "Gemini API error"
- Verify API key is correct
- Check API quota at [aistudio.google.com](https://aistudio.google.com)

### "Redis connection refused"
- Start Redis: edis-server
- Or use Upstash (cloud Redis)

## 🔍 Debugging Tips

1. Check browser console for client-side errors
2. Check terminal for server-side errors
3. Use Supabase logs for database issues
4. Use console.log liberally during development
5. Test each component in isolation

## 📚 Next Steps

Once your setup works:

1. Read the full **DEVELOPMENT_PLAN.md**
2. Follow phase-by-phase implementation
3. Test each feature as you build
4. Refer to code examples in the plan

## 🆘 Need Help?

- Review **PLAN_SUMMARY.md** for architecture overview
- Check **DEVELOPMENT_PLAN.md** for detailed implementation
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- Gemini docs: [ai.google.dev/docs](https://ai.google.dev/docs)

## ✅ Verification Checklist

Before moving to Week 2, verify:
- [ ] Next.js app runs on localhost:3000
- [ ] Database connection works
- [ ] Environment variables loaded
- [ ] Folder structure created
- [ ] Basic authentication works
- [ ] Test page shows success

---

**Time to first working prototype: ~4 hours** (following this guide + Week 2 of the plan)

Good luck building Tinkerbell! 🚀✨
