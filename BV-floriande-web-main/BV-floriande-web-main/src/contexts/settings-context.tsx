/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from '@/lib/translations';

// Define types for our settings
export interface UserSettings {
  language: string;
  dateFormat: 'dmy' | 'mdy' | 'ymd';
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    app: boolean;
    alerts: boolean;
    updates: boolean;
    reports: boolean;
  };
  dataSharingConsent: boolean;
}

// Default settings
const defaultSettings: UserSettings = {
  language: 'english',
  dateFormat: 'dmy',
  timeFormat: '24h',
  notifications: {
    email: true,
    app: true,
    alerts: true,
    updates: false,
    reports: true
  },
  dataSharingConsent: false
};

// Create context
interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  updateNotification: (key: keyof UserSettings['notifications'], value: boolean) => void;
  resetSettings: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  saveSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load settings from localStorage when component mounts
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);
          
          // Apply language setting to the document immediately
          if (parsedSettings.language) {
            applyLanguageSettings(parsedSettings.language);
          }
        }
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
      setInitialized(true);
    };

    loadSettings();
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    if (!initialized) return;
    
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      console.log('Settings saved to localStorage');
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }, [settings, initialized]);

  // Function to update settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  // Function to update notification settings
  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  // Function to reset settings
  const resetSettings = () => {
    setSettings(defaultSettings);
  };  // Function to apply language settings to the document
  const applyLanguageSettings = (language: string) => {
    if (typeof window !== 'undefined') {
      // Apply language setting to HTML element
      document.documentElement.setAttribute('lang', language === 'dutch' ? 'nl' : 'en');
      
      // Also set data attributes that can be used by CSS for language-specific styles
      document.documentElement.setAttribute('data-language', language);
    }
  };
  
  // Function to simulate saving settings to an API
  const saveSettings = async () => {
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // Apply language changes immediately
      applyLanguageSettings(settings.language);
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error; // Let the calling component handle the error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      updateNotification,
      resetSettings,
      isSaving,
      saveSuccess,
      saveSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use the settings context
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
