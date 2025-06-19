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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Clock,
  Shield,
  User
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminService, type ApprovedEmail, type RegistrationRequest } from '@/lib/admin-service';

export default function EmailManagementPage() {
  const { user } = useAuth();
  const [approvedEmails, setApprovedEmails] = useState<ApprovedEmail[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add Email Form
  const [newEmail, setNewEmail] = useState('');
  const [newEmailRole, setNewEmailRole] = useState<'admin' | 'trainer'>('trainer');
  const [newEmailNotes, setNewEmailNotes] = useState('');

  const isAdmin = user?.user_metadata?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [emails, requests] = await Promise.all([
        adminService.getApprovedEmails(),
        adminService.getRegistrationRequests()
      ]);
      setApprovedEmails(emails);
      setRegistrationRequests(requests);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Er is een fout opgetreden bij het laden van de gegevens.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.trim()) return;
    
    try {
      await adminService.addApprovedEmail(newEmail.trim(), newEmailRole, newEmailNotes.trim() || undefined);
      setNewEmail('');
      setNewEmailNotes('');
      await loadData();
    } catch (err) {
      console.error('Error adding email:', err);
      setError('Er is een fout opgetreden bij het toevoegen van de e-mail.');
    }
  };

  const handleRemoveEmail = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze goedgekeurde e-mail wilt verwijderen?')) return;
    
    try {
      await adminService.removeApprovedEmail(id);
      await loadData();
    } catch (err) {
      console.error('Error removing email:', err);
      setError('Er is een fout opgetreden bij het verwijderen van de e-mail.');
    }
  };

  const handleReviewRequest = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      await adminService.reviewRegistrationRequest(requestId, status, notes);
      await loadData();
    } catch (err) {
      console.error('Error reviewing request:', err);
      setError('Er is een fout opgetreden bij het beoordelen van het verzoek.');
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

  const pendingRequests = registrationRequests.filter(req => req.status === 'pending');

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">E-mail Goedkeuring Beheer</h1>
          <p className="text-muted-foreground">Beheer wie zich kan registreren op het platform</p>
        </div>
        {pendingRequests.length > 0 && (
          <Badge variant="destructive" className="text-sm">
            {pendingRequests.length} nieuwe verzoeken
          </Badge>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Tabs defaultValue="approved" className="space-y-6">
        <TabsList>
          <TabsTrigger value="approved">Goedgekeurde E-mails</TabsTrigger>
          <TabsTrigger value="requests" className="relative">
            Registratie Verzoeken
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approved">
          <div className="grid gap-6">
            {/* Add New Email */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Nieuwe E-mail Goedkeuren
                </CardTitle>
                <CardDescription>
                  Voeg een e-mailadres toe dat zich direct kan registreren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="email">E-mailadres</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="naam@bvfloriande.nl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select value={newEmailRole} onValueChange={(value: 'admin' | 'trainer') => setNewEmailRole(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trainer">Trainer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="add-btn" className="invisible">Actie</Label>
                    <Button onClick={handleAddEmail} className="w-full" disabled={!newEmail.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Toevoegen
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="notes">Notities (optioneel)</Label>
                  <Textarea
                    id="notes"
                    value={newEmailNotes}
                    onChange={(e) => setNewEmailNotes(e.target.value)}
                    placeholder="Bijv: Nieuwe trainer voor groep X"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Approved Emails List */}
            <Card>
              <CardHeader>
                <CardTitle>Goedgekeurde E-mailadressen ({approvedEmails.length})</CardTitle>
                <CardDescription>
                  Deze e-mailadressen kunnen zich direct registreren
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {approvedEmails.map((approvedEmail) => (
                    <div key={approvedEmail.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">{approvedEmail.email}</span>
                            <Badge variant={approvedEmail.role === 'admin' ? 'destructive' : 'default'}>
                              {approvedEmail.role === 'admin' ? (
                                <>
                                  <Shield className="h-3 w-3 mr-1" />
                                  Admin
                                </>
                              ) : (
                                <>
                                  <User className="h-3 w-3 mr-1" />
                                  Trainer
                                </>
                              )}
                            </Badge>
                          </div>
                          {approvedEmail.notes && (
                            <p className="text-sm text-gray-600 mb-2">{approvedEmail.notes}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Goedgekeurd op: {new Date(approvedEmail.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleRemoveEmail(approvedEmail.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {approvedEmails.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Nog geen goedgekeurde e-mailadressen
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Registratie Verzoeken</CardTitle>
              <CardDescription>
                Beoordeel verzoeken van mensen die zich willen registreren
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {registrationRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{request.email}</span>
                          <span className="text-sm text-gray-600">({request.name})</span>
                          <Badge variant={
                            request.status === 'pending' ? 'secondary' :
                            request.status === 'approved' ? 'default' : 'destructive'
                          }>
                            {request.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                            {request.status === 'approved' && <Check className="h-3 w-3 mr-1" />}
                            {request.status === 'rejected' && <X className="h-3 w-3 mr-1" />}
                            {request.status === 'pending' ? 'In afwachting' :
                             request.status === 'approved' ? 'Goedgekeurd' : 'Afgewezen'}
                          </Badge>
                        </div>
                        {request.message && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Bericht:</strong> {request.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Aangevraagd op: {new Date(request.requested_at).toLocaleDateString()}
                        </p>
                        {request.reviewed_at && (
                          <p className="text-xs text-gray-500">
                            Beoordeeld op: {new Date(request.reviewed_at).toLocaleDateString()}
                            {request.review_notes && ` - ${request.review_notes}`}
                          </p>
                        )}
                      </div>
                      {request.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <Button 
                            size="sm"
                            onClick={() => handleReviewRequest(request.id, 'approved', 'Goedgekeurd door admin')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Goedkeuren
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            onClick={() => handleReviewRequest(request.id, 'rejected', 'Afgewezen door admin')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Afwijzen
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {registrationRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    Nog geen registratie verzoeken ontvangen
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
