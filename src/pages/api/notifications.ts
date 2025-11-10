import type { APIRoute } from "astro";
import { secureAPI } from "../../lib/security";

interface NotificationRequest {
  type: "booking" | "reminder" | "promotion" | "update";
  title: string;
  message: string;
  recipientEmail?: string;
  recipientPhone?: string;
  bookingId?: string;
}

export const POST: APIRoute = secureAPI(
  async (
    request: Request,
    sanitizedBody: NotificationRequest,
  ): Promise<Response> => {
    const { type, title, message, recipientEmail, recipientPhone, bookingId } =
      sanitizedBody;
    try {
      if (!type || !title || !message) {
        return new Response(
          JSON.stringify({
            error: "type, title, and message are required",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
      // Simulate API calls
      const results = {
        emailSent: !!recipientEmail,
        smsSent: !!recipientPhone,
        pushSent: true,
        stored: true,
      };
      return new Response(
        JSON.stringify({
          success: true,
          results,
          notificationId: `notif_${Date.now()}`,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      return new Response(
        JSON.stringify({
          error: "Failed to send notification",
          details: error.message,
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
  {
    requiredFields: ["type", "title", "message"],
    requireAuth: false,
    rateLimitBy: "ip",
    rateLimitMax: 10,
    rateLimitWindowMs: 60000,
    maxBodyBytes: 1024 * 10,
  },
);

// GET endpoint for retrieving notification history
export const GET: APIRoute = secureAPI(
  async (request: Request) => {
    try {
      // In a real application, you would fetch from database
      // For now, return mock data
      const mockNotifications = [
        {
          id: "notif_1",
          type: "booking",
          title: "Termín potvrdený",
          message: "Váš termín na 15.10.2024 o 14:00 bol potvrdený",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
          read: false,
        },
        {
          id: "notif_2",
          type: "promotion",
          title: "Špeciálna ponuka",
          message: "Zľava 20% na všetky služby tento týždeň!",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
          read: true,
        },
      ];

      // TODO: Implement real notification fetching here
      return new Response(
        JSON.stringify({
          notifications: [],
          total: 0,
          unread: 0,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error: any) {
      console.error("Get notifications error:", error);

      return new Response(
        JSON.stringify({
          error: "Failed to retrieve notifications",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
  {
    requireAuth: false,
    rateLimitBy: "ip",
    rateLimitMax: 20,
    rateLimitWindowMs: 60000,
  },
);
