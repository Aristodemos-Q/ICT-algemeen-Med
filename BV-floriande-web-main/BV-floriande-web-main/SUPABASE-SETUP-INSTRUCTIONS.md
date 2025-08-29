# ❌ SUPABASE DATABASE SETUP VEREIST

## Probleem
Je krijgt deze errors omdat de Supabase database tabellen nog niet bestaan:
```
Error: Error fetching appointment requests: {}
Error: Error fetching appointments for patient: {}
```

## ✅ OPLOSSING - Voer deze stappen uit:

### Stap 1: Ga naar Supabase Dashboard
1. Open je Supabase project dashboard
2. Ga naar **SQL Editor** (in het linker menu)

### Stap 2: Voer de Database Setup uit
1. Klik op **New Query**
2. Open het bestand `SUPABASE-SETUP-COMPLETE.sql` in deze workspace
3. Kopieer de VOLLEDIGE inhoud van dat bestand
4. Plak het in de Supabase SQL Editor
5. Klik op **Run** om alle tabellen aan te maken

### Stap 3: Controleer de Setup
Na het uitvoeren van de SQL:
1. Ga naar **Table Editor** in Supabase
2. Controleer of deze tabellen bestaan:
   - ✅ `users`
   - ✅ `patients` 
   - ✅ `appointments`
   - ✅ `appointment_requests`
   - ✅ `appointment_types`
   - ✅ `practice_locations`
   - ✅ `doctor_schedules`
   - ✅ `medical_records`
   - ✅ `prescriptions`
   - ✅ `automation_logs`

### Stap 4: Test de Applicatie
1. Herlaad je applicatie (Ctrl+F5)
2. De errors zouden nu weg moeten zijn
3. Je zou test data moeten zien in de tabellen

## 📋 Wat de SQL Setup doet:
- ✅ Maakt alle benodigde tabellen aan
- ✅ Configureert Row Level Security (RLS) policies
- ✅ Voegt test data toe (sample appointment types, locations, etc.)
- ✅ Maakt indexes aan voor performance
- ✅ Configureert triggers voor timestamps

## 🔍 Debug Info
Na de setup kun je in de browser console zien:
- Database connection test results
- Welke tabellen bestaan
- Eventuele permission errors

## ⚠️ Let Op
- Voer de SQL uit als je Supabase admin/owner bent
- Als je een team project bent, vraag de admin om dit uit te voeren
- De sample data bevat test appointments die je kunt verwijderen

## 🚀 Na Setup
Je MedCheck+ applicatie zal dan volledig werken met:
- ✅ Afspraken boeken (via public form)
- ✅ Afspraken bekijken (dashboard)
- ✅ Afspraakverzoeken beheren
- ✅ Alle CRUD operaties via Supabase
