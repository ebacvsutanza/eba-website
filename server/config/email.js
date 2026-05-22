// email.js

const brevo = require("@getbrevo/brevo");

const apiInstance = new brevo.TransactionalEmailsApi();

apiInstance.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY,
);

async function sendEmail(to, subject, html) {
  try {
    const result = await apiInstance.sendTransacEmail({
      sender: {
        email: process.env.EMAIL_FROM,
        name: "CVSU App",
      },

      to: [{ email: to }],

      subject: subject,

      htmlContent: html,
    });

    console.log("Email sent");
    console.log(result);
  } catch (error) {
    console.error(error);
  }
}

module.exports = { sendEmail };
