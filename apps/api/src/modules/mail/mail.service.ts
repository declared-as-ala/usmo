import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import { USM_LOGO_BASE64, IBRAND_LOGO_BASE64 } from './mail-assets';

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
   * Send High-End Order Confirmation Email with USM Logo & Full Order Details
   */
  async sendOrderConfirmationEmail(params: {
    to: string;
    customerName: string;
    customerPhone: string;
    customerCity: string;
    customerAddress?: string;
    orderNumber: string;
    items: Array<{
      name: string;
      size?: string;
      quantity: number;
      price: number;
      subtotal?: number;
      customName?: string;
      customNumber?: string;
    }>;
    subtotal: number;
    shippingCost: number;
    discount?: number;
    total: number;
  }): Promise<boolean> {
    const subject = `Confirmation de commande ${params.orderNumber} — US Monastir`;

    // Logo source: direct HTTPS URL ensures instant display without triggering email attachments
    const logoImgSrc = 'https://raw.githubusercontent.com/declared-as-ala/usmo/main/apps/web/public/logo%20foot.png';

    const formatTnd = (m: number) => ((m || 0) / 1000).toFixed(3) + ' DT';

    const itemsRows = params.items
      .map(
        (item, idx) => `
      <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${idx % 2 === 0 ? '#ffffff' : '#fafafa'};">
        <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; color: #061a3a;">
          ${item.name}
          ${item.size ? `<span style="display: block; font-size: 11px; font-weight: 600; color: #64748b; margin-top: 2px;">Taille : ${item.size}</span>` : ''}
          ${
            item.customName || item.customNumber
              ? `<span style="display: inline-block; font-size: 11px; font-weight: 700; color: #0d63ff; background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 2px 6px; margin-top: 3px;">Flocage : ${[item.customName, item.customNumber ? '#' + item.customNumber : ''].filter(Boolean).join(' ')}</span>`
              : ''
          }
        </td>
        <td style="padding: 12px 14px; text-align: center; font-size: 13px; font-weight: 700; color: #061a3a;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 14px; text-align: right; font-size: 13px; font-weight: 600; color: #475569; font-family: monospace;">
          ${formatTnd(item.price)}
        </td>
        <td style="padding: 12px 14px; text-align: right; font-size: 13px; font-weight: 800; color: #061a3a; font-family: monospace;">
          ${formatTnd(item.subtotal || item.price * item.quantity)}
        </td>
      </tr>
    `
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #0f172a; margin: 0; padding: 0; }
          .wrapper { width: 100%; background-color: #f1f5f9; padding: 30px 12px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(6,26,58,0.08); }
          .header { background: linear-gradient(135deg, #061A3A 0%, #0D3B66 50%, #0D63FF 100%); padding: 36px 24px 30px; text-align: center; color: #ffffff; }
          .logo-box { margin: 0 auto 12px; text-align: center; }
          .logo-box img { width: 80px; height: 80px; object-fit: contain; display: block; margin: 0 auto; border: 0; }
          .title { margin: 16px 0 2px; font-size: 18px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #ffffff; }
          .subtitle { margin: 0; font-size: 11px; font-weight: 700; color: #3ed6d0; letter-spacing: 1px; text-transform: uppercase; }
          .body { padding: 32px 28px; }
          .badge-confirmed { display: inline-block; background: #ecfdf3; color: #027a48; border: 1px solid #a6f4c5; padding: 6px 16px; border-radius: 30px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; }
          .greeting { font-size: 20px; font-weight: 900; color: #061a3a; margin: 0 0 8px; }
          .lead { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; }
          .section-title { font-size: 12px; font-weight: 800; color: #061a3a; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
          .details-table td { padding: 8px 0; }
          .details-label { color: #64748b; width: 40%; font-weight: 600; }
          .details-val { color: #061a3a; font-weight: 700; }
          .items-table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          .items-table th { background: #f8fafc; padding: 10px 12px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
          .totals-table { width: 100%; border-collapse: collapse; margin-top: 16px; border-top: 2px solid #e2e8f0; padding-top: 12px; }
          .totals-table td { padding: 6px 0; font-size: 13px; }
          .total-highlight { border-top: 2px solid #0d63ff; padding-top: 12px !important; }
          .notice-box { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #0d63ff; border-radius: 12px; padding: 14px 18px; margin-top: 28px; font-size: 12px; color: #1e40af; line-height: 1.5; }
          .footer { background: #061a3a; padding: 28px 24px; text-align: center; color: #94a3b8; font-size: 11px; line-height: 1.6; }
          .footer-brand { font-size: 12px; font-weight: 800; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px; }
          .footer a { color: #3ed6d0; text-decoration: none; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="card">
            <!-- Header with Official Club Badge -->
            <div class="header">
              <div class="logo-box" style="margin: 0 auto 14px; text-align: center;">
                <img src="${logoImgSrc}" alt="US Monastir" width="80" height="80" style="display: block; width: 80px; height: 80px; object-fit: contain; margin: 0 auto; border: 0;" />
              </div>
              <h1 class="title">Union Sportive Monastirienne</h1>
              <p class="subtitle">Boutique Officielle de l'Union Sportive Monastirienne</p>
            </div>

            <!-- Content -->
            <div class="body">
              <div style="text-align: center;">
                <span class="badge-confirmed">✓ Commande Enregistrée</span>
              </div>

              <h2 class="greeting">Bonjour ${params.customerName},</h2>
              <p class="lead">
                Nous vous remercions pour votre commande sur la Boutique Officielle de l'Union Sportive Monastirienne ! Notre équipe prépare vos articles avec le plus grand soin.
              </p>

              <!-- Order Ref Banner -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 14px 20px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td>
                      <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Référence de commande</span>
                      <span style="font-size: 18px; font-weight: 900; color: #0d63ff; font-family: monospace;">${params.orderNumber}</span>
                    </td>
                    <td style="text-align: right;">
                      <span style="font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; display: block;">Date</span>
                      <span style="font-size: 13px; font-weight: 700; color: #061a3a;">${new Date().toLocaleDateString('fr-TN')}</span>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Shipping Info -->
              <div class="section-title">Informations de livraison</div>
              <table class="details-table" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="details-label">Destinataire :</td>
                  <td class="details-val">${params.customerName}</td>
                </tr>
                <tr>
                  <td class="details-label">Téléphone :</td>
                  <td class="details-val" style="font-family: monospace;">${params.customerPhone}</td>
                </tr>
                <tr>
                  <td class="details-label">Gouvernorat :</td>
                  <td class="details-val">${params.customerCity}</td>
                </tr>
                ${params.customerAddress ? `
                <tr>
                  <td class="details-label">Adresse :</td>
                  <td class="details-val">${params.customerAddress}</td>
                </tr>
                ` : ''}
                <tr>
                  <td class="details-label">Paiement :</td>
                  <td class="details-val" style="color: #0d63ff;">Espèces à la livraison</td>
                </tr>
              </table>

              <!-- Ordered Items -->
              <div class="section-title">Articles commandés</div>
              <table class="items-table" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="text-align: left;">Article</th>
                    <th style="text-align: center; width: 50px;">Qté</th>
                    <th style="text-align: right; width: 80px;">Prix Unit.</th>
                    <th style="text-align: right; width: 90px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRows}
                </tbody>
              </table>

              <!-- Totals Breakdown -->
              <table class="totals-table" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #64748b;">Sous-total :</td>
                  <td style="text-align: right; font-weight: 700; color: #061a3a; font-family: monospace;">${formatTnd(params.subtotal)}</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">Frais de livraison (${params.customerCity}) :</td>
                  <td style="text-align: right; font-weight: 700; color: #061a3a; font-family: monospace;">${formatTnd(params.shippingCost)}</td>
                </tr>
                ${params.discount ? `
                <tr>
                  <td style="color: #027a48; font-weight: 600;">Remise code promo :</td>
                  <td style="text-align: right; font-weight: 700; color: #027a48; font-family: monospace;">-${formatTnd(params.discount)}</td>
                </tr>
                ` : ''}
                <tr class="total-highlight">
                  <td style="font-size: 15px; font-weight: 900; color: #061a3a; text-transform: uppercase;">Total à régler :</td>
                  <td style="text-align: right; font-size: 18px; font-weight: 900; color: #0d63ff; font-family: monospace;">${formatTnd(params.total)}</td>
                </tr>
              </table>

              <!-- Next step alert notice -->
              <div class="notice-box">
                <strong>📞 Prochaine étape :</strong> Notre service livraison vous contactera au <strong>${params.customerPhone}</strong> avant le passage du coursier pour confirmer le créneau horaire de livraison.
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-brand">Boutique Officielle de l'Union Sportive Monastirienne</div>
              <p style="margin: 0 0 8px; color: #94a3b8;">Une Ville, Un Cœur, Un Club • الاتحاد الرياضي المنستيري</p>
              <p style="margin: 0 0 12px; color: #64748b;">
                Partenaire : <a href="https://ibrandtunisia.tn/" target="_blank" style="color: #3ed6d0; text-decoration: none; font-weight: 700;">iBrand Tunisia</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #475569;">© ${new Date().getFullYear()} US Monastir. Tous droits réservés.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendMail(params.to, subject, html);
  }

  /**
   * Generic low-level helper to send mail via Nodemailer SMTP
   */
  async sendMail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    attachments?: any[]
  ): Promise<boolean> {
    try {
      const mailOptions: any = {
        from: this.getFromAddress(),
        to,
        subject,
        html,
        text: text || subject,
      };

      if (attachments && attachments.length > 0) {
        mailOptions.attachments = attachments;
      }

      const info = await this.transporter.sendMail(mailOptions);

      this.logger.log(`[SMTP] Email successfully dispatched to ${to} (MessageId: ${info.messageId})`);
      return true;
    } catch (err: any) {
      this.logger.error(`[SMTP ERROR] Failed to send email to ${to}: ${err.message}`, err.stack);
      return false;
    }
  }
}

