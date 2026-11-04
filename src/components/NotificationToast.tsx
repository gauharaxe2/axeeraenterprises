import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface NotificationToastProps {
  notification: NotificationState | null;
  onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose
}) => {
  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle2 size={20} />;
      case 'error':
        return <AlertCircle size={20} />;
      case 'info':
      default:
        return <Info size={20} />;
    }
  };

  return (
    <div className={`notification-toast ${notification.type}`}>
      <span style={{ display: 'flex', alignItems: 'center' }}>{getIcon()}</span>
      <span style={{ flex: 1, fontSize: '0.95rem', lineHeight: 1.4 }}>
        {notification.message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          opacity: 0.8
        }}
        aria-label="Close notification"
      >
        <X size={18} />
      </button>
    </div>
  );
};
