# BV Floriande Trainers Platform

© 2025 qdela. All rights reserved.

Een webapplicatie voor trainers van BV Floriande om oefeningen, aanwezigheid en groepsevaluaties bij te houden.

**Ontwikkeld door qdela** - Dit project is eigendom van qdela en mag niet gekopieerd, aangepast of gedistribueerd worden zonder expliciete toestemming.

## Features

- 👩‍🏫 **Trainerbeheer**: Beheer trainersaccounts met verschillende rollen (admin, trainer)
- 👥 **Groepsbeheer**: Maak en beheer trainingsgroepen met leden
- 🏋️ **Oefeningen bijhouden**: Registreer welke oefeningen zijn uitgevoerd en beoordeel de moeilijkheidsgraad
- ✓ **Aanwezigheid**: Houd aanwezigheid bij van alle leden per trainingsessie
- 📅 **Agenda & Sessions**: Uitgebreid beheer van trainingsessies met tijd, locatie en toegewezen trainers
- 📊 **Voortgang**: Volg de voortgang van groepen en identificeer aandachtspunten
- 🔐 **Admin Dashboard**: Beheer gebruikers en systeeminstellingen (alleen voor admins)
- 👤 **Gebruikersprofielen**: Persoonlijke profielgegevens beheren

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, TypeScript
- **Backend**: Supabase (PostgreSQL database, Auth)
- **UI Components**: Tailwind CSS, Radix UI primitives
- **Form Validation**: Zod schema validation
- **Date Handling**: date-fns library
- **Hosting**: Vercel

## Lokaal Ontwikkelen

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Geïmplementeerde Functies

- **Database Schema**: Alle benodigde tabellen voor gebruikers, groepen, leden, oefeningen, trainingen en beoordelingen.
- **Authenticatie**: Inloggen, uitloggen, wachtwoord herstellen met Supabase Auth.
- **Formuliervalidatie**: Zod validatieschema's voor alle formulieren.
- **Agenda-interface**: Kalenderweergave voor trainingen en sessies.
- **Beschermde Routes**: Alleen geauthenticeerde gebruikers kunnen het dashboard bekijken.
- **Gebruikersprofielen**: Trainers kunnen hun profielgegevens bijwerken.

## Nog te implementeren

- **AI-aanbevelingen**: Implementatie van algoritme voor aanbevolen oefeningen.
- **Mobiel-responsief**: Optimalisatie voor mobiele apparaten.
- **Statistieken**: Geavanceerde grafieken en analyses.
- **Notificaties**: E-mailnotificaties voor trainers en beheerders.

## Learn More

## Database Structuur

De applicatie gebruikt de volgende tabellen:

- `users`: Trainers en admins
- `groups`: Trainingsgroepen  
- `members`: Leden/atleten
- `group_members`: Koppeltabel tussen groepen en leden
- `group_trainers`: Koppeltabel tussen groepen en trainers
- `locations`: Trainingslocaties
- `exercises`: Beschikbare oefeningen
- `sessions`: Trainingsessies
- `session_trainers`: Koppeltabel tussen sessies en trainers
- `attendance`: Aanwezigheidsregistratie
- `completed_exercises`: Uitgevoerde oefeningen met moeilijkheidsgraad
- `group_evaluations`: Evaluaties van groepen (✅ COMPLETE - includes evaluation_date, strengths, areas_for_improvement, recommended_exercises, next_goals, notes, evaluator_id)

**Status**: ✅ Alle tabellen zijn aanwezig en functioneel na het uitvoeren van de laatste migraties.

## Applicatie Structuur

- `/src/app/dashboard/`: Dashboard en hoofdfunctionaliteit
  - `/trainer-dashboard/`: Trainer dashboard met overzicht
  - `/groups/`: Groepenbeheer
  - `/exercises/`: Oefeningen bijhouden
  - `/attendance/`: Aanwezigheid registreren
  - `/calendar/`: Agenda en sessies

- `/src/lib/`: Bibliotheek code
  - `database-types.ts`: Type definities voor de database
  - `bvf-services.ts`: Service functies voor data manipulatie
  - `bvf-queries.ts`: Query functies voor data ophalen
  - `supabaseClient.ts`: Supabase client configuratie

## Geplande Functionaliteiten

- **AI-aanbevelingen**: Suggesties voor oefeningen op basis van moeilijkheidsgraad
- **Voortgangsrapportages**: Automatisch gegenereerde rapporten over groepsvoortgang
- **Ouder/leerling portaal**: Toegang voor ouders en leerlingen om voortgang te bekijken

## Security Best Practices

1. Use `.env.local` for all environment variables. Do not use `.env` or commit secrets to version control.
2. Store your Supabase credentials as:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Enable Row Level Security (RLS) on all Supabase tables and restrict access to user-owned data only.
4. Restrict CORS in Supabase to your production and development domains only.
5. Always use HTTPS in production.
6. Keep all dependencies up to date and run `npm audit` regularly.
7. Validate and sanitize all user input in forms before sending to Supabase.
8. Use Supabase Auth for all access and require email verification.
9. Use error boundaries in React to prevent leaking sensitive errors.

Example RLS Policy for a table with a user_id column:
```sql
CREATE POLICY "Users can access their own data only" ON your_table
FOR ALL USING (user_id = auth.uid());
```

## Troubleshooting Login Issues

If you're experiencing issues with logging in, follow these steps:

1. **Run the Login Diagnostic Tool**:
   - Navigate to `/login-diagnostic` in your application
   - Enter the credentials you're trying to use
   - Click "Run Diagnostic" to see detailed results

2. **Fix Common Issues**:
   - If a user exists in auth.users but not in public.users, run the fix script
   - If RLS policies are misconfigured, update them using the fix script
   - If the API key format is invalid, check your .env.local file

3. **Apply the Fix Script**:
   - Open the Supabase SQL Editor
   - Run the SQL file at `supabase/migrations/20250525_fix_login_issues.sql`
   - This will fix common issues with user creation and RLS policies

4. **Email Links Redirecting to Homepage**:
   - If links in confirmation or password reset emails redirect to the homepage:
   - Go to Supabase Dashboard > Authentication > URL Configuration
   - Ensure the Site URL is set correctly (e.g., `https://your-domain.com` or `http://localhost:3000`)
   - Add proper Redirect URLs: `/login` and `/reset-password` with the full domain
   - Request a new confirmation or reset email after updating these settings

5. **Test with a Known Working User**:
   - Email: `test@example.com`
   - Password: `password123`
   - These credentials are created by the fix script

6. **Clear Cache and Cookies**:
   - Sometimes login issues can be caused by cached credentials
   - Try clearing your browser cache or using incognito mode

For more detailed troubleshooting, see [SUPABASE-TROUBLESHOOTING.md](./SUPABASE-TROUBLESHOOTING.md).
