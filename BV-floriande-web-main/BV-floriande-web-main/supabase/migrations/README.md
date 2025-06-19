# Supabase Schema Migration Fixes

## Group Evaluations Table

**Table**: `group_evaluations`
**Description**: Evaluations of training groups with strengths, areas for improvement, and recommendations

### Columns:
   - `id` (UUID, primary key)
   - `group_id` (UUID, foreign key to groups table)
   - `evaluation_date` (DATE, default current date)
   - `strengths` (TEXT, positive aspects observed)
   - `areas_for_improvement` (TEXT, areas needing work)
   - `recommended_exercises` (TEXT[], array of exercise recommendations)
   - `next_goals` (TEXT, goals for upcoming sessions)
   - `notes` (TEXT, additional evaluator notes)
   - `evaluator_id` (UUID, foreign key to users table)
   - `created_at` (TIMESTAMP WITH TIME ZONE)
   - `updated_at` (TIMESTAMP WITH TIME ZONE)
   - **Status**: ✅ Created with proper RLS policies and indexes

### Migration Status:
- ✅ Table structure created
- ✅ Foreign key constraints added  
- ✅ RLS policies implemented
- ✅ Indexes for performance optimization
- ✅ Updated_at trigger configured
- ✅ Proper permissions granted

## Probleem 1: "ERROR: 42501: must be owner of relation users"
Dit probleem is opgelost in het bestand `20250520_working_bv_floriande_schema.sql` door:
- Alle `ALTER TABLE ... OWNER TO` statements te verwijderen
- Geen `SET ROLE` commando's te gebruiken
- Vereenvoudigde maar volledige tabeldefinities te gebruiken

## Probleem 2: "ERROR: 23503: insert or update on table 'users' violates foreign key constraint 'users_id_fkey'"
Dit probleem is opgelost in het bestand `20250520_fixed_sample_data.sql` door:
1. Eerst auth.users aan te maken (nodig voor de foreign key constraint)
2. Een functie `create_auth_user` toe te voegen die veilig gebruikers maakt in auth.users
3. Daarna pas entries toe te voegen aan de public.users tabel

## Probleem 3: "ERROR: 42703: column "description" of relation "public.locations" does not exist"
Dit probleem is opgelost in het bestand `20250603_cleanup_and_update_locations.sql` door:
1. Het toevoegen van de ontbrekende `description` kolom aan de locations tabel
2. Het verwijderen van alle sample data - locaties worden nu toegevoegd via de webinterface
3. Het correct instellen van alle benodigde constraints en triggers

## Probleem 4: "ERROR: 0A000: cannot use subquery in check constraint"
Dit probleem is opgelost door:
1. Het verwijderen van de CHECK constraint die subqueries gebruikt in de group_trainers tabel
2. Het verplaatsen van de validatie naar de application layer in bvf-services.ts
3. PostgreSQL staat geen subqueries toe in CHECK constraints omdat ze immutable moeten zijn

## Database Schema Issues Fixed:
1. **Missing group_trainers table**: Added proper creation of the `group_trainers` table in the main schema
2. **Table reference errors**: Fixed TRUNCATE statements to check for table existence before deletion
3. **Foreign key constraints**: Ensured proper relationships between trainers and groups
4. **CHECK constraint limitation**: Removed subquery-based CHECK constraints and moved validation to application layer

## Overige fixes in het sample data script:
1. Kolommen die niet in het schema voorkomen verwijderd:
   - `email` uit members tabel
   - `difficulty_level` uit exercises tabel
   - `is_primary` uit session_trainers tabel
   - `group_id`, `difficulty_rating`, `comments` uit completed_exercises tabel
   - vervangen door `sets`, `reps`, `duration_minutes`, `notes`

2. Kolomnamen gecorrigeerd:
   - `note` → `notes` in attendance tabel ✅
   - `evaluated_by` → `evaluator_id` in group_evaluations tabel ✅
   - `weaknesses` → `areas_for_improvement` in group_evaluations tabel ✅
   - `focus_points` → `notes` in group_evaluations tabel ✅
   
## Completed Migrations

- 20250608_add_group_evaluations_table.sql: Added missing group_evaluations table with correct column names and structure

