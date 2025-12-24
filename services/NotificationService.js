class NotificationService {
  // Dummy method for WhatsApp notification
  static async sendWhatsAppNotification(phoneNumber, template, data) {
    // Simulating API call with timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('WhatsApp Notification sent:', {
          to: phoneNumber,
          template,
          data
        });
        resolve({ success: true, message: 'WhatsApp notification sent' });
      }, 1000);
    });
  }

  // Dummy method for Email notification
  static async sendEmailNotification(email, subject, content) {
    // Simulating API call with timeout
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Email Notification sent:', {
          to: email,
          subject,
          content
        });
        resolve({ success: true, message: 'Email notification sent' });
      }, 1000);
    });
  }

  // Notification templates
  static templates = {
    INTERVIEW_SCHEDULED: {
      whatsapp: 'interview_scheduled',
      email: {
        subject: 'Interview Scheduled',
        template: `
          Dear {{candidateName}},
          
          Your interview has been scheduled for {{position}} position.
          
          Date: {{date}}
          Time: {{time}}
          Platform: {{platform}}
          Link: {{link}}
          
          Best regards,
          {{companyName}}
        `
      }
    },
    INTERVIEW_RESULT: {
      whatsapp: 'interview_result',
      email: {
        subject: 'Interview Results',
        template: `
          Dear {{candidateName}},
          
          We would like to inform you about your interview results for {{position}} position.
          
          Status: {{status}}
          {{additionalInfo}}
          
          Best regards,
          {{companyName}}
        `
      }
    },
    OFFER_LETTER: {
      whatsapp: 'offer_letter',
      email: {
        subject: 'Offer Letter - {{position}}',
        template: `
          Dear {{candidateName}},
          
          Congratulations! We are pleased to offer you the position of {{position}}.
          
          Please find your offer letter attached.
          
          Best regards,
          {{companyName}}
        `
      }
    },
    APPLICATION_STATUS: {
      whatsapp: 'application_status',
      email: {
        subject: 'Application Status Update',
        template: `
          Dear {{candidateName}},
          
          Your application for {{position}} has been {{status}}.
          
          {{additionalInfo}}
          
          Best regards,
          {{companyName}}
        `
      }
    }
  };

  // Helper method to send both WhatsApp and Email notifications
  static async sendNotification(type, userData, notificationData) {
    try {
      const template = this.templates[type];
      
      // Simulate WhatsApp notification
      if (userData.phoneNumber) {
        await this.sendWhatsAppNotification(
          userData.phoneNumber,
          template.whatsapp,
          notificationData
        );
      }

      // Simulate Email notification
      if (userData.email) {
        const emailContent = template.email.template.replace(
          /\{\{(\w+)\}\}/g,
          (match, key) => notificationData[key] || match
        );
        
        const emailSubject = template.email.subject.replace(
          /\{\{(\w+)\}\}/g,
          (match, key) => notificationData[key] || match
        );

        await this.sendEmailNotification(
          userData.email,
          emailSubject,
          emailContent
        );
      }

      return true;
    } catch (error) {
      console.error('Notification error:', error);
      throw error;
    }
  }

  // Add dummy notification history
  static getDummyNotifications() {
    return [
      {
        id: 1,
        type: 'INTERVIEW_SCHEDULED',
        timestamp: new Date().toISOString(),
        data: {
          candidateName: 'John Doe',
          position: 'React Native Developer',
          date: '2024-02-20',
          time: '10:00 AM',
          platform: 'Google Meet'
        }
      },
      {
        id: 2,
        type: 'INTERVIEW_RESULT',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        data: {
          candidateName: 'Jane Smith',
          position: 'UI/UX Designer',
          status: 'Selected',
          additionalInfo: 'Congratulations!'
        }
      },
      {
        id: 3,
        type: 'OFFER_LETTER',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        data: {
          candidateName: 'Mike Johnson',
          position: 'Senior Developer',
          salary: '₹15,00,000'
        }
      }
    ];
  }
}

export default NotificationService; 