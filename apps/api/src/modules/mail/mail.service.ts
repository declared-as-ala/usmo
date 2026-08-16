import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST || 'smtp.mail.ovh.net';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = process.env.SMTP_SECURE !== 'false'; // default true for SSL port 465
    const user = process.env.SMTP_USER || 'noreply@usmonastir.tn';
    const pass = process.env.SMTP_PASS || 'Mediausm&2026';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed SSL handshake blocks on OVH mail servers
      },
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log(`[SMTP] Successfully connected to OVH Mail Server (smtp.mail.ovh.net:465)`);
    } catch (err: any) {
      this.logger.warn(`[SMTP] Connection check notice: ${err.message}`);
    }
  }

  private getFromAddress(): string {
    const fromName = process.env.SMTP_FROM_NAME || 'Union Sportive Monastirienne';
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@usmonastir.tn';
    return `"${fromName}" <${fromEmail}>`;
  }

  /**
   * Send single-use invitation email to new administrators
   */
  async sendAdminInvitationEmail(to: string, name: string, invitationUrl: string, roleName: string = 'Administrateur'): Promise<boolean> {
    const subject = 'Activation de votre compte Administrateur — US Monastir';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0d3b66 0%, #0d63ff 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 12px; color: #3ed6d0; font-weight: 600; }
          .content { padding: 32px 24px; }
          .welcome { font-size: 16px; font-weight: 700; color: #0d3b66; margin-bottom: 12px; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .badge { display: inline-block; background: #eff6ff; color: #0d63ff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 20px; border: 1px solid #bfdbfe; }
          .btn-wrapper { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #0d63ff; color: #ffffff !important; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(13,99,255,0.3); }
          .notice { font-size: 12px; color: #64748b; background: #f1f5f9; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #0d63ff; margin-bottom: 24px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UNION SPORTIVE MONASTIRIENNE</h1>
            <p>PORTAIL D'ADMINISTRATION OFFICIEL</p>
          </div>
          <div class="content">
            <div class="welcome">Bonjour ${name},</div>
            <p class="text">Un compte d'administration vous a été attribué sur la plateforme numérique officielle de l'Union Sportive Monastirienne.</p>
            <div><span class="badge">Rôle : ${roleName}</span></div>
            <p class="text">Pour activer votre accès et définir votre mot de passe sécurisé, veuillez cliquer sur le bouton ci-dessous :</p>
            <div class="btn-wrapper">
              <a href="${invitationUrl}" class="btn" target="_blank">Activer Mon Compte</a>
            </div>
            <div class="notice">
              <strong>Lien d'invitation sécurisé à usage unique :</strong> Ce lien expirera après première utilisation. Si vous n'êtes pas destinataire de cette invitation, vous pouvez ignorer cet email.
            </div>
            <p class="text" style="font-size: 12px; color: #94a3b8;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><span style="word-break: break-all; color: #0d63ff;">${invitationUrl}</span></p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Union Sportive Monastirienne • Tous droits réservés<br>
            Ceci est un message automatique envoyé par noreply@usmonastir.tn.
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, subject, html);
  }

  /**
   * Send Password Reset Email
   */
  async sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<boolean> {
    const subject = 'Réinitialisation de votre mot de passe — US Monastir';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; }
          .header { background: #0d3b66; padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 18px; font-weight: 800; text-transform: uppercase; }
          .content { padding: 28px 24px; }
          .btn-wrapper { text-align: center; margin: 24px 0; }
          .btn { display: inline-block; background: #0d63ff; color: #ffffff !important; font-size: 14px; font-weight: 700; text-decoration: none; padding: 12px 24px; border-radius: 10px; }
          .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>US MONASTIR</h1>
          </div>
          <div class="content">
            <p>Bonjour ${name},</p>
            <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte US Monastir.</p>
            <div class="btn-wrapper">
              <a href="${resetUrl}" class="btn">Réinitialiser Mon Mot de Passe</a>
            </div>
            <p style="font-size: 12px; color: #64748b;">Si vous n'avez pas demandé cette réinitialisation, nous vous conseillons de vérifier la sécurité de votre compte.</p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Union Sportive Monastirienne
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, subject, html);
  }

  /**
   * Send Email Verification Email to new user registrants
   */
  async sendEmailVerificationEmail(to: string, name: string, verificationUrl: string): Promise<boolean> {
    const subject = 'Vérification de votre compte — US Monastir';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0d3b66 0%, #0d63ff 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 6px 0 0; font-size: 12px; color: #3ed6d0; font-weight: 600; }
          .content { padding: 32px 24px; }
          .welcome { font-size: 16px; font-weight: 700; color: #0d3b66; margin-bottom: 12px; }
          .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
          .btn-wrapper { text-align: center; margin: 28px 0; }
          .btn { display: inline-block; background: #0d63ff; color: #ffffff !important; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 12px rgba(13,99,255,0.3); }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UNION SPORTIVE MONASTIRIENNE</h1>
            <p>BIENVENUE DANS LA FAMILLE BLEU ET BLANC</p>
          </div>
          <div class="content">
            <div class="welcome">Bienvenue ${name} !</div>
            <p class="text">Merci de vous être inscrit sur la plateforme officielle de l'US Monastir. Veuillez confirmer votre adresse email pour activer votre compte supporter :</p>
            <div class="btn-wrapper">
              <a href="${verificationUrl}" class="btn" target="_blank">Vérifier Mon Email</a>
            </div>
            <p class="text" style="font-size: 12px; color: #94a3b8;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><span style="word-break: break-all; color: #0d63ff;">${verificationUrl}</span></p>
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Union Sportive Monastirienne • Tous droits réservés<br>
            Ceci est un message automatique envoyé par noreply@usmonastir.tn.
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, subject, html);
  }

  /**
   * Send Custom HTML Email Campaign
   */
  async sendCampaignEmail(to: string, subject: string, bodyHtml: string): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #0d3b66 0%, #0d63ff 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; }
          .header p { margin: 4px 0 0; font-size: 11px; color: #3ed6d0; font-weight: 600; }
          .content { padding: 28px 24px; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>UNION SPORTIVE MONASTIRIENNE</h1>
            <p>COMMUNIQUÉ OFFICIEL</p>
          </div>
          <div class="content">
            ${bodyHtml}
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Union Sportive Monastirienne • Tous droits réservés<br>
            Vous recevez cet email car vous êtes inscrit sur usmonastir.tn.
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(to, subject, html);
  }

  /**
   * Generic low-level helper to send mail via Nodemailer SMTP
   */
  async sendMail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: this.getFromAddress(),
        to,
        subject,
        html,
        text: text || subject,
      });

      this.logger.log(`[SMTP] Email successfully dispatched to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`[SMTP ERROR] Failed to send email to ${to}: ${err.message}`, err.stack);
      return false;
    }
  }
}
