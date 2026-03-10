# HomeScope — Project Guide

## Overview

HomeScope is a London house-hunting intelligence tool. Users search by postcode and get a dashboard with property prices, schools, crime, transport, and demographics.

**Tech stack:** Next.js 14 (App Router) + SQLite (better-sqlite3) + Leaflet maps + Tailwind CSS + SWR

## Environment Constraints

- This web environment has **limited outbound network access** — external APIs (government sites, postcodes.io) will timeout
- Always test connectivity before building pipelines that depend on external downloads
- Data import scripts that need external APIs must be run **locally on the user's machine**
- When scripts can't run here, provide complete local instructions in a single message

## Data Pipeline

- **Package manager:** pnpm
- **Scripts run with:** `npx tsx scripts/XX-name.ts`
- **DB file:** `homescope.db` (SQLite, ~13 MB)
- **Schema:** `db/schema.sql`
- **Scripts must be run in order** (numbered 00-10):
  - 00: Init DB → 01-02: Land Registry → 03-04: EPC → 05-06: Schools → 07-08: Demographics → 09: Enrich postcodes → 10: Compute price/sqm
- Schools data (`data/schools/*.csv`) requires manual download from GIAS/Ofsted — not committed to git

## Code Conventions

- **API routes:** `src/app/api/`
- **Query logic:** `src/lib/queries/` (schools.ts, prices.ts, demographics.ts)
- **External API wrappers:** `src/lib/` (police-api.ts, tfl-api.ts, postcodes.ts)
- **SWR hooks:** `src/hooks/`
- **Reusable components:** `src/components/`
- Area endpoint (`/api/area/[postcode]`) calls query functions directly — not HTTP self-calls
