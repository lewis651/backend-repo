import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

export const sendEmail = async (to, subject, text) => {
  try {
    if (process.env.SENDGRID_API_KEY) {
      // Use SendGrid
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg = {
        to,
        from: process.env.EMAIL_USER || "noreply@hysacam.com", // Use a verified sender
        subject,
        text,
      };
      const result = await sgMail.send(msg);
      console.log("Email sent successfully via SendGrid:", result[0].statusCode);
    } else {
      // Use Gmail
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER, // Use the Gmail address as sender
        to,
        subject,
        text
      });

      console.log("Email sent successfully via Gmail:", info.messageId);
    }
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error; // Re-throw to be caught in the route
  }
};
