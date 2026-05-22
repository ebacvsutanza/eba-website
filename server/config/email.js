const axios = require("axios");

async function sendEmail(to, subject, html) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "EBA CvSU - Tanza",
          email: process.env.EMAIL_FROM,
        },

        to: [
          {
            email: to,
          },
        ],

        subject: subject,

        htmlContent: html,
      },

      {
        headers: {
          accept: "application/json",
          "api-key": process.env.BREVO_API_KEY,
          "content-type": "application/json",
        },
      },
    );

    console.log("Email sent");
    console.log(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
}

module.exports = { sendEmail };
