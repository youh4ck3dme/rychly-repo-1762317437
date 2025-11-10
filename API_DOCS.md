# PAPI Hair Design API Documentation

## Overview

PAPI Hair Design provides a comprehensive REST API for AI-powered hair analysis, virtual try-on, and salon management.

Base URL: `https://your-domain.com/api`

All endpoints support JSON request/response format and include proper error handling.

## Authentication

Most endpoints are public for client-side usage. Admin endpoints require API key authentication.

### Headers

```
Authorization: Bearer YOUR_API_TOKEN
Content-Type: application/json
```

## Endpoints

### 1. Hair Analysis API

**Endpoint:** `POST /api/hair/analyze`

AI-powered hair analysis using OpenAI Vision.

**Request Body:**

```json
{
  "imageUrl": "https://example.com/hair-image.jpg",
  "locale": "sk",
  "goals": ["consultationStyle", "hairstylePreference"]
}
```

**Response:**

```json
{
  "hairType": "stredne husté, rovné vlasy",
  "condition": "zdravé, dobre hydratované",
  "faceShape": "oválna",
  "recommendations": [
    {
      "type": "strih",
      "title": "Vrstvený bob s ofinou",
      "description": "Moderný strih, ktorý dodá objem a dynamiku",
      "difficulty": "medium",
      "maintenance": "medium"
    }
  ],
  "confidence": 0.85,
  "language": "sk"
}
```

### 2. Virtual Try-On API

**Endpoint:** `POST /api/hair/virtual-try-on`

Generate virtual hair try-on using AI.

**Request Body:**

```json
{
  "userImage": "https://example.com/user-photo.jpg",
  "suggestion": {
    "name": "Balayage Blonde",
    "hairstyle": "Long Layers",
    "hex": "#D4AF37",
    "description": "Golden blonde balayage",
    "services": ["Farbenie", "Strihanie"]
  }
}
```

**Response:**

```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABA...",
  "confidence": 0.85,
  "method": "ai",
  "processingTime": 2500,
  "note": "Generated using DALL-E 3"
}
```

### 3. Hair Suggestions API

**Endpoint:** `POST /api/hair/suggest`

Get personalized hair style suggestions.

**Request Body:**

```json
{
  "hairType": "straight",
  "faceShape": "oval",
  "preferences": {
    "length": "medium",
    "colorPreference": "natural",
    "condition": "healthy"
  },
  "occasion": "general"
}
```

**Response:**

```json
{
  "suggestions": [
    {
      "type": "style",
      "content": "Vrstvený strih strednej dĺžky s jemnými vlnami"
    },
    {
      "type": "color",
      "content": "Balayage v teplých karamelových tónoch"
    }
  ],
  "confidence": 0.9,
  "method": "ai",
  "personalized": true,
  "totalSuggestions": 5
}
```

### 4. Notifications API

**Endpoint:** `POST /api/notifications`

Send push notifications and emails.

**Request Body:**

```json
{
  "type": "booking",
  "title": "Termín potvrdený! 🎉",
  "message": "Váš termín na zajtra o 14:00 bol úspešne potvrdený",
  "recipientEmail": "customer@example.com",
  "recipientPhone": "+421949459624",
  "bookingId": "booking_123"
}
```

**Response:**

```json
{
  "success": true,
  "results": {
    "emailSent": true,
    "smsSent": true,
    "pushSent": true,
    "stored": true
  },
  "notificationId": "notif_1699123456",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

**Endpoint:** `GET /api/notifications`

Retrieve notification history.

**Response:**

```json
{
  "notifications": [
    {
      "id": "notif_1",
      "type": "booking",
      "title": "Termín potvrdený",
      "message": "Váš termín bol potvrdený",
      "timestamp": "2024-01-15T14:30:00Z",
      "read": false
    }
  ],
  "total": 1,
  "unread": 1
}
```

## Error Handling

All endpoints return appropriate HTTP status codes and error messages.

### Error Response Format:

```json
{
  "error": "Error description",
  "details": "Additional error information",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid API key)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- Hair Analysis: 10 requests per minute per IP
- Virtual Try-On: 5 requests per minute per IP
- Notifications: 10 requests per minute per IP
- General endpoints: 20 requests per minute per IP

## Webhooks

Subscribe to webhook events for real-time updates:

### Supported Events:

- `booking.created`
- `booking.confirmed`
- `booking.cancelled`
- `analysis.completed`
- `payment.received`

### Webhook Payload:

```json
{
  "event": "booking.created",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "bookingId": "booking_123",
    "customerName": "Jana Nováková",
    "service": "AI Hair Analysis",
    "date": "2024-01-16T14:00:00Z"
  }
}
```

## SDK and Libraries

### JavaScript/TypeScript SDK

```typescript
import { PapiHairAPI } from "@papi-hair-design/sdk";

const api = new PapiHairAPI({
  apiKey: "your-api-key",
  baseUrl: "https://api.papihairdesign.sk",
});

// Analyze hair image
const result = await api.hair.analyze({
  imageUrl: "https://example.com/image.jpg",
  locale: "sk",
});

// Generate virtual try-on
const virtualTryOn = await api.hair.virtualTryOn({
  userImage: "https://example.com/user.jpg",
  suggestion: {
    name: "Blonde Balayage",
    hairstyle: "Long Layers",
    hex: "#D4AF37",
  },
});
```

## Testing

Use the provided test scripts:

```bash
# Test all API endpoints
npm run test:api

# Test hair analysis specifically
npm run test:hair-analysis

# Load testing
npm run test:load
```

## Support

For API support and questions:

- Email: api@papihairdesign.sk
- Documentation: https://docs.papihairdesign.sk
- Status Page: https://status.papihairdesign.sk

## Changelog

### Version 2.0.0 (Latest)

- Added AR camera functionality
- Enhanced AI analysis with face detection
- New social sharing features
- Improved PWA capabilities
- Added comprehensive analytics tracking

### Version 1.5.0

- Added virtual try-on API
- Enhanced error handling
- Improved rate limiting
- Added webhook support

### Version 1.0.0

- Initial API release
- Basic hair analysis
- Notification system
- Booking management
