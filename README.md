# TMDB App - Movie & TV Show Explorer

A modern web application built with Nuxt 3 and Vue 3 that allows users to browse trending movies and TV shows, view details, and bookmark their favorites. The app uses The Movie Database (TMDB) API for content and Supabase for authentication and bookmark storage.

## Features

- Browse trending movies and TV shows
- View detailed information about media items
- User authentication with Supabase
- Bookmark favorite media items
- Responsive design for all devices

## Prerequisites

- Node.js (v16 or later)
- npm, yarn, or pnpm
- Supabase account
- TMDB API key

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/KateKharchenko/tmdb-app.git
cd tmdb-app
```

### 2. Install dependencies

```bash
# npm
npm install

# yarn
yarn install

# pnpm
pnpm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory based on the `.env.example` file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your API keys:

```
# TMDB API Configuration
NUXT_PUBLIC_TMDB_API_TOKEN=your_tmdb_api_key_here
NUXT_PUBLIC_TMDB_API_BASE_URL=https://api.themoviedb.org/3

# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here
```

### 4. Set up Supabase

1. Create a new project in [Supabase](https://supabase.com/)
2. Set up authentication (Email/Password provider)
3. Create a `bookmarks` table with the following schema:

```sql
create table bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  media_id text not null,
  media_type text not null,
  title text not null,
  image text,
  rating numeric,
  created_at timestamp with time zone default now() not null,
  unique(user_id, media_id, media_type)
);

-- Set up Row Level Security
alter table bookmarks enable row level security;

-- Create policies
create policy "Users can view their own bookmarks" on bookmarks
  for select using (auth.uid() = user_id);

create policy "Users can insert their own bookmarks" on bookmarks
  for insert with check (auth.uid() = user_id);

create policy "Users can delete their own bookmarks" on bookmarks
  for delete using (auth.uid() = user_id);
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# yarn
yarn dev

# pnpm
pnpm dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
