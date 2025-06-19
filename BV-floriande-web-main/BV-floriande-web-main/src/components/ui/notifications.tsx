/*
 * BV Floriande Web Application
 * © 2025 qdela. All rights reserved.
 * 
 * This file is part of the BV Floriande Trainers Platform.
 * Unauthorized copying, modification, or distribution is prohibited.
 */

'use client';

import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationProps {
  message: string;
  type: NotificationType;
  duration?: number;
  onClose?: () => void;
}

const Notification = ({ message, type, duration = 5000, onClose }: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getTypeStyles = (): string => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const getIcon = (): React.ReactElement => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1v-3a1 1 0 00-1-1z" clipRule="evenodd"></path>
          </svg>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-md p-4 border rounded-lg shadow-lg transform transition-all duration-300 ${getTypeStyles()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          className="ml-4 text-gray-400 hover:text-gray-600"
          aria-label="Sluiten"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

let notificationCount = 0;
const PORTAL_ID_PREFIX = 'notification-portal-';

export function notify(message: string, type: NotificationType = 'info', duration: number = 5000): number {
  const id = notificationCount++;
  const portalId = `${PORTAL_ID_PREFIX}${id}`;
  
  // Create portal element if it doesn't exist
  let portalElement = document.getElementById(portalId);
  if (!portalElement) {
    portalElement = document.createElement('div');
    portalElement.id = portalId;
    document.body.appendChild(portalElement);
  }
  
  const root = createRoot(portalElement);
  
  const handleClose = () => {
    root.unmount();
    portalElement?.remove();
  };
  
  root.render(
    <Notification
      message={message}
      type={type}
      duration={duration}
      onClose={handleClose}
    />
  );
  
  return id;
}

export function alert(message: string, type: NotificationType = 'info', duration: number = 7000): number {
  return notify(message, type, duration);
}

export function dismissNotification(id: number): void {
  const portalId = `${PORTAL_ID_PREFIX}${id}`;
  const portalElement = document.getElementById(portalId);
  
  if (portalElement) {
    portalElement.remove();
  }
}
