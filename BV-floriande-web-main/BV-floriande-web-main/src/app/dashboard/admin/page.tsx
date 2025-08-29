/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { clearWebpackChunksCache } from '@/lib/clear-webpack-cache';
import PageChunkErrorRecovery from '@/lib/page-chunk-error-recovery';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings, 
  BarChart3, 
  Calendar,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  UserCog,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { bvfQueries } from '@/lib/bvf-queries';
import { supabase } from '@/lib/supabaseClient';
import { locationService } from '@/lib/bvf-services';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'trainer';
  status: 'active' | 'inactive';
  last_login: string;
  created_at: string;
  groups_assigned: number;
}

interface RegistrationRequest {
  id: string;
  email: string;
  name: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
}

interface ApprovedEmail {
  id: string;
  email: string;
  role: 'admin' | 'trainer';
  approved_by?: string;
  notes?: string;
  created_at: string;
}

interface AdminLocation {
  id: string;
  name: string;
  address?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
}

function AdminDashboardComponent() {
  const { user } = useAuth();  const [users, setUsers] = useState<AdminUser[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [approvedEmails, setApprovedEmails] = useState<ApprovedEmail[]>([]);
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddEmail, setShowAddEmail] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<AdminLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'trainer' as 'admin' | 'trainer',
    password: ''
  });  const [newEmail, setNewEmail] = useState({
    email: '',
    role: 'trainer' as 'admin' | 'trainer',
    notes: ''
  });
  const [newLocation, setNewLocation] = useState({
    name: '',
    address: '',
    description: ''
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load users (mock data for now)
        const mockUsers: AdminUser[] = [
          {
            id: '1',
            name: 'Jan Trainer',
            email: 'jan@bvfloriande.nl',
            role: 'trainer',
            status: 'active',
            last_login: '2025-01-20T10:30:00Z',
            created_at: '2024-09-01T00:00:00Z',
            groups_assigned: 3
          },
          {
            id: '2',
            name: 'Q Delarambelje',
            email: 'qdelarambelje@gmail.com',
            role: 'admin',
            status: 'active',
            last_login: '2025-01-20T12:00:00Z',
            created_at: '2024-08-01T00:00:00Z',
            groups_assigned: 0
          }
        ];
        setUsers(mockUsers);

        // Load registration requests
        const { data: requests } = await supabase
          .from('registration_requests')
          .select('*')
          .order('requested_at', { ascending: false });
        
        if (requests) {
          setRegistrationRequests(requests);
        }        // Load approved emails
        const { data: emails } = await supabase
          .from('approved_emails')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (emails) {
          setApprovedEmails(emails);
        }

        // Load locations
        const locationsData = await locationService.getAllLocations();
        setLocations(locationsData);

      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Check if current user is admin - Updated with your email
  const isAdmin = user?.user_metadata?.role === 'admin' || 
                  user?.email === 'qdelarambelje@gmail.com' ||
                  user?.email === 'admin@bvfloriande.nl';

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-red-600 mb-2">Toegang Geweigerd</h1>
              <p className="text-gray-600">Je hebt geen beheerrechten om deze pagina te bekijken.</p>
              <p className="text-sm text-gray-500 mt-2">Huidige gebruiker: {user?.email}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApproveRequest = async (requestId: string, status: 'approved' | 'rejected', notes: string = '') => {
    try {
      const { error } = await supabase.rpc('review_registration_request', {
        request_id: requestId,
        approval_status: status,
        admin_notes: notes
      });

      if (error) throw error;

      // Refresh registration requests
      const { data: requests } = await supabase
        .from('registration_requests')
        .select('*')
        .order('requested_at', { ascending: false });
      
      if (requests) {
        setRegistrationRequests(requests);
      }

      // Refresh approved emails if approved
      if (status === 'approved') {
        const { data: emails } = await supabase
          .from('approved_emails')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (emails) {
          setApprovedEmails(emails);
        }
      }

    } catch (error) {
      console.error('Error processing request:', error);
      alert('Er ging iets mis bij het verwerken van de aanvraag');
    }
  };

  const handleAddApprovedEmail = async () => {
    try {
      const { error } = await supabase
        .from('approved_emails')
        .insert([{
          email: newEmail.email,
          role: newEmail.role,
          notes: newEmail.notes,
          approved_by: user?.id
        }]);

      if (error) throw error;

      // Refresh approved emails
      const { data: emails } = await supabase
        .from('approved_emails')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (emails) {
        setApprovedEmails(emails);
      }

      setNewEmail({ email: '', role: 'trainer', notes: '' });
      setShowAddEmail(false);

    } catch (error) {
      console.error('Error adding approved email:', error);
      alert('Er ging iets mis bij het toevoegen van het e-mailadres');
    }
  };

  const handleAddUser = async () => {
    try {
      console.log('Creating user:', newUser);
      
      const createdUser: AdminUser = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: 'active',
        last_login: 'Nooit',
        created_at: new Date().toISOString(),
        groups_assigned: 0
      };
      
      setUsers([...users, createdUser]);
      setNewUser({ name: '', email: '', role: 'trainer', password: '' });
      setShowAddUser(false);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (confirm(`Weet je zeker dat je ${userName} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`)) {
      try {
        // TODO: Implement actual deletion via Supabase
        // await supabase.from('users').delete().eq('id', userId);
        
        setUsers(users.filter(u => u.id !== userId));
        alert(`${userName} is succesvol verwijderd.`);
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Er ging iets mis bij het verwijderen van de gebruiker.');
      }
    }
  };
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Location management handlers
  const handleAddLocation = async () => {
    try {
      if (!newLocation.name.trim()) {
        toast.error('Locatienaam is verplicht');
        return;
      }

      const createdLocation = await locationService.createLocation({
        name: newLocation.name.trim(),
        address: newLocation.address?.trim() || undefined,
        description: newLocation.description?.trim() || undefined
      });

      setLocations([...locations, createdLocation]);
      setNewLocation({ name: '', address: '', description: '' });
      setShowAddLocation(false);
      toast.success('Locatie succesvol aangemaakt');
      
    } catch (error) {
      console.error('Error creating location:', error);
      toast.error(error instanceof Error ? error.message : 'Er ging iets mis bij het aanmaken van de locatie');
    }
  };

  const handleEditLocation = async () => {
    if (!selectedLocation) return;
    
    try {
      const updatedLocation = await locationService.updateLocation(selectedLocation.id, {
        name: selectedLocation.name.trim(),
        address: selectedLocation.address?.trim() || undefined,
        description: selectedLocation.description?.trim() || undefined
      });

      setLocations(locations.map(loc => loc.id === updatedLocation.id ? updatedLocation : loc));
      setSelectedLocation(null);
      toast.success('Locatie succesvol bijgewerkt');

    } catch (error) {
      console.error('Error updating location:', error);
      toast.error(error instanceof Error ? error.message : 'Er ging iets mis bij het bijwerken van de locatie');
    }
  };

  const handleDeleteLocation = async (id: string, name: string) => {
    if (!confirm(`Weet je zeker dat je de locatie "${name}" wilt verwijderen?`)) return;

    try {
      await locationService.deleteLocation(id);
      setLocations(locations.filter(loc => loc.id !== id));
      toast.success('Locatie succesvol verwijderd');
      
    } catch (error) {
      console.error('Error deleting location:', error);
      toast.error(error instanceof Error ? error.message : 'Er ging iets mis bij het verwijderen van de locatie');
    }
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getRequestStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">Beheer gebruikers en systeeminstellingen</p>
          <p className="text-sm text-green-600 mt-1">Ingelogd als: {user?.email}</p>
        </div>
        <Button onClick={() => setShowAddUser(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Nieuwe Gebruiker
        </Button>
      </div>      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totaal Gebruikers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locaties</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locations.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {registrationRequests.filter(r => r.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Emails</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedEmails.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beheerders</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>      {/* Quick Fix Section */}
      <Card className="border-orange-200 bg-orange-50 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-orange-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800 mb-2">Database Fix Beschikbaar</h3>
              <p className="text-sm text-orange-700 mb-3">
                Als je problemen hebt met het toevoegen van groepen, trainingsessies, leden of oefeningen, 
                klik dan op onderstaande knop om de database configuratie te repareren.
              </p>
              <Button asChild variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                <Link href="/database-fix">
                  <Settings className="h-4 w-4 mr-2" />
                  Database Fix Uitvoeren
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-6">        <TabsList>
          <TabsTrigger value="users">Gebruikersbeheer</TabsTrigger>
          <TabsTrigger value="location-management">Locatiebeheer</TabsTrigger>
          <TabsTrigger value="email-management">Email Beheer</TabsTrigger>
          <TabsTrigger value="registration-requests">Registratie Aanvragen</TabsTrigger>
          <TabsTrigger value="settings">Systeem Instellingen</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Gebruikersbeheer</CardTitle>
              <CardDescription>Beheer gebruikers en hun rollen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search functionality */}
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Label htmlFor="user-search">Zoeken op naam of e-mail</Label>
                    <Input
                      id="user-search"
                      placeholder="Typ een naam of e-mailadres..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="text-sm text-muted-foreground mt-6">
                    {filteredUsers.length} van {users.length} gebruikers
                  </div>
                </div>

                <div className="border rounded-lg">
                  <div className="p-4 border-b">
                    <h3 className="font-medium">Huidige Gebruikers</h3>
                  </div>
                  <div className="divide-y">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((userItem) => (
                        <div key={userItem.id} className="p-4 flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{userItem.name}</p>
                            <p className="text-sm text-muted-foreground">{userItem.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Aangemaakt: {new Date(userItem.created_at).toLocaleDateString('nl-NL')}</span>
                              {userItem.last_login !== 'Nooit' && (
                                <span>Laatste login: {new Date(userItem.last_login).toLocaleDateString('nl-NL')}</span>
                              )}
                              {userItem.groups_assigned > 0 && (
                                <span>{userItem.groups_assigned} groep(en) toegewezen</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <Badge className={getRoleColor(userItem.role)}>
                                {userItem.role === 'admin' ? 'Beheerder' : 'Trainer'}
                              </Badge>
                              <Badge className={getStatusColor(userItem.status)}>
                                {userItem.status === 'active' ? 'Actief' : 'Inactief'}
                              </Badge>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(userItem)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Bewerken
                              </Button>
                              {userItem.id !== user?.id && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteUser(userItem.id, userItem.name)}
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Verwijderen
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2" />
                        <p>
                          {searchTerm 
                            ? `Geen gebruikers gevonden voor "${searchTerm}"`
                            : 'Geen gebruikers gevonden'
                          }
                        </p>
                        {searchTerm && (
                          <Button 
                            variant="link" 
                            onClick={() => setSearchTerm('')}
                            className="mt-2"
                          >
                            Zoekopdracht wissen
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>        </TabsContent>

        <TabsContent value="location-management">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Locatiebeheer</CardTitle>
                  <CardDescription>Beheer trainingslocaties en sportfaciliteiten</CardDescription>
                </div>
                <Button onClick={() => setShowAddLocation(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Locatie Toevoegen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Beschikbare Locaties</h3>
                </div>
                <div className="divide-y">
                  {locations.length > 0 ? locations.map((location) => (
                    <div key={location.id} className="p-4 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{location.name}</p>
                            {location.address && (
                              <p className="text-sm text-muted-foreground">{location.address}</p>
                            )}
                            {location.description && (
                              <p className="text-sm text-muted-foreground mt-1">{location.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(location.created_at).toLocaleDateString('nl-NL')}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedLocation(location)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Bewerken
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteLocation(location.id, location.name)}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Verwijderen
                          </Button>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Settings className="h-8 w-8 mx-auto mb-2" />
                      <p>Geen locaties gevonden</p>
                      <Button 
                        variant="link" 
                        onClick={() => setShowAddLocation(true)}
                        className="mt-2"
                      >
                        Eerste locatie toevoegen
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email-management">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Email Beheer</CardTitle>
                  <CardDescription>Beheer goedgekeurde e-mailadressen voor registratie</CardDescription>
                </div>
                <Button onClick={() => setShowAddEmail(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  E-mail Toevoegen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <div className="p-4 border-b">
                  <h3 className="font-medium">Goedgekeurde E-mailadressen</h3>
                </div>
                <div className="divide-y">
                  {approvedEmails.map((email) => (
                    <div key={email.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{email.email}</p>
                        {email.notes && (
                          <p className="text-sm text-muted-foreground">{email.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(email.role)}>
                          {email.role === 'admin' ? 'Beheerder' : 'Trainer'}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(email.created_at).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registration-requests">
          <Card>
            <CardHeader>
              <CardTitle>Registratie Aanvragen</CardTitle>
              <CardDescription>Bekijk en behandel nieuwe registratie aanvragen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrationRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium">{request.name}</h3>
                        <p className="text-sm text-muted-foreground">{request.email}</p>
                        {request.message && (
                          <p className="text-sm mt-2">{request.message}</p>
                        )}
                      </div>
                      <Badge className={getRequestStatusColor(request.status)}>
                        {request.status === 'pending' ? 'In afwachting' : 
                         request.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Aangevraagd: {new Date(request.requested_at).toLocaleString('nl-NL')}
                      </p>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleApproveRequest(request.id, 'approved')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Goedkeuren
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleApproveRequest(request.id, 'rejected')}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Afwijzen
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {registrationRequests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-8 w-8 mx-auto mb-2" />
                    <p>Geen registratie aanvragen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Systeem Instellingen</CardTitle>
              <CardDescription>
                Configureer systeem-brede instellingen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Algemene Instellingen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="org-name">Organisatienaam</Label>
                      <Input id="org-name" defaultValue="BV Floriande" />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Contact E-mail</Label>
                      <Input id="contact-email" defaultValue="info@bvfloriande.nl" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Trainings Instellingen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="session-duration">Standaard Sessie Duur (minuten)</Label>
                      <Input id="session-duration" type="number" defaultValue="90" />
                    </div>
                    <div>
                      <Label htmlFor="max-participants">Max Deelnemers per Groep</Label>
                      <Input id="max-participants" type="number" defaultValue="15" />
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Instellingen Opslaan</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Email Modal */}
      {showAddEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">E-mail Toevoegen aan Goedgekeurde Lijst</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddEmail(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-email-address">E-mailadres</Label>
                <Input
                  id="new-email-address"
                  type="email"
                  value={newEmail.email}
                  onChange={(e) => setNewEmail({...newEmail, email: e.target.value})}
                  placeholder="naam@bvfloriande.nl"
                />
              </div>
              <div>
                <Label htmlFor="new-email-role">Rol</Label>
                <Select 
                  value={newEmail.role} 
                  onValueChange={(value: 'admin' | 'trainer') => setNewEmail({...newEmail, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="admin">Beheerder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-email-notes">Notities (optioneel)</Label>
                <Textarea
                  id="new-email-notes"
                  value={newEmail.notes}
                  onChange={(e) => setNewEmail({...newEmail, notes: e.target.value})}
                  placeholder="Aanvullende informatie..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddApprovedEmail} className="flex-1">
                  E-mail Toevoegen
                </Button>
                <Button variant="outline" onClick={() => setShowAddEmail(false)} className="flex-1">
                  Annuleren
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nieuwe Gebruiker Toevoegen</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddUser(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-name">Naam</Label>
                <Input
                  id="new-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Volledige naam"
                />
              </div>
              <div>
                <Label htmlFor="new-email">E-mail</Label>
                <Input
                  id="new-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="email@bvfloriande.nl"
                />
              </div>
              <div>
                <Label htmlFor="new-role">Rol</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: 'admin' | 'trainer') => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="admin">Beheerder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-password">Tijdelijk Wachtwoord</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Minimaal 6 tekens"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddUser} className="flex-1">
                  Gebruiker Aanmaken
                </Button>
                <Button variant="outline" onClick={() => setShowAddUser(false)} className="flex-1">
                  Annuleren
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Gebruiker Bewerken</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Naam</Label>
                <Input
                  id="edit-name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  placeholder="Volledige naam"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">E-mail</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  placeholder="email@bvfloriande.nl"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Rol</Label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(value: 'admin' | 'trainer') => setSelectedUser({...selectedUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="admin">Beheerder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={selectedUser.status} 
                  onValueChange={(value: 'active' | 'inactive') => setSelectedUser({...selectedUser, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Actief</SelectItem>
                    <SelectItem value="inactive">Inactief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => {
                    // TODO: Implement actual update via Supabase
                    setUsers(users.map(u => u.id === selectedUser.id ? selectedUser : u));
                    setSelectedUser(null);
                    alert('Gebruiker succesvol bijgewerkt');
                  }} 
                  className="flex-1"
                >
                  Wijzigingen Opslaan
                </Button>
                <Button variant="outline" onClick={() => setSelectedUser(null)} className="flex-1">
                  Annuleren
                </Button>
              </div>
            </div>
          </div>
        </div>      )}

      {/* Add Location Modal */}
      {showAddLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Nieuwe Locatie Toevoegen</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAddLocation(false)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-location-name">Naam *</Label>
                <Input
                  id="new-location-name"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({...newLocation, name: e.target.value})}
                  placeholder="Bijv. Sporthal Floriande"
                />
              </div>
              <div>
                <Label htmlFor="new-location-address">Adres</Label>
                <Input
                  id="new-location-address"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({...newLocation, address: e.target.value})}
                  placeholder="Straat 123, 1234 AB Plaats"
                />
              </div>
              <div>
                <Label htmlFor="new-location-description">Beschrijving</Label>
                <Textarea
                  id="new-location-description"
                  value={newLocation.description}
                  onChange={(e) => setNewLocation({...newLocation, description: e.target.value})}
                  placeholder="Aanvullende informatie over de locatie..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddLocation} className="flex-1">
                  Locatie Toevoegen
                </Button>
                <Button variant="outline" onClick={() => setShowAddLocation(false)} className="flex-1">
                  Annuleren
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Locatie Bewerken</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLocation(null)}>
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-location-name">Naam *</Label>
                <Input
                  id="edit-location-name"
                  value={selectedLocation.name}
                  onChange={(e) => setSelectedLocation({...selectedLocation, name: e.target.value})}
                  placeholder="Bijv. Sporthal Floriande"
                />
              </div>
              <div>
                <Label htmlFor="edit-location-address">Adres</Label>
                <Input
                  id="edit-location-address"
                  value={selectedLocation.address || ''}
                  onChange={(e) => setSelectedLocation({...selectedLocation, address: e.target.value})}
                  placeholder="Straat 123, 1234 AB Plaats"
                />
              </div>
              <div>
                <Label htmlFor="edit-location-description">Beschrijving</Label>
                <Textarea
                  id="edit-location-description"
                  value={selectedLocation.description || ''}
                  onChange={(e) => setSelectedLocation({...selectedLocation, description: e.target.value})}
                  placeholder="Aanvullende informatie over de locatie..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleEditLocation} className="flex-1">
                  Wijzigingen Opslaan
                </Button>
                <Button variant="outline" onClick={() => setSelectedLocation(null)} className="flex-1">
                  Annuleren
                </Button>
              </div>
            </div>          </div>
        </div>
      )}
    </div>  );
}

// Wrap met chunk error recovery voor betere error handling
export default function AdminDashboardWithErrorRecovery() {
  // Recovery voor ChunkLoadErrors en gerelateerde problemen
  return (
    <PageChunkErrorRecovery>
      <AdminDashboardComponent />
    </PageChunkErrorRecovery>
  );
}
