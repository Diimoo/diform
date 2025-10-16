const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { PublicClientApplication } = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');
require('dotenv').config();

// Initialize electron-store for persistent storage
const store = new Store();

// Validate required environment variables
if (!process.env.AZURE_CLIENT_ID) {
  console.error('❌ AZURE_CLIENT_ID is required but not set in environment variables');
  console.error('Please set AZURE_CLIENT_ID in your .env file');
  app.quit();
}

// MSAL Configuration - Uses environment variable
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: 'https://login.microsoftonline.com/common',
  },
};

const msalInstance = new PublicClientApplication(msalConfig);

let mainWindow;
let authToken = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // Load the React app
  const isDev = !app.isPackaged;
  const startURL = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../client/build/index.html')}`;

  mainWindow.loadURL(startURL);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open external links in browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Development only
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Microsoft Graph Authentication
ipcMain.handle('auth:login', async () => {
  try {
    const authResult = await acquireToken();
    if (authResult) {
      authToken = authResult.accessToken;
      
      // Store token with expiration
      store.set('auth', {
        accessToken: authResult.accessToken,
        expiresOn: authResult.expiresOn,
        account: authResult.account
      });
      
      store.set('user', {
        username: authResult.account.username,
        name: authResult.account.name,
      });
      
      // Schedule token refresh
      scheduleTokenRefresh(authResult.expiresOn);
      
      return {
        success: true,
        user: authResult.account,
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

ipcMain.handle('auth:logout', async () => {
  authToken = null;
  store.delete('user');
  return { success: true };
});

ipcMain.handle('auth:getUser', async () => {
  return store.get('user', null);
});

// Microsoft Graph API Handlers
ipcMain.handle('graph:getEmails', async (event, params) => {
  if (!authToken) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = getGraphClient(authToken);
    const messages = await client
      .api('/me/messages')
      .top(params?.limit || 50)
      .orderby('receivedDateTime DESC')
      .select('subject,from,receivedDateTime,bodyPreview,isRead')
      .get();

    return {
      success: true,
      data: messages.value,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});

ipcMain.handle('graph:getCalendarEvents', async (event, params) => {
  if (!authToken) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = getGraphClient(authToken);
    const events = await client
      .api('/me/calendar/events')
      .top(params?.limit || 20)
      .orderby('start/dateTime')
      .select('subject,start,end,location,attendees,organizer')
      .get();

    return {
      success: true,
      data: events.value,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});

ipcMain.handle('graph:getFiles', async (event, params) => {
  if (!authToken) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = getGraphClient(authToken);
    const files = await client
      .api('/me/drive/root/children')
      .top(params?.limit || 50)
      .select('name,size,lastModifiedDateTime,webUrl')
      .get();

    return {
      success: true,
      data: files.value,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});

ipcMain.handle('graph:sendEmail', async (event, emailData) => {
  if (!authToken) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = getGraphClient(authToken);
    const email = {
      message: {
        subject: emailData.subject,
        body: {
          contentType: 'HTML',
          content: emailData.body,
        },
        toRecipients: emailData.to.map(email => ({
          emailAddress: { address: email },
        })),
      },
      saveToSentItems: true,
    };

    await client.api('/me/sendMail').post(email);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});

ipcMain.handle('graph:createEvent', async (event, eventData) => {
  if (!authToken) {
    return { error: 'Not authenticated' };
  }

  try {
    const client = getGraphClient(authToken);
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
      attendees: eventData.attendees?.map(email => ({
        emailAddress: { address: email },
        type: 'required',
      })) || [],
    };

    const result = await client.api('/me/calendar/events').post(event);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
});

// Helper functions
async function acquireToken() {
  const authCodeUrlParameters = {
    scopes: [
      'User.Read',
      'Mail.ReadWrite',
      'Mail.Send',
      'Calendars.ReadWrite',
      'Files.ReadWrite.All',
    ],
    redirectUri: 'http://localhost',
  };

  try {
    const authCodeUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
    
    // Open authentication window
    const authWindow = new BrowserWindow({
      width: 500,
      height: 700,
      show: true,
      webPreferences: {
        nodeIntegration: false,
      },
    });

    authWindow.loadURL(authCodeUrl);

    return new Promise((resolve, reject) => {
      authWindow.webContents.on('will-redirect', async (event, url) => {
        if (url.startsWith('http://localhost')) {
          event.preventDefault();
          authWindow.close();

          const urlParams = new URL(url).searchParams;
          const code = urlParams.get('code');

          if (code) {
            try {
              const tokenRequest = {
                code,
                scopes: authCodeUrlParameters.scopes,
                redirectUri: 'http://localhost',
              };

              const response = await msalInstance.acquireTokenByCode(tokenRequest);
              resolve(response);
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error('No authorization code received'));
          }
        }
      });

      authWindow.on('closed', () => {
        reject(new Error('Authentication window closed'));
      });
    });
  } catch (error) {
    throw error;
  }
}

function getGraphClient(accessToken) {
  return Client.init({
    authProvider: (done) => {
      done(null, accessToken);
    },
  });
}

// Token refresh functionality
let refreshTimeout;

function scheduleTokenRefresh(expiresOn) {
  // Clear existing timeout
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
  
  const expiryTime = new Date(expiresOn).getTime();
  const now = Date.now();
  const timeUntilExpiry = expiryTime - now;
  
  // Refresh 5 minutes before expiry
  const refreshTime = Math.max(timeUntilExpiry - (5 * 60 * 1000), 0);
  
  console.log(`Token will refresh in ${Math.round(refreshTime / 1000 / 60)} minutes`);
  
  refreshTimeout = setTimeout(async () => {
    try {
      console.log('Refreshing access token...');
      const authData = store.get('auth');
      
      if (authData && authData.account) {
        // Silent token refresh
        const tokenRequest = {
          scopes: [
            'User.Read',
            'Mail.ReadWrite',
            'Mail.Send',
            'Calendars.ReadWrite',
            'Files.ReadWrite.All',
          ],
          account: authData.account,
          forceRefresh: true
        };
        
        const refreshedToken = await msalInstance.acquireTokenSilent(tokenRequest);
        
        if (refreshedToken) {
          authToken = refreshedToken.accessToken;
          
          store.set('auth', {
            accessToken: refreshedToken.accessToken,
            expiresOn: refreshedToken.expiresOn,
            account: refreshedToken.account
          });
          
          console.log('✅ Token refreshed successfully');
          
          // Schedule next refresh
          scheduleTokenRefresh(refreshedToken.expiresOn);
        }
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, user will need to login again
      authToken = null;
      store.delete('auth');
    }
  }, refreshTime);
}

// On app start, check for existing valid token
app.whenReady().then(() => {
  const authData = store.get('auth');
  
  if (authData && authData.expiresOn) {
    const expiryTime = new Date(authData.expiresOn).getTime();
    const now = Date.now();
    
    if (expiryTime > now) {
      // Token still valid
      authToken = authData.accessToken;
      scheduleTokenRefresh(authData.expiresOn);
      console.log('✅ Restored existing valid token');
    } else {
      // Token expired, clear it
      store.delete('auth');
      console.log('⚠️  Stored token expired, login required');
    }
  }
});
