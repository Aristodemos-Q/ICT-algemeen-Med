# 🔧 FIX: Database Error Saving New User

## Probleem
Als je een nieuwe gebruiker probeert aan te maken, krijg je de fout:
```
Database error saving new user
```

## Oorzaak
Het probleem wordt veroorzaakt door:
1. **Ontbrekende trigger functie**: De `handle_new_user()` functie die automatisch een user record aanmaakt
2. **Incorrecte RLS policies**: Row Level Security policies die niet goed ingesteld zijn
3. **Ontbrekende users tabel structuur**: De users tabel heeft niet de juiste kolommen of constraints

## Oplossing

### Stap 1: Voer de Fix SQL uit
1. Ga naar je **Supabase Dashboard**
2. Navigeer naar **SQL Editor**
3. Open het bestand `FIX-USER-CREATION-ERROR.sql`
4. Kopieer de volledige inhoud
5. Plak dit in de Supabase SQL Editor
6. Klik op **Run** (F5)

### Stap 2: Verificatie
Na het uitvoeren van de SQL zie je de volgende berichten:
```
✅ handle_new_user functie bestaat
✅ on_auth_user_created trigger bestaat  
✅ users tabel bestaat
🎉 SUCCESS: "Database error saving new user" fix is toegepast!
```

### Stap 3: Test de Fix
1. Ga naar `http://localhost:3000/register`
2. Probeer een nieuwe gebruiker aan te maken:
   - **Naam**: Test Gebruiker
   - **Email**: test@medcheckplus.nl
   - **Wachtwoord**: testpass123
3. De registratie zou nu moeten werken zonder errors

## Wat is er gerepareerd?

### ✅ Database Level Fixes
- **Users tabel**: Correct aangemaakt met alle benodigde kolommen
- **Trigger functie**: `handle_new_user()` die automatisch users aanmaakt
- **Database trigger**: `on_auth_user_created` die de functie uitvoert
- **RLS Policies**: Veilige toegangsregels voor de users tabel
- **Error handling**: Verbeterde error handling in de trigger

### ✅ Application Level Fixes
- **Admin Dashboard**: Nu echte users i.p.v. mock data
- **User Creation**: Werkende user creation via admin dashboard
- **User Deletion**: Werkende user deletion functionaliteit
- **Data Loading**: Users worden nu uit database geladen

## Technische Details

### Database Schema
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'trainer',
    specialization TEXT,
    license_number TEXT,
    phone TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Trigger Functie
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'role', 'trainer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Troubleshooting

### Als de fix niet werkt:

1. **Controleer Supabase connectie**:
   ```bash
   # Test connectie
   node check-users.mjs
   ```

2. **Controleer environment variabelen**:
   ```bash
   # In .env.local
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Herstart de applicatie**:
   ```bash
   npm run dev
   ```

### Veelvoorkomende Errors

**Error: "Could not find the table 'public.users'"**
- ✅ **Oplossing**: Voer de SQL fix opnieuw uit

**Error: "permission denied for table users"**
- ✅ **Oplossing**: Controleer RLS policies in de SQL fix

**Error: "function handle_new_user() does not exist"**
- ✅ **Oplossing**: Voer de trigger functie deel van de SQL fix uit

## Testing

### Test Script
```javascript
// Test user creation via code
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpass123',
  options: {
    data: {
      name: 'Test User',
      role: 'trainer'
    }
  }
});

console.log('Result:', { data, error });
```

## Support

Als je nog steeds problemen hebt na deze fix:
1. Controleer de browser console voor error details
2. Controleer de Supabase logs in het dashboard
3. Verificeer dat alle environment variabelen correct zijn ingesteld
4. Zorg dat je de juiste database permissions hebt

---

**🎉 Na deze fix kun je zonder problemen nieuwe gebruikers aanmaken!**
