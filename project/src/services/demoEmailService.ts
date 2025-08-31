import { api, DemoSessionSchedule, DemoSessionAssignment, DemoBooking } from './api';

export interface EmailData {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  attachments?: any[];
}

export interface GoogleMeetDetails {
  meetingId: string;
  meetLink: string;
  eventId: string;
}

export class DemoEmailService {
  
  /**
   * Generate Google Meet link (placeholder - integrate with Google Calendar API)
   */
  static async createGoogleMeet(
    title: string,
    startTime: string,
    endTime: string,
    attendees: string[]
  ): Promise<GoogleMeetDetails> {
    // Placeholder implementation
    // In production, integrate with Google Calendar API
    const meetingId = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const meetLink = `https://meet.google.com/${meetingId}`;
    const eventId = `event-${Date.now()}`;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Log the meeting details for debugging
    console.log('📅 Creating Google Meet:', {
      title,
      startTime,
      endTime,
      attendees: attendees.length,
      meetLink
    });
    
    return {
      meetingId,
      meetLink,
      eventId
    };
  }

  /**
   * Send team assignment notification emails
   */
  static async sendTeamAssignmentNotifications(
    demoBooking: DemoBooking,
    assignments: DemoSessionAssignment[],
    includeInactive: boolean = false
  ): Promise<void> {
    try {
      const template = await this.getTemplateByCategory('demo_assignment', includeInactive);
      
      if (!template) {
        console.warn('Demo assignment email template not found or inactive');
        return;
      }
      
      for (const assignment of assignments) {
        if (assignment.team_member?.email) {
          const emailBody = this.replaceTemplateVariables(template.content, {
            team_member_name: assignment.team_member.name,
            client_name: demoBooking.name,
            client_email: demoBooking.email,
            company_name: demoBooking.company,
            product_interest: demoBooking.product_interest,
            role_in_demo: assignment.role_in_demo,
            preferred_date: demoBooking.preferred_date
          });

          const emailSubject = this.replaceTemplateVariables(template.subject, {
            company_name: demoBooking.company
          });

          await this.sendEmail({
            to: [assignment.team_member.email],
            subject: emailSubject,
            body: emailBody
          });
        }
      }
    } catch (error) {
      console.error('Error sending assignment notifications:', error);
    }
  }

  /**
   * Send schedule confirmation emails
   */
  static async sendScheduleConfirmationEmails(
    demoBooking: DemoBooking,
    schedule: DemoSessionSchedule,
    assignments: DemoSessionAssignment[],
    includeInactive: boolean = false
  ): Promise<void> {
    try {
      const template = await this.getTemplateByCategory('demo_confirmation', includeInactive);
      
      if (!template) {
        console.warn('Demo confirmation email template not found or inactive');
        return;
      }
      
      // Prepare team members list for email
      const teamMembersList = assignments
        .map(a => `• ${a.team_member?.name} (${a.role_in_demo})`)
        .join('\n');

      const emailVariables = {
        client_name: demoBooking.name,
        scheduled_date: this.formatDate(schedule.scheduled_date),
        scheduled_time: this.formatTime(schedule.start_time),
        timezone: schedule.timezone,
        google_meet_link: schedule.google_meet_link || 'Will be provided shortly',
        team_members_list: teamMembersList,
        agenda: schedule.agenda || `Demo session for ${demoBooking.product_interest}`
      };

      // Send to client
      const clientEmailBody = this.replaceTemplateVariables(template.content, emailVariables);
      const clientEmailSubject = this.replaceTemplateVariables(template.subject, emailVariables);
      
      await this.sendEmail({
        to: [demoBooking.email],
        subject: clientEmailSubject,
        body: clientEmailBody
      });

      // Send to team members
      const teamEmails = assignments
        .filter(a => a.team_member?.email)
        .map(a => a.team_member!.email);

      if (teamEmails.length > 0) {
        const teamEmailBody = this.addTeamSpecificInfo(clientEmailBody, schedule.preparation_notes);
        
        await this.sendEmail({
          to: teamEmails,
          cc: [demoBooking.email],
          subject: `[TEAM] ${clientEmailSubject}`,
          body: teamEmailBody
        });
      }
    } catch (error) {
      console.error('Error sending confirmation emails:', error);
    }
  }

  /**
   * Send reminder emails
   */
  static async sendReminderEmails(
    demoBooking: DemoBooking,
    schedule: DemoSessionSchedule,
    assignments: DemoSessionAssignment[],
    includeInactive: boolean = false
  ): Promise<void> {
    try {
      const template = await this.getTemplateByCategory('demo_reminder', includeInactive);
      
      if (!template) {
        console.warn('Demo reminder email template not found or inactive');
        return;
      }
      
      const baseVariables = {
        scheduled_date: this.formatDate(schedule.scheduled_date),
        scheduled_time: this.formatTime(schedule.start_time),
        timezone: schedule.timezone,
        google_meet_link: schedule.google_meet_link || ''
      };

      // Send to client
      const clientVariables = {
        ...baseVariables,
        recipient_name: demoBooking.name,
        product_interest: demoBooking.product_interest
      };

      const clientEmailBody = this.replaceTemplateVariables(template.content, clientVariables);
      const clientEmailSubject = this.replaceTemplateVariables(template.subject, {
        company_name: demoBooking.company
      });

      await this.sendEmail({
        to: [demoBooking.email],
        subject: clientEmailSubject,
        body: clientEmailBody
      });

      // Send to team members
      for (const assignment of assignments) {
        if (assignment.team_member?.email) {
          const teamVariables = {
            ...baseVariables,
            recipient_name: assignment.team_member.name,
            role_in_demo: assignment.role_in_demo,
            preparation_notes: schedule.preparation_notes || 'No specific preparation notes.'
          };

          const teamEmailBody = this.replaceTemplateVariables(template.content, teamVariables);
          
          await this.sendEmail({
            to: [assignment.team_member.email],
            subject: `[TEAM] ${clientEmailSubject}`,
            body: teamEmailBody
          });
        }
      }
    } catch (error) {
      console.error('Error sending reminder emails:', error);
    }
  }

