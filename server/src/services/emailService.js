import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWinnerEmail(to, name, matchType, prizeAmount) {
  const tier = matchType === 5 ? 'JACKPOT' : `${matchType}-Number Match`;
  await transporter.sendMail({
    from: `"Digital Heroes Golf" <${process.env.SMTP_USER}>`,
    to,
    subject: `🎉 Congratulations! You won the ${tier} Prize!`,
    html: `<h1>Well done, ${name}!</h1>
           <p>You matched ${matchType} numbers in this month's draw and won <strong>£${prizeAmount.toFixed(2)}</strong>.</p>
           <p>Please log in to verify your win and arrange payment.</p>`,
  });
}

export async function sendDrawPublishedEmail(to, name) {
  await transporter.sendMail({
    from: `"Digital Heroes Golf" <${process.env.SMTP_USER}>`,
    to,
    subject: `This month's draw results are in!`,
    html: `<h1>Hi ${name},</h1><p>The monthly draw results have been published. Log in to see if you won!</p>`,
  });
}
