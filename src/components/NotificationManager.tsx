import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../lib/i18n.tsx';

interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'reminder' | 'promotion' | 'update';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

interface NotificationManagerProps {
  isVisible: boolean;
  onClose: () => void;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({
  isVisible,
  onClose
}) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load notifications from localStorage
    const saved = localStorage.getItem('papi-notifications');
    if (saved) {
      setNotifications(JSON.parse(saved));
    }

    // Check notification permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // Request permission for notifications
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      setPermission('granted');
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      setPermission(permission);
    }
  };

  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      await requestNotificationPermission();
      return;
    }

    setIsLoading(true);

    try {
      // Simulate booking confirmation
      const testNotification: NotificationData = {
        id: Date.now().toString(),
        title: 'Termín potvrdený! 🎉',
        message: 'Váš termín na zajtra o 14:00 bol úspešne potvrdený. Tešíme sa na vás v PAPI Hair Design!',
        type: 'booking',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/kontakty'
      };

      // Add to local notifications
      const updated = [testNotification, ...notifications];
      setNotifications(updated);
      localStorage.setItem('papi-notifications', JSON.stringify(updated));

      // Send browser notification
      const notification = new Notification(testNotification.title, {
        body: testNotification.message,
        icon: '/assets/android-chrome-192x192.png',
        badge: '/assets/android-chrome-192x192.png',
        tag: 'papi-booking',
        requireInteraction: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
        if (testNotification.actionUrl) {
          window.location.href = testNotification.actionUrl;
        }
      };

      // Auto close after 5 seconds
      setTimeout(() => notification.close(), 5000);

    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(updated);
    localStorage.setItem('papi-notifications', JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(notif => notif.id !== id);
    setNotifications(updated);
    localStorage.setItem('papi-notifications', JSON.stringify(updated));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📅';
      case 'reminder': return '⏰';
      case 'promotion': return '🎁';
      case 'update': return '📢';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking': return 'border-blue-400 bg-blue-400/10';
      case 'reminder': return 'border-amber-400 bg-amber-400/10';
      case 'promotion': return 'border-green-400 bg-green-400/10';
      case 'update': return 'border-purple-400 bg-purple-400/10';
      default: return 'border-gray-400 bg-gray-400/10';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-black border border-amber-400/30 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
              Push Notifikácie
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          {/* Permission Status */}
          <div className="mb-8 p-4 rounded-xl border-2 bg-gray-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${permission === 'granted' ? 'bg-green-400' : permission === 'denied' ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                <div>
                  <p className="text-white font-semibold">
                    Stav notifikácií: {permission === 'granted' ? 'Povolené' : permission === 'denied' ? 'Zamietnuté' : 'Čaká na povolenie'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {permission === 'granted'
                      ? 'Notifikácie sú aktívne pre booking potvrdenia'
                      : permission === 'denied'
                      ? 'Povoľte notifikácie v prehliadači pre lepší zážitok'
                      : 'Kliknite pre povolenie notifikácií'
                    }
                  </p>
                </div>
              </div>

              {permission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  className="bg-gradient-to-r from-amber-400 to-amber-600 text-black font-bold py-2 px-4 rounded-lg hover:from-amber-300 hover:to-amber-500 transition-all"
                >
                  Povoliť
                </button>
              )}
            </div>
          </div>

          {/* Test Notification Button */}
          <div className="mb-8 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendTestNotification}
              disabled={isLoading || permission !== 'granted'}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Odosielam...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Otestovať notifikáciu
                </>
              )}
            </motion.button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">História notifikácií</h3>

            {notifications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5-5-5h5V12h-5l5-5 5 5h-5v5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"></path>
                </svg>
                <p>Žiadne notifikácie</p>
                <p className="text-sm">Otestujte notifikáciu vyššie</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-4 rounded-xl border-2 ${getNotificationColor(notification.type)} ${!notification.read ? 'opacity-100' : 'opacity-60'}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-semibold">{notification.title}</h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span>{new Date(notification.timestamp).toLocaleString()}</span>
                            <span className="capitalize">{notification.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-amber-400 hover:text-amber-300 transition-colors"
                            title="Označiť ako prečítané"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Vymazať"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Nastavenia notifikácií</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Typy notifikácií</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Potvrdenia termínov
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Pripomienky termínov
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input type="checkbox" className="rounded" />
                    Promo akcie a zľavy
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input type="checkbox" defaultChecked className="rounded" />
                    Aktualizácie aplikácie
                  </label>
                </div>
              </div>

              <div className="bg-gray-800/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Frekvencia</h4>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 text-gray-300">
                    <input type="radio" name="frequency" defaultChecked className="rounded-full" />
                    Iba dôležité notifikácie
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input type="radio" name="frequency" className="rounded-full" />
                    Všetky notifikácie
                  </label>
                  <label className="flex items-center gap-2 text-gray-300">
                    <input type="radio" name="frequency" className="rounded-full" />
                    Iba pri akciách
                  </label>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};