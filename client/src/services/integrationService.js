/**
 * Integration Service
 * Handles communication with Electron API or web fallback
 */

class IntegrationService {
  constructor() {
    this.isElectron = window.electronAPI?.isElectron || false;
    this.isAuthenticated = false;
    this.user = null;
  }

  // Check if running in Electron
  isElectronApp() {
    return this.isElectron;
  }

  // Authentication
  async login() {
    if (this.isElectron) {
      try {
        const result = await window.electronAPI.login();
        if (result.success) {
          this.isAuthenticated = true;
          this.user = result.user;
        }
        return result;
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Web fallback - mock authentication
      return {
        success: false,
        error: 'Authentication only available in desktop app',
      };
    }
  }

  async logout() {
    if (this.isElectron) {
      const result = await window.electronAPI.logout();
      this.isAuthenticated = false;
      this.user = null;
      return result;
    }
    return { success: true };
  }

  async getUser() {
    if (this.isElectron) {
      const user = await window.electronAPI.getUser();
      this.user = user;
      this.isAuthenticated = !!user;
      return user;
    }
    return null;
  }

  // Email Operations
  async getEmails(params = {}) {
    if (this.isElectron && this.isAuthenticated) {
      return await window.electronAPI.getEmails(params);
    } else {
      // Return mock data for web version
      return {
        success: true,
        data: this.getMockEmails(),
        mock: true,
      };
    }
  }

  async sendEmail(emailData) {
    if (this.isElectron && this.isAuthenticated) {
      return await window.electronAPI.sendEmail(emailData);
    } else {
      return {
        success: false,
        error: 'Email sending only available in desktop app',
        mock: true,
      };
    }
  }

  // Calendar Operations
  async getCalendarEvents(params = {}) {
    if (this.isElectron && this.isAuthenticated) {
      return await window.electronAPI.getCalendarEvents(params);
    } else {
      return {
        success: true,
        data: this.getMockEvents(),
        mock: true,
      };
    }
  }

  async createEvent(eventData) {
    if (this.isElectron && this.isAuthenticated) {
      return await window.electronAPI.createEvent(eventData);
    } else {
      return {
        success: false,
        error: 'Calendar integration only available in desktop app',
        mock: true,
      };
    }
  }

  // File Operations
  async getFiles(params = {}) {
    if (this.isElectron && this.isAuthenticated) {
      return await window.electronAPI.getFiles(params);
    } else {
      return {
        success: true,
        data: this.getMockFiles(),
        mock: true,
      };
    }
  }

  // Mock Data Generators (for web version testing)
  getMockEmails() {
    return [
      {
        subject: 'Project X Update - Q3 Results',
        from: { emailAddress: { address: 'john@example.com', name: 'John Doe' } },
        receivedDateTime: new Date(Date.now() - 3600000).toISOString(),
        bodyPreview: 'Here are the Q3 results for Project X...',
        isRead: false,
      },
      {
        subject: 'Meeting Notes - Strategy Session',
        from: { emailAddress: { address: 'sarah@example.com', name: 'Sarah Smith' } },
        receivedDateTime: new Date(Date.now() - 7200000).toISOString(),
        bodyPreview: 'Attached are the notes from our strategy session...',
        isRead: true,
      },
      {
        subject: 'Budget Approval Required',
        from: { emailAddress: { address: 'finance@example.com', name: 'Finance Team' } },
        receivedDateTime: new Date(Date.now() - 86400000).toISOString(),
        bodyPreview: 'Please review and approve the Q4 budget...',
        isRead: false,
      },
    ];
  }

  getMockEvents() {
    const now = new Date();
    return [
      {
        subject: 'Team Standup',
        start: { dateTime: new Date(now.getTime() + 3600000).toISOString() },
        end: { dateTime: new Date(now.getTime() + 5400000).toISOString() },
        location: { displayName: 'Conference Room A' },
        attendees: [
          { emailAddress: { address: 'team@example.com', name: 'Team' } },
        ],
      },
      {
        subject: 'Client Meeting - Project X',
        start: { dateTime: new Date(now.getTime() + 86400000).toISOString() },
        end: { dateTime: new Date(now.getTime() + 90000000).toISOString() },
        location: { displayName: 'Virtual' },
        attendees: [
          { emailAddress: { address: 'client@example.com', name: 'Client' } },
        ],
      },
    ];
  }

  getMockFiles() {
    return [
      {
        name: 'Project_X_Report.docx',
        size: 245678,
        lastModifiedDateTime: new Date(Date.now() - 86400000).toISOString(),
        webUrl: '#',
      },
      {
        name: 'Q3_Budget.xlsx',
        size: 123456,
        lastModifiedDateTime: new Date(Date.now() - 172800000).toISOString(),
        webUrl: '#',
      },
      {
        name: 'Presentation_Draft.pptx',
        size: 567890,
        lastModifiedDateTime: new Date(Date.now() - 259200000).toISOString(),
        webUrl: '#',
      },
    ];
  }
}

// Export singleton instance
const integrationService = new IntegrationService();
export default integrationService;
