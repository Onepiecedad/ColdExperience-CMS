# Cold Experience CMS Dashboard

A content management system for the Cold Experience website, built as a reusable module for the Skyland AI System.

## Features

- 🔐 **Magic Link Authentication** - Secure passwordless login via Supabase Auth
- 📝 **Multi-language Content Editor** - Edit text in EN, SV, DE, PL
- 📦 **Package Manager** - Update pricing and package details
- 🖼️ **Media Library** - Upload and manage images
- ⚙️ **Settings Panel** - Configure global site settings

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Setup

1. **Clone and install dependencies:**

   ```bash
   npm install
   ```

2. **Configure Supabase:**
   - Copy `.env.example` to `.env`
   - Add your Supabase project URL and anon key

3. **Run the database schema:**
   - Open your Supabase SQL Editor
   - Run the contents of `../ColdExperience/supabase/schema.sql`
   - Run the contents of `../ColdExperience/supabase/seed.sql`

4. **Create storage bucket:**
   - In Supabase Storage, create a bucket named `cms-media`
   - Set it to public

5. **Start the development server:**

   ```bash
   npm run dev
   ```

6. **Open in browser:**
   - Visit `http://localhost:3001`
   - Enter your email to receive a magic link

### Database Migrations

#### Draft System (Ticket 5)

The CMS uses a separate `cms_drafts` table for draft content. To set it up:

1. Open your [Supabase SQL Editor](https://supabase.com/dashboard)
2. Copy the contents of `scripts/create-cms-drafts.sql`
3. Paste and click **Run**
4. Verify the table was created:

   ```sql
   SELECT * FROM public.cms_drafts LIMIT 5;
   ```

> **Note:** Drafts are stored in `cms_drafts`, never in `cms_content`. This allows safe editing without affecting the live website until you explicitly publish.

## Schema Management

The CMS uses a whitelist (`src/content/schema.ts`) to control which keys can be published. Use the "Add Next Batch" feature to expand the schema:

1. **Generate:** Go to **Advanced → Schema Coverage → Used tab**
   - Expand "Add Next Batch"
   - Set optional prefix (e.g. `hero.`) and batch size
   - Click **Generate Batch** — downloads `schema.pending.json`

2. **Apply:** Run the command (script auto-finds file in `~/Downloads/`):

   ```bash
   npm run schema:apply-pending
   ```

This adds the entries to an AUTO-GENERATED block in `schema.ts`.

## Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Configure custom domain: `dashboard.coldexperience.se`

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Icons:** Lucide React

## Project Structure

```
src/
├── content/
│   └── contentMap.ts       # Website structure & page definitions
├── screens/                # New mobile-first navigation flow (iOS Settings-style)
│   ├── PagesScreen.tsx     # List of all website pages
│   ├── SectionsScreen.tsx  # Sections for selected page
│   └── EditorScreen.tsx    # Content editor with context bar
├── components/
│   ├── AuthScreen.tsx      # Login with magic link
│   ├── ContentEditor.tsx   # Multi-language text editor
│   ├── PackageEditor.tsx   # Package pricing & details
│   ├── MediaLibrary.tsx    # Image upload & management
│   └── SettingsPanel.tsx   # Global settings
├── services/
│   └── supabase.ts         # Database client & functions
├── App.tsx                 # Main app with navigation
├── types.ts                # TypeScript definitions
└── main.tsx                # Entry point
```

> **Note:** New mobile-first flow lives in `src/screens/` - uses React Router for drill-down navigation.

## License

Private - Cold Experience / Skyland AI System
