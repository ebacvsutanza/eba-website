const express = require("express");
const app = express();

const nodemailer = require("nodemailer");

const emailTracker = {};

const sender = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ebacvsutanza@gmail.com",
    pass: "vogn dzxy xwof uztp",
  },
});

async function processPhotoRequest(targetEmail, base64Image) {
  const today = new Date().toDateString();

  // Initialize/Reset daily tracker
  if (!emailTracker[targetEmail] || emailTracker[targetEmail].date !== today) {
    emailTracker[targetEmail] = { date: today, count: 0 };
  }

  // Enforce 3-photo limit
  if (emailTracker[targetEmail].count >= 50) {
    return "Time exceed: Limit of 3 photos reached for today.";
  }

  const mailOptions = {
    from: '"CVSU AR Virtual Try On Kiosk application" <ebacvsutanza@gmail.com>',
    to: targetEmail,
    subject: "Your Virtual Try-On Photo Copy",
    text: "Hello! Attached is your photo from the CVSU AR Booth.",
    attachments: [
      {
        filename: "cvsu-virtual-try-on-capture.png",
        content: base64Image,
        encoding: "base64",
      },
    ],
  };

  try {
    await sender.sendMail(mailOptions);
    emailTracker[targetEmail].count++; // Only increase count on success
    return `Success: Photo sent to ${targetEmail}`;
  } catch (error) {
    console.error("Mailer Error:", error);
    return "Error: Could not send email.";
  }
}

// Export the function so it can be imported elsewhere
module.exports = { processPhotoRequest };
