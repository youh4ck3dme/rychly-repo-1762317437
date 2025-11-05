import type { APIRoute } from 'astro';
import { secureAPI } from '../../lib/security';

interface NotificationRequest {
  type: 'booking' | 'reminder' | 'promotion' | 'update';
  title: string;
  message: string;
  recipientEmail?: string;
  recipientPhone?: string;
  bookingId?: string;
}

export const POST: APIRoute = secureAPI(async (request: Request, sanitizedBody: NotificationRequest) => {
  const { type, title, message, recipientEmail, recipientPhone, bookingId } = sanitizedBody;

  try {
    // Validate required fields
    if (!type || !title || !message) {
      return new Response(JSON.stringify({
        error: "type, title, and message are required"
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // In a real application, you would:
    // 1. Send email via nodemailer
    // 2. Send SMS via service like Twilio
    // 3. Send push notification via service like Firebase
    // 4. Store notification in database

    console.log('Sending notification:', {
      type,
      title,
      message,
      recipientEmail,
      recipientPhone,
      bookingId,
      timestamp: new Date().toISOString()
    });

    // Simulate API calls
    const results = {
      emailSent: !!recipientEmail,
      smsSent: !!recipientPhone,
      pushSent: true, // Browser notification
      stored: true
    };

    // Send immediate browser notification if possible
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/assets/android-chrome-192x192.png',
        badge: '/assets/android-chrome-192x192.png',
        tag: `papi-${type}`,
        requireInteraction: type === 'booking'
      });

      // Auto close after 5 seconds for non-booking notifications
      if (type !== 'booking') {
        setTimeout(() => notification.close(), 5000);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results,
      notificationId: `notif_${Date.now()}`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Notification error:', error);

    return new Response(JSON.stringify({
      error: "Failed to send notification",
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}, {
  requiredFields: ['type', 'title', 'message'],
  requireAuth: false, // Public endpoint for booking confirmations
  rateLimitBy: 'ip',
  rateLimitMax: 10,
  rateLimitWindowMs: 60000, // 1 minute
  maxBodyBytes: 1024 * 10, // 10KB max body size
});

// GET endpoint for retrieving notification history
export const GET: APIRoute = secureAPI(async (request: Request) => {
  try {
    // In a real application, you would fetch from database
    // For now, return mock data
    const mockNotifications = [
      {
        id: 'notif_1',
        type: 'booking',
        title: 'Termín potvrdený',
        message: 'Váš termín na 15.10.2024 o 14:00 bol potvrdený',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        read: false
      },
      {
        id: 'notif_2',
        type: 'promotion',
        title: 'Špeciálna ponuka',
        message: 'Zľava 20% na všetky služby tento týždeň!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        read: true
      }
    ];

    return new Response(JSON.stringify({
      notifications: mockNotifications,
      total: mockNotifications.length,
      unread: mockNotifications.filter(n => !n.read).length
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Get notifications error:', error);

    return new Response(JSON.stringify({
      error: "Failed to retrieve notifications"
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}, {
  requireAuth: false,
  rateLimitBy: 'ip',
  rateLimitMax: 20,
  rateLimitWindowMs: 60000,
});