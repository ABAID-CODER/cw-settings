// preload.js - ESM preload
import { contextBridge, ipcRenderer } from 'electron';

const electronAPI = {
  // Window Controls
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  openDevTools: () => ipcRenderer.invoke('open-dev-tools'),

  // App Management
  closeApp: () => ipcRenderer.invoke('close-app'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Configuration and Release Fetching
  fetchConfig: (configUrl) => ipcRenderer.invoke('fetch-github-config', configUrl),
  fetchReleasesWithConfig: (configUrl, type) => ipcRenderer.invoke('fetch-releases-with-config', { configUrl, type }),
  fetchReleasesDirect: ({ owner, repo }) => ipcRenderer.invoke('fetch-releases-direct', { owner, repo }),

  // Download System
  downloadFile: ({ url, fileName, destination, downloadId, headers = {}, showDirectorySelector = false, autoExtract = true }) =>
    ipcRenderer.invoke('download-file', { url, fileName, destination, downloadId, headers, showDirectorySelector, autoExtract }),
  pauseDownload: (downloadId) => ipcRenderer.invoke('pause-download', downloadId),
  resumeDownload: (downloadId) => ipcRenderer.invoke('resume-download', downloadId),
  cancelDownload: (downloadId) => ipcRenderer.invoke('cancel-download', downloadId),
  
  // Download event listeners
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, data) => callback(data)),
  onDownloadCompleted: (callback) => ipcRenderer.on('download-completed', (event, data) => callback(data)),
  onDownloadFailed: (callback) => ipcRenderer.on('download-failed', (event, data) => callback(data)),
  
  // App paths
  getAppPaths: () => ipcRenderer.invoke('get-app-paths'),
  
  // Test download (for debugging)
  testDownload: () => ipcRenderer.invoke('test-download'),

  // File Operations
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  showItemInFolder: (filePath) => ipcRenderer.invoke('show-item-in-folder', filePath),
  openPath: (p) => ipcRenderer.invoke('open-folder', p),
  checkPathExists: (p) => ipcRenderer.invoke('check-path-exists', p),
  
  // Token Generator API
  startTokenGenerator: () => ipcRenderer.invoke('start-token-generator'),
  sendTokenGeneratorCommand: (command) => ipcRenderer.invoke('send-token-generator-command', command),
  exportConsoleOutput: (consoleData) => ipcRenderer.invoke('export-console-output', consoleData),
  onTokenGeneratorOutput: (callback) => ipcRenderer.on('token-generator-output', (event, data) => callback(data)),
  onTokenGeneratorError: (callback) => ipcRenderer.on('token-generator-error', (event, data) => callback(data)),
  getPath: async (key) => {
    const res = await ipcRenderer.invoke('get-path', key);
    if (res?.success) return res.path;
    throw new Error(res?.error || 'Failed to get path');
  },
  getDirectoryContents: (dirPath) => ipcRenderer.invoke('get-directory-contents', dirPath),
  createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),

  // File Content Reading
  readTermsFile: () => ipcRenderer.invoke('read-terms-file'),
  readChangelogFile: () => ipcRenderer.invoke('read-changelog-file'),

  // App Updates
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: ({ downloadUrl, version, checksum }) => ipcRenderer.invoke('download-update', { downloadUrl, version, checksum }),
  installUpdate: ({ filePath, backupPath }) => ipcRenderer.invoke('install-update', { filePath, backupPath }),
  rollbackUpdate: ({ backupPath }) => ipcRenderer.invoke('rollback-update', { backupPath }),
  getBackups: () => ipcRenderer.invoke('get-backups'),

  // Announcements
  fetchAnnouncement: () => ipcRenderer.invoke('fetch-announcement'),
  publishAnnouncement: ({ token, title, content }) => ipcRenderer.invoke('publish-announcement', { token, title, content }),

  // Manifest Generation
  generateManifest: (appId) => ipcRenderer.invoke('generate-manifest', appId),

  // Installed Games Detection
  detectInstalledGames: () => ipcRenderer.invoke('scan-installed-games'),
  scanDirectory: (directoryPath) => ipcRenderer.invoke('scan-directory', directoryPath),

  // GitHub Operations
  uploadRelease: ({ token, owner, repo, releaseName, versionTag, releaseNotes, zipName, zipDataB64 }) =>
    ipcRenderer.invoke('upload-release', { token, owner, repo, releaseName, versionTag, releaseNotes, zipName, zipDataB64 }),
  updateGitHubRelease: ({ type, releaseId, token, title, tag, description, prerelease, draft }) =>
    ipcRenderer.invoke('update-github-release', { type, releaseId, token, title, tag, description, prerelease, draft }),

  // ZIP Operations
  createZipFromFiles: ({ files, outputPath, uploadOptions }) =>
    ipcRenderer.invoke('create-zip-from-files', { files, outputPath, uploadOptions }),
  createZipAndUpload: ({ files, zipName, uploadOptions }) =>
    ipcRenderer.invoke('create-zip-and-upload', { files, zipName, uploadOptions }),

  // Archive Extraction with Deletion
  extractArchiveAndDelete: ({ archivePath, destinationPath }) =>
    ipcRenderer.invoke('extract-archive-and-delete', { archivePath, destinationPath }),

  // External Operations
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // YouTube Integration
  validateYoutubeUrl: (url) => ipcRenderer.invoke('validate-youtube-url', url),

  // Directory Selection
  directoryResult: (data) => ipcRenderer.send('directory-selector-result', data),

  // Download Event Listeners
  onDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-progress', handler);
    return () => ipcRenderer.removeListener('download-progress', handler);
  },
  onDownloadComplete: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-complete', handler);
    return () => ipcRenderer.removeListener('download-complete', handler);
  },
  onDownloadError: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-error', handler);
    return () => ipcRenderer.removeListener('download-error', handler);
  },
  onShowDirectorySelector: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('show-directory-selector', handler);
    return () => ipcRenderer.removeListener('show-directory-selector', handler);
  },
  onShowCompletionDirectorySelector: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('show-completion-directory-selector', handler);
    return () => ipcRenderer.removeListener('show-completion-directory-selector', handler);
  },
  onDownloadExtracted: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-extracted', handler);
    return () => ipcRenderer.removeListener('download-extracted', handler);
  },
  onDownloadExtractionFailed: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('download-extraction-failed', handler);
    return () => ipcRenderer.removeListener('download-extraction-failed', handler);
  },
  onUpdateDownloadProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on('update-download-progress', handler);
    return () => ipcRenderer.removeListener('update-download-progress', handler);
  },

  // Token Generator
  runTokenGenerator: (args) => ipcRenderer.invoke('run-token-generator', args),
  getTokenGeneratorPath: () => ipcRenderer.invoke('get-token-generator-path'),

  // Utility
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
  send: (channel, data) => ipcRenderer.send(channel, data),
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
Object.freeze(electronAPI);

console.log('Preload (ESM) loaded successfully');
console.log('ElectronAPI exposed:', Object.keys(electronAPI));
console.log('Context bridge available:', !!contextBridge);
console.log('IPC Renderer available:', !!ipcRenderer);

// Test if the API is working
try {
  console.log('Testing windowMinimize function:', typeof electronAPI.windowMinimize);
  console.log('Testing windowMaximize function:', typeof electronAPI.windowMaximize);
  console.log('Testing windowClose function:', typeof electronAPI.windowClose);
} catch (error) {
  console.error('Error testing API functions:', error);
}