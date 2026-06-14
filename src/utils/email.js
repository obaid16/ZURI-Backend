const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    // Establish SMTP transport parameters
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || "",
      },
    });

    const message = {
      from: `"${process.env.EMAIL_FROM_NAME || "Zuri Wholesale"}" <${process.env.EMAIL_FROM || "wholesale@zuri.com"}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(`B2B Notification Email Sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("Nodemailer Mail Delivery Error (Skipped crash):", error.message);
    return false;
  }
};

module.exports = sendEmail;
