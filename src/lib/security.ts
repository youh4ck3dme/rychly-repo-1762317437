import { timingSafeEqual } from 'node:crypto';

// Enhanced security middleware with comprehensive protection
type SecureAPIOptions = {
  requiredFields?: string[];
  requireAuth?: boolean;
  rateLimitBy?: 'ip' | 'token';
  rateLimitWindowMs?: number;
  rateLimitMax?: number;
  maxBodyBytes?: number;
  honeypotField?: string;
  csp?: string;
  cors?: {
    origins?: string[];
    methods?: string[];
    headers?: string[];
    allowCredentials?: boolean;
  };
  image?: {
    allowHosts?: string[];
    allowExt?: string[];
  };
};

// In-memory rate-limit store (in production use Vercel KV or Redis)
const rateLimitStore = new Map<string, { count: number; ts: number }>();

function now() { return Date.now(); }

function timingSafeEq(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

function getClientIP(request: Request): string {
  // Check for common proxy headers in order of preference
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs: "client, proxy1, proxy2"
    const firstIP = forwardedFor.split(',')[0]?.trim();
    if (firstIP && firstIP !== 'unknown') return firstIP;
  }

  // Check other common headers
  const realIP = request.headers.get('x-real-ip');
  if (realIP && realIP !== 'unknown') return realIP;

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP && cfConnectingIP !== 'unknown') return cfConnectingIP;

  // Fallback for local development
  return request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
         '127.0.0.1';
}

function createJSONResponse(body: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  const headers: HeadersInit = {
    'content-type': 'application/json; charset=utf-8',
    'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
    'x-content-type-options': 'nosniff',
    'x-frame-options': 'DENY',
    'referrer-policy': 'no-referrer',
    'x-xss-protection': '1; mode=block',
    ...extraHeaders
  };
  return new Response(JSON.stringify(body), { status, headers });
}

