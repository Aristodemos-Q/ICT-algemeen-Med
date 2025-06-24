/*
 * MedCheck+ Medical Practice Portal
 * © 2025 qdela. All rights reserved.
 * 
 * Privacy - Patient Privacy Settings
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Lock, Share2, Bell, Mail, Phone, FileText } from 'lucide-react';

interface PrivacySettings {
  dataSharing: {
    medicalResearch: boolean;
    qualityImprovement: boolean;
    anonymousStatistics: boolean;
  };
  communications: {
    emailNotifications: boolean;
    smsReminders: boolean;
    phoneCallReminders: boolean;
    marketingEmails: boolean;
  };
  dataAccess: {
    familyAccess: boolean;
    emergencyAccess: boolean;
    thirdPartyAccess: boolean;
  };
  visibility: {
    profileVisible: boolean;
    appointmentHistory: boolean;
    medicalHistory: boolean;
  };
}

export default function PrivacyPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PrivacySettings>({
    dataSharing: {
      medicalResearch: false,
      qualityImprovement: true,
      anonymousStatistics: true,
    },
    communications: {
      emailNotifications: true,
      smsReminders: true,
      phoneCallReminders: false,
      marketingEmails: false,
    },
    dataAccess: {
      familyAccess: false,
      emergencyAccess: true,
      thirdPartyAccess: false,
    },
    visibility: {
      profileVisible: false,
      appointmentHistory: false,
      medicalHistory: false,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    try {
      // Hier zou je de privacy instellingen van de gebruiker laden
      // Voor nu gebruiken we de default waarden
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const updateSetting = (category: keyof PrivacySettings, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      // Hier zou je de instellingen opslaan
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const ToggleSwitch = ({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) => (
    <button
      type="button"
      title={`${label} ${checked ? 'uitschakelen' : 'inschakelen'}`}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
        checked ? 'bg-primary' : 'bg-gray-200'
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Instellingen</h1>
          <p className="text-gray-500 mt-1">Beheer uw privacy en gegevensinstellingen</p>
        </div>
        <div className="flex gap-2">
          {saveSuccess && (
            <Badge className="bg-green-100 text-green-800">
              Instellingen opgeslagen
            </Badge>
          )}
          <Button onClick={saveSettings} disabled={isLoading}>
            {isLoading ? 'Opslaan...' : 'Wijzigingen Opslaan'}
          </Button>
        </div>
      </div>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-600" />
            <CardTitle>Gegevens Delen</CardTitle>
          </div>
          <CardDescription>
            Bepaal hoe uw medische gegevens gebruikt mogen worden voor onderzoek en verbetering van zorg
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Medisch Onderzoek</h4>
              <p className="text-sm text-gray-500">Sta toe dat uw geanonimiseerde gegevens gebruikt worden voor medisch onderzoek</p>
            </div>            <ToggleSwitch
              checked={settings.dataSharing.medicalResearch}
              onChange={(value) => updateSetting('dataSharing', 'medicalResearch', value)}
              label="Medisch Onderzoek"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Kwaliteitsverbetering</h4>
              <p className="text-sm text-gray-500">Help mee om onze dienstverlening te verbeteren</p>
            </div>            <ToggleSwitch
              checked={settings.dataSharing.qualityImprovement}
              onChange={(value) => updateSetting('dataSharing', 'qualityImprovement', value)}
              label="Kwaliteitsverbetering"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Anonieme Statistieken</h4>
              <p className="text-sm text-gray-500">Draag bij aan algemene gezondheidsstatistieken</p>
            </div>            <ToggleSwitch
              checked={settings.dataSharing.anonymousStatistics}
              onChange={(value) => updateSetting('dataSharing', 'anonymousStatistics', value)}
              label="Anonieme Statistieken"
            />
          </div>
        </CardContent>
      </Card>

      {/* Communications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-600" />
            <CardTitle>Communicatie Voorkeuren</CardTitle>
          </div>
          <CardDescription>
            Stel in hoe en wanneer wij contact met u opnemen
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div className="space-y-1">
                <h4 className="font-medium">Email Notificaties</h4>
                <p className="text-sm text-gray-500">Ontvang belangrijke updates via email</p>
              </div>
            </div>            <ToggleSwitch
              checked={settings.communications.emailNotifications}
              onChange={(value) => updateSetting('communications', 'emailNotifications', value)}
              label="Email Notificaties"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div className="space-y-1">
                <h4 className="font-medium">SMS Herinneringen</h4>
                <p className="text-sm text-gray-500">Ontvang afspraak herinneringen via SMS</p>
              </div>
            </div>            <ToggleSwitch
              checked={settings.communications.smsReminders}
              onChange={(value) => updateSetting('communications', 'smsReminders', value)}
              label="SMS Herinneringen"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-400" />
              <div className="space-y-1">
                <h4 className="font-medium">Telefoon Herinneringen</h4>
                <p className="text-sm text-gray-500">Ontvang telefonische herinneringen voor belangrijke afspraken</p>
              </div>
            </div>            <ToggleSwitch
              checked={settings.communications.phoneCallReminders}
              onChange={(value) => updateSetting('communications', 'phoneCallReminders', value)}
              label="Telefoon Herinneringen"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-gray-400" />
              <div className="space-y-1">
                <h4 className="font-medium">Marketing Emails</h4>
                <p className="text-sm text-gray-500">Ontvang informatie over nieuwe diensten en aanbiedingen</p>
              </div>
            </div>            <ToggleSwitch
              checked={settings.communications.marketingEmails}
              onChange={(value) => updateSetting('communications', 'marketingEmails', value)}
              label="Marketing Emails"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Privacy Verklaring</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-800 mb-3">
            Uw privacy is van het grootste belang voor ons. Alle gegevens worden verwerkt volgens de AVG (GDPR) 
            en Nederlandse privacywetgeving.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Lees Privacy Verklaring
            </Button>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Download Mijn Gegevens
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
