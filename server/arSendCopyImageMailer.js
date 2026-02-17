// ===============================================================================================================================
// arSendCopyImageMailer.js — CVSU AR Virtual Try-On Kiosk (SendGrid + CVSU Email Validation)
// ===============================================================================================================================
// Usage in index.js:
//   const { processPhotoRequest, validateEmail } = require('./arSendCopyImageMailer');
// ===============================================================================================================================

const sgMail = require("@sendgrid/mail");
const dns = require("node:dns").promises;

// Initialize SendGrid — API key loaded from .env via dotenv in index.js
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Daily send tracker (in-memory; swap with Redis/DB for multi-instance deployments)
const emailTracker = {};

// DNS MX cache with 1-hour TTL to avoid repeated lookups
const mxCache = new Map();
const CACHE_TTL = 60 * 60 * 1000;

// ===============================================================================================================================
// EMAIL VALIDATION — strict @cvsu.edu.ph domain + DNS MX record verification
// ===============================================================================================================================

/**
 * Full validation pipeline:
 *   1. Format check — must match  user@cvsu.edu.ph
 *   2. DNS MX check — confirms the domain can receive mail
 *
 * @param   {string} email  Raw email string from request body
 * @returns {Promise<{ valid: boolean, email?: string, reason?: string }>}
 */
async function validateEmail(email) {
  // --- Format check ---
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Email is required." };
  }

  const trimmed = email.trim().toLowerCase();

  if (!/^[a-z0-9._-]+@cvsu\.edu\.ph$/.test(trimmed)) {
    return {
      valid: false,
      reason: "Email must follow the format user@cvsu.edu.ph",
    };
  }

  // --- DNS MX check (cached) ---
  const domain = "cvsu.edu.ph";
  const cached = mxCache.get(domain);

  if (!cached || Date.now() - cached.timestamp > CACHE_TTL) {
    try {
      const records = await dns.resolveMx(domain);
      mxCache.set(domain, {
        valid: records && records.length > 0,
        timestamp: Date.now(),
      });
    } catch (err) {
      mxCache.set(domain, { valid: false, timestamp: Date.now() });
    }
  }

  if (!mxCache.get(domain).valid) {
    return { valid: false, reason: "CVSU mail server could not be verified." };
  }

  return { valid: true, email: trimmed };
}

// ===============================================================================================================================
// BASE64 SANITIZATION — strips data-URI prefixes Unity might add & validates characters
// ===============================================================================================================================

/**
 * @param   {string} raw  Raw Base64 or data-URI string from Unity
 * @returns {string}       Clean Base64 content ready for SendGrid attachment
 * @throws  {Error}        If input is missing or contains invalid characters
 */
function sanitizeBase64(raw) {
  if (!raw || typeof raw !== "string") {
    throw new Error("Base64 image data is required.");
  }

  // Strip data-URI header if present (e.g. "data:image/png;base64,")
  let cleaned = raw.replace(/^data:image\/\w+;base64,/i, "");

  // Remove any whitespace/newlines injected in transit
  cleaned = cleaned.replace(/\s+/g, "");

  // Validate remaining characters are legal Base64
  if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
    throw new Error("Image data contains invalid Base64 characters.");
  }

  return cleaned;
}

// ===============================================================================================================================
// PROCESS PHOTO REQUEST — enforces daily limit, sanitizes image, sends via SendGrid
// ===============================================================================================================================

/**
 * @param   {string} targetEmail  Already-validated recipient address
 * @param   {string} base64Image  Raw or data-URI Base64 image from Unity
 * @returns {Promise<string>}     "Success: ..." or "Error: ..." message
 */
async function processPhotoRequest(targetEmail, base64Image) {
  const today = new Date().toDateString();
  const dailyLimit = parseInt(process.env.DAILY_SEND_LIMIT, 10) || 50;

  // Initialize or reset daily tracker
  if (!emailTracker[targetEmail] || emailTracker[targetEmail].date !== today) {
    emailTracker[targetEmail] = { date: today, count: 0 };
  }

  // Enforce daily photo limit
  if (emailTracker[targetEmail].count >= dailyLimit) {
    return `Limit exceeded: Only ${dailyLimit} photos allowed per day.`;
  }

  // Guard: ensure image data exists
  if (!base64Image) return "Error: No image data received.";

  // Sanitize and validate image
  let cleanImage;
  try {
    cleanImage = sanitizeBase64(base64Image);
  } catch (err) {
    return `Error: ${err.message}`;
  }

  // Build SendGrid message
  const msg = {
    to: targetEmail,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || "noreply@cvsu.edu.ph",
      name:
        process.env.SENDGRID_FROM_NAME ||
        "CVSU AR Virtual Try On Kiosk application",
    },
    subject: "Your Virtual Try-On Photo Copy",
    text: "Hello! Attached is your photo from the CVSU AR Booth.",
    attachments: [
      {
        content: cleanImage,
        filename: "cvsu-virtual-try-on-capture.png",
        type: "image/png",
        disposition: "attachment",
      },
    ],
  };

  // Send
  try {
    await sgMail.send(msg);
    emailTracker[targetEmail].count++; // Only increment on success
    return `Success: Photo sent to ${targetEmail}`;
  } catch (error) {
    console.error(
      "SendGrid Error:",
      error.response ? error.response.body : error.message,
    );
    return "Error: Could not send email.";
  }
}

// ===============================================================================================================================
// EXPORTS
// ===============================================================================================================================
module.exports = { validateEmail, processPhotoRequest };
