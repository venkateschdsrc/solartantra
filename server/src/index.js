import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowNoOrigin = (process.env.ALLOW_NO_ORIGIN || 'false').toLowerCase() === 'true';

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin && allowNoOrigin) {
        return callback(null, true);
      }
      if (!origin) {
        return callback(new Error('Origin not allowed'));
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed'));
    },
    methods: ['POST', 'OPTIONS'],
  })
);

app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 10),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: Number(process.env.MAX_FILE_BYTES || 5 * 1024 * 1024),
  },
});

function requireOrigin(req, res, next) {
  const origin = req.get('origin');
  if (!origin && allowNoOrigin) {
    return next();
  }
  if (!origin || !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origin not allowed' });
  }
  return next();
}

async function verifyTurnstile(token) {
  const secret = process.env.TURNSTILE_SECRET;
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

function validatePayload(body) {
  const errors = [];
  const fields = ['consumerName', 'consumerNumber', 'consumerAddress', 'postalCode', 'phoneNumber'];
  for (const field of fields) {
    if (!body?.[field] || String(body[field]).trim().length === 0) {
      errors.push(`${field} is required`);
    }
  }

  if (body.consumerNumber && !/^\d{16}$/.test(body.consumerNumber)) {
    errors.push('consumerNumber must be 16 digits');
  }
  if (body.postalCode && !/^\d{6}$/.test(body.postalCode)) {
    errors.push('postalCode must be 6 digits');
  }
  if (body.phoneNumber && !/^\d{10}$/.test(body.phoneNumber)) {
    errors.push('phoneNumber must be 10 digits');
  }

  return errors;
}

app.post('/enrol', requireOrigin, upload.single('billPhoto'), async (req, res) => {
  try {
    const captchaToken = req.body?.captchaToken;
    const captchaOk = await verifyTurnstile(captchaToken);
    if (!captchaOk) {
      return res.status(400).json({ error: 'Captcha verification failed' });
    }

    const errors = validatePayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const toEmail = process.env.TO_EMAIL || 'contact@solartantra.com';
    const fromEmail = process.env.FROM_EMAIL || 'no-reply@solartantra.com';
    const subject = req.body?.subject || 'New Solartantra enrolment';

    const text = `New enrolment received.\n\n` +
      `Name: ${req.body.consumerName}\n` +
      `Consumer Number: ${req.body.consumerNumber}\n` +
      `Address: ${req.body.consumerAddress}\n` +
      `Postal Code: ${req.body.postalCode}\n` +
      `Phone: ${req.body.phoneNumber}\n`;

    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject,
      text,
      attachments: req.file
        ? [{
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: req.file.mimetype,
          }]
        : [],
    };

    await transporter.sendMail(mailOptions);

    return res.json({ ok: true });
  } catch (error) {
    console.error('Enrol API error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Enrol API listening on port ${port}`);
});
