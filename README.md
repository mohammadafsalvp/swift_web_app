# IDC Swift — Marine & Offshore Engine Repair Document Portal

A document management dashboard for marine and offshore engineering teams — vessel repair logs, engine diagnostics, blueprints, and safety certifications in one place.

## Tech Stack

- **[Next.js 16](https://nextjs.org)** — App Router, TypeScript
- **[Tailwind CSS v4](https://tailwindcss.com)** — CSS-first theme config (`app/globals.css`)
- **[Google Stitch](https://stitch.withgoogle.com)** — UI/UX design source, connected via MCP

## UI/UX Design

The interface is built from a UI/UX design generated in Google Stitch, project **"IDC Swift Document Portal"**, design system **"Marine Industrial Modern"**:

- **Typography:** Plus Jakarta Sans (headings/body), JetBrains Mono (technical codes — vessel IMO numbers, part serials)
- **Palette:** near-black primary (`#0D1117`), deep teal secondary (`#00838F`), sea-glass tint accents (`#E0F2F1`), cool-gray canvas (`#F0F3F5`) with white floating cards
- **Layout:** persistent left sidebar navigation, modular white cards on a tinted canvas, soft diffused shadows, pill-shaped status badges
- All design tokens (colors, spacing, radius, shadows, type scale) are wired into Tailwind's `@theme` block in [`app/globals.css`](app/globals.css) — no separate `tailwind.config.js` needed (Tailwind v4 CSS-first config).

## Features

- **Dashboard** — document processing/verification rate chart, vault & processed documents summary, categorized document repository table
- **Live search** — filters the documents table by ID, engineer, vessel, engine, or date
- **Upload modal** — asset sector selector, engine/vessel fields, drag-and-drop file zone
- **Currency conversion** — all monetary figures are sourced in USD and converted to **AED** at render time (rate: `1 USD = 3.6725 AED`), via [`app/components/dashboard/currency.ts`](app/components/dashboard/currency.ts)

## Project Structure

```
app/
  components/dashboard/
    Dashboard.tsx        # top-level layout + state
    Sidebar.tsx           # logo + navigation
    TopBar.tsx             # search bar + actions
    MetricsCharts.tsx     # processing-rate + vault charts
    DocumentsTable.tsx    # filterable document repository
    UploadModal.tsx       # document upload form
    data.ts                # mock data
    currency.ts            # USD → AED conversion
    icons.tsx              # inline SVG icon set
  globals.css              # Tailwind v4 theme (design tokens)
  layout.tsx                # fonts + root layout
  page.tsx                  # renders <Dashboard />
```

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
npm start
```
