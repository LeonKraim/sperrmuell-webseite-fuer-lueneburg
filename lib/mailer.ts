import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "in-v3.mailjet.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.MAILJET_SMTP_USER!,
    pass: process.env.MAILJET_SMTP_PASS!,
  },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  await transporter.sendMail({
    from: `"${process.env.MAILJET_FROM_NAME || "Sperrmüll Abfuhrplan"}" <${process.env.MAILJET_FROM_EMAIL!}>`,
    to,
    subject,
    html,
  });
}
