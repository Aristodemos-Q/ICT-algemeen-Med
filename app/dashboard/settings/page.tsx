/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Save,
  AlertCircle,
  Check,
  Info,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useSettings } from "@/contexts/settings-context";
import { useTranslation } from "@/lib/translations";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/lib/authService";
import { useToast } from "@/components/ui/toast";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [mounted, setMounted] = React.useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: ''
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Get auth context
  const { user } = useAuth();
  
  // Get settings from context
  const { 
    settings, 
    updateSettings, 
    updateNotification, 
    saveSettings,
    isSaving, 
    saveSuccess 
  } = useSettings();
  
  // Get translation function based on current language
  const t = useTranslation(settings.language);
  
  const { addToast } = useToast();

  // useEffect only runs on the client, so we can safely show the UI without hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize profile data when user is loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Early return if not mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="w-full mx-auto py-4 px-2">Loading...</div>;
  }
  
  const handleNotificationChange = (key: keyof typeof settings.notifications, checked: boolean) => {
    updateNotification(key, checked);
  };
  
  const handleDataSharingChange = (checked: boolean) => {
    updateSettings({ dataSharingConsent: checked });
  };
  
  const handleSaveSettings = async () => {
    try {
      await saveSettings();
      addToast({
        type: 'success',
        title: t('settingsSaved') || 'Settings saved successfully',
        message: t('settingsSavedDescription') || 'Your settings have been updated.',
        duration: 3000
      });
    } catch (error) {
      addToast({
        type: 'error',
        title: t('settingsError') || 'Error saving settings',
        message: t('settingsErrorDescription') || 'Please try again later.',
        duration: 5000
      });
    }
  };

  // Password change handlers
  const handlePasswordInputChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (passwordErrors.length > 0) {
      setPasswordErrors([]);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (!password || password.length < 8) {
      errors.push(t('passwordMinLength') || 'Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push(t('passwordUppercase') || 'Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push(t('passwordLowercase') || 'Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(password)) {
      errors.push(t('passwordNumber') || 'Password must contain at least one number');
    }
    return errors;
  };

  const handlePasswordChange = async () => {
    const errors: string[] = [];
    
    // Validate current password
    if (!passwordData.currentPassword) {
      errors.push(t('currentPasswordRequired') || 'Current password is required');
    }
    
    // Validate new password
    if (!passwordData.newPassword) {
      errors.push(t('newPasswordRequired') || 'New password is required');
    } else {
      errors.push(...validatePassword(passwordData.newPassword));
    }
    
    // Validate password confirmation
    if (!passwordData.confirmPassword) {
      errors.push(t('confirmPasswordRequired') || 'Password confirmation is required');
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push(t('passwordsDoNotMatch') || 'Passwords do not match');
    }

    if (errors.length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.updatePassword(passwordData.newPassword);
      
      // Reset form and close modal
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordModal(false);
      setPasswordErrors([]);
      
      // Show success message
      addToast({
        type: 'success',
        title: t('passwordChangedSuccessfully') || 'Password changed successfully',
        message: t('passwordChangedDescription') || 'Your password has been updated securely.',
        duration: 3000
      });
    } catch (error) {
      console.error('Password change error:', error);
      setPasswordErrors([error instanceof Error ? error.message : (t('passwordChangeError') || 'Error changing password')]);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors([]);
    setShowPasswords({ current: false, new: false, confirm: false });
  };

  // Profile update handlers
  const handleProfileDataChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateProfile = async () => {
    if (!profileData.fullName.trim()) {
      addToast({
        type: 'error',
        title: t('fullNameRequired') || 'Full name is required',
        duration: 3000
      });
      return;
    }

    setIsUpdatingProfile(true);
    try {
      // Update user metadata in Supabase Auth
      const { error } = await authService.supabase.auth.updateUser({
        data: {
          full_name: profileData.fullName
        }
      });

      if (error) {
        throw error;
      }

      addToast({
        type: 'success',
        title: t('profileUpdatedSuccessfully') || 'Profile updated successfully',
        duration: 3000
      });
    } catch (error) {
      console.error('Profile update error:', error);
      addToast({
        type: 'error',
        title: t('profileUpdateError') || 'Error updating profile',
        message: 'Please try again later.',
        duration: 5000
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  return (
    <div className="w-full mx-auto py-4 px-2">
      <div className="flex justify-between items-center mb-6 px-1">
        <Link 
          href="/" 
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {t('backToDashboard')}
        </Link>
        <h1 className="text-2xl font-bold">{t('settings')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left sidebar with settings categories */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-lg shadow p-4 sticky top-20">
            <Tabs defaultValue="account" orientation="vertical" onValueChange={setActiveTab}>
              <TabsList className="flex flex-col h-auto space-y-2">
                <TabsTrigger value="account" className="justify-start w-full">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{t('accountSettings')}</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start w-full">
                  <div className="flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    <span>{t('notificationPreferences')}</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="justify-start w-full">
                  <div className="flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    <span>{t('privacySecurity')}</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border bg-card p-6 shadow">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsContent value="account" className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">{t('accountSettings')}</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full-name">{t('fullName')}</Label>
                      <Input 
                        id="full-name"
                        type="text" 
                        className="w-full p-2 rounded bg-background border"
                        value={profileData.fullName}
                        onChange={(e) => handleProfileDataChange('fullName', e.target.value)}
                        title={t('enterFullName')}
                        placeholder={t('enterFullName')}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email-address">{t('emailAddress')}</Label>
                      <Input 
                        id="email-address"
                        type="email" 
                        className="w-full p-2 rounded bg-background border"
                        value={profileData.email}
                        title={t('enterEmailAddress')}
                        placeholder={t('enterEmailAddress')}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('emailCannotBeChanged')}
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="user-role">{t('role')}</Label>
                      <Input 
                        id="user-role"
                        type="text" 
                        className="w-full p-2 rounded bg-background border"
                        value={user?.user_metadata?.role || 'User'}
                        disabled
                        title={t('yourCurrentRole')}
                        placeholder={t('yourCurrentRole')}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('contactAdminForRoles')}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                            {t('updating')}...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            {t('updateProfile')}
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">{t('changePassword')}</h3>
                      <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                        {t('changePassword')}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium mb-2">{t('sessions')}</h3>
                  <div className="bg-muted/30 p-3 rounded-md mb-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{t('currentSession')}</p>
                        <p className="text-xs text-muted-foreground">Windows • Chrome • IP: 192.168.1.1</p>
                      </div>
                      <div className="text-xs text-primary">{t('activeNow')}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">{t('notificationPreferences')}</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('emailNotifications')}</p>
                        <p className="text-xs text-muted-foreground">{t('receiveEmailNotifications')}</p>
                      </div>
                      <div>
                        <input 
                          type="checkbox" 
                          id="emailNotif" 
                          className="h-4 w-4 rounded"
                          checked={settings.notifications.email}
                          onChange={(e) => handleNotificationChange('email', e.target.checked)}
                          aria-label={t('receiveEmailNotifications')}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('inAppNotifications')}</p>
                        <p className="text-xs text-muted-foreground">{t('receiveAppNotifications')}</p>
                      </div>
                      <div>
                        <input 
                          type="checkbox" 
                          id="appNotif" 
                          className="h-4 w-4 rounded"
                          checked={settings.notifications.app}
                          onChange={(e) => handleNotificationChange('app', e.target.checked)}
                          aria-label={t('receiveAppNotifications')}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('criticalAlerts')}</p>
                        <p className="text-xs text-muted-foreground">{t('notificationsCriticalEvents')}</p>
                      </div>
                      <div>
                        <input 
                          type="checkbox" 
                          id="alertsNotif" 
                          className="h-4 w-4 rounded"
                          checked={settings.notifications.alerts}
                          onChange={(e) => handleNotificationChange('alerts', e.target.checked)}
                          aria-label={t('notificationsCriticalEvents')}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('systemUpdates')}</p>
                        <p className="text-xs text-muted-foreground">{t('notificationsSystemUpdates')}</p>
                      </div>
                      <div>
                        <input 
                          type="checkbox" 
                          id="updatesNotif" 
                          className="h-4 w-4 rounded"
                          checked={settings.notifications.updates}
                          onChange={(e) => handleNotificationChange('updates', e.target.checked)}
                          aria-label={t('notificationsSystemUpdates')}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('weeklyReports')}</p>
                        <p className="text-xs text-muted-foreground">{t('receiveWeeklyReports')}</p>
                      </div>
                      <div>
                        <input 
                          type="checkbox" 
                          id="reportsNotif" 
                          className="h-4 w-4 rounded"
                          checked={settings.notifications.reports}
                          onChange={(e) => handleNotificationChange('reports', e.target.checked)}
                          aria-label={t('receiveWeeklyReports')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">{t('privacySecurity')}</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t('dataSharingConsent')}</p>
                        <p className="text-xs text-muted-foreground">{t('dataShareConsent')}</p>
                      </div>
                      <div>
                        <input 
                          type="checkbox" 
                          id="dataSharing" 
                          className="h-4 w-4 rounded"
                          checked={settings.dataSharingConsent}
                          onChange={(e) => handleDataSharingChange(e.target.checked)}
                          aria-label={t('dataShareConsent')}
                        />
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">{t('twoFactorAuth')}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{t('twoFactorDescription')}</p>
                      <Button variant="outline" size="sm">
                        {t('configure2FA')}
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium mb-2">{t('dataExport')}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{t('dataExportDescription')}</p>
                      <Button variant="outline" size="sm">
                        {t('requestDataExport')}
                      </Button>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="text-sm font-medium text-destructive mb-2">{t('dangerZone')}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{t('deleteAccountDescription')}</p>
                      <Button variant="destructive" size="sm">
                        {t('deleteAccount')}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Save button section */}
            <div className="mt-8 pt-4 border-t flex justify-between items-center">
              <div className="flex items-center gap-4">
                {saveSuccess && (
                  <div className="flex items-center text-green-600">
                    <Check className="h-4 w-4 mr-1" />
                    <span className="text-sm">{t('settingsSaved')}</span>
                  </div>
                )}
                {/* Toast Test Button - only in development */}
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => addToast({
                      type: 'info',
                      title: 'Toast Test',
                      message: 'This is a test notification to verify the toast system is working!',
                      duration: 3000
                    })}
                    className="text-xs"
                  >
                    Test Toast
                  </Button>
                )}
              </div>
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin"></div>
                    <span>{t('saving')}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    <span>{t('save')} {t('settings')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('changePassword')}</DialogTitle>
            <DialogClose onClick={handleClosePasswordModal} />
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {passwordErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 text-destructive mr-2" />
                  <span className="text-sm font-medium text-destructive">
                    {t('errorOccurred')}
                  </span>
                </div>
                <ul className="mt-2 text-sm text-destructive space-y-1">
                  {passwordErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="current-password">{t('currentPassword')}</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                  placeholder={t('enterCurrentPassword')}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">{t('newPassword')}</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                  placeholder={t('enterNewPassword')}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('passwordRequirements')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">{t('confirmPassword')}</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                  placeholder={t('confirmNewPassword')}
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleClosePasswordModal}
              disabled={isChangingPassword}
            >
              {t('cancel')}
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('changing')}...
                </>
              ) : (
                t('changePassword')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
