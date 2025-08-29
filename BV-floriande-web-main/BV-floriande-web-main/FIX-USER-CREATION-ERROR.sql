-- =============================================================================
-- EENVOUDIG ACCOUNT SCHEMA: Registratie en Login Systeem
-- =============================================================================
-- Dit is een vereenvoudigd schema voor alleen account beheer zonder admin complexiteit
-- Focust op: registratie, login, wachtwoord reset, basis gebruikersbeheer

-- Stap 1: Eenvoudige users tabel (alleen essentiële velden)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_sign_in_at TIMESTAMP WITH TIME ZONE
);

-- Stap 2: Enable RLS voor veiligheid
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Stap 3: Eenvoudige RLS policies (gebruikers kunnen alleen eigen profiel zien/bewerken)
DROP POLICY IF EXISTS "Users can manage own profile" ON public.users;
CREATE POLICY "Users can manage own profile" ON public.users 
    FOR ALL USING (auth.uid() = id);

-- Stap 4: Trigger functie voor automatische user creation bij registratie
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log fout maar laat registratie doorgaan
        RAISE LOG 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stap 5: Trigger voor automatische user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Stap 6: Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Stap 7: Index voor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Stap 8: Verificatie dat alles werkt
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 EENVOUDIG ACCOUNT SCHEMA GEÏNSTALLEERD!';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Functionaliteit:';
    RAISE NOTICE '   📝 Gebruiker registratie';
    RAISE NOTICE '   🔑 Gebruiker login';
    RAISE NOTICE '   🔄 Wachtwoord reset';
    RAISE NOTICE '   👤 Basis profiel beheer';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Geen admin complexiteit - gewoon simpel account beheer!';
    RAISE NOTICE '';
    
    -- Toon wat er aangemaakt is
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Users tabel bestaat';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
        RAISE NOTICE '✅ Auto-registratie functie bestaat';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        RAISE NOTICE '✅ Registratie trigger bestaat';
    END IF;
END $$;

-- Schema overzicht
SELECT 
    'EENVOUDIG ACCOUNT SCHEMA KLAAR' as status,
    'Registratie + Login + Profiel' as functionaliteit,
    NOW() as geïnstalleerd_op;
