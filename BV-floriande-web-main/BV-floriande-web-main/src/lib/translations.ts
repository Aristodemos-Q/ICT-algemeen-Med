/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

// Translation system for the Fieldlab Tata Steel application
// This file contains translations for English and Dutch languages

type TranslationKey = string;

export type Translation = {
  [key: TranslationKey]: string;
};

type TranslationDictionary = {
  [language: string]: Translation;
};

// English translations (default)
const en: Translation = {
  // Common
  "save": "Save",
  "cancel": "Cancel",
  "back": "Back",
  "search": "Search",
  "loading": "Loading...",
  "saving": "Saving...",
  "settingsSaved": "Settings saved successfully",
  "backToDashboard": "Back to Dashboard",

  // Navigation
  "dashboard": "Dashboard",
  "settings": "Settings",
  
  // Settings
  "settingsTitle": "Settings",
  "accountSettings": "Account Settings",
  "notificationPreferences": "Notification Preferences",
  "appearanceSettings": "Appearance Settings",
  "privacySecurity": "Privacy & Security",

  // Account Settings
  "fullName": "Full Name",
  "emailAddress": "Email Address",
  "role": "Role",
  "changePassword": "Change Password",
  "resetPassword": "Reset Password",
  "resetPasswordTitle": "Reset Your Password",
  "resetPasswordDescription": "Follow this link to reset the password for your user:",
  "resetPasswordButton": "Reset Password",
  "resetPasswordEmailSubject": "Reset Your Password",
  "resetPasswordEmailGreeting": "Dear user,",
  "resetPasswordEmailText": "Thank you for your request to reset your password at BV Floriande. To reset your password and gain access to all features, please use the link below.",
  "resetPasswordEmailInstructions": "If the button above doesn't work, you can also copy and paste the following link in your browser:",
  "currentPassword": "Current Password",
  "newPassword": "New Password",
  "confirmPassword": "Confirm Password",
  "enterCurrentPassword": "Enter your current password",
  "enterNewPassword": "Enter your new password",
  "confirmNewPassword": "Confirm your new password",
  "passwordRequirements": "Password must be at least 8 characters with uppercase, lowercase, and number",
  "currentPasswordRequired": "Current password is required",
  "newPasswordRequired": "New password is required",
  "confirmPasswordRequired": "Password confirmation is required",
  "passwordsDoNotMatch": "Passwords do not match",
  "passwordMinLength": "Password must be at least 8 characters long",
  "passwordUppercase": "Password must contain at least one uppercase letter",
  "passwordLowercase": "Password must contain at least one lowercase letter",
  "passwordNumber": "Password must contain at least one number",
  "passwordChangedSuccessfully": "Password changed successfully",
  "passwordChangeError": "Error changing password. Please try again.",
  "changing": "Changing",
  "errorOccurred": "An error occurred",
  "emailCannotBeChanged": "Email address cannot be changed",
  "updateProfile": "Update Profile",
  "updating": "Updating",
  "profileUpdatedSuccessfully": "Profile updated successfully",
  "profileUpdateError": "Error updating profile. Please try again.",
  "fullNameRequired": "Full name is required",
  "contactAdminForRoles": "Contact your administrator to change roles",
  "sessions": "Sessions",
  "currentSession": "Current Session",
  "activeNow": "Active Now",
  "settingsSavedDescription": "Your settings have been updated successfully.",
  "settingsError": "Error saving settings",
  "settingsErrorDescription": "Please try again later.",
  "passwordChangedDescription": "Your password has been updated securely.",
  
  // Notifications
  "emailNotifications": "Email Notifications",
  "receiveEmailNotifications": "Receive email notifications for important alerts",
  "inAppNotifications": "In-App Notifications",
  "receiveAppNotifications": "Receive notifications within the application",
  "criticalAlerts": "Critical Alerts",
  "notificationsCriticalEvents": "Notifications for critical system events",
  "systemUpdates": "System Updates",
  "notificationsSystemUpdates": "Notifications about system updates",
  "weeklyReports": "Weekly Reports",
  "receiveWeeklyReports": "Receive weekly performance reports",
  
  // Appearance
  "theme": "Theme",
  "light": "Light",
  "dark": "Dark",
  "system": "System",
  "language": "Language",
  "dateFormat": "Date Format",
  "timeFormat": "Time Format",
  
  // Privacy & Security
  "dataSharingConsent": "Data Sharing Consent",
  "dataShareConsent": "Allow anonymous usage data to be shared for product improvement",
  "twoFactorAuth": "Two-Factor Authentication",
  "twoFactorDescription": "Add an extra layer of security to your account",
  "configure2FA": "Configure 2FA",
  "dataExport": "Data Export",
  "dataExportDescription": "Download all your data from the platform",
  "requestDataExport": "Request Data Export",
  "dangerZone": "Danger Zone",
  "deleteAccount": "Delete Account",
  "deleteAccountDescription": "Permanently delete your account and all associated data"
};

