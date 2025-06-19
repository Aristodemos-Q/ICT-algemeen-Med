/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  User, 
  Crown, 
  AlertTriangle,
  UserCog,
  Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminService, type UserWithRole } from '@/lib/admin-service';

export default function UserManagementPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Updated admin check
  const isAdmin = user?.user_metadata?.role === 'admin' || 
                  user?.email === 'qdelarambelje@gmail.com' ||
                  user?.email === 'admin@bvfloriande.nl';

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const usersData = await adminService.getUsersWithRoles();
      setUsers(usersData);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Er is een fout opgetreden bij het laden van gebruikers.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromoteToAdmin = async (userId: string, userName: string) => {
    if (!confirm(`Weet je zeker dat je ${userName} wilt promoveren tot admin?`)) return;
    
    try {
      setActionLoading(userId);
      await adminService.promoteUserToAdmin(userId);
      await loadUsers();
      setError(null);
    } catch (err: any) {
      console.error('Error promoting user:', err);
      setError(err.message || 'Er is een fout opgetreden bij het promoveren van de gebruiker.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemoteToTrainer = async (userId: string, userName: string) => {
    if (!confirm(`Weet je zeker dat je ${userName} wilt degraderen naar trainer? Deze actie kan niet ongedaan worden gemaakt.`)) return;
    
    try {
      setActionLoading(userId);
      await adminService.demoteAdminToTrainer(userId);
      await loadUsers();
      setError(null);
    } catch (err: any) {
      console.error('Error demoting user:', err);
      setError(err.message || 'Er is een fout opgetreden bij het degraderen van de gebruiker.');
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-red-600 mb-2">Toegang Geweigerd</h1>
              <p className="text-gray-600">Je hebt geen beheerrechten om deze pagina te bekijken.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const adminUsers = users.filter(u => u.role === 'admin');
  const trainerUsers = users.filter(u => u.role === 'trainer');

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Gebruikersbeheer</h1>
          <p className="text-muted-foreground">Beheer gebruikersrollen en machtigingen</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            <Users className="h-3 w-3 mr-1" />
            {users.length} totaal
          </Badge>
          <Badge variant="destructive" className="text-sm">
            <Shield className="h-3 w-3 mr-1" />
            {adminUsers.length} admins
          </Badge>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Admins Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              Beheerders ({adminUsers.length})
            </CardTitle>
            <CardDescription>
              Gebruikers met volledige toegang tot het systeem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adminUsers.map((adminUser) => (
                <div key={adminUser.id} className="border rounded-lg p-4 bg-yellow-50">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Crown className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">{adminUser.name}</span>
                        <span className="text-sm text-gray-600">{adminUser.email}</span>
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                        {adminUser.id === user?.id && (
                          <Badge variant="outline">Jij</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Lid sinds: {new Date(adminUser.created_at).toLocaleDateString()}
                        {adminUser.last_sign_in_at && (
                          <span className="ml-4">
                            Laatst ingelogd: {new Date(adminUser.last_sign_in_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {adminUser.id !== user?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDemoteToTrainer(adminUser.id, adminUser.name)}
                          disabled={actionLoading === adminUser.id}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {actionLoading === adminUser.id ? 'Bezig...' : 'Degraderen naar Trainer'}
                        </Button>
                      )}
                      {adminUser.id === user?.id && (
                        <Badge variant="outline" className="text-xs">
                          Je kunt jezelf niet degraderen
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {adminUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Geen beheerders gevonden
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Trainers Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-blue-500" />
              Trainers ({trainerUsers.length})
            </CardTitle>
            <CardDescription>
              Gebruikers met trainer toegang
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trainerUsers.map((trainer) => (
                <div key={trainer.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{trainer.name}</span>
                        <span className="text-sm text-gray-600">{trainer.email}</span>
                        <Badge variant="default">
                          <User className="h-3 w-3 mr-1" />
                          Trainer
                        </Badge>
                        <Badge variant={trainer.status === 'active' ? 'default' : 'secondary'}>
                          {trainer.status === 'active' ? 'Actief' : 
                           trainer.status === 'inactive' ? 'Inactief' : 'Geschorst'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500">
                        Lid sinds: {new Date(trainer.created_at).toLocaleDateString()}
                        {trainer.last_sign_in_at && (
                          <span className="ml-4">
                            Laatst ingelogd: {new Date(trainer.last_sign_in_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromoteToAdmin(trainer.id, trainer.name)}
                        disabled={actionLoading === trainer.id}
                        className="text-green-600 hover:text-green-700"
                      >
                        {actionLoading === trainer.id ? 'Bezig...' : 'Promoveren tot Admin'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {trainerUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Geen trainers gevonden
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Box */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800 mb-1">Belangrijk!</h3>
              <p className="text-sm text-yellow-700">
                • Er moet altijd minimaal één admin zijn<br/>
                • Je kunt jezelf niet degraderen van admin<br/>
                • Admin promoties en degradaties zijn onomkeerbaar zonder hulp van een andere admin
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