## Database Schema Status

1. **group_evaluations table structure** (FIXED):
   - `id` (UUID, primary key)
   - `group_id` (UUID, foreign key to groups)
   - `evaluation_date` (DATE, default current_date)
   - `strengths` (TEXT, nullable)
   - `areas_for_improvement` (TEXT, nullable)
   - `recommended_exercises` (TEXT[], array of exercise recommendations)
   - `next_goals` (TEXT, nullable)
   - `notes` (TEXT, nullable)
   - `evaluator_id` (UUID, foreign key to users)
   - `created_at` and `updated_at` (timestamps)
   - **Status**: ✅ Created with proper RLS policies and indexes

2. **group_trainers table structure** (EXISTING):
   - `id` (UUID, primary key)
   - `group_id` (UUID, foreign key to groups)
   - `trainer_id` (UUID, foreign key to users)
   - `assigned_at` (timestamp)
   - `assigned_by` (UUID, foreign key to users)
   - `created_at` and `updated_at` (timestamps)
   - **Note**: Role validation is handled in the application layer, not database constraints

## Migration Files Status

### ✅ Active/Working Files:
- `20250608_add_group_evaluations_table.sql` - Creates missing group_evaluations table
- `20250607_add_recurrence_fields.sql` - Adds session recurrence and group_trainers table
- `20250603_cleanup_and_update_locations.sql` - Location table updates
- `20250601_clean_database_no_sample_data.sql` - Clean database setup
- `20250531_fix_infinite_recursion_rls_v2.sql` - RLS policy fixes
- `20250526_complete_auth_fix.sql` - Authentication setup with demo accounts
- `20250525_fix_login_issues.sql` - Login diagnostic fixes
- `20250520_working_bv_floriande_schema.sql` - Core schema definition

### 📁 Backup Files:
- Files in `/backup/` folder - Previous versions and sample data (not executed)

## Current Database State

All core tables are now present and functional:
- ✅ users, groups, members, group_members
- ✅ locations, exercises, sessions, session_trainers  
- ✅ attendance, completed_exercises
- ✅ group_evaluations (FIXED)
- ✅ group_trainers
- ✅ All RLS policies configured
- ✅ Proper indexes and constraints

## Next Steps

The database schema is now complete. The error "relation public.group_evaluations does not exist" should be resolved after running the 20250608_add_group_evaluations_table.sql migration.

## Instructies voor gebruik van de fixes:
1. Gebruik het schema uit `20250520_working_bv_floriande_schema.sql`
2. Pas de locatie fixes toe met `20250603_cleanup_and_update_locations.sql`
3. Voeg data toe via de webinterface (geen sample data meer in de migrations)
4. Valideer het resultaat met `20250520_schema_validator.sql`

## SQL Editor Instructies:
Om deze scripts uit te voeren in Supabase:
1. Ga naar je Supabase Dashboard
2. Navigeer naar de SQL Editor
3. Kopieer en plak de inhoud van elk bestand
4. Klik op "Run" om uit te voeren

## Productie-klare setup:
De database is nu volledig schoon zonder testdata. Alle data wordt toegevoegd via de webinterface:
- Locaties via het admin panel
- Groepen via de groepenbeheer pagina
- Leden via de ledenbeheer functionaliteit
- Trainingen via de agenda/planning interface

## Toekomstige aanpassingen:
Als je een Foreign Key constraint error krijgt tussen twee tabellen, zorg dat je eerst rijen invoegt in de tabel waarnaar verwezen wordt (de "parent" tabel) voordat je rijen invoegt in de verwijzende tabel (de "child" tabel).

Volgorde van inserts voor optimale werking:
1. auth.users (via registratie in de webinterface)
2. public.users (automatisch via trigger)
3. locations (via admin interface)
4. groups (via groepenbeheer)
5. members (via ledenbeheer)
6. group_members (via groepenbeheer)
7. exercises (via oefeningen interface)
8. sessions (via agenda/planning)
9. session_trainers (via session management)
10. completed_exercises (via training logging)
11. attendance (via aanwezigheidsregistratie)
12. group_evaluations (via evaluatie interface)
