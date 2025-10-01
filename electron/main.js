const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { PublicClientApplication } = require('@azure/msal-node');
const { Client } = require('@microsoft/microsoft-graph-client');

// Initialize electron-store for persistent storage
const store = new Store();

// MSAL Configuration - Replace with your Azure AD app credentials
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
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
      store.set('user', {
        username: authResult.account.username,
        name: authResult.account.name,
      });
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
