import React from 'react';
import { useNotification } from '../hooks/useNotification';
import { Notification } from './Notification';

export const NotificationContainer: React.FC = () => {
    const { notifications } = useNotification();

    return (
        <div
            aria-live="polite"
            className="fixed inset-0 flex flex-col items-end px-4 py-6 sm:p-6 pointer-events-none z-[100]"
            style={{ paddingTop: '5.5rem' }}
        >
            <div className="w-full max-w-sm space-y-4">
                {notifications.map((notification) => (
                    <Notification key={notification.id} notification={notification} />
                ))}
            </div>
        </div>
    );
};
