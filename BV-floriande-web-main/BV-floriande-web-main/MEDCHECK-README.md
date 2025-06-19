# MedCheck+ 🏥

Een moderne webapplicatie voor huisartsenpraktijk management, gebouwd met Next.js, TypeScript en Supabase.

## 📋 Overzicht

MedCheck+ is een volledig functioneel medisch praktijk portaal dat patiënten in staat stelt om online afspraken te maken en artsen/assistentes helpt bij het beheren van hun praktijk. Dit project demonstreert **Werkproces 2 (Automatiseert processen)** en **Werkproces 3 (Beheert databases)**.

### 🎯 Kernfunctionaliteiten

#### Voor Patiënten (Publiek toegankelijk)
- ✅ Online afspraken maken
- ✅ Automatische bevestigingsemails
- ✅ Verschillende soorten consulten
- ✅ Urgentie levels
- ✅ Praktijkinformatie bekijken

#### Voor Praktijkpersoneel (Beveiligd dashboard)
- ✅ Afspraakverzoeken beheren
- ✅ Patiëntendossiers
- ✅ Agenda overzicht
- ✅ Dashboard met statistieken
- ✅ Rollen-gebaseerde toegang (arts/assistent/admin)

## 🚀 Werkproces Demonstratie

### Werkproces 2: Automatiseert processen
- **Formulierverwerking**: Automatische validatie en opslag van afspraakverzoeken
- **E-mail notificaties**: Klaar voor automatische emails via SendGrid
- **Workflow automation**: Status tracking van aanvragen (pending → approved → scheduled)
- **Real-time updates**: Live dashboard updates voor personeel

### Werkproces 3: Beheert databases
- **Database design**: Volledig genormaliseerde medische database schema
- **CRUD operaties**: Complete Create, Read, Update, Delete functionaliteit
- **Relationele queries**: Complexe joins tussen patiënten, afspraken en artsen
- **Data integriteit**: Foreign keys, constraints en validation
- **Row Level Security**: Beveiligde data toegang per rol

## 🛠️ Technische Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, Server-side rendering
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS, shadcn/ui
- **Forms**: React Hook Form met validatie
- **Date handling**: date-fns

## 📁 Project Structuur

```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Homepage (patiëntportaal)
│   ├── appointment-booking/     # Afspraak maken pagina
│   ├── dashboard/               # Beveiligde dashboard area
│   └── api/                     # API routes
├── components/                  # Herbruikbare UI componenten
├── lib/                        # Core business logic
│   ├── medcheck-types.ts       # TypeScript types
│   ├── medcheck-queries.ts     # Database queries
│   └── supabaseClient.ts       # Database client
└── context/                    # React context (auth)

supabase/
└── migrations/                 # Database schema
    └── 20250619_medcheck_transformation.sql
```

## 🗄️ Database Schema

### Kern Tabellen
- **users**: Artsen, assistentes, admins
- **patients**: Patiëntgegevens
- **appointments**: Geplande afspraken
- **appointment_requests**: Aanvragen van patiënten
- **appointment_types**: Soorten consulten
- **practice_locations**: Praktijklocaties
- **medical_records**: Medische dossiers
- **prescriptions**: Recepten

### Relaties
```sql
patients 1:N appointments
users 1:N appointments (als arts)
appointment_types 1:N appointments
appointment_requests 1:1 appointments (na goedkeuring)
```

## ⚡ Installatie & Setup

### 1. Repository clonen
```bash
git clone <repository-url>
cd BV-floriande-web-main/BV-floriande-web-main
```

### 2. Dependencies installeren
```bash
npm install
```

### 3. Environment variabelen
Maak `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Database migratie
```bash
npm run migrate
```

> **Let op**: De migratie script geeft instructies voor handmatige SQL uitvoering in Supabase dashboard.

### 5. Development server starten
```bash
npm run dev
```

Bezoek http://localhost:3000

## 🧪 Testing & Demonstratie

### Database Operaties Testen
```bash
# Test database connectiviteit
node test-database-fix.mjs

# Test authentication
node test-auth-db-fix.js
```

### Demo Scenario's

#### 1. Patiënt Journey
1. Ga naar http://localhost:3000
2. Klik "Afspraak maken"
3. Vul het formulier in
4. Controleer database voor nieuwe appointment_request

#### 2. Admin Workflow
1. Registreer als admin via /register
2. Update role in database: `UPDATE users SET role = 'admin' WHERE email = 'admin@example.com'`
3. Login via /login
4. Bekijk dashboard met pending requests
5. Goedkeuren/afwijzen van verzoeken

## 📊 Database Demonstraties

### Selectie Queries
```sql
-- Alle wachtende afspraakverzoeken met patiëntgegevens
SELECT ar.*, at.name as appointment_type, at.duration_minutes
FROM appointment_requests ar
JOIN appointment_types at ON ar.appointment_type_id = at.id
WHERE ar.status = 'pending'
ORDER BY ar.urgency DESC, ar.created_at ASC;

-- Arts agenda voor vandaag
SELECT a.*, p.name as patient_name, at.name as appointment_type
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN appointment_types at ON a.appointment_type_id = at.id
WHERE DATE(a.scheduled_at) = CURRENT_DATE
ORDER BY a.scheduled_at;
```

### Insert/Update Operaties
```sql
-- Nieuwe patiënt registreren
INSERT INTO patients (patient_number, name, email, birth_date, gp_patient)
VALUES ('P2025001', 'Jan Jansen', 'jan@example.com', '1980-01-01', true);

-- Afspraakverzoek goedkeuren
UPDATE appointment_requests 
SET status = 'approved', processed_by = 'user-id', processed_at = NOW()
WHERE id = 'request-id';
```

## 🔒 Beveiliging

- **Row Level Security**: Alle tabellen hebben RLS policies
- **Role-based access**: Admin, doctor, assistant rollen
- **Input validatie**: Server-side en client-side validatie
- **SQL injection preventie**: Prepared statements via Supabase

## 📧 Email Integratie (Ready)

Het systeem is voorbereid voor automatische emails:
- Appointment confirmation emails
- Reminder emails
- Staff notification emails

Integratie met SendGrid is een simpele uitbreiding.

## 🔄 Workflow Automation

### Afspraakverzoek Proces
1. **Patiënt** maakt verzoek → `status: 'pending'`
2. **Assistent** bekijkt → dashboard notificatie
3. **Goedkeuring** → automatische afspraak creatie
4. **Email** → bevestiging naar patiënt

## 🎨 UI/UX Features

- Responsive design (mobile-first)
- Modern glassmorphism design
- Toegankelijke forms
- Loading states
- Error handling
- Toast notifications

## 📈 Uitbreidingsmogelijkheden

- 📅 Agenda integratie (Google Calendar)
- 💳 Online betalingen
- 📱 Mobile app
- 🔔 SMS notificaties
- 📊 Rapportage dashboard
- 🗄️ Backup systeem

## 🐛 Troubleshooting

### Database Connectie Problemen
```bash
# Test connectie
node test-db-connectivity.mjs
```

### Authentication Issues
```bash
# Test auth flow
node test-auth-api-key.mjs
```

## 📄 Licentie

© 2025 qdela. Alle rechten voorbehouden.

## 👥 Contact

Voor vragen over dit project of de implementatie van werkprocessen 2 & 3, neem contact op via GitHub issues.

---

**MedCheck+** - Moderne medische praktijk management voor betere patiëntenzorg. 🏥✨