async function readLimitedJSON(request: Request, maxBytes: number): Promise<any> {
  const reader = request.body?.getReader();
  if (!reader) return {};

  let totalBytes = 0;
  const chunks: Uint8Array[] = [];

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      if (value) {
        totalBytes += value.byteLength;
        if (totalBytes > maxBytes) {
          throw new Error(`Payload too large: ${totalBytes} bytes (max: ${maxBytes})`);
        }
        chunks.push(value);
      }
    }
  } catch (error) {
    throw new Error(`Failed to read request body: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const buffer = Buffer.concat(chunks);
  if (buffer.length === 0) return {};

  try {
    return JSON.parse(buffer.toString('utf8'));
  } catch (error) {
    throw new Error('Invalid JSON payload');
  }
}

function isPrivateIP(host: string): boolean {
  // Basic IP literal and private range detection
  const ipv4Match = host.match(/^(\d{1,3}\.){3}\d{1,3}$/);
  if (ipv4Match) {
    const parts = host.split('.').map(Number);
    // Check for private ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
    return parts[0] === 10 ||
           (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
           (parts[0] === 192 && parts[1] === 168) ||
           parts[0] === 127 ||
           parts[0] === 0;
  }

  // IPv6 loopback
  if (host === '::1' || host === '0:0:0:0:0:0:0:1') return true;

  return false;
}

function validateImageURL(url: string, allowedExts: string[], allowedHosts?: string[]): string | null {
  try {
    const parsedURL = new URL(url);

    // HTTPS only
    if (parsedURL.protocol !== 'https:') {
      return 'Only HTTPS URLs are allowed for images';
    }

    // Block private IPs and IP literals
    if (isPrivateIP(parsedURL.hostname)) {
      return 'Private IP addresses are not allowed';
    }

    // Check against allowed hosts if specified
    if (allowedHosts?.length && !allowedHosts.includes(parsedURL.hostname)) {
      return `Host '${parsedURL.hostname}' is not in the allowed list`;
    }

    // Validate file extension
    const pathname = parsedURL.pathname.toLowerCase();
    const extension = pathname.split('.').pop() || '';

    if (!allowedExts.includes(extension)) {
      return `File extension '.${extension}' is not allowed. Allowed: ${allowedExts.join(', ')}`;
    }

    // Basic sanity checks
    if (pathname.length > 255) {
      return 'URL path is too long';
    }

    if (parsedURL.search.length > 512) {
      return 'URL query parameters are too long';
    }

    return null; // Valid
  } catch (error) {
    return 'Invalid URL format';
  }
}

function applyCORSHeaders(request: Request, corsOptions: {
  origins: string[];
  methods: string[];
  headers: string[];
  allowCredentials: boolean;
}): HeadersInit {
  const origin = request.headers.get('origin') || '';
  const allowAll = corsOptions.origins.includes('*');
  const originAllowed = allowAll || corsOptions.origins.includes(origin);

  const headers: HeadersInit = {
    'access-control-allow-origin': originAllowed ? (allowAll ? '*' : origin) : 'null',
    'access-control-allow-methods': corsOptions.methods.join(','),
    'access-control-allow-headers': corsOptions.headers.join(','),
    'vary': 'Origin',
  };

  if (corsOptions.allowCredentials && originAllowed) {
    headers['access-control-allow-credentials'] = 'true';
  }

  return headers;
}

/**
 * Enhanced secure API wrapper with comprehensive security features
 */
export function secureAPI(
  handler: (request: Request, sanitizedBody: any) => Promise<Response> | Response,
  options: SecureAPIOptions = {}
) {
  const config = {
    requiredFields: options.requiredFields || [],
    requireAuth: options.requireAuth ?? true,
    rateLimitBy: options.rateLimitBy || 'ip',
    rateLimitWindowMs: options.rateLimitWindowMs || 60_000, // 1 minute
    rateLimitMax: options.rateLimitMax || 30,
    maxBodyBytes: options.maxBodyBytes || 64 * 1024, // 64KB
    honeypotField: options.honeypotField || 'honeypot',
    csp: options.csp || "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'; img-src 'self' data: https:;",
    cors: {
      origins: options.cors?.origins || ['*'],
      methods: options.cors?.methods || ['POST', 'OPTIONS'],
      headers: options.cors?.headers || ['content-type', 'authorization'],
      allowCredentials: options.cors?.allowCredentials ?? false,
    },
    image: {
      allowHosts: options.image?.allowHosts || undefined,
      allowExt: options.image?.allowExt || ['jpg', 'jpeg', 'png', 'webp']
    }
  };

  return async (ctx: { request: Request }) => {
    const { request } = ctx;
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          ...applyCORSHeaders(request, config.cors),
          'content-security-policy': config.csp,
        },
      });
    }

    // Enforce JSON Content-Type
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('application/json')) {
      return createJSONResponse(
        { ok: false, error: 'Content-Type must be application/json' },
        415,
        applyCORSHeaders(request, config.cors)
      );
    }

    // Parse and validate JSON body with size limits
    let body: any;
    try {
      body = await readLimitedJSON(request, config.maxBodyBytes);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid request body';
      return createJSONResponse(
        { ok: false, error: message },
        400,
        applyCORSHeaders(request, config.cors)
      );
    }

    // Honeypot protection
    if (config.honeypotField && typeof body[config.honeypotField] === 'string') {
      const honeypotValue = body[config.honeypotField].trim();
      if (honeypotValue.length > 0) {
        return createJSONResponse(
          { ok: false, error: 'Request rejected' },
          403,
          applyCORSHeaders(request, config.cors)
        );
      }
    }

    // Validate required fields
    const sanitizedBody: any = {};
    for (const field of config.requiredFields) {
      if (!(field in body) || typeof body[field] !== 'string' || body[field].trim().length === 0) {
        return createJSONResponse(
          { ok: false, error: `Missing required field: ${field}` },
          400,
          applyCORSHeaders(request, config.cors)
        );
      }
      sanitizedBody[field] = body[field].trim();
    }

    // Copy non-required fields (basic sanitization)
    for (const [key, value] of Object.entries(body)) {
      if (!config.requiredFields.includes(key)) {
        if (typeof value === 'string') {
          sanitizedBody[key] = value.trim();
        } else {
          sanitizedBody[key] = value;
        }
      }
    }

    // Validate image URLs if present
    if (typeof sanitizedBody.imageUrl === 'string') {
      const imageValidationError = validateImageURL(
        sanitizedBody.imageUrl,
        config.image.allowExt || ['jpg', 'jpeg', 'png', 'webp'],
        config.image.allowHosts
      );
      if (imageValidationError) {
        return createJSONResponse(
          { ok: false, error: `Invalid image URL: ${imageValidationError}` },
          400,
          applyCORSHeaders(request, config.cors)
        );
      }
    }

    // Authentication check
    if (config.requireAuth) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return createJSONResponse(
          { ok: false, error: 'Authorization required' },
          401,
          {
            ...applyCORSHeaders(request, config.cors),
            'www-authenticate': 'Bearer realm="api", charset="UTF-8"',
          }
        );
      }

      const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
      if (!tokenMatch) {
        return createJSONResponse(
          { ok: false, error: 'Invalid authorization format. Use: Bearer <token>' },
          401,
          applyCORSHeaders(request, config.cors)
        );
      }

      const token = tokenMatch[1];
      const expectedToken = process.env.API_AUTH_TOKEN;

      if (!expectedToken || !timingSafeEq(token, expectedToken)) {
        return createJSONResponse(
          { ok: false, error: 'Invalid authorization token' },
          401,
          applyCORSHeaders(request, config.cors)
        );
      }
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimitKey = config.rateLimitBy === 'token'
      ? (request.headers.get('authorization') || 'anonymous')
      : clientIP;

    const rateLimitData = rateLimitStore.get(rateLimitKey);
    const currentTime = now();

    if (!rateLimitData || currentTime - rateLimitData.ts > config.rateLimitWindowMs) {
      // Reset or initialize rate limit window
      rateLimitStore.set(rateLimitKey, { count: 1, ts: currentTime });
    } else {
      rateLimitData.count++;
      if (rateLimitData.count > config.rateLimitMax) {
        return createJSONResponse(
          { ok: false, error: 'Rate limit exceeded' },
          429,
          {
            ...applyCORSHeaders(request, config.cors),
            'retry-after': Math.ceil(config.rateLimitWindowMs / 1000).toString(),
          }
        );
      }
    }

    // Execute the handler
    try {
      const response = await handler(request, sanitizedBody);

      // Enhance response with security headers
      const enhancedHeaders = new Headers(response.headers);

      // Add CORS headers
      const corsHeaders = applyCORSHeaders(request, config.cors);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        enhancedHeaders.set(key, value);
      });

      // Add security headers
      enhancedHeaders.set('content-security-policy', config.csp);
      if (!enhancedHeaders.has('x-content-type-options')) {
        enhancedHeaders.set('x-content-type-options', 'nosniff');
      }
      if (!enhancedHeaders.has('x-frame-options')) {
        enhancedHeaders.set('x-frame-options', 'DENY');
      }
      if (!enhancedHeaders.has('referrer-policy')) {
        enhancedHeaders.set('referrer-policy', 'no-referrer');
      }
      if (!enhancedHeaders.has('strict-transport-security')) {
        enhancedHeaders.set('strict-transport-security', 'max-age=63072000; includeSubDomains; preload');
      }

      return new Response(response.body, {
        status: response.status,
        headers: enhancedHeaders
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Internal server error';
      return createJSONResponse(
        {
          ok: false,
          error: 'Internal server error',
          ...(process.env.NODE_ENV === 'development' && { debug: errorMessage })
        },
        500,
        applyCORSHeaders(request, config.cors)
      );
    }
  };
}