// Dutch translations
const nl: Translation = {
  // Common
  "save": "Opslaan",
  "cancel": "Annuleren",
  "back": "Terug",
  "search": "Zoeken",
  "loading": "Laden...",
  "saving": "Opslaan...",
  "settingsSaved": "Instellingen succesvol opgeslagen",
  "backToDashboard": "Terug naar Dashboard",

  // Navigation
  "dashboard": "Dashboard",
  "settings": "Instellingen",
  
  // Settings
  "settingsTitle": "Instellingen",
  "accountSettings": "Accountinstellingen",
  "notificationPreferences": "Notificatievoorkeuren",
  "appearanceSettings": "Weergave-instellingen",
  "privacySecurity": "Privacy & Beveiliging",

  // Account Settings
  "fullName": "Volledige naam",
  "emailAddress": "E-mailadres",
  "role": "Rol",
  "changePassword": "Wachtwoord wijzigen",
  "resetPassword": "Wachtwoord opnieuw instellen",
  "resetPasswordTitle": "Wachtwoord opnieuw instellen",
  "resetPasswordDescription": "Volg deze link om het wachtwoord voor je account opnieuw in te stellen:",
  "resetPasswordButton": "Wachtwoord opnieuw instellen",
  "resetPasswordEmailSubject": "Wachtwoord opnieuw instellen",
  "resetPasswordEmailGreeting": "Beste gebruiker,",
  "resetPasswordEmailText": "Bedankt voor je verzoek om je wachtwoord opnieuw in te stellen bij BV Floriande. Om je wachtwoord te resetten en toegang te krijgen tot alle functionaliteiten, klik op de onderstaande link.",
  "resetPasswordEmailInstructions": "Als de knop hierboven niet werkt, kun je ook de onderstaande link in je browser kopiëren:",
  "currentPassword": "Huidig wachtwoord",
  "newPassword": "Nieuw wachtwoord",
  "confirmPassword": "Bevestig wachtwoord",
  "enterCurrentPassword": "Voer uw huidige wachtwoord in",
  "enterNewPassword": "Voer uw nieuwe wachtwoord in",
  "confirmNewPassword": "Bevestig uw nieuwe wachtwoord",
  "passwordRequirements": "Wachtwoord moet minimaal 8 tekens lang zijn met hoofdletter, kleine letter en cijfer",
  "currentPasswordRequired": "Huidig wachtwoord is verplicht",
  "newPasswordRequired": "Nieuw wachtwoord is verplicht",
  "confirmPasswordRequired": "Wachtwoordbevestiging is verplicht",
  "passwordsDoNotMatch": "Wachtwoorden komen niet overeen",
  "passwordMinLength": "Wachtwoord moet minimaal 8 tekens lang zijn",
  "passwordUppercase": "Wachtwoord moet minimaal één hoofdletter bevatten",
  "passwordLowercase": "Wachtwoord moet minimaal één kleine letter bevatten",
  "passwordNumber": "Wachtwoord moet minimaal één cijfer bevatten",
  "passwordChangedSuccessfully": "Wachtwoord succesvol gewijzigd",
  "passwordChangeError": "Fout bij het wijzigen van het wachtwoord. Probeer opnieuw.",
  "changing": "Wijzigen",
  "errorOccurred": "Er is een fout opgetreden",
  "emailCannotBeChanged": "E-mailadres kan niet worden gewijzigd",
  "updateProfile": "Profiel bijwerken",
  "updating": "Bijwerken",
  "profileUpdatedSuccessfully": "Profiel succesvol bijgewerkt",
  "profileUpdateError": "Fout bij het bijwerken van het profiel. Probeer opnieuw.",
  "fullNameRequired": "Volledige naam is verplicht",
  "contactAdminForRoles": "Neem contact op met uw beheerder om rollen te wijzigen",
  "sessions": "Sessies",
  "currentSession": "Huidige sessie",
  "activeNow": "Nu actief",
  "settingsSavedDescription": "Uw instellingen zijn succesvol bijgewerkt.",
  "settingsError": "Fout bij het opslaan van instellingen",
  "settingsErrorDescription": "Probeer het later opnieuw.",
  "passwordChangedDescription": "Uw wachtwoord is veilig bijgewerkt.",
  
  // Notifications
  "emailNotifications": "E-mailnotificaties",
  "receiveEmailNotifications": "Ontvang e-mailnotificaties voor belangrijke waarschuwingen",
  "inAppNotifications": "In-app notificaties",
  "receiveAppNotifications": "Ontvang meldingen binnen de applicatie",
  "criticalAlerts": "Kritieke waarschuwingen",
  "notificationsCriticalEvents": "Meldingen voor kritieke systeemgebeurtenissen",
  "systemUpdates": "Systeemupdates",
  "notificationsSystemUpdates": "Meldingen over systeemupdates",
  "weeklyReports": "Wekelijkse rapporten",
  "receiveWeeklyReports": "Ontvang wekelijkse prestatierapporten",
  
  // Appearance
  "theme": "Thema",
  "light": "Licht",
  "dark": "Donker",
  "system": "Systeem",
  "language": "Taal",
  "dateFormat": "Datumnotatie",
  "timeFormat": "Tijdnotatie",
  
  // Privacy & Security
  "dataSharingConsent": "Toestemming voor gegevensdeling",
  "dataShareConsent": "Sta toe dat anonieme gebruiksgegevens worden gedeeld voor productverbetering",
  "twoFactorAuth": "Tweefactorauthenticatie",
  "twoFactorDescription": "Voeg een extra beveiligingslaag toe aan uw account",
  "configure2FA": "2FA configureren",
  "dataExport": "Gegevensexport",
  "dataExportDescription": "Download al uw gegevens van het platform",
  "requestDataExport": "Gegevensexport aanvragen",
  "dangerZone": "Gevarenzone",
  "deleteAccount": "Account verwijderen",
  "deleteAccountDescription": "Verwijder uw account en alle bijbehorende gegevens permanent"
};

// Combine all translations
const translations: TranslationDictionary = {
  english: en,
  dutch: nl
};

export const getTranslation = (language: string, key: TranslationKey): string => {
  // Fallback to English if language is not supported or key doesn't exist
  if (!translations[language] || !translations[language][key]) {
    return translations.english[key] || key;
  }
  
  return translations[language][key];
};

// Create hook to use translations
export const useTranslation = (language: string) => {
  return (key: TranslationKey): string => getTranslation(language, key);
};
