'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Calendar, LogOut, Eye, EyeOff, Edit, Save, X, KeyRound, Shield, ArrowLeft, FileText, MessageSquare, Monitor, Download, Trash2, HelpCircle, Phone, Settings, Bell, Lock, Database } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/authService';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  last_sign_in_at?: string;
}

type TabType = 'profile' | 'security' | 'notifications' | 'data' | 'support';

export default function AccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  const [editForm, setEditForm] = useState({
    name: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.log('Profile not found, creating fallback profile');
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          name: user.email?.split('@')[0] || '',
          created_at: user.created_at || new Date().toISOString(),
          last_sign_in_at: user.last_sign_in_at
        };
        setProfile(fallbackProfile);
        setEditForm({ name: fallbackProfile.name });
      } else {
        setProfile(data);
        setEditForm({ name: data.name || '' });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: profile.email,
          name: editForm.name,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setProfile({ ...profile, name: editForm.name });
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profiel succesvol bijgewerkt!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Er ging iets mis bij het bijwerken van je profiel.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen.' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.updatePassword(passwordForm.newPassword);
      if (!result.success) throw new Error('Password update failed');

      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Wachtwoord succesvol gewijzigd!' });
    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Er ging iets mis bij het wijzigen van je wachtwoord.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as TabType, name: 'Profiel', icon: User },
    { id: 'security' as TabType, name: 'Beveiliging', icon: Shield },
    { id: 'notifications' as TabType, name: 'Notificaties', icon: Bell },
    { id: 'data' as TabType, name: 'Data', icon: Database },
    { id: 'support' as TabType, name: 'Support', icon: HelpCircle },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profiel Informatie</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Naam</label>
                      <p className="text-lg">{profile.name || 'Geen naam ingesteld'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-lg">{profile.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Lid sinds</label>
                      <p className="text-lg">
                        {new Date(profile.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                    <Button onClick={() => setIsEditing(true)} className="mt-4">
                      <Edit className="h-4 w-4 mr-2" />
                      Bewerken
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Naam</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Je volledige naam"
                        required
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Opslaan...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Opslaan
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({ name: profile.name || '' });
                        }}
                      >
                        Annuleren
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Wachtwoord Wijzigen</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="newPassword">Nieuw wachtwoord</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Minimaal 8 tekens"
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Bevestig wachtwoord</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Herhaal het nieuwe wachtwoord"
                        className="pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Wijzigen...
                      </>
                    ) : (
                      <>
                        <KeyRound className="h-4 w-4 mr-2" />
                        Wachtwoord bijwerken
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case 'security':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Beveiliging</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Twee-factor authenticatie</p>
                  <p className="text-sm text-gray-600">Extra beveiliging voor je account</p>
                </div>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Inschakelen
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Login geschiedenis</p>
                  <p className="text-sm text-gray-600">Bekijk recente inlogpogingen</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Bekijken
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Sessie beheer</p>
                  <p className="text-sm text-gray-600">Actieve sessies op andere apparaten</p>
                </div>
                <Button variant="outline" size="sm">
                  <Monitor className="h-4 w-4 mr-2" />
                  Beheren
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notificatie Instellingen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Email notificaties</p>
                  <p className="text-sm text-gray-600">Ontvang updates via email</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <span className="sr-only">Email notificaties inschakelen</span>
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="relative">
                    <div className="w-10 h-6 bg-blue-600 rounded-full shadow-inner"></div>
                    <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 right-1 transition"></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Afspraak herinneringen</p>
                  <p className="text-sm text-gray-600">24 uur van tevoren herinneren</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <span className="sr-only">Afspraak herinneringen inschakelen</span>
                  <input type="checkbox" className="sr-only" defaultChecked />
                  <div className="relative">
                    <div className="w-10 h-6 bg-blue-600 rounded-full shadow-inner"></div>
                    <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 right-1 transition"></div>
                  </div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Marketing emails</p>
                  <p className="text-sm text-gray-600">Nieuws en aanbiedingen</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <span className="sr-only">Marketing emails inschakelen</span>
                  <input type="checkbox" className="sr-only" />
                  <div className="relative">
                    <div className="w-10 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                    <div className="absolute w-4 h-4 bg-white rounded-full shadow top-1 left-1 transition"></div>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>
        );

      case 'data':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Data Beheer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" />
                Download mijn gegevens
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Privacy verklaring
              </Button>
              <Button variant="outline" className="w-full justify-start text-orange-600 hover:bg-orange-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Account verwijderen
              </Button>
            </CardContent>
          </Card>
        );

      case 'support':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Hulp & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact opnemen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Veelgestelde vragen
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                Telefonische support
              </Button>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Snelle Acties</h4>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/dashboard">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Terug naar Dashboard
                    </Link>
                  </Button>
                  <Button 
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Uitloggen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Beheer</h1>
          <p className="text-gray-600">Welkom terug, {profile.name || user?.email?.split('@')[0]}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Link>
        </Button>
      </div>
      
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Tab Layout */}
      <div className="flex gap-6">
        {/* Sidebar Navigation */}
        <div className="w-64 space-y-2">
          <h3 className="font-medium text-gray-900 mb-3">Instellingen</h3>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
