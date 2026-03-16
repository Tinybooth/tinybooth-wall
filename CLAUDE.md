# Crispy Waffle - Event Photo Wall

A real-time event photo sharing web app. Guests at an event (wedding, party, etc.) scan a QR code, take or upload photos from their phone, and see them appear live on a TV display as a dynamic photo collage.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Package Manager**: Yarn (use `yarn` instead of `npm`)
- **Styling**: Tailwind CSS
- **Database**: SQLite via Prisma (local dev), easily swappable to PostgreSQL for production
- **File Storage**: Local filesystem in development, Cloudflare R2 or Vercel Blob for production
- **Real-time**: Server-Sent Events (SSE) or polling for TV display updates
- **QR Code**: `qrcode.react` for generating QR codes on the TV display

## Project Structure

```
app/
  layout.tsx                    # Root layout with providers
  page.tsx                      # Landing / create event page
  [slug]/
    page.tsx                    # TV display - photo collage (no scroll, fills viewport)
    post/
      page.tsx                  # Mobile guest flow - camera/upload/preview/submit
  api/
    events/
      route.ts                  # Create event, get event by slug
    posts/
      route.ts                  # Create post (upload photos), get posts for event
    posts/stream/
      route.ts                  # SSE endpoint for real-time post updates
src/
  components/
    ui/                         # Base UI components (Button, Input, etc.)
    tv/                         # TV display components (PhotoGrid, QROverlay, PhotoTile)
    post/                       # Mobile posting flow components (Camera, Preview, CaptionInput)
  lib/
    db.ts                       # Prisma client singleton
    storage.ts                  # File storage abstraction
    utils.ts                    # Utility functions (slug generation, etc.)
  types/
    index.ts                    # Shared TypeScript types
prisma/
  schema.prisma                 # Database schema
public/
  uploads/                      # Local file storage for development
```

## Routes

| Route | Purpose | Device |
|-------|---------|--------|
| `/` | Create event page | Desktop/Mobile |
| `/[slug]` | TV display - live photo collage with QR code | TV/Desktop |
| `/[slug]/post` | Guest upload flow - camera, preview, submit | Mobile |

## Data Model

```
Event
  - id: String (cuid)
  - name: String
  - slug: String (unique, derived from name)
  - dateCreated: DateTime

Post
  - id: String (cuid)
  - eventId: String (FK → Event)
  - caption: String? (optional, short)
  - dateCreated: DateTime

Photo
  - id: String (cuid)
  - postId: String (FK → Post)
  - url: String (path to stored image)
  - order: Int (for multi-photo post ordering)
  - dateCreated: DateTime
```

## Key Behaviors

### TV Display (`/[slug]`)
- Fills entire browser viewport — no scrolling in any direction
- Dark background
- Photo collage/grid layout, Pinterest-style but viewport-constrained
- Multi-photo posts rotate images in their tile (flipagram-style)
- QR code in corner with "Post a pic!" label — small but noticeable
- Only shows posts from the last 2 hours, unless total posts < 100, then shows older ones
- Polls or uses SSE for real-time updates — new posts animate in

### Mobile Post Flow (`/[slug]/post`)
- First visit: welcome screen explaining the event, confirm button
- After confirm: request camera permissions, show camera viewfinder
- Return visits: skip welcome, go straight to camera (unless permissions were denied)
- Camera screen has option to select from camera roll (multiple select)
- After capture/select: preview screen with optional short caption input
- Submit uploads photos and returns to camera for another shot
- Caption applies to the entire post (group of photos), not individual photos

## Code Style Guidelines

### TypeScript
- **Strict mode**: Enabled — no implicit any, strict null checks
- **Semicolons**: Required at end of statements
- **Return types**: All functions must have explicit return types
- **Async/Await**: Preferred over `.then()` chains

### Naming Conventions
- `camelCase` for variables and functions
- `PascalCase` for types, interfaces, classes, and components
- `SCREAMING_SNAKE_CASE` for constants and enum values
- Files: `PascalCase` for components (`PhotoTile.tsx`), `camelCase` for utilities (`formatDate.ts`)

### Component Structure

```typescript
// External imports first, then internal imports, then types
import { useState } from 'react';
import { PhotoTile } from '@/components/tv/PhotoTile';
import type { Post } from '@/types';

interface PhotoGridProps {
  posts: Post[];
  onNewPost: (post: Post) => void;
}

export function PhotoGrid({ posts, onNewPost }: PhotoGridProps): React.ReactElement {
  // Hooks first
  // Event handlers
  // Render helpers
  // Return JSX
}
```

### Component Organization
- One component per file
- Extract components over 30 lines into their own file
- Screen files should be thin — compose extracted components
- Styled elements at the bottom of the file if needed

### DRY (Don't Repeat Yourself)
- Check `src/components/` before creating a new component
- Extract shared logic into hooks (`src/hooks/`) or utilities (`src/lib/`)
- Never duplicate code — if you're copying, refactor

### Import Organization

```typescript
// 1. React / Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. External libraries
import QRCode from 'qrcode.react';

// 3. Internal absolute imports
import { PhotoTile } from '@/components/tv/PhotoTile';
import { db } from '@/lib/db';

// 4. Relative imports
import { formatCaption } from './utils';

// 5. Types (with type keyword)
import type { Post } from '@/types';
```

### JSDoc Comments

All exported functions, components, and non-trivial helpers must include JSDoc:

```typescript
/**
 * Displays a single photo tile in the TV collage grid.
 * @param post - The post data including photos and caption
 * @param size - Tile size variant for grid layout
 */
```

## Git Conventions

### Commit Messages (Conventional Commits)

```
feat: add camera capture flow
fix: resolve photo upload timeout
chore: update dependencies
refactor: extract photo grid into reusable component
```

### Pre-commit Checklist

1. Run type check: `yarn typecheck`
2. Run linter: `yarn lint`
3. Ensure app builds: `yarn build`

## Commands

```bash
# Development
yarn dev                # Start Next.js dev server
yarn build              # Production build
yarn start              # Start production server
yarn typecheck          # Check types without building
yarn lint               # Run ESLint

# Database
yarn db:push            # Push schema changes to database
yarn db:generate        # Regenerate Prisma client
yarn db:studio          # Open Prisma Studio GUI
```

## Storage Strategy

For MVP/this weekend's event:
- Store photos locally in `public/uploads/` directory
- Simple and fast, no external service dependencies

For production:
- Abstract storage behind `src/lib/storage.ts` interface
- Swap to Cloudflare R2, Vercel Blob, or S3-compatible storage
- The storage abstraction makes this a one-file change

## Real-time Updates

The TV display needs to show new posts as they come in:
- **SSE (Server-Sent Events)**: Preferred — lightweight, one-way server-to-client stream
- Fallback: polling every 3-5 seconds
- New posts should animate into the grid smoothly

## Important Notes

- **Mobile-first for post flow**: The `/[slug]/post` page is designed for phones — optimize for mobile viewport
- **TV-optimized for display**: The `/[slug]` page is designed for large screens — fill the viewport, no scroll
- **No auth required**: Guests don't need accounts — frictionless photo sharing
- **Keep it simple**: MVP for this weekend. Build for one event, architect for many.
- **Dark mode**: The TV display uses a dark theme for ambient/event aesthetic
- **Short captions only**: Enforce a character limit (~100 chars) on captions
