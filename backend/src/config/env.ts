import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ourgoals',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret_change_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'OurGoals <noreply@ourgoals.app>',
  },
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  inviteExpiryHours: parseInt(process.env.INVITE_EXPIRY_HOURS || '72', 10),
};
