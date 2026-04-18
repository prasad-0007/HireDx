# HireDx - Interview Rejection Analysis System

Welcome to **HireDx** - built for DevClash 2026.

## 🚀 Overview
Candidates finish interviews without knowing why they were rejected. HireDx is a platform where users upload or record interview audio and receive detailed AI-powered analysis of exactly why they likely got rejected.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, shadcn/ui.
- **Visualizations**: Recharts, Framer Motion, Lucide Icons.
- **Backend**: Next.js Server API Routes.
- **AI Integration**: Google Gemini 1.5 Pro (Direct Multimodal Audio Analysis replacing Whisper).
- **Database & Auth**: Supabase (PostgreSQL).

## 🏃‍♂️ Running the Hackathon Demo
We have built a completely standalone **Demo Mode** UI so you can pitch the project to judges immediately without needing backend DBs configured.

```bash
cd hiredx
npm install
npm run dev
```
Open `http://localhost:3000`.
Click "View Demo Analysis" or click "Sign In" on the Login page to directly access the populated Rejection Heatmap Dashboard!

## 🔐 Wiring up the Backend
1. Create a Supabase project and get your URL and Anon Key.
2. Get your Google Gemini API Key from Google AI Studio.
3. Copy `.env.example` to `.env.local` and add your keys.
4. Run the SQL located in `supabase/migrations/0000_init.sql` in your Supabase SQL Editor to spawn the tables.
