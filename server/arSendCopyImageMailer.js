const SibApiV3Sdk = require('sib-api-v3-sdk');
const dotenv = require('dotenv');

dotenv.config();

const number_of_email_per_person_per_day = 5;
const emailTracker = {};

// Configure Brevo API
const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications['api-key'];

apiKey.apiKey = process.env.BREVO_API_KEY;

// Create API instance
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

const processPhotoRequest = async (targetEmail, base64Image) => {

    const today = new Date().toDateString();

    // Reset tracker daily
    if (
        !emailTracker[targetEmail] ||
        emailTracker[targetEmail].date !== today
    ) {
        emailTracker[targetEmail] = {
            date: today,
            count: 0
        };
    }

    // Daily limit check
    if (
        emailTracker[targetEmail].count >=
        number_of_email_per_person_per_day
    ) {

        console.warn(
            `Status:\x1b[33m 429\x1b[0m ${targetEmail} reached limit`
        );

        return {
            error: true,
            status: 429,
            message: `Limit reached.`
        };
    }

    // Create email payload
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Your Virtual Try-On Photo";

    sendSmtpEmail.htmlContent = `
        <div style="
            font-family: Arial, sans-serif;
            border: 2px solid #006400;
            padding: 20px;
            border-radius: 10px;
        ">

            <h2 style="color: #006400;">
                CVSU Virtual Try-On
            </h2>

            <p>
                Hello! We hope you enjoyed trying on our university threads.
            </p>

            <p>
                <strong>Attached below</strong> is the photo copy you requested from the AR Booth.
            </p>

            <hr style="
                border: 0;
                border-top: 1px solid #eee;
            " />

            <p style="
                font-size: 12px;
                color: #777;
            ">
                This is an automated message from the
                CVSU Tanza AR Kiosk Application.
            </p>

        </div>
    `;

    sendSmtpEmail.sender = {
        name: "EBA CVSU AR Booth",
        email: "ebacvsutanza@gmail.com"
    };

    sendSmtpEmail.to = [
        {
            email: targetEmail
        }
    ];

    // Attachment
    sendSmtpEmail.attachment = [
        {
            name: "capture.jpg",
            content: base64Image.replace(
                /^data:image\/[a-z]+;base64,/,
                ""
            )
        }
    ];

    try {

        const response =
            await apiInstance.sendTransacEmail(sendSmtpEmail);

        console.log("SUCCESS:", response);

        emailTracker[targetEmail].count++;

        return {
            error: false,
            status: 200,
            message: `Success: Photo sent to ${targetEmail}`
        };

    } catch (error) {

        console.error(
            "BREVO ERROR:",
            error.response?.body || error
        );

        return {
            error: true,
            status: 500,
            message: "Failed to send email"
        };
    }
};

module.exports = processPhotoRequest;