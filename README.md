# AdVisor

AI-powered advertising campaign strategy generator. Create data-driven media plans in minutes with intelligent budget allocation, audience targeting, and real-time trend analysis.

## Features

- **AI Campaign Generation** - Describe your campaign goal and get a complete strategy
- **AI Strategist Personas** - Choose from specialized AI strategists with different approaches
- **Google Trends Integration** - Explore real-time search trends and create campaigns from trending data
- **Interactive Budget Allocation** - Visual funnel with drag-to-adjust budget distribution
- **AI Chat Refinement** - Refine your strategy through conversation with your AI strategist
- **PDF Export** - Export campaign blueprints for presentations

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Supabase (Auth & Database)
- Anthropic Claude API
- SerpAPI (Google Trends)

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add the `.env` file (already in project in Google Drive Submission)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Sample Simple Usage

1. Sign in or create an account
2. Select an AI strategist
3. Describe your campaign goal (e.g., "Valentine's Day promotion for a flower shop in NYC")
4. Set your budget
5. Click "Generate Strategy"
6. Refine via chat, then export to PDF
