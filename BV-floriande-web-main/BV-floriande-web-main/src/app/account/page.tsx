'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  HelpCircle, 
  Edit, 
  Save, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Monitor,
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Check,
  Download,
  FileText,
  Trash2,
  MessageSquare,
  LogOut
} from 'lucide-react';
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
          <div className="p-8">
            <div className="border-b border-gray-100 pb-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Profiel Informatie</h2>
              <p className="text-gray-600">Beheer je persoonlijke gegevens en voorkeuren</p>
            </div>
            
            <div className="space-y-8">
              {/* Profile Info Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6">
                {!isEditing ? (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Volledige Naam
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-white p-3 rounded-lg border">
                          {profile.name || 'Geen naam ingesteld'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          Email Adres
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-white p-3 rounded-lg border">
                          {profile.email}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Lid sinds
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-white p-3 rounded-lg border">
                          {new Date(profile.created_at).toLocaleDateString('nl-NL', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Laatste activiteit
                        </label>
                        <p className="text-lg font-medium text-gray-900 bg-white p-3 rounded-lg border">
                          {profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString('nl-NL') : 'Vandaag'}
                        </p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => setIsEditing(true)} 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Profiel Bewerken
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Volledige Naam
                      </Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Uw volledige naam"
                        className="p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="flex gap-4">
                      <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg">
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Opslaan...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            Opslaan
                          </div>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({ name: profile.name || '' });
                        }}
                        className="px-6 py-3 rounded-xl border-gray-300 hover:bg-gray-50"
                      >
                        Annuleren
                      </Button>
                    </div>
                  </form>
                )}
              </div>

              {/* Password Change Section */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-blue-600" />
                  Wachtwoord Wijzigen
                </h3>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">Nieuw wachtwoord</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          placeholder="Minimaal 8 tekens"
                          className="p-4 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                          onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">Bevestig wachtwoord</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          placeholder="Herhaal het nieuwe wachtwoord"
                          className="p-4 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-lg"
                          onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl shadow-lg">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Wijzigen...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4" />
                        Wachtwoord bijwerken
                      </div>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="p-8">
            <div className="border-b border-gray-100 pb-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Beveiliging</h2>
              <p className="text-gray-600">Beveilig uw account met geavanceerde instellingen</p>
            </div>
            
            <div className="space-y-6">
              {/* Security Features */}
              <div className="grid gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Shield className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Twee-factor authenticatie</h3>
                        <p className="text-sm text-gray-600">Extra beveiligingslaag voor uw account</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="px-4 py-2 rounded-lg border-green-200 text-green-700 hover:bg-green-50">
                      <Shield className="h-4 w-4 mr-2" />
                      Inschakelen
                    </Button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Eye className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Login geschiedenis</h3>
                        <p className="text-sm text-gray-600">Bekijk recente inlogpogingen en activiteit</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="px-4 py-2 rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50">
                      <Eye className="h-4 w-4 mr-2" />
                      Bekijken
                    </Button>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <Monitor className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Sessie beheer</h3>
                        <p className="text-sm text-gray-600">Beheer actieve sessies op andere apparaten</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="px-4 py-2 rounded-lg border-purple-200 text-purple-700 hover:bg-purple-50">
                      <Monitor className="h-4 w-4 mr-2" />
                      Beheren
                    </Button>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Account Status
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between bg-white p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Account Status:</span>
                    <span className="text-green-600 font-bold">✓ Geverifieerd</span>
                  </div>
                  <div className="flex justify-between bg-white p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Email Status:</span>
                    <span className="text-green-600 font-bold">✓ Bevestigd</span>
                  </div>
                  <div className="flex justify-between bg-white p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Laatste login:</span>
                    <span className="text-gray-900">
                      {profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString('nl-NL') : 'Vandaag'}
                    </span>
                  </div>
                  <div className="flex justify-between bg-white p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Account aangemaakt:</span>
                    <span className="text-gray-900">{new Date(profile.created_at).toLocaleDateString('nl-NL')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="p-8">
            <div className="border-b border-gray-100 pb-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Notificatie Instellingen</h2>
              <p className="text-gray-600">Beheer uw communicatie voorkeuren en herinneringen</p>
            </div>
            
            <div className="space-y-6">
              {/* Email Notifications */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Email notificaties</h3>
                      <p className="text-sm text-gray-600">Ontvang belangrijke updates via email</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <span className="sr-only">Email notificaties inschakelen</span>
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="relative">
                      <div className="w-12 h-6 bg-blue-600 rounded-full shadow-inner transition-colors"></div>
                      <div className="absolute w-5 h-5 bg-white rounded-full shadow top-0.5 right-0.5 transition-transform"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Appointment Reminders */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Afspraak herinneringen</h3>
                      <p className="text-sm text-gray-600">24 uur van tevoren automatisch herinneren</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <span className="sr-only">Afspraak herinneringen inschakelen</span>
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <div className="relative">
                      <div className="w-12 h-6 bg-green-600 rounded-full shadow-inner transition-colors"></div>
                      <div className="absolute w-5 h-5 bg-white rounded-full shadow top-0.5 right-0.5 transition-transform"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Marketing Emails */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Bell className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Marketing emails</h3>
                      <p className="text-sm text-gray-600">Nieuwsbrieven, tips en speciale aanbiedingen</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <span className="sr-only">Marketing emails inschakelen</span>
                    <input type="checkbox" className="sr-only" />
                    <div className="relative">
                      <div className="w-12 h-6 bg-gray-300 rounded-full shadow-inner transition-colors"></div>
                      <div className="absolute w-5 h-5 bg-white rounded-full shadow top-0.5 left-0.5 transition-transform"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-4">Geavanceerde Instellingen</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="font-medium text-gray-700">SMS notificaties</span>
                    <span className="text-sm text-gray-500">Binnenkort beschikbaar</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <span className="font-medium text-gray-700">Push notificaties</span>
                    <span className="text-sm text-gray-500">Binnenkort beschikbaar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="p-8">
            <div className="border-b border-gray-100 pb-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Beheer</h2>
              <p className="text-gray-600">Beheer uw persoonlijke gegevens en privacy instellingen</p>
            </div>
            
            <div className="space-y-6">
              {/* Data Export */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-600" />
                  Gegevens Exporteren
                </h3>
                <p className="text-gray-600 mb-4">Download een kopie van al uw persoonlijke gegevens die bij ons zijn opgeslagen.</p>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl">
                  <Download className="h-4 w-4 mr-2" />
                  Download mijn gegevens
                </Button>
              </div>

              {/* Privacy Policy */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Privacy & Voorwaarden
                </h3>
                <p className="text-gray-600 mb-4">Lees onze privacy verklaring en algemene voorwaarden.</p>
                <div className="flex gap-3">
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 px-6 py-2 rounded-xl">
                    <FileText className="h-4 w-4 mr-2" />
                    Privacy verklaring
                  </Button>
                  <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-2 rounded-xl">
                    <FileText className="h-4 w-4 mr-2" />
                    Algemene voorwaarden
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-bold text-red-900 mb-4 flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Gevaarlijke Acties
                </h3>
                <p className="text-red-700 mb-4">Deze acties zijn permanent en kunnen niet ongedaan worden gemaakt.</p>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100 px-6 py-2 rounded-xl">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Account permanent verwijderen
                </Button>
              </div>
            </div>
          </div>
        );

      case 'support':
        return (
          <div className="p-8">
            <div className="border-b border-gray-100 pb-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Hulp & Support</h2>
              <p className="text-gray-600">Krijg hulp of neem contact met ons op</p>
            </div>
            
            <div className="space-y-6">
              {/* Contact Support */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                  Contact Opnemen
                </h3>
                <p className="text-gray-600 mb-4">Heeft u vragen of problemen? Ons support team helpt u graag verder.</p>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Start een gesprek
                </Button>
              </div>

              {/* Help Resources */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-green-600" />
                  Hulpbronnen
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start h-12 border-gray-200 hover:bg-gray-50">
                    <FileText className="h-4 w-4 mr-3" />
                    Veelgestelde vragen
                  </Button>
                  <Button variant="outline" className="justify-start h-12 border-gray-200 hover:bg-gray-50">
                    <User className="h-4 w-4 mr-3" />
                    Gebruikershandleiding
                  </Button>
                  <Button variant="outline" className="justify-start h-12 border-gray-200 hover:bg-gray-50">
                    <Monitor className="h-4 w-4 mr-3" />
                    Video tutorials
                  </Button>
                  <Button variant="outline" className="justify-start h-12 border-gray-200 hover:bg-gray-50">
                    <Phone className="h-4 w-4 mr-3" />
                    Telefonische support
                  </Button>
                </div>
              </div>

              {/* Emergency Options */}
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6">
                <h3 className="font-bold text-orange-900 mb-4">Noodopties</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start border-orange-300 text-orange-700 hover:bg-orange-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    Alle apparaten uitloggen
                  </Button>
                  <p className="text-sm text-orange-700">
                    Gebruik deze optie als u denkt dat uw account mogelijk gecompromitteerd is.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Beheer</h1>
              <p className="text-xl text-gray-600">Welkom terug, <span className="font-semibold text-blue-600">{profile.name || user?.email?.split('@')[0]}</span></p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Online • Laatste activiteit: {profile.last_sign_in_at ? new Date(profile.last_sign_in_at).toLocaleDateString('nl-NL') : 'Vandaag'}</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-500">Lid sinds</p>
                <p className="font-semibold">{new Date(profile.created_at).toLocaleDateString('nl-NL')}</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-white" />
              </div>
              <Button asChild variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Message */}
        {message && (
          <div className={`p-6 rounded-2xl border shadow-lg ${
            message.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {message.type === 'success' ? (
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div>
                <h3 className="font-bold text-lg">{message.type === 'success' ? 'Gelukt!' : 'Oeps!'}</h3>
                <p className="text-base">{message.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Tab Layout */}
        <div className="flex gap-8">
          {/* Premium Sidebar Navigation */}
          <div className="w-80 space-y-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Instellingen Menu</h3>
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all duration-200 group ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-[1.02]'
                          : 'hover:bg-gray-50 text-gray-700 hover:shadow-md hover:scale-[1.01]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${
                        activeTab === tab.id 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 group-hover:bg-gray-200'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          activeTab === tab.id ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          activeTab === tab.id ? 'text-white' : 'text-gray-900'
                        }`}>{tab.name}</p>
                        <p className={`text-sm ${
                          activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {tab.id === 'profile' && 'Persoonlijke informatie'}
                          {tab.id === 'security' && 'Beveiliging & privacy'}
                          {tab.id === 'notifications' && 'Email & herinneringen'}
                          {tab.id === 'data' && 'Gegevens & export'}
                          {tab.id === 'support' && 'Hulp & ondersteuning'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[600px]">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
