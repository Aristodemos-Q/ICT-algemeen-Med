# MedCheck+ Demo & Screenshots Bijlage

**Live Demo:** http://localhost:3006  
**Project Repository:** [GitHub](https://github.com/Aristodemos-Q/ICT-algemeen-Med)  
**Datum Screenshots:** 5 september 2025  

---

## 📱 Screenshots en Demo Locaties

### 🏠 Homepage & Landing
**URL:** `http://localhost:3006/`
- **Functie:** Welkomstpagina met navigatie naar verschillende secties
- **Gebruikers:** Publiek toegankelijk
- **Features:** Overzicht van beschikbare services

### 📅 Afspraak Booking (Publiek)
**URL:** `http://localhost:3006/appointment-booking`
- **Functie:** Patiënten kunnen hier 24/7 afspraken aanvragen
- **Gebruikers:** Alle patiënten zonder inloggen
- **Features:** 
  - Formulier validatie in real-time
  - Datum/tijd selectie
  - Reden voor bezoek
  - Contact informatie
  - Directe opslag in database

**Proces Screenshots:**
1. **Leeg formulier** - Toon de interface
2. **Ingevuld formulier** - Demonstreer data invoer
3. **Validatie errors** - Toon foutafhandeling
4. **Succesbericht** - Bevestiging van verzending

### 💊 Herhaalrecept Aanvragen
**URL:** `http://localhost:3006/repeat-prescription`
- **Functie:** Digitale herhaalrecept aanvragen
- **Gebruikers:** Geregistreerde patiënten
- **Features:**
  - Medicatie geschiedenis
  - Apotheek selectie
  - Upload van oude recepten
  - Status tracking

### 🏥 Medisch Dashboard
**URL:** `http://localhost:3006/dashboard`
- **Functie:** Centrale hub voor medisch personeel
- **Gebruikers:** Artsen en assistentes (login vereist)
- **Features:**
  - Real-time overzicht nieuwe verzoeken
  - Status updates met één klik
  - Patiënt historie
  - Agenda integratie

**Dashboard Screenshots:**
1. **Overzicht pending requests** - Toon wachtrij
2. **Appointment details** - Uitgebreide patiënt info
3. **Quick actions** - Approve/Reject buttons
4. **Status updates** - Real-time wijzigingen

### 👨‍💼 Admin Portal
**URL:** `http://localhost:3006/admin`
- **Functie:** Systeembeheer en gebruikersbeheer
- **Gebruikers:** Alleen administrators
- **Features:**
  - Gebruikers aanmaken/beheren
  - Systeem statistieken
  - Database backup beheer
  - Security instellingen

### 📊 Database Management Demo

#### Supabase Dashboard
**URL:** `https://supabase.com/dashboard`
- **Tabel Overzicht:** Alle database tabellen en relaties
- **RLS Policies:** Security instellingen per tabel
- **Real-time Features:** Live data subscriptions
- **Analytics:** Performance metrics en usage statistics

#### Database Operaties Screenshots:
1. **CREATE:** Nieuwe appointment in database
2. **READ:** Query resultaten van appointment lijst
3. **UPDATE:** Status wijziging van pending naar approved
4. **DELETE:** Soft delete demonstratie

---

## 🔄 Automatisering Screenshots

### Email Notificatie Systeem
**SendGrid Dashboard:** Configuratie en sent emails overzicht

### Real-time Updates
**Browser Tabs:** Demonstratie van instant updates tussen dashboard en booking

### Form Validatie
**Client-side:** JavaScript validatie voorbeelden
**Server-side:** Database constraint errors

---

## 📋 Database Schema Visualisatie

### ERD Diagram (Entity Relationship Diagram)
```
appointment_requests (1:N) ← users (doctors)
prescription_requests (1:N) ← users (doctors)
users (1:N) → audit_logs
```

### Sample Data Screenshots
- **appointment_requests:** Tabel met sample data
- **users:** User management overzicht  
- **prescription_requests:** Medicatie aanvragen
- **audit_logs:** Activiteit tracking

---

## 🎯 Werkproces Demonstratie Flow

### Volledige User Journey (Screenshots):
1. **Start:** Patiënt bezoekt website
2. **Form:** Vult afspraak formulier in
3. **Validation:** Real-time feedback
4. **Submit:** Succesbericht naar patiënt
5. **Dashboard:** Arts ziet nieuwe aanvraag
6. **Review:** Arts bekijkt details
7. **Action:** Goedkeuring met één klik
8. **Notification:** Automatische email naar patiënt
9. **Calendar:** Afspraak wordt ingepland
10. **Complete:** Proces volledig geautomatiseerd

### Performance Metrics Screenshots:
- **Response Time:** Database query snelheid
- **User Activity:** Real-time user counters
- **Error Handling:** Foutafhandeling demonstratie
- **Backup Status:** Database backup overzicht

---

## 🔧 Technical Implementation Screenshots

### Code Structure
- **Frontend Components:** React component tree
- **API Routes:** Next.js API endpoints
- **Database Schemas:** SQL table definitions
- **Configuration Files:** Environment en config bestanden

### Security Features
- **RLS Policies:** Row Level Security implementatie
- **Authentication:** Login/logout flow
- **Authorization:** Role-based access control
- **Data Encryption:** HTTPS en database encryption

### Performance Monitoring
- **Supabase Analytics:** Database performance metrics
- **Network Tab:** API call timings
- **Lighthouse Score:** Web performance audit
- **Error Tracking:** Console en error logs

---

## 📸 Screenshot Checklist

### Moet hebben voor verslag:

#### Werkproces 1 (Ontwerp):
- [ ] System architecture diagram
- [ ] Information flow visualization
- [ ] User interface mockups
- [ ] Database schema diagram

#### Werkproces 2 (Automatisering):
- [ ] Appointment booking form (empty state)
- [ ] Form validation in action
- [ ] Successful submission confirmation
- [ ] Dashboard real-time update
- [ ] Email notification example
- [ ] Status change workflow
- [ ] Automated process flow diagram

#### Werkproces 3 (Database):
- [ ] Supabase dashboard overview
- [ ] Table structure in database
- [ ] SQL query execution
- [ ] CRUD operations screenshots
- [ ] RLS policies configuration
- [ ] Data relationships visualization
- [ ] Backup and recovery settings
- [ ] Performance analytics

### Aanvullende Screenshots:
- [ ] Error handling examples
- [ ] Mobile responsive design
- [ ] Loading states
- [ ] User feedback messages
- [ ] Admin dashboard features
- [ ] Security warnings/confirmations

---

## 🚀 Live Demo Instructies

### Voor Reviewers:
1. **Start applicatie:** `npm run dev` in project directory
2. **Open browser:** Ga naar `http://localhost:3006`
3. **Test booking flow:** Gebruik appointment-booking pagina
4. **Check dashboard:** Login als admin/doctor
5. **Verify database:** Check Supabase dashboard voor data

### Demo Scenario:
1. Boek een afspraak als patiënt
2. Switch naar dashboard tab
3. Zie real-time update van nieuwe aanvraag
4. Keur aanvraag goed met één klik
5. Controleer email notificatie
6. Bekijk database wijzigingen in Supabase

### Test Accounts:
```
Admin: admin@medcheck.nl / admin123
Doctor: doctor@medcheck.nl / doctor123
Assistant: assistant@medcheck.nl / assistant123
```

---

**Dit document dient als handleiding voor het maken van screenshots en demonstraties die het verslag ondersteunen met visueel bewijs van alle werkprocessen.**
