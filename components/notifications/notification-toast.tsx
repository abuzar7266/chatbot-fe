'use client';

import { useAppStore } from '@/store/app-store';
import { useEffect } from 'react';

export function NotificationToast() {
  const { notifications, removeNotification } = useAppStore();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => {
        const bgColor = {
          success: 'bg-green-500',
          error: 'bg-red-500',
          warning: 'bg-yellow-500',
          info: 'bg-blue-500',
        }[notification.type];

        return (
          <div
            key={notification.id}
            className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-lg min-w-[300px] flex items-center justify-between`}
          >
            <p>{notification.message}</p>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}

