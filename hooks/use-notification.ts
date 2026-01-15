import { useAppStore } from '@/store/app-store';

/**
 * Hook for managing notifications
 */
export function useNotification() {
  const { addNotification, removeNotification, clearNotifications } = useAppStore();

  const notify = {
    success: (message: string) => {
      addNotification({ message, type: 'success' });
    },
    error: (message: string) => {
      addNotification({ message, type: 'error' });
    },
    warning: (message: string) => {
      addNotification({ message, type: 'warning' });
    },
    info: (message: string) => {
      addNotification({ message, type: 'info' });
    },
  };

  return {
    notify,
    removeNotification,
    clearNotifications,
  };
}

