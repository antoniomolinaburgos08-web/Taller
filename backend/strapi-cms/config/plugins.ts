import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('SMTP_HOST', ''),
        port: env.int('SMTP_PORT', 587),
        secure: env.int('SMTP_PORT', 587) === 465,
        auth: {
          user: env('SMTP_USER', ''),
          pass: env('SMTP_PASS', ''),
        },
      },
      settings: {
        defaultFrom: env('SMTP_FROM', 'info@eltallerdemigue.es'),
        defaultReplyTo: env('SMTP_FROM', 'info@eltallerdemigue.es'),
      },
    },
  },
});

export default config;
