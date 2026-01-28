# AdVisor

AI-powered advertising campaign strategy generator. Create data-driven media plans in minutes with intelligent budget allocation, audience targeting, and real-time trend analysis.

## Features

- **AI Campaign Generation** - Describe your campaign goal and get a complete strategy with budget allocation, audience segments, and ad format recommendations
- **AI Strategist Personas** - Choose from specialized AI strategists (Performance, Brand, Growth, Analytics) with different optimization approaches
- **Google Trends Integration** - Explore real-time search trends and create campaigns directly from trending data points
- **Interactive Budget Allocation** - Visual funnel with drag-to-adjust budget distribution across awareness, consideration, and conversion stages
- **AI Chat Refinement** - Refine your strategy through natural conversation with your AI strategist
- **PDF Export** - Export polished campaign blueprints for stakeholder presentations

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database & Auth**: Supabase
- **AI**: Anthropic Claude API
- **Trends Data**: SerpAPI (Google Trends)
- **Charts**: Nivo
- **PDF Generation**: React-PDF

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Supabase account (for database and authentication)
- Anthropic API key (for AI features)
- SerpAPI key (for Google Trends data)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# SerpAPI (Google Trends)
NEXT_SERPAPI_KEY=your_serpapi_key
```

### Getting API Keys

1. **Supabase**: Create a project at [supabase.com](https://supabase.com) and copy the URL and anon key from Project Settings > API
2. **Anthropic**: Get an API key from [console.anthropic.com](https://console.anthropic.com)
3. **SerpAPI**: Sign up at [serpapi.com](https://serpapi.com) and get your API key

## Database Setup

Create the following table in your Supabase project:

```sql
create table campaigns (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  prompt text not null,
  strategist jsonb not null,
  budget integer not null,
  keywords text[] default '{}',
  location text,
  signals jsonb not null,
  signal_source text default 'ai',
  funnel_budget jsonb,
  audiences jsonb default '[]',
  ad_formats jsonb default '[]',
  strategy_rationale jsonb default '[]',
  chat_messages jsonb default '[]',
  initial_message text,
  status text default 'draft',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table campaigns enable row level security;

-- Policy: Users can only access their own campaigns
create policy "Users can view own campaigns" on campaigns
  for select using (auth.uid() = user_id);

create policy "Users can insert own campaigns" on campaigns
  for insert with check (auth.uid() = user_id);

create policy "Users can update own campaigns" on campaigns
  for update using (auth.uid() = user_id);

create policy "Users can delete own campaigns" on campaigns
  for delete using (auth.uid() = user_id);
```

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd omnimind
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
omnimind/
├── app/
│   ├── (auth)/           # Authentication pages (login, register)
│   ├── actions/          # Server actions (AI, database, trends)
│   ├── auth/             # Auth callback route
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── HomeClient.tsx    # Main client component
├── components/
│   ├── ui/               # Reusable UI components
│   ├── CampaignBuilder.tsx   # Campaign strategy builder
│   ├── CampaignsList.tsx     # Campaigns list view
│   ├── HeroLanding.tsx       # Landing page for guests
│   ├── Sidebar.tsx           # Navigation sidebar
│   ├── Settings.tsx          # User settings
│   └── TrendsExplorer.tsx    # Google Trends explorer
├── lib/
│   ├── supabase/         # Supabase client utilities
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Utility functions
├── public/
│   └── assets/           # Static assets (images, icons)
└── middleware.ts         # Auth middleware
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Usage

### Creating a Campaign

1. Sign in or create an account
2. Select an AI strategist persona
3. Describe your campaign goal (e.g., "Valentine's Day promotion for a flower shop in NYC")
4. Set your budget using the slider
5. Click "Generate Strategy" to create your campaign blueprint
6. Refine the strategy by chatting with your AI strategist
7. Export to PDF when ready

### Using Trends Explorer

1. Navigate to the Trends tab
2. Search for keywords or select preset topics
3. View trend data over time
4. Click any data point on the chart to create a campaign directly from that trend

## License

MIT
