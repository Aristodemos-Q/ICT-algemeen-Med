/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { UserSettings } from "@/contexts/settings-context";

/**
 * Format a date according to the user's preferences
 * 
 * @param date Date to format
 * @param dateFormat User's preferred date format (mdy, dmy, ymd)
 * @param timeFormat User's preferred time format (12h, 24h)
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | number,
  dateFormat: UserSettings['dateFormat'],
  timeFormat: UserSettings['timeFormat']
): string {
  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return 'Invalid date';
  }
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  // Format hours based on 12h or 24h preference
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  let ampm = '';
  
  if (timeFormat === '12h') {
    ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  }
  
  const formattedTime = `${String(hours).padStart(2, '0')}:${minutes}${ampm}`;
  
  // Format date according to preference
  let formattedDate = '';
  
  switch (dateFormat) {
    case 'mdy':
      formattedDate = `${month}/${day}/${year}`;
      break;
    case 'dmy':
      formattedDate = `${day}/${month}/${year}`;
      break;
    case 'ymd':
    default:
      formattedDate = `${year}-${month}-${day}`;
      break;
  }
  
  return `${formattedDate}, ${formattedTime}`;
}

/**
 * Format a number according to the user's preferences
 * 
 * @param value Number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

/**
 * Apply language-specific formatting based on user preference
 * 
 * @param key Text key
 * @param language User's preferred language
 * @returns Localized string
 */
export function translate(key: string, language: UserSettings['language']): string {
  // In a real app, you would have proper translations
  // This is just a simple example
  const translations: Record<string, Record<string, string>> = {
    english: {
      'save': 'Save',
      'cancel': 'Cancel',
      'settings': 'Settings',
      'language': 'Language',
      'theme': 'Theme',
    },
    dutch: {
      'save': 'Opslaan',
      'cancel': 'Annuleren',
      'settings': 'Instellingen',
      'language': 'Taal',
      'theme': 'Thema',
    },
    german: {
      'save': 'Speichern',
      'cancel': 'Abbrechen',
      'settings': 'Einstellungen',
      'language': 'Sprache',
      'theme': 'Thema',
    },
    french: {
      'save': 'Enregistrer',
      'cancel': 'Annuler',
      'settings': 'Paramètres',
      'language': 'Langue',
      'theme': 'Thème',
    },
    spanish: {
      'save': 'Guardar',
      'cancel': 'Cancelar',
      'settings': 'Configuración',
      'language': 'Idioma',
      'theme': 'Tema',
    }
  };
  
  const languageDict = translations[language] || translations.english;
  return languageDict[key] || key; // Fall back to key if translation not found
}
