import { api } from './api';
import type { AdminInvitation } from './api';

interface EmailConfig {
  from: string;
  replyTo?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  /**
   * Replace template variables with actual values
   */
  private replacePlaceholders(template: string, variables: Record<string, string>): string {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, value);
    });
    
    return result;
  }

  /**
   * Get the invitation URL for the frontend
   */
  private getInvitationUrl(token: string): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/admin/accept-invitation?token=${token}`;
  }

  /**
   * Send invitation email to a new admin user
   */
  async sendInvitationEmail(invitation: AdminInvitation): Promise<void> {
    try {
      // Get the invitation email template
      const template = await api.invitationEmailTemplates.getByType('Admin Invitation Email');
      
      if (!template) {
        throw new Error('No invitation email template found');
      }

      // Prepare template variables
      const variables = {
        email: invitation.email,
        role: invitation.role,
        invitation_url: this.getInvitationUrl(invitation.invitation_token),
        expires_at: new Date(invitation.expires_at).toLocaleDateString(),
        company_name: 'Trinexa',
        support_email: this.config.from
      };

      // Replace placeholders in subject and body
      const subject = this.replacePlaceholders(template.subject, variables);
      const htmlBody = this.replacePlaceholders(template.content, variables);
      const textBody = this.htmlToText(htmlBody);

      // Send email via your preferred email service
      await this.sendEmail({
        to: invitation.email,
        subject,
        html: htmlBody,
        text: textBody
      });

    } catch (error) {
      console.error('Failed to send invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  }

  /**
   * Send welcome email after successful invitation acceptance
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    try {
      const template = await api.invitationEmailTemplates.getByType('Admin Welcome Email');
      
      if (!template) {
        console.log('No welcome email template found - skipping welcome email');
        return;
      }

      const variables = {
        name: name || email,
        email: email,
        login_url: `${window.location.origin}/admin/login`,
        company_name: 'Trinexa',
        support_email: this.config.from
      };

      const subject = this.replacePlaceholders(template.subject, variables);
      const htmlBody = this.replacePlaceholders(template.content, variables);
      const textBody = this.htmlToText(htmlBody);

      await this.sendEmail({
        to: email,
        subject,
        html: htmlBody,
        text: textBody
      });

    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw error for welcome email - it's not critical
    }
  }

  /**
   * Convert HTML to plain text (basic implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }

  /**
   * Core email sending function - implement with your email service
   */
  private async sendEmail(emailData: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    // Example implementation using fetch to a backend email service
    // Replace this with your actual email service implementation
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.config.from,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          replyTo: this.config.replyTo || this.config.from
        })
      });

      if (!response.ok) {
        throw new Error(`Email service responded with status: ${response.status}`);
      }

    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Fallback: Log email content for manual sending in development
      if (process.env.NODE_ENV === 'development') {
        console.log('EMAIL CONTENT (Development Mode):');
        console.log('To:', emailData.to);
        console.log('Subject:', emailData.subject);
        console.log('HTML:', emailData.html);
        console.log('Text:', emailData.text);
        console.log('---');
      }
      
      throw error;
    }
  }

  /**
   * Send test email to verify configuration
   */
  async sendTestEmail(to: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Trinexa Admin - Email Configuration Test',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify that your email configuration is working correctly.</p>
        <p>If you received this email, your email service is properly configured.</p>
        <p>Best regards,<br>Trinexa Admin System</p>
      `,
      text: `
        Email Configuration Test
        
        This is a test email to verify that your email configuration is working correctly.
        If you received this email, your email service is properly configured.
        
        Best regards,
        Trinexa Admin System
      `
    });
  }
}

// Default email service instance
export const emailService = new EmailService({
  from: 'admin@trinexa.com',
  replyTo: 'support@trinexa.com'
});

// Export types for use in other files
export type { EmailConfig };
