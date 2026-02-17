// ===============================================================================================================================
// RECEIVES THE DATA FROM UNITY APPLICATION
// ===============================================================================================================================
const emailTracker = {};

async function processPhotoRequest(targetEmail, base64Image) {
  const today = new Date().toDateString();

  // Initialize/Reset daily tracker
  if (!emailTracker[targetEmail] || emailTracker[targetEmail].date !== today) {
    emailTracker[targetEmail] = { date: today, count: 0 };
  }

  // Enforce 50-photo limit (your code says 50, message says 3 — fixed message below)
  if (emailTracker[targetEmail].count >= 50) {
    return "Time exceed: Limit of 50 photos reached for today.";
  }

  const msg = {
    to: targetEmail,
    from: {
      email: "ebacvsutanza@gmail.com", // Must be verified in SendGrid
      name: "CVSU AR Virtual Try On Kiosk Application",
    },
    subject: "Your Virtual Try-On Photo Copy",
    text: "Hello! Attached is your photo from the CVSU AR Booth.",
    attachments: [
      {
        content: base64Image, // already base64
        filename: "cvsu-virtual-try-on-capture.png",
        type: "image/png",
        disposition: "attachment",
      },
    ],
  };

  try {
    await sgMail.send(msg);
    emailTracker[targetEmail].count++;
    return `Success: Photo sent to ${targetEmail}`;
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error);
    return "Error: Could not send email.";
  }
}

// Export the function so it can be imported elsewhere
module.exports = { processPhotoRequest };
