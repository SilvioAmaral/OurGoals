import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: { user: env.smtp.user, pass: env.smtp.pass },
});

export async function sendPartnerInvite(to: string, inviterName: string, token: string): Promise<void> {
  const link = `${env.appUrl}/invite/accept/${token}`;
  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject: `${inviterName} invited you to OurGoals`,
    html: `
      <p>Hi!</p>
      <p><strong>${inviterName}</strong> has invited you to build a shared bucket list together on <strong>OurGoals</strong>.</p>
      <p><a href="${link}" style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;">Accept Invite</a></p>
      <p>This link expires in ${env.inviteExpiryHours} hours.</p>
    `,
  });
}
