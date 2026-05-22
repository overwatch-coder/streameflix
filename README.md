# StreameFlix

StreameFlix is a Next.js streaming discovery app for browsing movies and TV shows, watching available streams, saving personal lists, tracking watch progress, and participating in social features such as discussions, reviews, replies, and reactions.

The app uses TMDB for movie and TV metadata, custom application APIs for user data, PostgreSQL for persistence, Prisma as the ORM, httpOnly cookie authentication, and Cloudinary for profile image uploads.

## Tech Stack

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Custom email/password auth with signed httpOnly cookies
- Cloudinary for image uploads
- TMDB, RapidAPI, and OMDB for media data
- Vitest for focused unit tests

## Requirements

- Node.js 20 or newer
- npm
- Local PostgreSQL running on `localhost:5432`
- Cloudinary account for avatar uploads
- TMDB API key for real movie/TV metadata
- Optional: RapidAPI and OMDB keys for extra streaming/source metadata

## Local Setup

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

On Windows PowerShell, if `cp` is not available:

```powershell
Copy-Item .env.example .env.local
```

Prisma CLI commands read `.env` by default. This repo keeps `.env` ignored by git, so either create `.env` with the same `DATABASE_URL` value or set `DATABASE_URL` in your shell before running Prisma commands.

Update `.env.local`:

```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key_here
NEXT_PUBLIC_OMDB_API_KEY=your_omdb_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL="postgresql://postgres:postgres@localhost:5432/streameflix?schema=public"
AUTH_SECRET="replace-this-with-a-long-random-local-secret"

CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
```

Generate the Prisma client:

```bash
npx prisma generate
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

This project uses Prisma with PostgreSQL. The schema lives in:

```text
prisma/schema.prisma
```

For local development, make sure PostgreSQL is running and that the `streameflix` database exists before using auth, profiles, lists, reviews, or discussions.

Useful commands:

```bash
npx prisma generate
npx prisma migrate dev
```

`npx prisma migrate dev` creates and applies local PostgreSQL migrations from the Prisma schema.

## Authentication

Authentication is handled by application-owned API routes rather than a third-party auth backend.

Main routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Sessions are stored in a signed httpOnly cookie named `streameflix_session`.

## Uploads

Avatar uploads go through:

```text
POST /api/profile/avatar
```

The server uploads the image to Cloudinary and stores the resulting URL on the user profile.

## Main API Areas

- `/api/profile`
- `/api/profiles/search`
- `/api/profiles/[id]`
- `/api/library/favorites`
- `/api/library/watchlist`
- `/api/library/history`
- `/api/discussions`
- `/api/reviews`
- `/api/reactions`

Client components should call these API routes instead of accessing the database directly.

## Verification

Run focused tests:

```bash
npm test
```

Run TypeScript checks:

```bash
npx tsc --noEmit
```

Run a production build:

```bash
npm run build
```

If your shell has `NODE_ENV` set to `development`, run the production build with:

```powershell
$env:NODE_ENV='production'; npm run build
```

## Deployment Notes

For production, set these environment variables in your hosting provider:

- `DATABASE_URL` with the production PostgreSQL connection string
- `AUTH_SECRET` with a strong random secret
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_TMDB_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- Optional: `NEXT_PUBLIC_RAPIDAPI_KEY`
- Optional: `NEXT_PUBLIC_OMDB_API_KEY`

Do not commit real secrets to the repository.