  /**
   * Get email template by category with optional inactive template support
   */
  private static async getTemplateByCategory(
    category: string, 
    includeInactive: boolean = false
  ): Promise<any> {
    try {
      const templates = await api.emailTemplates.getAll();
      return templates.find(t => 
        t.category === category && 
        (includeInactive || t.is_active)
      );
    } catch (error) {
      console.error(`Error fetching template for category ${category}:`, error);
      return null;
    }
  }

  /**
   * Get all demo-related email templates with filtering options
   */
  static async getDemoEmailTemplates(includeInactive: boolean = false): Promise<any[]> {
    try {
      const templates = await api.emailTemplates.getAll();
      return templates.filter(t => 
        t.category.startsWith('demo_') && 
        (includeInactive || t.is_active)
      );
    } catch (error) {
      console.error('Error fetching demo email templates:', error);
      return [];
    }
  }

  /**
   * Check if a specific demo email template is available and active
   */
  static async isTemplateAvailable(
    category: string, 
    requireActive: boolean = true
  ): Promise<boolean> {
    const template = await this.getTemplateByCategory(category, !requireActive);
    return template !== null;
  }

  /**
   * Replace template variables in text
   */
  private static replaceTemplateVariables(text: string, variables: Record<string, string>): string {
    let result = text;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    });
    
    return result;
  }

  /**
   * Add team-specific information to email body
   */
  private static addTeamSpecificInfo(emailBody: string, preparationNotes?: string): string {
    const teamInfo = `\n\n--- TEAM INFORMATION ---\n`;
    const prepNotes = preparationNotes 
      ? `Preparation Notes: ${preparationNotes}\n`
      : 'No specific preparation notes.\n';
    
    return emailBody + teamInfo + prepNotes;
  }

  /**
   * Format date for display
   */
  private static formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  /**
   * Format time for display
   */
  private static formatTime(timeString: string): string {
    try {
      return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  }

  /**
   * Send email (placeholder - integrate with email service)
   */
  private static async sendEmail(emailData: EmailData): Promise<void> {
    // Placeholder implementation
    // In production, integrate with email service like SendGrid, AWS SES, etc.
    
    console.log('📧 Sending Email:');
    console.log('To:', emailData.to.join(', '));
    if (emailData.cc) console.log('CC:', emailData.cc.join(', '));
    console.log('Subject:', emailData.subject);
    console.log('Body:', emailData.body);
    console.log('---');
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // In production, replace with actual email service call:
    /*
    const emailService = new EmailService();
    await emailService.send({
      to: emailData.to,
      cc: emailData.cc,
      subject: emailData.subject,
      html: emailData.body,
      attachments: emailData.attachments
    });
    */
  }

  /**
   * Schedule automated reminder emails
   */
  static async scheduleReminderEmails(
    demoBooking: DemoBooking,
    schedule: DemoSessionSchedule,
    assignments: DemoSessionAssignment[],
    includeInactive: boolean = false
  ): Promise<void> {
    // Placeholder for scheduling reminders
    // In production, use a job queue or cron system
    
    console.log('📅 Scheduling reminder emails for demo session:');
    console.log('- 24 hours before');
    console.log('- 2 hours before');
    console.log('- Demo details:', {
      client: demoBooking.name,
      date: schedule.scheduled_date,
      time: schedule.start_time,
      teamMembers: assignments.length,
      includeInactive
    });

    // Example using setTimeout (not recommended for production)
    // In production, use a proper job scheduler like Bull, Agenda, or AWS EventBridge
    /*
    const demoDateTime = new Date(`${schedule.scheduled_date}T${schedule.start_time}`);
    const reminderTime24h = new Date(demoDateTime.getTime() - 24 * 60 * 60 * 1000);
    const reminderTime2h = new Date(demoDateTime.getTime() - 2 * 60 * 60 * 1000);
    
    if (reminderTime24h > new Date()) {
      setTimeout(() => {
        this.sendReminderEmails(demoBooking, schedule, assignments, includeInactive);
      }, reminderTime24h.getTime() - Date.now());
    }
    
    if (reminderTime2h > new Date()) {
      setTimeout(() => {
        this.sendReminderEmails(demoBooking, schedule, assignments, includeInactive);
      }, reminderTime2h.getTime() - Date.now());
    }
    */
  }
}

export default DemoEmailService;
