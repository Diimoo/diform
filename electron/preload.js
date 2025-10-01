const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  login: () => ipcRenderer.invoke('auth:login'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getUser: () => ipcRenderer.invoke('auth:getUser'),

  // Microsoft Graph - Email
  getEmails: (params) => ipcRenderer.invoke('graph:getEmails', params),
  sendEmail: (emailData) => ipcRenderer.invoke('graph:sendEmail', emailData),

  // Microsoft Graph - Calendar
  getCalendarEvents: (params) => ipcRenderer.invoke('graph:getCalendarEvents', params),
  createEvent: (eventData) => ipcRenderer.invoke('graph:createEvent', eventData),

  // Microsoft Graph - Files
  getFiles: (params) => ipcRenderer.invoke('graph:getFiles', params),

  // Check if running in Electron
  isElectron: true,
  platform: process.platform,
});
