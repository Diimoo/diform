/**
 * Microsoft Graph Service for React Native
 * Handles authentication and API calls to Microsoft Graph
 */

import { PublicClientApplication } from 'react-native-msal';
import { Client } from '@microsoft/microsoft-graph-client';
import * as Keychain from 'react-native-keychain';

// MSAL Configuration - Replace with your Azure AD app credentials
const msalConfig = {
  clientId: 'YOUR_CLIENT_ID_HERE',
  authority: 'https://login.microsoftonline.com/common',
  redirectUri: 'msauth://com.diform.mobile/YOUR_SIGNATURE_HASH',
};

const scopes = [
  'User.Read',
  'Mail.ReadWrite',
  'Mail.Send',
  'Calendars.ReadWrite',
  'Files.ReadWrite.All',
];

class MSGraphService {
  constructor() {
    this.msalClient = null;
    this.accessToken = null;
    this.user = null;
    this.initMsal();
  }

  async initMsal() {
    try {
      this.msalClient = await PublicClientApplication.createPublicClientApplication(
        msalConfig
      );
    } catch (error) {
      console.error('MSAL initialization error:', error);
    }
  }

  // Authentication
  async login() {
    try {
      const result = await this.msalClient.acquireToken({
        scopes,
      });

      if (result) {
        this.accessToken = result.accessToken;
        this.user = result.account;

        // Store token securely
        await Keychain.setGenericPassword(
          'diform_token',
          this.accessToken,
          { service: 'com.diform.mobile' }
        );

        return result.account;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      if (this.user) {
        await this.msalClient.signOut({ account: this.user });
      }
      this.accessToken = null;
      this.user = null;

      // Remove stored token
      await Keychain.resetGenericPassword({ service: 'com.diform.mobile' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getUser() {
    return this.user;
  }

  async getToken() {
    if (!this.accessToken) {
      // Try to get from keychain
      const credentials = await Keychain.getGenericPassword({
        service: 'com.diform.mobile',
      });
      if (credentials) {
        this.accessToken = credentials.password;
      }
    }
    return this.accessToken;
  }

  // Get Graph Client
  getGraphClient() {
    return Client.init({
      authProvider: async (done) => {
        const token = await this.getToken();
        if (token) {
          done(null, token);
        } else {
          done(new Error('No access token available'), null);
        }
      },
    });
  }

  // Email Operations
  async getEmails(limit = 50) {
    try {
      const client = this.getGraphClient();
      const messages = await client
        .api('/me/messages')
        .top(limit)
        .orderby('receivedDateTime DESC')
        .select('subject,from,receivedDateTime,bodyPreview,isRead')
        .get();

      return messages.value;
    } catch (error) {
      console.error('Get emails error:', error);
      throw error;
    }
  }

  async sendEmail(emailData) {
    try {
      const client = this.getGraphClient();
      const email = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: 'HTML',
            content: emailData.body,
          },
          toRecipients: emailData.to.map((email) => ({
            emailAddress: { address: email },
          })),
        },
        saveToSentItems: true,
      };

      await client.api('/me/sendMail').post(email);
      return true;
    } catch (error) {
      console.error('Send email error:', error);
      throw error;
    }
  }

  // Calendar Operations
  async getCalendarEvents(limit = 20) {
    try {
      const client = this.getGraphClient();
      const events = await client
        .api('/me/calendar/events')
        .top(limit)
        .orderby('start/dateTime')
        .select('subject,start,end,location,attendees,organizer')
        .get();

      return events.value;
    } catch (error) {
      console.error('Get calendar events error:', error);
      throw error;
    }
  }

  async createEvent(eventData) {
    try {
      const client = this.getGraphClient();
      const event = {
        subject: eventData.subject,
        start: {
          dateTime: eventData.start,
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventData.end,
          timeZone: 'UTC',
        },
        attendees:
          eventData.attendees?.map((email) => ({
            emailAddress: { address: email },
            type: 'required',
          })) || [],
      };

      const result = await client.api('/me/calendar/events').post(event);
      return result;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  }

  // File Operations
  async getFiles(limit = 50) {
    try {
      const client = this.getGraphClient();
      const files = await client
        .api('/me/drive/root/children')
        .top(limit)
        .select('name,size,lastModifiedDateTime,webUrl')
        .get();

      return files.value;
    } catch (error) {
      console.error('Get files error:', error);
      throw error;
    }
  }

  async searchFiles(query) {
    try {
      const client = this.getGraphClient();
      const results = await client
        .api('/me/drive/root/search')
        .query({ q: query })
        .get();

      return results.value;
    } catch (error) {
      console.error('Search files error:', error);
      throw error;
    }
  }
}

// Export singleton instance
const msGraphService = new MSGraphService();
export default msGraphService;
