import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const smtpUser = process.env.EMAIL_FROM || '';
      const smtpPass = process.env.GOOGLE_SMTP_PASSWORD || '';

      if (!smtpUser || !smtpPass) {
        this.logger.warn('SMTP credentials are not configured; using json transport');
        this.transporter = nodemailer.createTransport({
          jsonTransport: true,
        });
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    } catch (error) {
      this.logger.error('Failed to initialize email transporter', error);
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  async sendPasswordResetCode(email: string, resetCode: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@alacena.com',
        to: email,
        subject: 'Tu código de recuperación de contraseña - Alacena',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recupera tu contraseña</h2>
            <p>Hemos recibido una solicitud para recuperar tu contraseña.</p>
            <p>Tu código de verificación es:</p>
            <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; letter-spacing: 5px; margin: 0; font-size: 32px; font-weight: bold;">
                ${resetCode}
              </h1>
            </div>
            <p>Ingresa este código en la aplicación para restaurar tu contraseña.</p>
            <p><strong>Este código expirará en 15 minutos.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">
              Por seguridad, nunca compartamos este código por email o mensaje directo.
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset code email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset code email to ${email}:`, error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    baseUrl: string = 'http://localhost:3000',
  ): Promise<boolean> {
    try {
      const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@alacena.com',
        to: email,
        subject: 'Recupera tu contraseña - Alacena',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Recupera tu contraseña</h2>
            <p>Hemos recibido una solicitud para recuperar tu contraseña.</p>
            <p>Haz clic en el siguiente enlace para restablecerla:</p>
            <p>
              <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Restaurar contraseña
              </a>
            </p>
            <p>Este enlace expirará en 15 minutos.</p>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <hr>
            <small style="color: #666;">
              Si el botón no funciona, copia este enlace en tu navegador:<br>
              ${resetLink}
            </small>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@alacena.com',
        to: email,
        subject: 'Bienvenido a Alacena',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>¡Bienvenido a Alacena, ${firstName}!</h2>
            <p>Tu cuenta ha sido creada exitosamente.</p>
            <p>Ahora puedes acceder a todas las funcionalidades de nuestra plataforma.</p>
            <p>
              <a href="http://localhost:3000/login" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Iniciar sesión
              </a>
            </p>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  async sendNotificationEmail(
    email: string,
    title: string,
    message: string,
    link?: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@alacena.com',
        to: email,
        subject: `${title} - Alacena`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${title}</h2>
            <p>${message}</p>
            ${link ? `<p><a href="${link}">Ver en Alacena</a></p>` : ''}
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Notification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send notification email to ${email}:`, error);
      return false;
    }
  }
}
