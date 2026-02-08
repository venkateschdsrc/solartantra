export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = (env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean);

    const allowNoOrigin = (env.ALLOW_NO_ORIGIN || 'false').toLowerCase() === 'true';

    const corsHeaders = buildCorsHeaders(origin, allowedOrigins, allowNoOrigin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST' || new URL(request.url).pathname !== '/enrol') {
      return new Response('Not Found', { status: 404, headers: corsHeaders });
    }

    if (!isOriginAllowed(origin, allowedOrigins, allowNoOrigin)) {
      return new Response(JSON.stringify({ error: 'Origin not allowed' }), {
        status: 403,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const rateLimit = await applyRateLimit(request, env);
    if (!rateLimit.ok) {
      return new Response(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const payload = extractPayload(formData);

    const errors = validatePayload(payload);
    if (errors.length > 0) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: errors }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const captchaToken = payload.captchaToken;
    const captchaOk = await verifyTurnstile(captchaToken, env);
    if (!captchaOk) {
      return new Response(JSON.stringify({ error: 'Captcha verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    const emailResponse = await sendEmail(payload, formData.get('billPhoto'), env);
    if (!emailResponse.ok) {
      return new Response(JSON.stringify({ error: 'Email delivery failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, 'content-type': 'application/json' },
    });
  },
};

function buildCorsHeaders(origin, allowedOrigins, allowNoOrigin) {
  const headers = {
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'Content-Type',
    'access-control-max-age': '86400',
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers['access-control-allow-origin'] = origin;
    headers['vary'] = 'Origin';
  } else if (!origin && allowNoOrigin) {
    headers['access-control-allow-origin'] = '*';
  }

  return headers;
}

function isOriginAllowed(origin, allowedOrigins, allowNoOrigin) {
  if (!origin && allowNoOrigin) {
    return true;
  }
  if (!origin) {
    return false;
  }
  return allowedOrigins.includes(origin);
}

async function applyRateLimit(request, env) {
  if (!env.RATE_LIMIT_KV) {
    return { ok: true };
  }

  const windowMs = Number(env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000);
  const max = Number(env.RATE_LIMIT_MAX || 10);
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const key = `rate:${ip}`;

  const entryRaw = await env.RATE_LIMIT_KV.get(key);
  const now = Date.now();

  if (!entryRaw) {
    await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: 1, start: now }), {
      expirationTtl: Math.ceil(windowMs / 1000),
    });
    return { ok: true };
  }

  const entry = JSON.parse(entryRaw);
  if (now - entry.start > windowMs) {
    await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: 1, start: now }), {
      expirationTtl: Math.ceil(windowMs / 1000),
    });
    return { ok: true };
  }

  if (entry.count >= max) {
    return { ok: false };
  }

  await env.RATE_LIMIT_KV.put(key, JSON.stringify({ count: entry.count + 1, start: entry.start }), {
    expirationTtl: Math.ceil(windowMs / 1000),
  });

  return { ok: true };
}

function extractPayload(formData) {
  return {
    consumerName: String(formData.get('consumerName') || ''),
    consumerNumber: String(formData.get('consumerNumber') || ''),
    consumerAddress: String(formData.get('consumerAddress') || ''),
    postalCode: String(formData.get('postalCode') || ''),
    phoneNumber: String(formData.get('phoneNumber') || ''),
    subject: String(formData.get('subject') || 'New Solartantra enrolment'),
    captchaToken: String(formData.get('captchaToken') || ''),
  };
}

function validatePayload(body) {
  const errors = [];
  if (!body.consumerName.trim()) errors.push('consumerName is required');
  if (!/^\d{16}$/.test(body.consumerNumber)) errors.push('consumerNumber must be 16 digits');
  if (!body.consumerAddress.trim()) errors.push('consumerAddress is required');
  if (!/^\d{6}$/.test(body.postalCode)) errors.push('postalCode must be 6 digits');
  if (!/^\d{10}$/.test(body.phoneNumber)) errors.push('phoneNumber must be 10 digits');
  return errors;
}

async function verifyTurnstile(token, env) {
  const secret = env.TURNSTILE_SECRET;
  if (!secret) {
    return true;
  }
  if (!token) {
    return false;
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return Boolean(data.success);
}

async function sendEmail(payload, file, env) {
  const toEmail = env.TO_EMAIL || 'contact@solartantra.com';
  const fromEmail = env.FROM_EMAIL || 'no-reply@solartantra.com';
  const fromName = env.FROM_NAME || 'Solartantra';

  const text = `New enrolment received.\n\n` +
    `Name: ${payload.consumerName}\n` +
    `Consumer Number: ${payload.consumerNumber}\n` +
    `Address: ${payload.consumerAddress}\n` +
    `Postal Code: ${payload.postalCode}\n` +
    `Phone: ${payload.phoneNumber}\n`;

  const mail = {
    personalizations: [{ to: [{ email: toEmail }] }],
    from: { email: fromEmail, name: fromName },
    subject: payload.subject,
    content: [{ type: 'text/plain', value: text }],
  };

  if (file instanceof File) {
    const maxBytes = Number(env.MAX_FILE_BYTES || 5 * 1024 * 1024);
    if (file.size <= maxBytes) {
      const buffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(buffer);
      mail.attachments = [
        {
          content: base64,
          filename: file.name,
          type: file.type || 'application/octet-stream',
          disposition: 'attachment',
        },
      ];
    }
  }

  return fetch('https://api.mailchannels.net/tx/v1/send', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(mail),
  });
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
