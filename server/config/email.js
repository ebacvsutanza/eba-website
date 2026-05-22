// email.js

import Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.authentications["apiKey"].apiKey = process.env.BREVO_API_KEY;

export async function sendEmail(to, subject, html) {
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

    console.log(result);
  } catch (error) {
    console.error(error);
  }
}
