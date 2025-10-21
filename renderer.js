// renderer.js - Complete Production-Ready Implementation

// Global State
let adminCredentials = [];
let discordInviteLink = "https://discord.gg/q7jukKbCZT";
let isAdminLoggedIn = false;
let currentTheme = localStorage.getItem('siteTheme') || 'cyberpunk';
let currentLayout = localStorage.getItem('siteLayout') || 'grid';
let appVersion = '2.1.1';

// Window controls moved to HTML script tag to prevent conflicts

// GLOBAL WINDOW CONTROL FUNCTIONS - Enhanced with better debugging
// renderer/global-window-controls.js
// (no console logs; returns booleans)

async function _callApiMethod(methods, channelName) {
  try {
    for (const method of methods) {
      if (!window.electronAPI) continue;

      const fn = window.electronAPI[method];
      if (typeof fn === 'function') {
        // If it's an async function (returns a promise) await it; otherwise call it.
        const result = fn.length === 0 ? fn() : fn(...[]); // call without args
        if (result && typeof result.then === 'function') {
          await result;
        }
        return true;
      }
    }

    // try invoke-style API
    if (window.electronAPI?.invoke && typeof window.electronAPI.invoke === 'function') {
      await window.electronAPI.invoke(channelName);
      return true;
    }

    // try send-style API (fire-and-forget)
    if (window.electronAPI?.send && typeof window.electronAPI.send === 'function') {
      window.electronAPI.send(channelName);
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

// Test window controls
window.testWindowControls = () => {
    console.log('🧪 Testing window controls...');
    
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    
    console.log('Buttons found:', {
        minimize: !!minimizeBtn,
        maximize: !!maximizeBtn,
        close: !!closeBtn
    });
    
    console.log('ElectronAPI available:', !!window.electronAPI);
    if (window.electronAPI) {
        console.log('Available methods:', Object.keys(window.electronAPI));
    }
};

// Debug window controls
window.debugWindowControls = () => {
    console.log('🔍 Debugging window controls...');
    
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    
    console.log('Buttons found:', {
        minimize: !!minimizeBtn,
        maximize: !!maximizeBtn,
        close: !!closeBtn
    });
    
    console.log('ElectronAPI available:', !!window.electronAPI);
    if (window.electronAPI) {
        console.log('Available methods:', Object.keys(window.electronAPI));
    }
};

// Test hover controls
window.testHoverControls = () => {
    console.log('🧪 Testing hover controls...');
    const hoverControls = document.getElementById('hover-window-controls');
    console.log('Hover controls element:', hoverControls);
    console.log('Current classes:', hoverControls?.classList.toString());
    console.log('Current style:', hoverControls?.style.cssText);
    
    showHoverControls();
    
    setTimeout(() => {
        console.log('Hiding controls...');
        hideHoverControls();
    }, 3000);
};

// Force show controls for testing
window.forceShowControls = () => {
    const hoverControls = document.getElementById('hover-window-controls');
    if (hoverControls) {
        hoverControls.style.display = 'flex';
        hoverControls.style.opacity = '1';
        hoverControls.style.visibility = 'visible';
        hoverControls.style.transform = 'translateY(0)';
        hoverControls.style.pointerEvents = 'auto';
        console.log('Controls forced to show');
    } else {
        console.error('Hover controls not found');
    }
};

// Force show hover controls
window.showHoverControlsNow = () => {
    showHoverControls();
};

// Force hide hover controls
window.hideHoverControlsNow = () => {
    hideHoverControls();
};

// Debug DOM structure
window.debugHoverControls = () => {
    console.log('🔍 Debugging hover controls DOM...');
    
    const titleBar = document.getElementById('title-bar');
    const hoverControls = document.getElementById('hover-window-controls');
    const titleBarButtons = document.getElementById('title-bar-buttons');
    
    console.log('DOM Elements:');
    console.log('- title-bar:', titleBar);
    console.log('- hover-window-controls:', hoverControls);
    console.log('- title-bar-buttons:', titleBarButtons);
    
    if (hoverControls) {
        console.log('Hover controls details:');
        console.log('- classes:', hoverControls.classList.toString());
        console.log('- style:', hoverControls.style.cssText);
        console.log('- computed style:', window.getComputedStyle(hoverControls));
        console.log('- parent:', hoverControls.parentElement);
        console.log('- children:', hoverControls.children.length);
        
        // Check if buttons exist
        const minimizeBtn = document.getElementById('minimize-btn');
        const maximizeBtn = document.getElementById('maximize-btn');
        const closeBtn = document.getElementById('close-btn');
        
        console.log('Buttons inside hover controls:');
        console.log('- minimize-btn:', minimizeBtn);
        console.log('- maximize-btn:', maximizeBtn);
        console.log('- close-btn:', closeBtn);
    }
    
    // Test if we can manually show them
    if (hoverControls) {
        console.log('Testing manual visibility...');
        hoverControls.style.display = 'flex';
        hoverControls.style.opacity = '1';
        hoverControls.style.visibility = 'visible';
        hoverControls.style.transform = 'translateY(0)';
        hoverControls.style.pointerEvents = 'auto';
        hoverControls.style.background = 'red'; // Make it obvious
        console.log('Controls should now be visible with red background');
    }
};

let appConfig = {};
// Global releases cache - accessible from window object
let releasesCache = {};
window.releasesCache = releasesCache;
let lastActiveListPage = 'fixes-page';
let activeCategory = 'fixes';
let currentDirectoryPath = 'C:\\';
let selectedDirectoryPath = '';

const MANIFEST_REPO_URL = "https://raw.githubusercontent.com/ABAID-CODER/crackworld-manifest/main/configured.json";
const MANIFEST_REPO_DEFAULT = "ABAID-CODER/crackworld-manifest";

// Enhanced Download Manager with Directory Selector and Progress Tracking
let rememberedDownloadPath = localStorage.getItem('defaultDownloadPath') || null;

window.downloadManager = {
    activeDownloads: new Map(),
    downloadHistory: [],
    downloadAnimations: new Map(),
    abortControllers: new Map(),
    downloadStats: {
        totalDownloads: 0,
        successfulDownloads: 0,
        failedDownloads: 0,
        totalBytesDownloaded: 0
    },
    
    init: function() {
        try {
            // Load download history
            const savedHistory = localStorage.getItem('downloadHistory');
            this.downloadHistory = savedHistory ? JSON.parse(savedHistory) : [];
            
            // Load download stats
            const savedStats = localStorage.getItem('downloadStats');
            if (savedStats) {
                this.downloadStats = { ...this.downloadStats, ...JSON.parse(savedStats) };
            }
            
            console.log('Enhanced download manager initialized successfully');
        } catch (error) {
            console.error('Error initializing download manager:', error);
            this.downloadHistory = [];
        }
    },
    
    saveState: function() {
        try {
            localStorage.setItem('downloadHistory', JSON.stringify(this.downloadHistory));
            localStorage.setItem('downloadStats', JSON.stringify(this.downloadStats));
            console.log('Download state saved successfully');
        } catch (error) {
            console.error('Error saving download state:', error);
        }
    },
    
    startDownload: async function(url, fileName, cardElement, options = {}) {
        if (!url || !fileName) {
            throw new Error('URL and filename are required');
        }
        
        try {
            const downloadId = `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Show directory selector if no remembered path or if explicitly requested
            if (!rememberedDownloadPath || options.showDirectorySelector) {
                const selectedPath = await this.showDirectorySelector(downloadId, fileName);
                if (!selectedPath) {
                    throw new Error('No download directory selected');
                }
                rememberedDownloadPath = selectedPath;
                localStorage.setItem('defaultDownloadPath', selectedPath);
            }
            
            const download = {
                id: downloadId,
                url: url,
                fileName: fileName,
                destination: rememberedDownloadPath,
                status: 'starting',
                progress: 0,
                receivedBytes: 0,
                totalBytes: 0,
                startTime: Date.now(),
                endTime: null,
                cardElement: cardElement,
                createdAt: Date.now()
            };
            
            this.activeDownloads.set(downloadId, download);
            
            // Show start notification
            showToast(`🚀 Starting download: ${fileName}`, 'info');
            
            // Add progress bar to card
            this.addProgressBarToCard(cardElement, downloadId);
            
            // Start download
                await this.executeDownload(download);
            
            this.updateHistory(download);
            return { success: true, downloadId };
        } catch (error) {
            console.error("Start download error:", error);
            showToast(`❌ Download failed: ${error.message}`, 'error');
            throw error;
        }
    },
    
    showDirectorySelector: function(downloadId, fileName) {
        return new Promise((resolve) => {
            // Create directory selector modal
            const modal = document.createElement('div');
            modal.id = 'directory-selector-modal';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>📁 Select Download Directory</h3>
                        <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                    </div>
                    <div class="modal-body">
                        <p>Choose where to save: <strong>${fileName}</strong></p>
                        <div class="directory-selector" id="download-path-selector">
                            <div class="directory-icon">📁</div>
                            <div class="directory-text">Click to select download folder</div>
                            <div class="selected-path" id="selected-download-path">Not selected</div>
                        </div>
                        
                        <div class="quick-access-buttons" style="margin: 15px 0; display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
                            <button class="btn" onclick="selectQuickPath('downloads')" style="font-size: 11px; padding: 6px 10px;">📥 Downloads</button>
                            <button class="btn" onclick="selectQuickPath('desktop')" style="font-size: 11px; padding: 6px 10px;">🖥️ Desktop</button>
                            <button class="btn" onclick="selectQuickPath('documents')" style="font-size: 11px; padding: 6px 10px;">📄 Documents</button>
                        </div>
                        
                        <div class="field" style="flex-direction: row; align-items: center; justify-content: center; gap: 10px;">
                            <input type="checkbox" id="remember-path">
                            <label for="remember-path" style="font-size: 13px;">Remember this location for future downloads</label>
                    </div>
                </div>
                    <div class="modal-footer">
                        <button class="btn" onclick="confirmDirectorySelection('${downloadId}')" id="confirm-dir-btn" disabled>Confirm</button>
                        <button class="btn" onclick="cancelDirectorySelection('${downloadId}')" style="background: rgba(255, 68, 68, 0.2); border-color: #ff4444; color: #ff4444;">Cancel</button>
                    </div>
            </div>
        `;
        
            document.body.appendChild(modal);
            
            // Set up directory selector
            const selector = document.getElementById('download-path-selector');
            const selectedPathEl = document.getElementById('selected-download-path');
            const confirmBtn = document.getElementById('confirm-dir-btn');
            let selectedPath = null;
            
            selector.addEventListener('click', async () => {
                try {
                    const result = await window.electronAPI.selectDirectory();
                    if (result) {
                        selectedPath = result;
                        selectedPathEl.textContent = result;
                        confirmBtn.disabled = false;
                        selector.style.borderColor = 'var(--cyan)';
                    }
        } catch (error) {
                    console.error('Error selecting directory:', error);
                    showToast('Error selecting directory', 'error');
                }
            });
            
            // Global functions for directory selection
            window.selectQuickPath = async (pathType) => {
                try {
                    const appPaths = await window.electronAPI.getAppPaths();
                    const paths = {
                        'downloads': appPaths.downloads,
                        'desktop': appPaths.desktop,
                        'documents': appPaths.documents
                    };
                    if (paths[pathType]) {
                        selectedPath = paths[pathType];
                        selectedPathEl.textContent = selectedPath;
                        confirmBtn.disabled = false;
                        selector.style.borderColor = 'var(--cyan)';
                    }
                } catch (error) {
                    console.error('Error getting app paths:', error);
                }
            };
            
            window.confirmDirectorySelection = (id) => {
                if (selectedPath) {
                    const rememberPath = document.getElementById('remember-path').checked;
                    if (rememberPath) {
                        rememberedDownloadPath = selectedPath;
                        localStorage.setItem('defaultDownloadPath', selectedPath);
                    }
                    modal.remove();
                    resolve(selectedPath);
                }
            };
            
            window.cancelDirectorySelection = (id) => {
                modal.remove();
                resolve(null);
            };
        });
    },
    
    addProgressBarToCard: function(cardElement, downloadId) {
        // Remove existing progress bar if any
        const existingProgress = cardElement.querySelector('.download-progress-container');
        if (existingProgress) {
            existingProgress.remove();
        }
        
        // Create progress bar container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'download-progress-container';
        progressContainer.id = `progress-${downloadId}`;
        progressContainer.innerHTML = `
            <div class="download-progress-info">
                <span class="download-filename">${this.activeDownloads.get(downloadId)?.fileName || 'Downloading...'}</span>
                <span class="download-status">Starting...</span>
            </div>
                    <div class="download-progress-bar">
                        <div class="download-progress-fill" style="width: 0%"></div>
                    </div>
            <div class="download-progress-details">
                <span class="download-speed">0 KB/s</span>
                <span class="download-eta">Calculating...</span>
            </div>
        `;
        
        // Insert progress bar into card
        const cardContent = cardElement.querySelector('.card-content') || cardElement;
        cardContent.appendChild(progressContainer);
        
        // Add downloading class to card
        cardElement.classList.add('downloading');
    },
    
    updateProgressBar: function(downloadId, progress, status, speed, eta) {
        const progressContainer = document.getElementById(`progress-${downloadId}`);
        if (!progressContainer) return;
        
        const progressFill = progressContainer.querySelector('.download-progress-fill');
        const statusEl = progressContainer.querySelector('.download-status');
        const speedEl = progressContainer.querySelector('.download-speed');
        const etaEl = progressContainer.querySelector('.download-eta');
        
        if (progressFill) {
            progressFill.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
            
        if (statusEl) {
            statusEl.textContent = status || `${Math.round(progress)}% complete`;
        }
        
        if (speedEl && speed) {
            speedEl.textContent = this.formatBytes(speed) + '/s';
        }
        
        if (etaEl && eta) {
            etaEl.textContent = `ETA: ${Math.round(eta)}s`;
        }
    },
    
    removeProgressBar: function(cardElement, downloadId) {
        const progressContainer = document.getElementById(`progress-${downloadId}`);
        if (progressContainer) {
            progressContainer.remove();
        }
        cardElement.classList.remove('downloading');
    },
    
    executeDownload: async function(download) {
        try {
            download.status = 'downloading';
            this.updateProgressBar(download.id, 0, 'Downloading...');
            
            // Use Electron API for downloads
            if (window.electronAPI && window.electronAPI.downloadFile) {
                const result = await window.electronAPI.downloadFile({
                url: download.url,
                fileName: download.fileName,
                destination: download.destination,
                downloadId: download.id,
                showDirectorySelector: false,
                autoExtract: true
                });
            
            if (result.success) {
                download.status = 'completed';
                download.progress = 100;
                download.endTime = Date.now();
                    
                    this.updateProgressBar(download.id, 100, 'Completed!');
                    
                    // Show completion notification
                    showToast(`✅ Download completed: ${download.fileName}`, 'success');
                
                    // Remove progress bar after 3 seconds
                setTimeout(() => {
                        this.removeProgressBar(download.cardElement, download.id);
                }, 3000);
                
                    // Update stats
                    this.downloadStats.totalDownloads++;
                    this.downloadStats.successfulDownloads++;
                    this.downloadStats.totalBytesDownloaded += download.totalBytes || 0;
                    
                    this.saveState();
            } else {
                throw new Error(result.error || 'Download failed');
            }
            } else {
                // Fallback to browser download
                const a = document.createElement('a');
                a.href = download.url;
                a.download = download.fileName;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
            download.status = 'completed';
            download.progress = 100;
            download.endTime = Date.now();
            
                this.updateProgressBar(download.id, 100, 'Completed!');
            showToast(`✅ Download completed: ${download.fileName}`, 'success');
            
                setTimeout(() => {
                    this.removeProgressBar(download.cardElement, download.id);
                }, 3000);
            }
            
        } catch (error) {
            console.error('Download execution failed:', error);
            download.status = 'failed';
                download.endTime = Date.now();
            download.error = error.message;
            
            this.updateProgressBar(download.id, 0, 'Failed!');
            showToast(`❌ Download failed: ${download.fileName}`, 'error');
            
            // Remove progress bar after 5 seconds
            setTimeout(() => {
                this.removeProgressBar(download.cardElement, download.id);
            }, 5000);
            
            this.downloadStats.failedDownloads++;
            this.saveState();
        }
    },
    
    updateHistory: function(download) {
        const existingIndex = this.downloadHistory.findIndex(d => d.id === download.id);
        
        if (existingIndex === -1) {
            this.downloadHistory.unshift({ ...download });
                } else {
            this.downloadHistory[existingIndex] = { ...download };
        }
        
        if (this.downloadHistory.length > 100) {
            this.downloadHistory = this.downloadHistory.slice(0, 100);
        }
        
        this.saveState();
    },
    
    formatBytes: function(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    
    animateCardFlight: function(cardElement, delay, message) {
        if (!cardElement) return;
        
        // Add flight animation class
        cardElement.classList.add('card-flight');
        
        // Create flight message
        const flightMessage = document.createElement('div');
        flightMessage.className = 'flight-message';
        flightMessage.textContent = message;
        flightMessage.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(0, 255, 255, 0.95), rgba(128, 0, 255, 0.95));
            color: #fff;
            padding: 10px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            z-index: 1000;
            pointer-events: none;
            animation: flightMessage 3s ease-out forwards;
            box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
        `;
        
        // Create steam effect container
        const steamContainer = document.createElement('div');
        steamContainer.className = 'steam-container';
        steamContainer.style.cssText = `
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            height: 60px;
            pointer-events: none;
            z-index: 999;
        `;
        
        // Create multiple steam particles
        for (let i = 0; i < 8; i++) {
            const steamParticle = document.createElement('div');
            steamParticle.className = 'steam-particle';
            steamParticle.style.cssText = `
                position: absolute;
                width: ${20 + Math.random() * 15}px;
                height: ${20 + Math.random() * 15}px;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
                border-radius: 50%;
                left: ${20 + Math.random() * 60}%;
                bottom: 0;
                animation: steamRise ${2 + Math.random() * 2}s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
                filter: blur(1px);
            `;
            steamContainer.appendChild(steamParticle);
        }
        
        // Add CSS animation if not exists
        if (!document.getElementById('flight-animation-styles')) {
            const style = document.createElement('style');
            style.id = 'flight-animation-styles';
            style.textContent = `
                .card-flight {
                    animation: cardFly 3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
                    position: relative;
                    z-index: 1000;
                }
                
                @keyframes cardFly {
                    0% { 
                        transform: translateY(0) scale(1) rotate(0deg); 
                        opacity: 1; 
                        filter: brightness(1) drop-shadow(0 0 10px rgba(0, 255, 255, 0.3));
                    }
                    0.5% { 
                        transform: translateY(-5px) scale(1.02) rotate(0.5deg); 
                        opacity: 0.98; 
                        filter: brightness(1.1) drop-shadow(0 0 15px rgba(0, 255, 255, 0.4));
                    }
                    1% { 
                        transform: translateY(-10px) scale(1.05) rotate(1deg); 
                        opacity: 0.95; 
                        filter: brightness(1.2) drop-shadow(0 0 20px rgba(0, 255, 255, 0.5));
                    }
                    1.5% { 
                        transform: translateY(-20px) scale(1.08) rotate(1.5deg); 
                        opacity: 0.92; 
                        filter: brightness(1.3) drop-shadow(0 0 25px rgba(0, 255, 255, 0.6));
                    }
                    2% { 
                        transform: translateY(-35px) scale(1.1) rotate(2deg); 
                        opacity: 0.88; 
                        filter: brightness(1.4) drop-shadow(0 0 30px rgba(0, 255, 255, 0.7));
                    }
                    2.5% { 
                        transform: translateY(-55px) scale(1.12) rotate(2.5deg); 
                        opacity: 0.85; 
                        filter: brightness(1.5) drop-shadow(0 0 35px rgba(0, 255, 255, 0.8));
                    }
                    3% { 
                        transform: translateY(-80px) scale(1.15) rotate(3deg); 
                        opacity: 0.8; 
                        filter: brightness(1.6) drop-shadow(0 0 40px rgba(0, 255, 255, 0.9));
                    }
                    4% { 
                        transform: translateY(-120px) scale(1.18) rotate(3.5deg); 
                        opacity: 0.75; 
                        filter: brightness(1.7) drop-shadow(0 0 45px rgba(0, 255, 255, 1));
                    }
                    5% { 
                        transform: translateY(-170px) scale(1.2) rotate(4deg); 
                        opacity: 0.7; 
                        filter: brightness(1.8) drop-shadow(0 0 50px rgba(0, 255, 255, 1));
                    }
                    6% { 
                        transform: translateY(-230px) scale(1.22) rotate(4.5deg); 
                        opacity: 0.65; 
                        filter: brightness(1.9) drop-shadow(0 0 55px rgba(0, 255, 255, 1));
                    }
                    7% { 
                        transform: translateY(-300px) scale(1.25) rotate(5deg); 
                        opacity: 0.6; 
                        filter: brightness(2) drop-shadow(0 0 60px rgba(0, 255, 255, 1));
                    }
                    8% { 
                        transform: translateY(-380px) scale(1.28) rotate(5.5deg); 
                        opacity: 0.55; 
                        filter: brightness(2.1) drop-shadow(0 0 65px rgba(0, 255, 255, 1));
                    }
                    9% { 
                        transform: translateY(-470px) scale(1.3) rotate(6deg); 
                        opacity: 0.5; 
                        filter: brightness(2.2) drop-shadow(0 0 70px rgba(0, 255, 255, 1));
                    }
                    10% { 
                        transform: translateY(-570px) scale(1.32) rotate(6.5deg); 
                        opacity: 0.45; 
                        filter: brightness(2.3) drop-shadow(0 0 75px rgba(0, 255, 255, 1));
                    }
                    12% { 
                        transform: translateY(-680px) scale(1.35) rotate(7deg); 
                        opacity: 0.4; 
                        filter: brightness(2.4) drop-shadow(0 0 80px rgba(0, 255, 255, 1));
                    }
                    15% { 
                        transform: translateY(-800px) scale(1.38) rotate(7.5deg); 
                        opacity: 0.35; 
                        filter: brightness(2.5) drop-shadow(0 0 85px rgba(0, 255, 255, 1));
                    }
                    18% { 
                        transform: translateY(-930px) scale(1.4) rotate(8deg); 
                        opacity: 0.3; 
                        filter: brightness(2.6) drop-shadow(0 0 90px rgba(0, 255, 255, 1));
                    }
                    22% { 
                        transform: translateY(-1070px) scale(1.42) rotate(8.5deg); 
                        opacity: 0.25; 
                        filter: brightness(2.7) drop-shadow(0 0 95px rgba(0, 255, 255, 1));
                    }
                    26% { 
                        transform: translateY(-1220px) scale(1.45) rotate(9deg); 
                        opacity: 0.2; 
                        filter: brightness(2.8) drop-shadow(0 0 100px rgba(0, 255, 255, 1));
                    }
                    30% { 
                        transform: translateY(-1380px) scale(1.48) rotate(9.5deg); 
                        opacity: 0.15; 
                        filter: brightness(2.9) drop-shadow(0 0 105px rgba(0, 255, 255, 1));
                    }
                    35% { 
                        transform: translateY(-1550px) scale(1.5) rotate(10deg); 
                        opacity: 0.1; 
                        filter: brightness(3) drop-shadow(0 0 110px rgba(0, 255, 255, 1));
                    }
                    40% { 
                        transform: translateY(-1730px) scale(1.52) rotate(10.5deg); 
                        opacity: 0.08; 
                        filter: brightness(3.1) drop-shadow(0 0 115px rgba(0, 255, 255, 1));
                    }
                    45% { 
                        transform: translateY(-1920px) scale(1.55) rotate(11deg); 
                        opacity: 0.06; 
                        filter: brightness(3.2) drop-shadow(0 0 120px rgba(0, 255, 255, 1));
                    }
                    50% { 
                        transform: translateY(-2120px) scale(1.58) rotate(11.5deg); 
                        opacity: 0.04; 
                        filter: brightness(3.3) drop-shadow(0 0 125px rgba(0, 255, 255, 1));
                    }
                    60% { 
                        transform: translateY(-2530px) scale(1.6) rotate(12deg); 
                        opacity: 0.02; 
                        filter: brightness(3.4) drop-shadow(0 0 130px rgba(0, 255, 255, 1));
                    }
                    70% { 
                        transform: translateY(-2950px) scale(1.62) rotate(12.5deg); 
                        opacity: 0.01; 
                        filter: brightness(3.5) drop-shadow(0 0 135px rgba(0, 255, 255, 1));
                    }
                    80% { 
                        transform: translateY(-3380px) scale(1.65) rotate(13deg); 
                        opacity: 0.005; 
                        filter: brightness(3.6) drop-shadow(0 0 140px rgba(0, 255, 255, 1));
                    }
                    90% { 
                        transform: translateY(-3820px) scale(1.68) rotate(13.5deg); 
                        opacity: 0.002; 
                        filter: brightness(3.7) drop-shadow(0 0 145px rgba(0, 255, 255, 1));
                    }
                    100% { 
                        transform: translateY(-4270px) scale(1.7) rotate(14deg); 
                        opacity: 0; 
                        filter: brightness(3.8) drop-shadow(0 0 150px rgba(0, 255, 255, 1));
                    }
                }
                
                @keyframes flightMessage {
                    0% { 
                        opacity: 0; 
                        transform: translate(-50%, -50%) scale(0.5) rotate(-5deg); 
                    }
                    10% { 
                        opacity: 1; 
                        transform: translate(-50%, -50%) scale(1.1) rotate(0deg); 
                    }
                    20% { 
                        opacity: 1; 
                        transform: translate(-50%, -50%) scale(1.2) rotate(2deg); 
                    }
                    30% { 
                        opacity: 1; 
                        transform: translate(-50%, -50%) scale(1.15) rotate(-1deg); 
                    }
                    40% { 
                        opacity: 1; 
                        transform: translate(-50%, -50%) scale(1.1) rotate(1deg); 
                    }
                    50% { 
                        opacity: 1; 
                        transform: translate(-50%, -50%) scale(1.05) rotate(0deg); 
                    }
                    60% { 
                        opacity: 0.9; 
                        transform: translate(-50%, -50%) scale(1) rotate(-0.5deg); 
                    }
                    70% { 
                        opacity: 0.8; 
                        transform: translate(-50%, -50%) scale(0.95) rotate(0.5deg); 
                    }
                    80% { 
                        opacity: 0.6; 
                        transform: translate(-50%, -50%) scale(0.9) rotate(-0.3deg); 
                    }
                    90% { 
                        opacity: 0.3; 
                        transform: translate(-50%, -50%) scale(0.85) rotate(0.2deg); 
                    }
                    100% { 
                        opacity: 0; 
                        transform: translate(-50%, -50%) scale(0.8) rotate(0deg); 
                    }
                }
                
                @keyframes steamRise {
                    0% { 
                        transform: translateY(0) scale(0.5) rotate(0deg); 
                        opacity: 0.8; 
                    }
                    10% { 
                        transform: translateY(-10px) scale(0.7) rotate(5deg); 
                        opacity: 0.9; 
                    }
                    20% { 
                        transform: translateY(-25px) scale(0.9) rotate(10deg); 
                        opacity: 0.8; 
                    }
                    30% { 
                        transform: translateY(-45px) scale(1.1) rotate(15deg); 
                        opacity: 0.7; 
                    }
                    40% { 
                        transform: translateY(-70px) scale(1.3) rotate(20deg); 
                        opacity: 0.6; 
                    }
                    50% { 
                        transform: translateY(-100px) scale(1.5) rotate(25deg); 
                        opacity: 0.5; 
                    }
                    60% { 
                        transform: translateY(-135px) scale(1.7) rotate(30deg); 
                        opacity: 0.4; 
                    }
                    70% { 
                        transform: translateY(-175px) scale(1.9) rotate(35deg); 
                        opacity: 0.3; 
                    }
                    80% { 
                        transform: translateY(-220px) scale(2.1) rotate(40deg); 
                        opacity: 0.2; 
                    }
                    90% { 
                        transform: translateY(-270px) scale(2.3) rotate(45deg); 
                        opacity: 0.1; 
                    }
                    100% { 
                        transform: translateY(-325px) scale(2.5) rotate(50deg); 
                        opacity: 0; 
                    }
                }
                
                .steam-container {
                    overflow: hidden;
                }
                
                .steam-particle {
                    will-change: transform, opacity;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Add message and steam to card
        cardElement.style.position = 'relative';
        cardElement.appendChild(flightMessage);
        cardElement.appendChild(steamContainer);
        
        // Move card to end of page after animation
        setTimeout(() => {
            if (cardElement.parentNode) {
                // Reset animation classes
                cardElement.classList.remove('card-flight');
                cardElement.style.transform = '';
                cardElement.style.opacity = '';
                cardElement.style.filter = '';
                cardElement.style.position = '';
                
                // Remove steam and message elements
                const steamContainer = cardElement.querySelector('.steam-container');
                const flightMessage = cardElement.querySelector('.flight-message');
                if (steamContainer) steamContainer.remove();
                if (flightMessage) flightMessage.remove();
                
                // Move to end of the grid
                const grid = cardElement.parentNode;
                if (grid && grid.classList.contains('grid')) {
                    grid.appendChild(cardElement);
                    
                    // Add flown indicator
                    const flownBadge = document.createElement('div');
                    flownBadge.className = 'flown-badge';
                    flownBadge.innerHTML = '🚀 Flown';
                    flownBadge.style.cssText = `
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        background: linear-gradient(135deg, rgba(0, 255, 255, 0.9), rgba(128, 0, 255, 0.9));
                        color: white;
                        padding: 4px 8px;
                        border-radius: 12px;
                        font-size: 10px;
                        font-weight: bold;
                        z-index: 10;
                        animation: flownBadgePulse 2s ease-in-out infinite;
                    `;
                    
                    // Add CSS for flown badge animation
                    if (!document.getElementById('flown-badge-styles')) {
                        const style = document.createElement('style');
                        style.id = 'flown-badge-styles';
                        style.textContent = `
                            @keyframes flownBadgePulse {
                                0%, 100% { transform: scale(1); opacity: 0.8; }
                                50% { transform: scale(1.1); opacity: 1; }
                            }
                        `;
                        document.head.appendChild(style);
                    }
                    
                    cardElement.appendChild(flownBadge);
                    
                    // Add a subtle animation to show it's been moved
                    cardElement.style.transition = 'all 0.5s ease';
                    cardElement.style.transform = 'scale(0.95)';
                    cardElement.style.opacity = '0.7';
                    cardElement.style.border = '2px solid rgba(0, 255, 255, 0.3)';
                    
                    setTimeout(() => {
                        cardElement.style.transform = 'scale(1)';
                        cardElement.style.opacity = '1';
                    }, 100);
                }
            }
        }, 3000);
    }
};

// Initialize download manager
window.downloadManager.init();

// Listen for download progress updates from main process
if (window.electronAPI) {
    window.electronAPI.onDownloadProgress((data) => {
        console.log('Progress update received:', data);
        const { downloadId, progress, receivedBytes, totalBytes, speed } = data;
        const download = window.downloadManager.activeDownloads.get(downloadId);
        
        if (download) {
            download.progress = progress;
            download.receivedBytes = receivedBytes;
            download.totalBytes = totalBytes;
            
            // Calculate ETA
            const remainingBytes = totalBytes - receivedBytes;
            const eta = speed > 0 ? remainingBytes / speed : 0;
            
            console.log(`Updating progress for ${downloadId}: ${progress}% (${receivedBytes}/${totalBytes} bytes)`);
            
            // Update progress bar
            window.downloadManager.updateProgressBar(downloadId, progress, `${Math.round(progress)}% complete`, speed, eta);
        } else {
            console.warn(`No active download found for ID: ${downloadId}`);
        }
    });
    
    window.electronAPI.onDownloadCompleted((data) => {
        const { downloadId, fileName, path } = data;
        const download = window.downloadManager.activeDownloads.get(downloadId);
        
        if (download) {
            download.status = 'completed';
            download.progress = 100;
            download.endTime = Date.now();
            
            window.downloadManager.updateProgressBar(downloadId, 100, 'Completed!');
            showToast(`✅ Download completed: ${fileName}`, 'success');
            
            // Remove progress bar after 3 seconds
            setTimeout(() => {
                window.downloadManager.removeProgressBar(download.cardElement, downloadId);
            }, 3000);
            
            // Update stats
            window.downloadManager.downloadStats.totalDownloads++;
            window.downloadManager.downloadStats.successfulDownloads++;
            window.downloadManager.downloadStats.totalBytesDownloaded += download.totalBytes || 0;
            
            window.downloadManager.saveState();
        }
    });
    
    window.electronAPI.onDownloadFailed((data) => {
        const { downloadId, fileName, error } = data;
        const download = window.downloadManager.activeDownloads.get(downloadId);
        
        if (download) {
            download.status = 'failed';
            download.endTime = Date.now();
            download.error = error;
            
            window.downloadManager.updateProgressBar(downloadId, 0, 'Failed!');
            showToast(`❌ Download failed: ${fileName}`, 'error');
            
            // Remove progress bar after 5 seconds
            setTimeout(() => {
                window.downloadManager.removeProgressBar(download.cardElement, downloadId);
            }, 5000);
            
            window.downloadManager.downloadStats.failedDownloads++;
            window.downloadManager.saveState();
        }
    });
}

// Enhanced download function with progress tracking
async function downloadAsset(url, fileName, cardElement) {
    try {
        if (!url || !fileName) {
            throw new Error('URL and filename are required');
        }
        
        // Use the enhanced download manager
        const result = await window.downloadManager.startDownload(url, fileName, cardElement);
        
        if (result.success) {
            console.log(`Download started: ${fileName} (ID: ${result.downloadId})`);
            } else {
            throw new Error('Failed to start download');
        }
        } catch (error) {
        console.error('Download error:', error);
        showToast(`Download failed: ${error.message}`, 'error');
    }
}

// Download all assets from a release
async function downloadReleaseAssets(type, releaseId, cardElement) {
    try {
        console.log('Starting download for release:', type, releaseId);
        
        const releases = releasesCache[type] || [];
        const release = releases.find(r => r && r.id === releaseId);
        
        if (!release) {
            console.error('Release not found:', releaseId, 'in type:', type);
            showToast('Release not found', 'error');
            return;
        }
        
        if (!release.assets || release.assets.length === 0) {
            showToast('No files available for download', 'warning');
            return;
        }

        console.log('Starting download for', release.assets.length, 'assets');
        
        // Show directory selector only once for the first asset
        let showSelector = true;
        
        for (const asset of release.assets) {
            if (asset && asset.browser_download_url && asset.name) {
                await window.downloadManager.startDownload(
                    asset.browser_download_url,
                    asset.name,
                    cardElement,
                    { 
                        showDirectorySelector: showSelector, 
                        silentExtraction: true,
                        autoExtract: true
                    }
                );
                showSelector = false; // Only show for first asset
            }
        }
        } catch (error) {
        console.error('Download failed:', error);
        showToast('Download failed: ' + error.message, 'error');
    }
}

// Download a single asset
async function downloadSingleAsset(url, fileName, assetElement) {
    try {
        if (!url || !fileName) {
            throw new Error('URL and filename are required');
        }
        
        // Use the enhanced download manager
        const result = await window.downloadManager.startDownload(url, fileName, assetElement);
        
        if (result.success) {
            console.log(`Download started: ${fileName} (ID: ${result.downloadId})`);
            } else {
            throw new Error('Failed to start download');
        }
    } catch (error) {
        console.error('Download error:', error);
        showToast(`Download failed: ${error.message}`, 'error');
    }
}

// Make functions globally accessible
window.downloadSingleAsset = downloadSingleAsset;
window.downloadReleaseAssets = downloadReleaseAssets;
window.downloadAsset = downloadAsset;

// Toast Notification System
let lastToast = { message: '', timestamp: 0 };
let toastCount = 0;
const MAX_TOASTS = 5;

function showToast(message, type = 'info') {
    try {
        // Prevent toast spam
        if (toastCount >= MAX_TOASTS) {
            console.warn('Too many toasts, skipping:', message);
            return;
        }
        
        const now = Date.now();
        if (message === lastToast.message && (now - lastToast.timestamp < 3000)) {
            return;
        }
        lastToast = { message, timestamp: now };
        toastCount++;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : type === 'warning' ? '⚠' : 'ℹ'}</span>
                <span class="toast-text">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        if (!document.querySelector('#toast-styles')) {
            const styles = document.createElement('style');
            styles.id = 'toast-styles';
            styles.textContent = `
                .toast {
                    position: fixed; top: 60px; right: 20px; z-index: 10000; background: var(--card-bg);
                    border: 1px solid var(--stroke); border-radius: 8px; padding: 12px 16px; max-width: 400px;
                    animation: slideIn 0.3s ease; box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                }
                .toast-success { border-left: 4px solid #00ff88; }
                .toast-error { border-left: 4px solid #ff4444; }
                .toast-warning { border-left: 4px solid #ffaa00; }
                .toast-info { border-left: 4px solid var(--cyan); }
                .toast-content { display: flex; align-items: center; gap: 10px; }
                .toast-text { flex: 1; font-size: 14px; }
                .toast-close { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 16px; }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            try {
                if (toast.parentNode) {
                    toast.remove();
                    toastCount = Math.max(0, toastCount - 1); // Decrement toast count
                }
            } catch (cleanupError) {
                console.error('Error cleaning up toast:', cleanupError);
            }
        }, 5000);
    } catch (error) {
        console.error('Error showing toast:', error);
    }
}

// Navigation Functions

function showPage(pageId) {
    try {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            
            if (['fixes-page', 'tools-page', 'softwares-page'].includes(pageId)) {
                lastActiveListPage = pageId;
            }
            
            // Clear upload forms when navigating to admin panel
            if (pageId === 'admin-panel-page') {
                setTimeout(() => {
                    // Clear all upload forms
                    if (window.uploadManager) {
                        ['fixes', 'tools', 'software', 'activations'].forEach(type => {
                            window.uploadManager.clearForm(type);
                        });
                    }
                    
                    // Also clear update form if it exists
                    clearUpdateForm();
                }, 100);
            }
        }
    } catch (error) {
        console.error('Error showing page:', error);
    }
}

function openModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'grid';
        }
    } catch (error) {
        console.error('Error opening modal:', error);
    }
}

function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            modal.style.display = 'none';
        }
    } catch (error) {
        console.error('Error closing modal:', error);
    }
}

// Configuration Management - Automatically loads from GitHub
async function loadAppConfiguration() {
    console.log('Loading application configuration from GitHub...');
    
    try {
        // Try to load from GitHub manifest repository first
        const configUrl = `https://raw.githubusercontent.com/${MANIFEST_REPO_DEFAULT}/main/configured.json`;
        
        try {
            const response = await fetch(configUrl);
            if (response.ok) {
                const config = await response.json();
                appConfig = config;
                
                // Update Discord link if available
                if (config.discord) {
                    discordInviteLink = config.discord;
                }
                
                console.log('Configuration loaded from GitHub manifest:', config);
                showToast('Configuration loaded from GitHub!', 'success');
                return { success: true, config };
            } else if (response.status === 404) {
                console.log('No configured.json found in manifest repository, using defaults');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (configError) {
            console.warn('Failed to load from manifest repository:', configError.message);
        }
        
        // Fallback to original method if GitHub config not available
        try {
            const response = await fetch(MANIFEST_REPO_URL);
            if (response.ok) {
                const config = await response.json();
                appConfig = config;
                
                if (config.discord) {
                    discordInviteLink = config.discord;
                }
                
                console.log('Configuration loaded from fallback source:', config);
                return { success: true, config };
            }
        } catch (fallbackError) {
            console.warn('Fallback configuration source also failed:', fallbackError.message);
        }
        
        // Use default configuration if all else fails
        console.log('Using default hardcoded configuration');
        appConfig = {
            github: {
                fixes: 'cwabaid/cw.fixes',
                tools: 'cwabaid/cw.tools', 
                softwares: 'cwabaid/cw.softwares'
            },
            discord: 'https://discord.gg/q7jukKbCZT'
        };
        
        return { success: true, config: appConfig };
        
    } catch (error) {
        console.error('Critical error in configuration loading:', error);
        
        // Emergency fallback
        appConfig = {
            github: {
                fixes: 'cwabaid/cw.fixes',
                tools: 'cwabaid/cw.tools', 
                softwares: 'cwabaid/cw.softwares'
            },
            discord: 'https://discord.gg/q7jukKbCZT'
        };
        
        return { success: false, error: error.message, config: appConfig };
    }
}

// Releases Management with Dynamic Config
async function displayReleases(type) {
    const grid = document.getElementById(`${type}-grid`);
    if (!grid) return;

    try {
        grid.innerHTML = '<div class="loading-placeholder">Loading releases...</div>';
        
        // Ensure we have configuration
        if (!appConfig.github || !appConfig.github[type]) {
            await loadAppConfiguration();
        }
        
        const repoConfig = appConfig.github?.[type];
        if (!repoConfig) {
            // Show fallback message
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>⚙️ Configuration Required</h3>
                    <p>No repository configured for ${type}. Please configure repositories in the Admin Panel.</p>
                    ${isAdminLoggedIn ? '<button class="btn" onclick="showPage(\'admin-panel-page\');">Open Admin Panel</button>' : ''}
                </div>
            `;
            return;
        }
        
        // Use GitHub API directly with pagination to fetch ALL releases
        const [owner, repo] = repoConfig.split('/');
        if (!owner || !repo) {
            throw new Error(`Invalid repository format: ${repoConfig}. Use format: owner/repo`);
        }
        
        console.log(`Fetching all releases from ${owner}/${repo}`);
        
        // Update loading message to show we're fetching all releases
        grid.innerHTML = '<div class="loading-placeholder">Fetching all releases (this may take a moment)...</div>';
        
        // Fetch all releases with pagination
        const allReleases = [];
        let page = 1;
        const perPage = 100; // Maximum per page allowed by GitHub API
        
        while (true) {
            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?page=${page}&per_page=${perPage}`;
            const response = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Crack-World-App',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
            }
            
            const releases = await response.json();
            
            if (!Array.isArray(releases) || releases.length === 0) {
                break; // No more releases to fetch
            }
            
            allReleases.push(...releases);
            
            // Update progress
            grid.innerHTML = `<div class="loading-placeholder">Fetched ${allReleases.length} releases so far...</div>`;
            
            // If we got fewer releases than requested, we've reached the end
            if (releases.length < perPage) {
                break;
            }
            
            page++;
        }
        
        const releases = allReleases;
        console.log(`✅ Fetched ${releases.length} total releases from ${owner}/${repo}`);
        
        if (Array.isArray(releases) && releases.length > 0) {
            releasesCache[type] = releases;
            displayReleasesInGrid(type, releases);
        } else {
            grid.innerHTML = `
                <div class="empty-state">
                    <h3>📦 No Releases Found</h3>
                    <p>No releases available.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error(`Error loading ${type}:`, error);
        grid.innerHTML = `
            <div class="empty-state">
                <h3>❌ Failed to Load</h3>
                <p>Error loading ${type}: ${error.message}</p>
                <button class="btn" onclick="displayReleases('${type}')">🔄 Retry</button>
            </div>
        `;
    }
}

// Fuzzy Search Helper Functions
function generateAbbreviations(text) {
    if (!text) return [];
    
    const words = text.toLowerCase().split(/[\s\-_\.\(\)\[\]]+/).filter(word => word.length > 0);
    const abbreviations = [];
    
    // Generate various abbreviation patterns
    if (words.length > 1) {
        // First letter of each word (e.g., "Call of Duty" -> "cod")
        const firstLetters = words.map(word => word[0]).join('');
        if (firstLetters.length >= 2) {
            abbreviations.push(firstLetters);
        }
        
        // First letter of significant words (skip common words)
        const significantWords = words.filter(word => 
            !['of', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by'].includes(word)
        );
        if (significantWords.length > 1) {
            const significantAbbrev = significantWords.map(word => word[0]).join('');
            if (significantAbbrev.length >= 2 && significantAbbrev !== firstLetters) {
                abbreviations.push(significantAbbrev);
            }
        }
        
        // First few letters of first word + first letter of others
        if (words[0].length > 2) {
            const hybrid = words[0].substring(0, Math.min(3, words[0].length)) + 
                          words.slice(1).map(word => word[0]).join('');
            if (hybrid.length >= 3) {
                abbreviations.push(hybrid);
            }
        }
    }
    
    // Single word abbreviations (first 3-4 letters)
    if (words.length === 1 && words[0].length > 3) {
        abbreviations.push(words[0].substring(0, 3));
        if (words[0].length > 4) {
            abbreviations.push(words[0].substring(0, 4));
        }
    }
    
    return abbreviations;
}

function fuzzyMatch(query, target, threshold = 0.93) {
    if (!query || !target) return false;
    
    query = query.toLowerCase().trim();
    target = target.toLowerCase();
    
    // Exact match
    if (target.includes(query)) return true;
    
    // Check against generated abbreviations
    const abbreviations = generateAbbreviations(target);
    for (const abbrev of abbreviations) {
        if (abbrev === query || abbrev.includes(query)) {
            return true;
        }
    }
    
    // Fuzzy matching using simple algorithm
    const similarity = calculateSimilarity(query, target);
    return similarity >= threshold;
}

function calculateSimilarity(str1, str2) {
    if (str1 === str2) return 1.0;
    if (str1.length === 0 || str2.length === 0) return 0.0;
    
    // Use Levenshtein distance for similarity calculation
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;
    
    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,     // deletion
                matrix[i][j - 1] + 1,     // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }
    
    const maxLen = Math.max(len1, len2);
    const distance = matrix[len1][len2];
    return (maxLen - distance) / maxLen;
}

function createSearchableContent(release) {
    // Create a comprehensive searchable string from release data
    const searchableFields = [
        release.name || '',
        release.tag_name || '',
        release.body || ''
    ].join(' ').toLowerCase();
    
    return searchableFields;
}

// Filter releases based on search query with fuzzy matching and dynamic abbreviations
function filterReleases(type, query) {
    const releases = releasesCache[type];
    if (!releases) return;
    
    // If query is empty, show all releases
    if (!query || query.trim() === '') {
        displayReleasesInGrid(type, releases);
        return;
    }
    
    const searchQuery = query.toLowerCase().trim();
    
    // Filter releases using enhanced matching
    const filteredReleases = releases.filter(release => {
        const searchableContent = createSearchableContent(release);
        const releaseName = release.name || release.tag_name || '';
        const releaseBody = release.body || '';
        const releaseTag = release.tag_name || '';
        
        // 1. Exact substring matching (highest priority)
        if (searchableContent.includes(searchQuery)) {
            return true;
        }
        
        // 2. Dynamic abbreviation matching
        const nameAbbrevs = generateAbbreviations(releaseName);
        const bodyAbbrevs = generateAbbreviations(releaseBody);
        const tagAbbrevs = generateAbbreviations(releaseTag);
        
        const allAbbrevs = [...nameAbbrevs, ...bodyAbbrevs, ...tagAbbrevs];
        
        for (const abbrev of allAbbrevs) {
            if (abbrev === searchQuery || abbrev.includes(searchQuery) || searchQuery.includes(abbrev)) {
                return true;
            }
        }
        
        // 3. Fuzzy matching with 93% threshold
        const fields = [releaseName, releaseBody, releaseTag];
        for (const field of fields) {
            if (field && fuzzyMatch(searchQuery, field, 0.93)) {
                return true;
            }
        }
        
        // 4. Word-level fuzzy matching (for multi-word queries)
        const queryWords = searchQuery.split(/\s+/).filter(word => word.length > 1);
        if (queryWords.length > 1) {
            const matchedWords = queryWords.filter(queryWord => {
                return fields.some(field => field && fuzzyMatch(queryWord, field, 0.85)); // Slightly lower threshold for individual words
            });
            
            // If most words match, consider it a match
            if (matchedWords.length >= Math.ceil(queryWords.length * 0.7)) {
                return true;
            }
        }
        
        return false;
    });
    
    // Sort results by relevance (exact matches first, then fuzzy matches)
    const sortedResults = filteredReleases.sort((a, b) => {
        const aContent = createSearchableContent(a);
        const bContent = createSearchableContent(b);
        
        const aExact = aContent.includes(searchQuery);
        const bExact = bContent.includes(searchQuery);
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        // For non-exact matches, sort by name similarity
        const aSim = calculateSimilarity(searchQuery, (a.name || a.tag_name || '').toLowerCase());
        const bSim = calculateSimilarity(searchQuery, (b.name || b.tag_name || '').toLowerCase());
        
        return bSim - aSim;
    });
    
    displayReleasesInGrid(type, sortedResults);
}

function displayReleasesInGrid(type, releases) {
    const grid = document.getElementById(`${type}-grid`);
    if (!grid || !releases) return;

    if (releases.length === 0) {
        grid.innerHTML = '<div class="empty-state"><h3>No Releases Found</h3><p>No releases match your search criteria.</p></div>';
        return;
    }

    try {
        // Clear the grid first to avoid duplicates
        grid.innerHTML = '';
        
        releases.forEach(release => {
            const hasAssets = release.assets && release.assets.length > 0;
            const adminEditBtn = isAdminLoggedIn ? `
                <button class="btn admin-btn" onclick="openUpdateReleaseModal('${type}', ${release.id})" title="Edit Release">
                    <span class="edit-icon">✏️</span> Edit
                </button>
            ` : '';
            
            // Extract video URL and get thumbnail
            const videoUrl = extractYouTubeUrl(release.body || '');
            const youtubeId = videoUrl ? extractYouTubeId(videoUrl) : null;
            
            // Extract banner URL from description (if provided)
            const bannerUrl = extractBannerUrl(release.body || '');
            
            // Determine thumbnail URL (banner takes priority over YouTube)
            let thumbnailUrl = null;
            if (bannerUrl) {
                thumbnailUrl = bannerUrl;
            } else if (youtubeId) {
                thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
            }
            
            // Get published date
            const publishedDate = new Date(release.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            const cardElement = document.createElement('div');
            cardElement.className = 'release-card';
            cardElement.innerHTML = `
                <div class="card-inner">
                    <div class="card-thumbnail-section">
                        ${thumbnailUrl ? `
                            <div class="card-thumbnail">
                                <img src="${thumbnailUrl}" alt="${release.name || release.tag_name}" 
                                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                <div class="card-no-thumbnail" style="display: none;">🎮</div>
                                <div class="play-overlay" onclick="viewReleaseDetails('${type}', ${release.id})">▶</div>
                            </div>
                        ` : `
                            <div class="card-thumbnail">
                                <div class="card-no-thumbnail">🎮</div>
                            </div>
                        `}
                    </div>
                    
                    <div class="card-content">
                        <div class="card-header">
                            <h3 class="card-title">${release.name || release.tag_name}</h3>
                            <div class="card-meta">
                                <span class="publish-date">📅 ${publishedDate}</span>
                                <span class="tag-name">🏷️ ${release.tag_name}</span>
                            </div>
                            <div class="card-badges">
                                ${release.prerelease ? '<span class="badge prerelease">Pre-release</span>' : ''}
                                ${release.draft ? '<span class="badge draft">Draft</span>' : ''}
                                ${youtubeId ? '<span class="badge video-badge">📹 Video</span>' : ''}
                                ${hasAssets ? `<span class="badge assets-badge">${release.assets.length} files</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="card-body">
                            <div class="card-description">
                                ${formatReleaseBody(release.body, 150)}
                            </div>
                        </div>
                        
                        <div class="card-actions">
                            <button class="btn secondary" onclick="viewReleaseDetails('${type}', ${release.id})">
                                <span>👁️</span> View Details
                            </button>
                            ${hasAssets ? `
                                <button class="btn primary" onclick="downloadReleaseAssets('${type}', ${release.id}, this.closest('.release-card'))">
                                    <span>⬇️</span> Download
                                </button>
                            ` : ''}
                            ${adminEditBtn}
                        </div>
                    </div>
                </div>
            `;
            
            // Add click event listener for card flight animation
            cardElement.addEventListener('click', function(event) {
                // Don't trigger if clicking on buttons or links
                if (event.target.tagName === 'BUTTON' || event.target.closest('button')) {
                    return;
                }
                
                // Trigger card flight animation
                window.downloadManager.animateCardFlight(cardElement, 0, '🚀 not gonna come back');
            });
            
            grid.appendChild(cardElement);
        });
        
    } catch (error) {
        console.error('Error displaying releases in grid:', error);
        grid.innerHTML = '<div class="empty-state"><h3>Error</h3><p>Failed to display releases</p></div>';
    }
}

async function downloadRelease(type, releaseId) {
    try {
        console.log('Downloading release:', type, releaseId);
        
        const releases = releasesCache[type] || [];
        const release = releases.find(r => r && r.id === releaseId);
        
        if (!release) {
            console.error('Release not found:', releaseId, 'in type:', type);
            showToast('Release not found', 'error');
            return;
        }
        
        if (!release.assets || release.assets.length === 0) {
            showToast('No files available for download', 'warning');
            return;
        }

        console.log('Starting download for', release.assets.length, 'assets');
        
        // Show directory selector only once for the first asset
        let showSelector = true;
        
        for (const asset of release.assets) {
            if (asset && asset.browser_download_url && asset.name) {
                await window.downloadManager.startDownload(
                    asset.browser_download_url,
                    asset.name,
                    null,
                    { 
                        showDirectorySelector: showSelector, 
                        silentExtraction: true,
                        autoExtract: true
                    }
                );
                showSelector = false; // Only show for first asset
            }
        }
    } catch (error) {
        console.error('Download failed:', error);
        showToast('Download failed: ' + error.message, 'error');
    }
}

function viewReleaseDetails(type, releaseId) {
    try {
        console.log('Viewing release details for:', type, releaseId);
        
        const releases = releasesCache[type] || [];
        const release = releases.find(r => r && r.id === releaseId);
        
        if (!release) {
            console.error('Release not found:', releaseId, 'in type:', type);
            showToast('Release not found', 'error');
            return;
        }

        console.log('Found release:', release.name || release.tag_name);
        const assets = release.assets || [];
        const videoUrl = extractYouTubeUrl(release.body || '');
        
        const titleEl = document.getElementById('release-title');
        const tagEl = document.getElementById('release-tag');
        const dateEl = document.getElementById('release-date');
        const descEl = document.getElementById('release-description');
        const detailsEl = document.getElementById('release-details');
        
        if (titleEl) {
            titleEl.textContent = release.name || release.tag_name || 'Untitled Release';
        }
        if (tagEl) {
            tagEl.textContent = release.tag_name || 'No Tag';
        }
        if (dateEl) {
            const date = release.published_at ? new Date(release.published_at).toLocaleDateString() : 'Unknown Date';
            dateEl.textContent = date;
        }
        if (descEl) {
            descEl.innerHTML = formatReleaseBody(release.body || 'No description available.');
        }
        
        if (detailsEl) {
            let detailsHTML = '';
            
            // Add video section if video URL exists
            if (videoUrl) {
                const videoId = extractYouTubeId(videoUrl);
                if (videoId) {
                    // YouTube video
                    detailsHTML += `
                        <div class="details-section">
                            <h3>🎥 Video Preview</h3>
                            <div class="video-container">
                                <iframe src="https://www.youtube.com/embed/${videoId}" 
                                        frameborder="0" allowfullscreen></iframe>
                            </div>
                        </div>`;
                } else if (videoUrl.match(/vimeo\.com\/([0-9]+)/)) {
                    // Vimeo video
                    const vimeoId = videoUrl.match(/vimeo\.com\/([0-9]+)/)[1];
                    detailsHTML += `
                        <div class="details-section">
                            <h3>🎥 Video Preview</h3>
                            <div class="video-container">
                                <iframe src="https://player.vimeo.com/video/${vimeoId}" 
                                        frameborder="0" allowfullscreen></iframe>
                            </div>
                        </div>`;
                } else if (videoUrl.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/)) {
                    // Dailymotion video
                    const dmId = videoUrl.match(/dailymotion\.com\/video\/([a-zA-Z0-9]+)/)[1];
                    detailsHTML += `
                        <div class="details-section">
                            <h3>🎥 Video Preview</h3>
                            <div class="video-container">
                                <iframe src="https://www.dailymotion.com/embed/video/${dmId}" 
                                        frameborder="0" allowfullscreen></iframe>
                            </div>
                        </div>`;
                } else if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) {
                    // Direct video file
                    detailsHTML += `
                        <div class="details-section">
                            <h3>🎥 Video Preview</h3>
                            <div class="video-container">
                                <video controls style="width: 100%; max-height: 500px;">
                                    <source src="${videoUrl}" type="video/${videoUrl.split('.').pop()}">
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>`;
                } else {
                    // Generic video link
                    detailsHTML += `
                        <div class="details-section">
                            <h3>🎥 Video</h3>
                            <p><a href="${videoUrl}" target="_blank" class="btn">Watch Video</a></p>
                        </div>`;
                }
            }
            
            // Add downloads section if assets exist
            if (assets.length > 0) {
                detailsHTML += `
                    <div class="details-section">
                        <h3>📥 Downloads (${assets.length} files)</h3>`;
                        
                assets.forEach(asset => {
                    if (asset && asset.name) {
                        const size = asset.size ? (asset.size / 1024 / 1024).toFixed(2) + ' MB' : 'Unknown size';
                        detailsHTML += `
                            <div class="asset-item">
                                <div class="asset-info">
                                    <span class="asset-name">📄 ${asset.name}</span>
                                    <span class="asset-size">(${size})</span>
                                </div>
                                <button class="btn primary asset-download-btn" onclick="downloadSingleAsset('${asset.browser_download_url}', '${asset.name}', this.closest('.asset-item'))">
                                    <span>⬇️</span> Download
                                </button>
                            </div>`;
                    }
                });
                
                detailsHTML += '</div>';
            } else {
                detailsHTML += `
                    <div class="details-section">
                        <h3>📥 Downloads</h3>
                        <p style="color: var(--muted); font-style: italic;">No downloadable files available for this release.</p>
                    </div>`;
            }
            
            detailsEl.innerHTML = detailsHTML;
        }
        
        console.log('Showing details page...');
        showPage('details-page');
        
    } catch (error) {
        console.error('Error viewing release details:', error);
        showToast('Error loading release details: ' + error.message, 'error');
    }
}


// Downloads Page with Modern UI (removed duplicate)







// Theme Management
function applyTheme(theme) {
    try {
        console.log(`Applying theme: ${theme}`);
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`, `layout-${currentLayout}`);
        localStorage.setItem('siteTheme', theme);
        currentTheme = theme;
        
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.toggle('active', card.dataset.theme === theme);
        });
    } catch (error) {
        console.error('Error applying theme:', error);
    }
}

function applyLayout(layout) {
    try {
        console.log(`Applying layout: ${layout}`);
        document.body.className = document.body.className.replace(/layout-\w+/g, '');
        document.body.classList.add(`layout-${layout}`);
        localStorage.setItem('siteLayout', layout);
        currentLayout = layout;
        
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.layout === layout);
        });
    } catch (error) {
        console.error('Error applying layout:', error);
    }
}

// Utility Functions

function formatReleaseBody(body, maxLength = null) {
    if (!body) return 'No description provided.';
    
    try {
        let formatted = body
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
            
        if (maxLength && formatted.length > maxLength) {
            // Remove HTML tags for length calculation
            const textLength = formatted.replace(/<[^>]*>/g, '').length;
            if (textLength > maxLength) {
                // Truncate while preserving HTML structure
                let truncated = formatted.substring(0, maxLength);
                truncated = truncated.replace(/<[^>]*$/g, ''); // Remove incomplete tags
                return truncated + '...';
            }
        }
        
        return formatted;
    } catch (error) {
        console.error('Error formatting release body:', error);
        return body || 'No description provided.';
    }
}

function extractYouTubeUrl(text) {
    if (!text) return null;
    try {
        // Extract any video URL (YouTube, Vimeo, Dailymotion, direct links, etc.)
        const urlRegex = /(https?:\/\/[^\s]+\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v))/gi;
        const youtubeRegex = /(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi;
        const vimeoRegex = /(https?:\/\/)?(www\.)?(vimeo\.com\/)([0-9]+)/gi;
        const dailymotionRegex = /(https?:\/\/)?(www\.)?(dailymotion\.com\/video\/)([a-zA-Z0-9]+)/gi;
        
        // Try direct video file URL first
        let match = urlRegex.exec(text);
        if (match) return match[0];
        
        // Try YouTube
        match = youtubeRegex.exec(text);
        if (match) return match[0];
        
        // Try Vimeo
        match = vimeoRegex.exec(text);
        if (match) return match[0];
        
        // Try Dailymotion
        match = dailymotionRegex.exec(text);
        if (match) return match[0];
        
        return null;
    } catch (error) {
        console.error('Error extracting video URL:', error);
        return null;
    }
}

function extractYouTubeId(url) {
    if (!url) return null;
    try {
        const match = url.match(/(?:youtube\.com\/(?:embed\/|v\/|watch\?v=)|youtu\.be\/)([^&\n?#]+)/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting YouTube ID:', error);
        return null;
    }
}

function extractBannerUrl(text) {
    if (!text) return null;
    try {
        // Extract banner/thumbnail URL from description
        const bannerRegex = /🖼️\s*Banner:\s*(https?:\/\/[^\s]+)/i;
        const match = bannerRegex.exec(text);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error extracting banner URL:', error);
        return null;
    }
}

function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    try {
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 60000) {
            return 'just now';
        } else if (diff < 3600000) {
            return `${Math.round(diff / 60000)} minutes ago`;
        } else if (diff < 86400000) {
            return `${Math.round(diff / 3600000)} hours ago`;
        } else {
            return `${Math.round(diff / 86400000)} days ago`;
        }
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return '';
    }
}

// Admin Functions
async function handleAdminLogin() {
    try {
        const usernameEl = document.getElementById('loginUser');
        const passwordEl = document.getElementById('loginPass');
        
        if (!usernameEl || !passwordEl) {
            showToast('Login form not found', 'error');
            return;
        }
        
        const username = usernameEl.value.trim();
        const password = passwordEl.value.trim();
        
        const isValid = adminCredentials.some(cred => 
            cred.username === username && cred.password === password);
        
        if (isValid) {
            isAdminLoggedIn = true;
            document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
            
            const adminPanelToggle = document.getElementById('adminPanelToggle');
            if (adminPanelToggle) {
                adminPanelToggle.addEventListener('click', () => showPage('admin-panel-page'));
            }
            
            const adminLogoutBtn = document.getElementById('adminLogoutBtn');
            if (adminLogoutBtn) {
                adminLogoutBtn.addEventListener('click', () => {
                    isAdminLoggedIn = false;
                    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
                    showPage(lastActiveListPage);
                    refreshCurrentReleases();
                });
            }
            
            closeModal('adminPassModal');
            showToast('Admin login successful!', 'success');
            
            usernameEl.value = '';
            passwordEl.value = '';
            
            refreshCurrentReleases();
        } else {
            showToast('Invalid admin credentials', 'error');
        }
    } catch (error) {
        console.error('Error during admin login:', error);
        showToast('Login failed', 'error');
    }
}

function refreshCurrentReleases() {
    try {
        const currentPage = document.querySelector('.page.active');
        if (!currentPage) return;
        
        const pageId = currentPage.id;
        
        if (pageId === 'fixes-page') {
            displayReleases('fixes');
        } else if (pageId === 'tools-page') {
            displayReleases('tools');
        } else if (pageId === 'software-page') {
            displayReleases('software');
        }
    } catch (error) {
        console.error('Error refreshing releases:', error);
    }
}

// Update Release Functions
let currentUpdateRelease = null;

function openUpdateReleaseModal(type, releaseId) {
    try {
        console.log('Opening update modal for:', type, releaseId);
        
        const releases = releasesCache[type] || [];
        const release = releases.find(r => r && r.id === releaseId);
        
        if (!release) {
            console.error('Release not found:', releaseId, 'in type:', type);
            showToast('Release not found', 'error');
            return;
        }
        
        currentUpdateRelease = { type, releaseId, release };
        
        // Clear previous form data
        clearUpdateForm();
        
        // Populate form fields
        const titleEl = document.getElementById('update-release-title');
        const tagEl = document.getElementById('update-release-tag');
        const descEl = document.getElementById('update-release-description');
        const youtubeUrlEl = document.getElementById('update-youtube-url');
        const prereleaseEl = document.getElementById('update-release-prerelease');
        const draftEl = document.getElementById('update-release-draft');
        
        if (titleEl) titleEl.value = release.name || '';
        if (tagEl) tagEl.value = release.tag_name || '';
        
        // Extract YouTube URL from existing description
        const existingYouTubeUrl = extractYouTubeUrl(release.body || '');
        if (youtubeUrlEl) youtubeUrlEl.value = existingYouTubeUrl || '';
        
        // Set description (remove YouTube URL from it if it exists)
        let description = release.body || '';
        if (existingYouTubeUrl) {
            description = description.replace(existingYouTubeUrl, '').trim();
        }
        if (descEl) descEl.value = description;
        
        if (prereleaseEl) prereleaseEl.checked = release.prerelease || false;
        if (draftEl) draftEl.checked = release.draft || false;
        
        // Setup upload zone for update modal
        setupUpdateUploadZone();
        
        openModal('updateReleaseModal');
    } catch (error) {
        console.error('Error opening update release modal:', error);
        showToast('Error opening update form', 'error');
    }
}

async function updateRelease() {
    try {
        if (!currentUpdateRelease) {
            showToast('No release selected for update', 'error');
            return;
        }
        
        // Get form elements
        const tokenEl = document.getElementById('update-github-token');
        const titleEl = document.getElementById('update-release-title');
        const tagEl = document.getElementById('update-release-tag');
        const descEl = document.getElementById('update-release-description');
        const youtubeUrlEl = document.getElementById('update-youtube-url');
        const prereleaseEl = document.getElementById('update-release-prerelease');
        const draftEl = document.getElementById('update-release-draft');
        const replaceFilesEl = document.getElementById('update-replace-files');
        
        if (!tokenEl || !titleEl || !tagEl || !descEl) {
            showToast('Form fields not found', 'error');
            return;
        }
        
        const token = tokenEl.value.trim();
        const title = titleEl.value.trim();
        const tag = tagEl.value.trim();
        const youtubeUrl = youtubeUrlEl ? youtubeUrlEl.value.trim() : '';
        let description = descEl.value.trim();
        const prerelease = prereleaseEl ? prereleaseEl.checked : false;
        const draft = draftEl ? draftEl.checked : false;
        const replaceFiles = replaceFilesEl ? replaceFilesEl.checked : false;
        
        if (!token || !title || !tag || !description) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        // Add video URL to description if provided
        if (youtubeUrl) {
            description += `\n\n🎥 Video: ${youtubeUrl}`;
        }
        
        showToast('Updating release...', 'info');
        
        try {
            // Update release via direct GitHub API call
            const [owner, repo] = getRepositoryFromType(currentUpdateRelease.type);
            if (!owner || !repo) {
                throw new Error('Repository configuration not found');
            }
            
            const releaseUpdateData = {
                name: title,
                tag_name: tag,
                body: description,
                prerelease: prerelease,
                draft: draft
            };
            
            // Update the release
            const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/${currentUpdateRelease.releaseId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(releaseUpdateData)
            });
            
            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(`GitHub API Error: ${updateResponse.status} - ${errorData.message || updateResponse.statusText}`);
            }
            
            const updatedRelease = await updateResponse.json();
            
            // If replacing assets with new files, zip into <title>_<tag>.zip and upload single asset
            const selectedFiles = updateSelectedFiles || [];
            if (selectedFiles.length > 0 && replaceFiles) {
                showToast('Replacing release files...', 'info');

                // Delete existing assets
                try {
                    const existingAssets = updatedRelease.assets || [];
                    for (const asset of existingAssets) {
                        await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset.id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github.v3+json' }
                        });
                    }
                } catch (deleteError) {
                    console.warn('Error deleting existing assets:', deleteError);
                }

                // Build zip
                if (typeof JSZip === 'undefined') throw new Error('Archiver not available');
                const zipper = new JSZip();
                for (const fd of selectedFiles) {
                    if (fd && fd.file) zipper.file(fd.file.name, fd.file);
                }
                const zipped = await zipper.generateAsync({ type: 'blob' });
                const zipName = `${(title || updatedRelease.name || 'release').replace(/\s+/g, '_')}_${(tag || updatedRelease.tag_name || 'v')}.zip`;

                // Upload single zipped asset
                const uploadUrl = updatedRelease.upload_url.replace('{?name,label}', `?name=${encodeURIComponent(zipName)}`);
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'POST',
                    headers: { 'Authorization': `token ${token}`, 'Content-Type': 'application/zip' },
                    body: zipped
                });
                if (!uploadResponse.ok) {
                    const t = await uploadResponse.text().catch(() => '');
                    throw new Error(`Asset upload failed: ${uploadResponse.status} ${t}`);
                }
            }
            
            showToast('Release updated successfully!', 'success');
            closeModal('updateReleaseModal');
            
            // Clear form and refresh releases
            clearUpdateForm();
            await displayReleases(currentUpdateRelease.type);
            
            currentUpdateRelease = null;
            
        } catch (error) {
            throw error;
        }
        
    } catch (error) {
        console.error('Error updating release:', error);
        showToast('Error updating release: ' + error.message, 'error');
    }
}

// Supporting functions for update release functionality
let updateSelectedFiles = [];

function setupUpdateUploadZone() {
    try {
        const uploadZone = document.getElementById('update-upload-zone');
        const fileInput = document.getElementById('update-file-input');
        
        if (!uploadZone || !fileInput) return;
        
        // Clear previous event listeners
        uploadZone.replaceWith(uploadZone.cloneNode(true));
        const newUploadZone = document.getElementById('update-upload-zone');
        
        // Click to select files
        newUploadZone.addEventListener('click', () => fileInput.click());
        
        // Drag and drop events
        newUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            newUploadZone.classList.add('drag-over');
        });
        
        newUploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            newUploadZone.classList.remove('drag-over');
        });
        
        newUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            newUploadZone.classList.remove('drag-over');
            handleUpdateFiles(e.dataTransfer.files);
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            handleUpdateFiles(e.target.files);
        });
        
        console.log('Update upload zone setup complete');
    } catch (error) {
        console.error('Error setting up update upload zone:', error);
    }
}

function handleUpdateFiles(files) {
    try {
        const validFiles = [];
        
        Array.from(files).forEach(file => {
            if (file.size > 1024 * 1024 * 1024) { // 1GB limit
                showToast(`File too large: ${file.name} (max 1GB)`, 'error');
                return;
            }
            
            validFiles.push(file);
        });
        
        if (validFiles.length > 0) {
            addUpdateFilesToList(validFiles);
            showToast(`Added ${validFiles.length} file(s) for upload`, 'success');
        }
    } catch (error) {
        console.error('Error handling update files:', error);
        showToast('Error processing files', 'error');
    }
}

function addUpdateFilesToList(files) {
    const fileList = document.getElementById('update-file-list');
    if (!fileList) return;
    
    files.forEach(file => {
        const fileId = Date.now() + Math.random();
        const fileData = { id: fileId, file: file };
        updateSelectedFiles.push(fileData);
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon">${getFileIcon(file.name)}</div>
                <div class="file-details">
                    <h4>${file.name}</h4>
                    <p>${formatFileSize(file.size)} • ${file.type || 'Unknown type'}</p>
                </div>
            </div>
            <div class="file-actions">
                <button class="file-remove-btn" onclick="removeUpdateFile(${fileId})">
                    Remove
                </button>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    });
}

function removeUpdateFile(fileId) {
    try {
        updateSelectedFiles = updateSelectedFiles.filter(f => f.id !== fileId);
        
        // Remove from UI
        const fileList = document.getElementById('update-file-list');
        if (fileList) {
            const fileItems = fileList.querySelectorAll('.file-item');
            fileItems.forEach(item => {
                const removeBtn = item.querySelector('.file-remove-btn');
                if (removeBtn && removeBtn.onclick.toString().includes(fileId)) {
                    item.remove();
                }
            });
        }
        
        showToast('File removed', 'info');
    } catch (error) {
        console.error('Error removing update file:', error);
    }
}

function clearUpdateForm() {
    try {
        // Clear form inputs
        const inputs = ['update-github-token', 'update-release-title', 'update-release-tag', 'update-youtube-url', 'update-release-description'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        
        // Clear checkboxes
        const checkboxes = ['update-release-prerelease', 'update-release-draft', 'update-replace-files'];
        checkboxes.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.checked = false;
        });
        
        // Clear file list
        const fileList = document.getElementById('update-file-list');
        if (fileList) fileList.innerHTML = '';
        
        // Clear selected files
        updateSelectedFiles = [];
        
        // Clear file input
        const fileInput = document.getElementById('update-file-input');
        if (fileInput) fileInput.value = '';
        
        console.log('Update form cleared');
    } catch (error) {
        console.error('Error clearing update form:', error);
    }
}

function getRepositoryFromType(type) {
    try {
        if (!appConfig?.github) return [null, null];
        
        const repoString = appConfig.github[type];
        if (!repoString || !repoString.includes('/')) return [null, null];
        
        return repoString.split('/');
    } catch (error) {
        console.error('Error getting repository from type:', error);
        return [null, null];
    }
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️',
        'exe': '⚙️', 'msi': '⚙️',
        'dmg': '💿', 'deb': '📦',
        'pdf': '📄', 'txt': '📝',
        'jpg': '🖼️', 'png': '🖼️', 'gif': '🖼️'
    };
    return icons[ext] || '📄';
}

// Manifest Files Functionality
async function generateManifest() {
    try {
        const appIdInput = document.getElementById('appid-input');
        const resultDiv = document.getElementById('manifest-result');
        
        if (!appIdInput || !resultDiv) {
            showToast('Manifest form elements not found', 'error');
            return;
        }
        
        const appId = appIdInput.value.trim();
        if (!appId || isNaN(appId) || parseInt(appId) <= 0) {
            showToast('Please enter a valid Steam AppID', 'warning');
            return;
        }
        
        showToast('Downloading manifest for AppID: ' + appId, 'info');
        resultDiv.style.display = 'none';
        
        try {
            // Download manifest from SteamAutoCracks/ManifestHub
            const manifestUrl = `https://codeload.github.com/SteamAutoCracks/ManifestHub/zip/refs/heads/${appId}`;
            
            const response = await fetch(manifestUrl);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Manifest not found for AppID ${appId}. This game may not be available in the manifest repository.`);
                } else {
                    throw new Error(`Failed to download manifest: ${response.status} ${response.statusText}`);
                }
            }
            
            // Get the ZIP file as blob
            const zipBlob = await response.blob();
            
            // Create download link
            const downloadUrl = URL.createObjectURL(zipBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = downloadUrl;
            downloadLink.download = `manifest-${appId}.zip`;
            downloadLink.style.display = 'none';
            
            // Add to page and click to download
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(downloadUrl);
            }, 100);
            
            // Show success message
            resultDiv.querySelector('h4').textContent = 'Manifest Downloaded Successfully!';
            resultDiv.querySelector('p').innerHTML = `
                Manifest for AppID <strong>${appId}</strong> has been downloaded successfully! 🎉<br>
                <small style="color: var(--muted); margin-top: 8px; display: block;">
                    📁 Check your Downloads folder for: <code>manifest-${appId}.zip</code><br>
                    📊 Extract the ZIP file to access the manifest files.
                </small>
            `;
            resultDiv.style.display = 'block';
            
            showToast(`Manifest for AppID ${appId} downloaded successfully!`, 'success');
            
        } catch (downloadError) {
            throw downloadError;
        }
    } catch (error) {
        console.error('Error generating manifest:', error);
        
        const resultDiv = document.getElementById('manifest-result');
        if (resultDiv) {
            resultDiv.querySelector('h4').textContent = 'Manifest Download Failed';
            resultDiv.querySelector('p').innerHTML = `
                ⚠️ Error: ${error.message}<br>
                <small style="color: var(--muted); margin-top: 8px; display: block;">
                    Please check the AppID and try again. Use the request on Discord button below if you think AppID is correct.
                </small>
            `;
            resultDiv.style.display = 'block';
        }
        
        showToast('Failed to download manifest: ' + error.message, 'error');
    }
}

// Admin Panel Functionality
function setupAdminTabs() {
    try {
        const adminTabs = document.querySelectorAll('.admin-tab');
        const adminTabContents = document.querySelectorAll('.admin-tab-content');
        
        adminTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Remove active from all tabs and contents
                adminTabs.forEach(t => t.classList.remove('active'));
                adminTabContents.forEach(content => content.classList.remove('active'));
                
                // Add active to clicked tab and corresponding content
                tab.classList.add('active');
                const targetContent = document.getElementById(targetTab + '-tab');
                if (targetContent) {
                    targetContent.classList.add('active');
                    
                    // Update status dashboard when tab is shown
                    if (targetTab === 'app-status') {
                        updateAppStatus();
                    }
                }
            });
        });
        
        console.log('Admin tabs setup complete');
    } catch (error) {
        console.error('Error setting up admin tabs:', error);
    }
}

// Settings Tabs Functionality
function setupSettingsTabs() {
    try {
        console.log('Setting up settings tabs...');
        const settingsTabs = document.querySelectorAll('.settings-tab');
        const settingsTabContents = document.querySelectorAll('.settings-tab-content');
        
        console.log('Found settings tabs:', settingsTabs.length);
        console.log('Found settings tab contents:', settingsTabContents.length);
        
        // Define the click handler function first
        const handleTabClick = (event) => {
            console.log('Settings tab clicked:', event.currentTarget.dataset.tab);
            const tab = event.currentTarget;
                const targetTab = tab.dataset.tab;
                
                // Remove active from all tabs and contents
                settingsTabs.forEach(t => t.classList.remove('active'));
                settingsTabContents.forEach(content => content.classList.remove('active'));
                
                // Add active to clicked tab and corresponding content
                tab.classList.add('active');
                const targetContent = document.getElementById(targetTab + '-tab');
                if (targetContent) {
                    targetContent.classList.add('active');
                console.log('Activated tab content:', targetTab + '-tab');
            } else {
                console.error('Tab content not found:', targetTab + '-tab');
            }
        };
        
        // Remove any existing event listeners to prevent duplicates
        settingsTabs.forEach((tab, index) => {
            console.log(`Setting up tab ${index}:`, tab.dataset.tab);
            tab.removeEventListener('click', handleTabClick);
            tab.addEventListener('click', handleTabClick);
        });
        
        // Load settings content when tabs are clicked
        document.querySelector('[data-tab="announcements"]')?.addEventListener('click', loadAnnouncements);
        document.querySelector('[data-tab="changelog"]')?.addEventListener('click', loadChangelog);
        document.querySelector('[data-tab="terms"]')?.addEventListener('click', loadTerms);
        document.querySelector('[data-tab="installed-games"]')?.addEventListener('click', () => {
            const list = document.getElementById('installed-games-list');
            if (list && list.childElementCount === 0) {
                scanInstalledGames();
            }
        });
        document.querySelector('[data-tab="offline-activations"]')?.addEventListener('click', () => {
            const list = document.getElementById('activations-list');
            if (list && list.childElementCount === 0) {
                loadOfflineActivations();
            }
        });
        document.querySelector('[data-tab="denuvo-token"]')?.addEventListener('click', () => {
            initializeDenuvoTokenConsole();
        });
        const refreshBtn = document.getElementById('refresh-installed-games');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => scanInstalledGames());
        }
        const refreshActivationsBtn = document.getElementById('refresh-activations');
        if (refreshActivationsBtn) {
            console.log('Setting up refresh activations button');
            refreshActivationsBtn.addEventListener('click', () => {
                console.log('Refresh activations button clicked');
                loadOfflineActivations();
            });
        } else {
            console.error('Refresh activations button not found');
        }

        // Auto-scan installed games shortly after settings load if the tab exists
        setTimeout(() => {
            const tabContent = document.getElementById('installed-games-tab');
            if (tabContent) {
                const list = document.getElementById('installed-games-list');
                if (list && list.childElementCount === 0) {
                    console.log('Auto-scanning installed games...');
                    scanInstalledGames();
                }
            }
        }, 1000);
        
        // Auto-load offline activations shortly after settings load if the tab exists
        setTimeout(() => {
            const tabContent = document.getElementById('offline-activations-tab');
            if (tabContent) {
                const list = document.getElementById('activations-list');
                if (list && list.childElementCount === 0) {
                    console.log('Auto-loading offline activations...');
                    loadOfflineActivations();
                }
            }
        }, 1500);
        
        console.log('Settings tabs setup complete');
    } catch (error) {
        console.error('Error setting up settings tabs:', error);
    }
}

// Fallback settings tab handler - direct event delegation
document.addEventListener('DOMContentLoaded', function() {
    // Use event delegation for settings tabs as a fallback
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('settings-tab')) {
            const tab = event.target;
            const targetTab = tab.dataset.tab;
            
            console.log('Fallback settings tab clicked:', targetTab);
            
            // Remove active from all tabs and contents
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.settings-tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active to clicked tab and corresponding content
            tab.classList.add('active');
            const targetContent = document.getElementById(targetTab + '-tab');
            if (targetContent) {
                targetContent.classList.add('active');
                console.log('Fallback activated tab content:', targetTab + '-tab');
            }
        }
    });
});

// Helper functions for announcements
function formatAnnouncementText(announcementText) {
    try {
        // Split by lines and process each line
        const lines = announcementText.split('\n');
        let formattedHtml = '<div style="max-width: 800px; line-height: 1.6;">';
        
        let inSection = false;
        
        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Skip empty lines
            if (!trimmed) {
                formattedHtml += '<br>';
                return;
            }
            
            // Check for section headers (lines starting with ## or #)
            if (trimmed.startsWith('## ')) {
                const title = trimmed.substring(3);
                formattedHtml += `<h4 style="color: var(--cyan); font-family: Orbitron, sans-serif; margin: 24px 0 16px 0; font-size: 20px;">📢 ${title}</h4>`;
            } else if (trimmed.startsWith('# ')) {
                const title = trimmed.substring(2);
                formattedHtml += `<h3 style="color: var(--cyan); font-family: Orbitron, sans-serif; margin: 30px 0 20px 0; font-size: 24px; text-shadow: 0 0 8px rgba(86, 233, 255, 0.5);">🎆 ${title}</h3>`;
            } else if (trimmed.startsWith('- ')) {
                // Bullet point
                const content = trimmed.substring(2);
                formattedHtml += `<div style="margin: 8px 0; padding-left: 20px; color: var(--text);"><span style="color: var(--cyan); margin-right: 8px;">•</span>${content}</div>`;
            } else if (trimmed.startsWith('[') && trimmed.includes(']')) {
                // Date/timestamp format
                formattedHtml += `<div style="color: var(--muted); font-size: 13px; margin: 12px 0 8px 0; font-style: italic;">📅 ${trimmed}</div>`;
            } else {
                // Regular text
                formattedHtml += `<p style="color: var(--text); margin: 12px 0; line-height: 1.6;">${trimmed}</p>`;
            }
        });
        
        formattedHtml += '</div>';
        return formattedHtml;
        
    } catch (error) {
        console.error('Error formatting announcement text:', error);
        return `<pre style="white-space: pre-wrap; font-family: Inter, sans-serif; font-size: 14px; line-height: 1.6; color: var(--text);">${announcementText}</pre>`;
    }
}

function getDefaultAnnouncementContent() {
    return `
        <div style="max-width: 800px; line-height: 1.6;">
            <h3 style="color: var(--cyan); font-family: Orbitron, sans-serif; margin-bottom: 20px; font-size: 24px; text-shadow: 0 0 8px rgba(86, 233, 255, 0.5);">🎆 Welcome to Crack World!</h3>
            
            <div style="padding: 20px; background: rgba(86, 233, 255, 0.1); border: 1px solid rgba(86, 233, 255, 0.3); border-radius: 12px; margin-bottom: 20px;">
                <p style="color: var(--text); margin: 0 0 12px 0; font-size: 16px; font-weight: 600;">🎉 Thank you for using Crack World!</p>
                <p style="color: var(--muted); margin: 0; font-size: 14px;">We're constantly working to improve your experience. Check back regularly for the latest updates, announcements, and important information.</p>
            </div>
            
            <div style="padding: 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--stroke); border-radius: 8px; margin-bottom: 16px;">
                <h4 style="color: var(--text); margin: 0 0 12px 0; font-size: 16px;">📢 Stay Connected</h4>
                <p style="color: var(--muted); margin: 0 0 8px 0; font-size: 14px;">• Join our Discord community for real-time updates</p>
                <p style="color: var(--muted); margin: 0 0 8px 0; font-size: 14px;">• Follow our GitHub repository for technical updates</p>
                <p style="color: var(--muted); margin: 0; font-size: 14px;">• Check the changelog tab for version history</p>
            </div>
            
            <div style="text-align: center; padding: 16px; background: rgba(134, 47, 255, 0.1); border: 1px solid rgba(134, 47, 255, 0.3); border-radius: 8px;">
                <p style="color: var(--vio); font-weight: 600; margin: 0 0 8px 0;">🚀 No announcements at this time</p>
                <p style="color: var(--muted); font-size: 13px; margin: 0;">New announcements will appear here when available.</p>
            </div>
        </div>
    `;
}

// Load Settings Content
async function loadAnnouncements() {
    try {
        const content = document.getElementById('announcement-content');
        if (!content) return;
        
        content.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="loading-spinner"></div><p style="color: var(--muted);">Loading announcements from GitHub...</p></div>';
        
        // Try to get repository from admin config first, fallback to default
        let repository = 'ABAID-CODER/crackworld-manifest';
        try {
            const adminRepoEl = document.getElementById('announcement-repo');
            if (adminRepoEl && adminRepoEl.value.trim()) {
                repository = adminRepoEl.value.trim();
            }
        } catch (configError) {
            console.log('Using default repository for announcements');
        }
        
        const announcementUrl = `https://raw.githubusercontent.com/${repository}/main/announcements.txt`;
        console.log(`Loading announcements from: ${announcementUrl}`);
        
        try {
            const response = await fetch(announcementUrl, {
                cache: 'no-store', // Always get fresh content
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (response.ok) {
                const announcements = await response.text();
                if (announcements.trim()) {
                    // Format announcements with better styling
                    const formattedAnnouncements = formatAnnouncementText(announcements);
                    content.innerHTML = formattedAnnouncements;
                    
                    // Show success message
                    console.log(`Announcements loaded successfully from ${repository}`);
                } else {
                    content.innerHTML = getDefaultAnnouncementContent();
                }
                
                return;
            } else if (response.status === 404) {
                console.log(`Announcements file not found in ${repository}, showing default message`);
                content.innerHTML = getDefaultAnnouncementContent();
                return;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (githubError) {
            console.warn(`Failed to load announcements from ${repository}:`, githubError.message);
            content.innerHTML = getDefaultAnnouncementContent();
        }
        
    } catch (error) {
        console.error('Error loading announcements:', error);
        const content = document.getElementById('announcement-content');
        if (content) {
            content.innerHTML = '<div style="text-align: center; padding: 20px;"><p style="color: #ff4444;">⚠️ Failed to load announcements. Please try again.</p></div>';
        }
    }
}

async function loadChangelog() {
    try {
        const content = document.getElementById('changelog-content');
        if (!content) return;
        
        content.innerHTML = '<div style="text-align: center; padding: 20px;"><div class="loading-spinner"></div><p style="color: var(--muted);">Loading changelog from GitHub...</p></div>';
        
        // Load changelog from GitHub repository using hardcoded URL
        const changelogUrl = 'https://raw.githubusercontent.com/ABAID-CODER/crackworld-manifest/main/changelog.txt';
        
        try {
            const response = await fetch(changelogUrl);
            if (response.ok) {
                const changelogText = await response.text();
                const formattedChangelog = formatChangelogText(changelogText);
                content.innerHTML = formattedChangelog;
                return;
            } else if (response.status === 404) {
                console.warn('Changelog file not found on GitHub, using fallback');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (githubError) {
            console.warn('Failed to load changelog from GitHub:', githubError.message);
        }
        
        // Fallback to default changelog if GitHub fails
        const defaultChangelog = `
            <div style="max-width: 800px; line-height: 1.6;">
                <h4 style="color: var(--cyan); font-family: Orbitron, sans-serif; margin-bottom: 24px; font-size: 24px;">📋 Changelog</h4>
                
                <div style="margin-bottom: 30px; padding: 20px; background: rgba(86, 233, 255, 0.1); border: 1px solid rgba(86, 233, 255, 0.3); border-radius: 12px;">
                    <h5 style="color: var(--cyan); margin-bottom: 16px; font-size: 18px;">🚀 Version 2.1.0 - Enhanced Download System</h5>
                    <p style="color: var(--muted); margin-bottom: 12px; font-size: 13px;"><strong>Released:</strong> ${new Date().toLocaleDateString()}</p>
                    <ul style="color: var(--muted); margin-left: 20px; font-size: 14px;">
                        <li style="margin-bottom: 8px;">✨ Complete download manager overhaul with concurrent downloads</li>
                        <li style="margin-bottom: 8px;">🎨 Added animated download progress indicators with real-time updates</li>
                        <li style="margin-bottom: 8px;">⚡ Removed download queue system - now supports unlimited concurrent downloads</li>
                        <li style="margin-bottom: 8px;">🔧 Fixed rememberedDownloadPath error and enhanced path management</li>
                        <li style="margin-bottom: 8px;">📝 Comprehensive Terms of Service integrated directly in code</li>
                        <li style="margin-bottom: 8px;">📋 Dynamic changelog loading from GitHub repository</li>
                        <li style="margin-bottom: 8px;">🎯 Enhanced error handling with retry mechanisms and user feedback</li>
                        <li style="margin-bottom: 8px;">💫 Improved download animations with stacking and auto-removal</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 25px; padding: 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--stroke); border-radius: 8px;">
                    <h5 style="color: var(--text); margin-bottom: 12px; font-size: 16px;">🎨 Version 2.0.0 - Production Ready</h5>
                    <p style="color: var(--muted); margin-bottom: 12px; font-size: 13px;"><strong>Released:</strong> October 2024</p>
                    <ul style="color: var(--muted); margin-left: 20px; font-size: 14px;">
                        <li style="margin-bottom: 6px;">Complete UI overhaul with modern cyberpunk design</li>
                        <li style="margin-bottom: 6px;">Enhanced download manager with queue system</li>
                        <li style="margin-bottom: 6px;">Custom scrollbars and improved card styling</li>
                        <li style="margin-bottom: 6px;">Production-ready toast notifications</li>
                        <li style="margin-bottom: 6px;">Comprehensive admin panel with upload functionality</li>
                        <li style="margin-bottom: 6px;">GitHub integration for release management</li>
                        <li style="margin-bottom: 6px;">Configuration persistence and loading</li>
                        <li style="margin-bottom: 6px;">Enhanced release card display with YouTube thumbnails</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 25px; padding: 16px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--stroke); border-radius: 8px;">
                    <h5 style="color: var(--text); margin-bottom: 12px; font-size: 16px;">🌟 Version 1.0.0 - Initial Release</h5>
                    <p style="color: var(--muted); margin-bottom: 12px; font-size: 13px;"><strong>Released:</strong> September 2024</p>
                    <ul style="color: var(--muted); margin-left: 20px; font-size: 14px;">
                        <li style="margin-bottom: 6px;">Initial application framework and architecture</li>
                        <li style="margin-bottom: 6px;">Basic functionality for browsing releases</li>
                        <li style="margin-bottom: 6px;">Download capabilities with directory selection</li>
                        <li style="margin-bottom: 6px;">GitHub API integration for release data</li>
                        <li style="margin-bottom: 6px;">Manifest file generation system</li>
                        <li style="margin-bottom: 6px;">Discord integration and community features</li>
                    </ul>
                </div>
                
                <div style="text-align: center; padding: 20px; background: rgba(134, 47, 255, 0.1); border: 1px solid rgba(134, 47, 255, 0.3); border-radius: 8px;">
                    <p style="color: var(--vio); font-weight: 600; margin-bottom: 8px;">🚀 What's Next?</p>
                    <p style="color: var(--muted); font-size: 13px; margin: 0;">Stay tuned for more updates and features! Follow our GitHub repository and Discord server for the latest developments.</p>
                </div>
            </div>
        `;
        
        content.innerHTML = defaultChangelog;
        
    } catch (error) {
        console.error('Error loading changelog:', error);
        const content = document.getElementById('changelog-content');
        if (content) {
            content.innerHTML = '<div style="text-align: center; padding: 20px;"><p style="color: var(--muted);">Failed to load changelog. Please try again.</p></div>';
        }
    }
}

// Helper function to format changelog text from GitHub
function formatChangelogText(changelogText) {
    try {
        const lines = changelogText.split('\n');
        let formattedHtml = '<div style="max-width: 800px; line-height: 1.6;"><h4 style="color: var(--cyan); font-family: Orbitron, sans-serif; margin-bottom: 24px; font-size: 24px;">📋 Changelog</h4>';
        
        let currentVersion = null;
        let currentVersionContent = [];
        let inCodeBlock = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // Skip empty lines
            if (!trimmedLine) continue;
            
            // Handle code blocks
            if (trimmedLine.startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                continue;
            }
            
            if (inCodeBlock) continue;
            
            // Check if line is a version header (multiple patterns)
            const versionPatterns = [
                /^#+\s*(v?\d+\.\d+\.\d+)/i,  // Markdown headers with version
                /^##\s*(v?\d+\.\d+\.\d+)/i, // Markdown h2 headers
                /^#\s*(v?\d+\.\d+\.\d+)/i,  // Markdown h1 headers
                /^(v?\d+\.\d+\.\d+)/i,      // Plain version numbers
                /^(\d{4}-\d{2}-\d{2})/i,    // Date format
                /^(Version|Release|Changelog)/i, // Version keywords
                /^\[(v?\d+\.\d+\.\d+)\]/i,  // Bracketed versions
                /^##\s*\[(v?\d+\.\d+\.\d+)\]/i // Markdown with brackets
            ];
            
            let isVersionHeader = false;
            for (const pattern of versionPatterns) {
                if (pattern.test(trimmedLine)) {
                    isVersionHeader = true;
                    break;
                }
            }
            
            if (isVersionHeader) {
                // Save previous version if exists
                if (currentVersion && currentVersionContent.length > 0) {
                    formattedHtml += formatVersionSection(currentVersion, currentVersionContent);
                }
                
                // Clean up version header
                currentVersion = trimmedLine
                    .replace(/^#+\s*/, '') // Remove markdown headers
                    .replace(/^\[|\]$/g, '') // Remove brackets
                    .trim();
                currentVersionContent = [];
            } else if (trimmedLine.startsWith('-') || trimmedLine.startsWith('*') || trimmedLine.startsWith('•') || trimmedLine.startsWith('+')) {
                // Add changelog item
                const item = trimmedLine.replace(/^[-*•+]\s*/, '').trim();
                if (item) currentVersionContent.push(item);
            } else if (trimmedLine.length > 0 && !currentVersion) {
                // If no version header found yet, treat as version
                currentVersion = trimmedLine;
                currentVersionContent = [];
            }
        }
        
        // Add the last version
        if (currentVersion && currentVersionContent.length >= 0) {
            formattedHtml += formatVersionSection(currentVersion, currentVersionContent);
        }
        
        formattedHtml += '</div>';
        
        return formattedHtml;
    } catch (error) {
        console.error('Error formatting changelog:', error);
        return `<div style="padding: 20px;"><pre style="color: var(--muted); white-space: pre-wrap;">${changelogText}</pre></div>`;
    }
}

// Helper function to format individual version sections
function formatVersionSection(version, items) {
    const isLatest = version.toLowerCase().includes('latest') || version.toLowerCase().includes('current');
    const bgColor = isLatest ? 'rgba(86, 233, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)';
    const borderColor = isLatest ? 'rgba(86, 233, 255, 0.3)' : 'var(--stroke)';
    const titleColor = isLatest ? 'var(--cyan)' : 'var(--text)';
    
    let html = `<div style="margin-bottom: 25px; padding: 16px; background: ${bgColor}; border: 1px solid ${borderColor}; border-radius: 8px;">`;
    html += `<h5 style="color: ${titleColor}; margin-bottom: 12px; font-size: 16px;">🚀 ${version}</h5>`;
    
    if (items.length > 0) {
        html += '<ul style="color: var(--muted); margin-left: 20px; font-size: 14px;">';
        for (const item of items) {
            html += `<li style="margin-bottom: 6px;">${item}</li>`;
        }
        html += '</ul>';
    }
    
    html += '</div>';
    return html;
}

async function loadTerms() {
    try {
        const content = document.getElementById('terms-content');
        if (!content) return;
        
        // Comprehensive Terms of Service implemented directly in code
        const termsContent = `
            <div style="max-width: 800px; line-height: 1.6; font-size: 14px;">
                <h4 style="color: var(--cyan); font-family: Orbitron, sans-serif; margin-bottom: 20px; font-size: 24px;">Terms of Service</h4>
                <p style="color: var(--muted); margin-bottom: 30px;"><strong>Last Updated:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">1. Acceptance of Terms</h5>
                    <p style="color: var(--muted); margin-bottom: 15px;">By downloading, installing, or using the Crack World application ("the Software"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Software.</p>
                    <p style="color: var(--muted);">These Terms constitute a legally binding agreement between you and the developers of Crack World.</p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">2. Purpose and Educational Use</h5>
                    <p style="color: var(--muted); margin-bottom: 15px;">Crack World is provided <strong>exclusively for educational, research, and informational purposes</strong>. The Software is designed to help users understand software distribution, version control, and digital content management.</p>
                    <p style="color: var(--muted);"><strong style="color: var(--orange);">Important:</strong> Users are expected to respect intellectual property rights, software licenses, and applicable laws in their jurisdiction.</p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">3. Prohibited Uses</h5>
                    <p style="color: var(--muted); margin-bottom: 10px;">You agree NOT to use the Software for:</p>
                    <ul style="color: var(--muted); margin-left: 20px; margin-bottom: 15px;">
                        <li style="margin-bottom: 8px;">Distributing, downloading, or accessing copyrighted material without proper authorization</li>
                        <li style="margin-bottom: 8px;">Commercial piracy or copyright infringement</li>
                        <li style="margin-bottom: 8px;">Circumventing legitimate software protection mechanisms for illegal purposes</li>
                        <li style="margin-bottom: 8px;">Any activity that violates local, national, or international laws</li>
                        <li style="margin-bottom: 8px;">Malicious distribution of software or malware</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">4. User Responsibilities</h5>
                    <p style="color: var(--muted); margin-bottom: 15px;">As a user of Crack World, you are responsible for:</p>
                    <ul style="color: var(--muted); margin-left: 20px; margin-bottom: 15px;">
                        <li style="margin-bottom: 8px;">Ensuring your use complies with all applicable laws and regulations</li>
                        <li style="margin-bottom: 8px;">Respecting intellectual property rights of software developers and publishers</li>
                        <li style="margin-bottom: 8px;">Using the Software only for legitimate educational and research purposes</li>
                        <li style="margin-bottom: 8px;">Keeping your GitHub tokens and credentials secure</li>
                        <li style="margin-bottom: 8px;">Not sharing or distributing copyrighted content through the platform</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">5. Privacy and Data Collection</h5>
                    <p style="color: var(--muted); margin-bottom: 15px;">We respect your privacy and are committed to protecting your personal information:</p>
                    <ul style="color: var(--muted); margin-left: 20px; margin-bottom: 15px;">
                        <li style="margin-bottom: 8px;"><strong>No Data Collection:</strong> We do not collect, store, or transmit personal information to external servers</li>
                        <li style="margin-bottom: 8px;"><strong>Local Storage:</strong> All configuration data, preferences, and download history are stored locally on your device</li>
                        <li style="margin-bottom: 8px;"><strong>GitHub Integration:</strong> GitHub tokens and repository access are handled directly between your device and GitHub's APIs</li>
                        <li style="margin-bottom: 8px;"><strong>No Tracking:</strong> We do not use analytics, cookies, or tracking mechanisms</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">6. Disclaimer of Warranties</h5>
                    <p style="color: var(--muted); margin-bottom: 15px;">THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, INCLUDING:</p>
                    <ul style="color: var(--muted); margin-left: 20px; margin-bottom: 15px;">
                        <li style="margin-bottom: 8px;">Implied warranties of merchantability, fitness for a particular purpose, and non-infringement</li>
                        <li style="margin-bottom: 8px;">Any guarantee that the Software will be error-free, secure, or continuously available</li>
                        <li style="margin-bottom: 8px;">Accuracy, completeness, or reliability of any content accessed through the Software</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">7. Limitation of Liability</h5>
                    <p style="color: var(--muted); margin-bottom: 15px;">TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE DEVELOPERS SHALL NOT BE LIABLE FOR:</p>
                    <ul style="color: var(--muted); margin-left: 20px; margin-bottom: 15px;">
                        <li style="margin-bottom: 8px;">Any direct, indirect, incidental, consequential, or punitive damages</li>
                        <li style="margin-bottom: 8px;">Legal consequences arising from misuse of the Software</li>
                        <li style="margin-bottom: 8px;">Loss of data, profits, or business opportunities</li>
                        <li style="margin-bottom: 8px;">Any damages resulting from your use or inability to use the Software</li>
                    </ul>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">8. Indemnification</h5>
                    <p style="color: var(--muted);">You agree to indemnify, defend, and hold harmless the developers from any claims, damages, losses, or expenses arising from your use of the Software, violation of these Terms, or infringement of any third-party rights.</p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">9. Third-Party Services</h5>
                    <p style="color: var(--muted); margin-bottom: 15px;">Crack World integrates with third-party services (GitHub, Discord). Your use of these services is subject to their respective terms of service and privacy policies. We are not responsible for the availability, content, or practices of third-party services.</p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">10. Modifications to Terms</h5>
                    <p style="color: var(--muted);">We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting within the Software. Your continued use after changes constitutes acceptance of the modified Terms.</p>
                </div>
                
                <div style="margin-bottom: 25px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">11. Termination</h5>
                    <p style="color: var(--muted);">These Terms remain in effect until terminated. You may terminate this agreement by discontinuing use and deleting the Software. We may terminate your access if you violate these Terms.</p>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h5 style="color: var(--text); font-size: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--stroke); padding-bottom: 6px;">12. Governing Law</h5>
                    <p style="color: var(--muted);">These Terms are governed by applicable international laws and the laws of your jurisdiction. Any disputes shall be resolved in accordance with local legal procedures.</p>
                </div>
                
                <div style="background: rgba(255, 170, 0, 0.1); border: 1px solid rgba(255, 170, 0, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                    <h6 style="color: var(--orange); margin-bottom: 10px; font-size: 16px;">⚠️ Important Legal Notice</h6>
                    <p style="color: var(--muted); font-size: 13px; margin: 0;">This software is intended for educational purposes only. Users are solely responsible for ensuring their use complies with applicable copyright laws, software licenses, and local regulations. The developers do not condone or support software piracy or copyright infringement.</p>
                </div>
                
                <div style="text-align: center; padding: 20px; background: rgba(86, 233, 255, 0.1); border: 1px solid rgba(86, 233, 255, 0.3); border-radius: 8px;">
                    <p style="color: var(--cyan); font-weight: 600; margin-bottom: 8px;">Questions about these Terms?</p>
                    <p style="color: var(--muted); font-size: 13px; margin: 0;">Contact us through our Discord server or GitHub repository for clarification on any terms or conditions.</p>
                </div>
            </div>
        `;
        
        content.innerHTML = termsContent;
    } catch (error) {
        console.error('Error loading terms:', error);
        const content = document.getElementById('terms-content');
        if (content) {
            content.innerHTML = '<p style="color: var(--muted);">Failed to load terms of service. Please try again.</p>';
        }
    }
}


// Enhanced announcement publishing function
async function publishAnnouncement() {
    try {
        // Get form data
        const tokenEl = document.getElementById('announcement-github-token');
        const repoEl = document.getElementById('announcement-repo');
        const titleEl = document.getElementById('announcement-title');
        const contentEl = document.getElementById('announcement-content-textarea');
        const statusEl = document.getElementById('announcement-status');
        const statusTextEl = document.getElementById('announcement-status-text');
        
        if (!tokenEl || !repoEl || !titleEl || !contentEl) {
            showToast('Required form elements not found', 'error');
            return;
        }
        
        const token = tokenEl.value.trim();
        const repo = repoEl.value.trim();
        const title = titleEl.value.trim();
        const content = contentEl.value.trim();
        
        // Validate inputs
        if (!token || !repo || !title || !content) {
            showToast('Please fill in all required fields', 'warning');
            return;
        }
        
        // Validate repo format
        if (!repo.includes('/') || repo.split('/').length !== 2) {
            showToast('Repository format should be owner/repository', 'error');
            return;
        }
        
        // Show status
        if (statusEl && statusTextEl) {
            statusEl.style.display = 'block';
            statusEl.className = 'link-preview';
            statusTextEl.innerHTML = '⏳ Publishing announcement to GitHub...';
        }
        
        // Format announcement content with timestamp
        const timestamp = new Date().toLocaleString();
        const announcementContent = `# ${title}\n\n[${timestamp}]\n\n${content}`;
        
        // Commit to GitHub
        try {
            const result = await commitAnnouncementToGitHub(announcementContent, token, repo);
            
            if (result.success) {
                showToast('✅ Announcement published successfully!', 'success');
                
                if (statusEl && statusTextEl) {
                    statusEl.className = 'link-preview valid';
                    statusTextEl.innerHTML = '✅ Published successfully! Refreshing announcements...';
                }
                
                // Clear form
                titleEl.value = '';
                contentEl.value = '';
                
                // Hide preview if visible
                const previewEl = document.getElementById('announcement-preview');
                if (previewEl) {
                    previewEl.style.display = 'none';
                }
                
                // Refresh announcements in settings after a delay
                setTimeout(() => {
                    loadAnnouncements();
                }, 3000);
                
            } else {
                throw new Error(result.error || 'Failed to publish to GitHub');
            }
            
        } catch (publishError) {
            console.error('Error publishing announcement:', publishError);
            showToast(`❌ Failed to publish: ${publishError.message}`, 'error');
            
            if (statusEl && statusTextEl) {
                statusEl.className = 'link-preview invalid';
                statusTextEl.innerHTML = `❌ Failed to publish: ${publishError.message}`;
            }
        }
        
    } catch (error) {
        console.error('Error in publishAnnouncement:', error);
        showToast('Failed to publish announcement: ' + error.message, 'error');
    }
}

// Helper function to commit announcements to GitHub
async function commitAnnouncementToGitHub(content, token, repository) {
    try {
        const [owner, repo] = repository.split('/');
        const filename = 'announcements.txt';
        
        // Get current file SHA if it exists
        let currentSha = null;
        try {
            const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filename}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const currentFile = await getResponse.json();
                currentSha = currentFile.sha;
            }
        } catch (getError) {
            console.log('Announcements file does not exist yet, will create new');
        }
        
        // Create or update the file
        const encodedContent = btoa(unescape(encodeURIComponent(content))); // Properly encode UTF-8
        const updateData = {
            message: `Update announcements - ${new Date().toISOString()}`,
            content: encodedContent,
            branch: 'main'
        };
        
        if (currentSha) {
            updateData.sha = currentSha;
        }
        
        const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`GitHub API Error: ${updateResponse.status} - ${errorData.message || updateResponse.statusText}`);
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Error committing announcement to GitHub:', error);
        return { success: false, error: error.message };
    }
}

function previewAnnouncement() {
    try {
        const titleEl = document.getElementById('announcement-title');
        const contentTextarea = document.getElementById('announcement-content-textarea');
        const previewEl = document.getElementById('announcement-preview');
        const previewTitleEl = document.getElementById('preview-title');
        const previewContentEl = document.getElementById('preview-content');
        
        if (!titleEl || !contentTextarea || !previewEl) return;
        
        const title = titleEl.value.trim();
        const content = contentTextarea.value.trim();
        
        if (!title || !content) {
            showToast('Please fill in title and content first', 'warning');
            return;
        }
        
        if (previewTitleEl) previewTitleEl.textContent = title;
        if (previewContentEl) previewContentEl.textContent = content;
        
        previewEl.style.display = 'block';
        showToast('Preview generated', 'success');
    } catch (error) {
        console.error('Error previewing announcement:', error);
    }
}

// Load current announcements from GitHub for editing
async function loadCurrentAnnouncements() {
    try {
        const tokenEl = document.getElementById('announcement-github-token');
        const repoEl = document.getElementById('announcement-repo');
        const statusEl = document.getElementById('announcement-status');
        const statusTextEl = document.getElementById('announcement-status-text');
        
        if (!tokenEl || !repoEl) {
            showToast('GitHub configuration not found', 'error');
            return;
        }
        
        const token = tokenEl.value.trim();
        const repo = repoEl.value.trim();
        
        if (!token || !repo) {
            showToast('Please enter GitHub token and repository first', 'warning');
            return;
        }
        
        // Show loading status
        if (statusEl && statusTextEl) {
            statusEl.style.display = 'block';
            statusEl.className = 'link-preview';
            statusTextEl.innerHTML = '⏳ Loading current announcements from GitHub...';
        }
        
        try {
            const [owner, repository] = repo.split('/');
            const response = await fetch(`https://api.github.com/repos/${owner}/${repository}/contents/announcements.txt`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (response.ok) {
                const fileData = await response.json();
                const content = atob(fileData.content);
                
                // Parse the announcement content
                const lines = content.split('\n');
                const titleLine = lines.find(line => line.startsWith('# '));
                const title = titleLine ? titleLine.substring(2) : '';
                
                // Get content after title and timestamp
                const titleIndex = lines.findIndex(line => line.startsWith('# '));
                const contentStart = titleIndex >= 0 ? titleIndex + 3 : 0; // Skip title and timestamp
                const announcementContent = lines.slice(contentStart).join('\n').trim();
                
                // Fill form fields
                const titleEl = document.getElementById('announcement-title');
                const contentEl = document.getElementById('announcement-content-textarea');
                
                if (titleEl) titleEl.value = title;
                if (contentEl) contentEl.value = announcementContent;
                
                showToast('✅ Current announcements loaded successfully', 'success');
                
                if (statusEl && statusTextEl) {
                    statusEl.className = 'link-preview valid';
                    statusTextEl.innerHTML = '✅ Current announcements loaded successfully';
                }
                
            } else if (response.status === 404) {
                showToast('No announcements file found in repository', 'info');
                
                if (statusEl && statusTextEl) {
                    statusEl.className = 'link-preview';
                    statusTextEl.innerHTML = 'ℹ️ No announcements file found in repository';
                }
            } else {
                throw new Error(`GitHub API Error: ${response.status}`);
            }
            
        } catch (loadError) {
            console.error('Error loading announcements:', loadError);
            showToast(`Failed to load announcements: ${loadError.message}`, 'error');
            
            if (statusEl && statusTextEl) {
                statusEl.className = 'link-preview invalid';
                statusTextEl.innerHTML = `❌ Failed to load: ${loadError.message}`;
            }
        }
        
    } catch (error) {
        console.error('Error in loadCurrentAnnouncements:', error);
        showToast('Error loading announcements: ' + error.message, 'error');
    }
}

// Validate announcement form and enable/disable publish button
function validateAnnouncementForm() {
    try {
        const tokenEl = document.getElementById('announcement-github-token');
        const repoEl = document.getElementById('announcement-repo');
        const titleEl = document.getElementById('announcement-title');
        const contentEl = document.getElementById('announcement-content-textarea');
        const publishBtn = document.getElementById('publish-announcement-btn');
        const statusEl = document.getElementById('github-config-status');
        
        if (!tokenEl || !repoEl || !titleEl || !contentEl || !publishBtn) return;
        
        const token = tokenEl.value.trim();
        const repo = repoEl.value.trim();
        const title = titleEl.value.trim();
        const content = contentEl.value.trim();
        
        const isValid = token && repo && title && content && repo.includes('/') && repo.split('/').length === 2;
        
        publishBtn.disabled = !isValid;
        
        // Update status display
        if (statusEl) {
            if (token && repo && repo.includes('/')) {
                statusEl.className = 'link-preview valid';
                statusEl.innerHTML = '<span class="link-validation-icon">✅</span><span>GitHub configuration valid - ready to publish</span>';
            } else if (token || repo) {
                statusEl.className = 'link-preview';
                statusEl.innerHTML = '<span class="link-validation-icon">⚠️</span><span>Please complete GitHub configuration</span>';
            } else {
                statusEl.className = 'link-preview';
                statusEl.innerHTML = '<span class="link-validation-icon">ℹ️</span><span>Enter your GitHub token and repository to enable announcement publishing</span>';
            }
        }
        
    } catch (error) {
        console.error('Error validating announcement form:', error);
    }
}

// Navigation Functions
function setupNavigation() {
    try {
        // Back buttons
        const backFromDownloads = document.getElementById('back-from-downloads');
        const backFromSettings = document.getElementById('back-from-settings');
        const backToListBtn = document.getElementById('back-to-list-btn');
        
        if (backFromDownloads) {
            backFromDownloads.addEventListener('click', () => showPage(lastActiveListPage));
        }
        if (backFromSettings) {
            backFromSettings.addEventListener('click', () => showPage(lastActiveListPage));
        }
        if (backToListBtn) {
            backToListBtn.addEventListener('click', () => showPage(lastActiveListPage));
        }
        
        // Category buttons with proper active state management
        const categoryBtns = document.querySelectorAll('.category-btn');
        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        console.log('Navigation setup complete');
    } catch (error) {
        console.error('Error setting up navigation:', error);
    }
}

// Manifest Page Setup
function setupManifestPage() {
    try {
        console.log('Setting up manifest page...');
        
        // Show Discord request section by default (since manifests are typically not found)
        const discordSection = document.getElementById('discord-request-section');
        if (discordSection) {
            discordSection.style.display = 'block';
        }
        
        // Setup Discord request button
        const discordBtn = document.getElementById('request-discord-btn');
        if (discordBtn) {
            discordBtn.addEventListener('click', () => {
                console.log('Discord request button clicked');
                // Open Discord channel in default browser
                if (window.electronAPI && window.electronAPI.openExternal) {
                    window.electronAPI.openExternal('https://discord.com/channels/1311229995787747339/1391458765571621038');
                } else {
                    // Fallback for browser mode
                    window.open('https://discord.com/channels/1311229995787747339/1391458765571621038', '_blank');
                }
            });
        }
        
        // Setup manifest generation button
        const generateBtn = document.getElementById('generate-manifest');
        if (generateBtn) {
            generateBtn.addEventListener('click', async () => {
                const appIdInput = document.getElementById('appid-input');
                const appId = appIdInput?.value?.trim();
                
                if (!appId) {
                    showToast('Please enter a Steam AppID', 'warning');
                    return;
                }
                
                try {
                    // Show loading state
                    generateBtn.textContent = 'GENERATING...';
                    generateBtn.disabled = true;
                    
                    // Simulate manifest generation (you can replace this with actual logic)
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Show result
                    const resultDiv = document.getElementById('manifest-result');
                    if (resultDiv) {
                        resultDiv.style.display = 'block';
                    }
                    
                    showToast('Manifest generated successfully!', 'success');
                    
                } catch (error) {
                    console.error('Error generating manifest:', error);
                    showToast('Failed to generate manifest', 'error');
                } finally {
                    generateBtn.textContent = 'GENERATE & INSTALL MANIFEST';
                    generateBtn.disabled = false;
                }
            });
        }
        
        console.log('Manifest page setup complete');
    } catch (error) {
        console.error('Error setting up manifest page:', error);
    }
}

// Hover Window Controls System
let hoverControlsVisible = false;
let hoverTimeout = null;

function setupHoverWindowControls() {
    console.log('Setting up hover window controls...');
    
    const titleBar = document.getElementById('title-bar');
    const hoverControls = document.getElementById('hover-window-controls');
    
    console.log('Elements found:', {
        titleBar: !!titleBar,
        hoverControls: !!hoverControls
    });
    
    if (!titleBar || !hoverControls) {
        console.error('Title bar or hover controls not found');
        console.log('Title bar element:', titleBar);
        console.log('Hover controls element:', hoverControls);
        return;
    }
    
    // Show controls on title bar hover
    titleBar.addEventListener('mouseenter', (e) => {
        console.log('Title bar mouse enter');
        clearTimeout(hoverTimeout);
        showHoverControls();
    });
    
    // Hide controls when leaving title bar
    titleBar.addEventListener('mouseleave', (e) => {
        console.log('Title bar mouse leave');
        hideHoverControls();
    });
    
    // Keep controls visible when hovering over them
    hoverControls.addEventListener('mouseenter', (e) => {
        console.log('Hover controls mouse enter');
        clearTimeout(hoverTimeout);
        showHoverControls();
    });
    
    // Hide controls when leaving the controls area
    hoverControls.addEventListener('mouseleave', (e) => {
        console.log('Hover controls mouse leave');
        hideHoverControls();
    });
    
    // Update controls position to follow cursor
    titleBar.addEventListener('mousemove', (e) => {
        if (hoverControlsVisible) {
            updateControlsPosition(e);
        }
    });
    
    console.log('✅ Hover window controls setup complete');
}

function showHoverControls() {
    console.log('Showing hover controls...');
    const hoverControls = document.getElementById('hover-window-controls');
    if (hoverControls) {
        console.log('Adding visible class to hover controls');
        hoverControls.classList.add('visible');
        hoverControlsVisible = true;
        console.log('Hover controls should now be visible');
    } else {
        console.error('Hover controls element not found in showHoverControls');
    }
}

function hideHoverControls() {
    console.log('Hiding hover controls...');
    hoverTimeout = setTimeout(() => {
        const hoverControls = document.getElementById('hover-window-controls');
        if (hoverControls) {
            console.log('Removing visible class from hover controls');
            hoverControls.classList.remove('visible');
            hoverControlsVisible = false;
            console.log('Hover controls should now be hidden');
        } else {
            console.error('Hover controls element not found in hideHoverControls');
        }
    }, 150); // Small delay to prevent flickering
}

function updateControlsPosition(e) {
    const hoverControls = document.getElementById('hover-window-controls');
    if (hoverControls) {
        // Position controls near the cursor but slightly offset
        const x = Math.min(e.clientX + 10, window.innerWidth - 120);
        const y = Math.max(e.clientY + 10, 50);
        
        hoverControls.style.left = x + 'px';
        hoverControls.style.top = y + 'px';
        hoverControls.style.right = 'auto';
    }
}


// Event Handlers Setup
function setupEventHandlers() {
    console.log('Setting up event handlers...');
    
    // Setup hover window controls
    setupHoverWindowControls();
    
    // Setup dev tools shortcut (only in Electron)
    if (window.electronAPI) {
        setupDevToolsShortcut();
    }
    
    // Setup offline detection
    setupOfflineDetection();
    
        // Setup window controls
        setupWindowControls();
        
        // Setup keyboard shortcuts
        setupWindowControlShortcuts();

        // Navigation
        const fixesBtn = document.getElementById('fixesBtn');
        const manifestsBtn = document.getElementById('manifestsBtn');
        const toolsBtn = document.getElementById('toolsBtn');
        const softwaresBtn = document.getElementById('softwaresBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const downloadsBtn = document.getElementById('downloadsBtn');
        
        if (fixesBtn) {
            fixesBtn.addEventListener('click', () => {
                showPage('fixes-page');
                displayReleases('fixes');
            });
        }
        if (manifestsBtn) {
            manifestsBtn.addEventListener('click', () => {
                showPage('manifests-page');
                setupManifestPage();
            });
        }
        if (toolsBtn) {
            toolsBtn.addEventListener('click', () => {
                showPage('tools-page');
                displayReleases('tools');
            });
        }
        if (softwaresBtn) {
            softwaresBtn.addEventListener('click', () => {
                showPage('softwares-page');
                displayReleases('softwares');
            });
        }
        
        // Search functionality for all release types
        const searchFixes = document.getElementById('searchFixes');
        const searchTools = document.getElementById('searchTools');
        const searchSoftwares = document.getElementById('searchSoftwares');
        
        if (searchFixes) {
            searchFixes.addEventListener('input', (e) => {
                filterReleases('fixes', e.target.value);
            });
        }
        if (searchTools) {
            searchTools.addEventListener('input', (e) => {
                filterReleases('tools', e.target.value);
            });
        }
        if (searchSoftwares) {
            searchSoftwares.addEventListener('input', (e) => {
                filterReleases('softwares', e.target.value);
            });
        }
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => showPage('settings-page'));
        }
        if (downloadsBtn) {
            downloadsBtn.addEventListener('click', () => showPage('downloads-page'));
        }
        
        // Manifest generation
        const generateManifestBtn = document.getElementById('generate-manifest');
        if (generateManifestBtn) {
            generateManifestBtn.addEventListener('click', generateManifest);
        }

        // Admin
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const loginBtn = document.getElementById('loginBtn');
        
        if (adminLoginBtn) {
            adminLoginBtn.addEventListener('click', () => openModal('adminPassModal'));
        }
        if (loginBtn) {
            loginBtn.addEventListener('click', handleAdminLogin);
        }
        
        // Announcement admin panel
        setupAnnouncementEventHandlers();

        // Discord
        const discordBtn = document.getElementById('discordBtn');
        if (discordBtn) {
            discordBtn.addEventListener('click', () => {
                const savedLink = localStorage.getItem('discordInviteLink') || discordInviteLink;
                window.electronAPI.openExternal(savedLink);
                showToast('Opening Discord server...', 'info');
            });
        }

        // Back buttons
        const backToListBtn = document.getElementById('back-to-list-btn');
        const backFromDownloadsBtn = document.getElementById('back-from-downloads');
        const backFromSettingsBtn = document.getElementById('back-from-settings');
        
        if (backToListBtn) {
            backToListBtn.addEventListener('click', () => {
                // Return to the last active list page
                showPage(lastActiveListPage || 'fixes-page');
            });
        }
        if (backFromDownloadsBtn) {
            backFromDownloadsBtn.addEventListener('click', () => {
                showPage(lastActiveListPage || 'fixes-page');
            });
        }
        if (backFromSettingsBtn) {
            backFromSettingsBtn.addEventListener('click', () => {
                showPage(lastActiveListPage || 'fixes-page');
            });
        }

        // Downloads page controls
        setupDownloadPageControls();
        
        const clearCompletedBtn = document.getElementById('clear-completed-downloads');
        const clearAllBtn = document.getElementById('clear-all-downloads');
        
        if (clearCompletedBtn) {
            clearCompletedBtn.addEventListener('click', () => window.downloadManager.clearCompleted());
        }
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                openModal('clearDownloadsModal');
            });
        }

        // Update release modal
        const saveReleaseBtn = document.getElementById('save-release-update-btn');
        const clearUpdateBtn = document.getElementById('clear-update-form');
        
        if (saveReleaseBtn) {
            saveReleaseBtn.addEventListener('click', updateRelease);
        }
        if (clearUpdateBtn) {
            clearUpdateBtn.addEventListener('click', clearUpdateForm);
        }
        
        // Admin announcement functions
        const publishAnnouncementBtn = document.getElementById('publish-announcement-btn');
        const previewAnnouncementBtn = document.getElementById('preview-announcement-btn');
        
        if (publishAnnouncementBtn) {
            publishAnnouncementBtn.addEventListener('click', publishAnnouncement);
        }
        if (previewAnnouncementBtn) {
            previewAnnouncementBtn.addEventListener('click', previewAnnouncement);
        }
        
        // Admin configuration buttons
        const loadGitHubConfigBtn = document.getElementById('load-github-config');
        const saveGitHubConfigBtn = document.getElementById('save-github-config');
        const testGitHubConnectionBtn = document.getElementById('test-github-connection');
        const saveDiscordConfigBtn = document.getElementById('save-discord-config');
        const saveThemeSettingsBtn = document.getElementById('save-theme-settings');
        
        if (loadGitHubConfigBtn) {
            loadGitHubConfigBtn.addEventListener('click', loadGitHubConfig);
        }
        if (saveGitHubConfigBtn) {
            saveGitHubConfigBtn.addEventListener('click', saveGitHubConfig);
        }
        if (testGitHubConnectionBtn) {
            testGitHubConnectionBtn.addEventListener('click', testGitHubConnection);
        }
        if (saveDiscordConfigBtn) {
            saveDiscordConfigBtn.addEventListener('click', saveDiscordConfig);
        }
        if (saveThemeSettingsBtn) {
            saveThemeSettingsBtn.addEventListener('click', saveThemeSettings);
        }
        
        // Status dashboard buttons
        const refreshStatusBtn = document.getElementById('refresh-status');
        const exportLogsBtn = document.getElementById('export-logs');
        const clearCacheBtn = document.getElementById('clear-cache');
        
        if (refreshStatusBtn) {
            refreshStatusBtn.addEventListener('click', updateAppStatus);
        }
        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', exportAppLogs);
        }
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', clearAppCache);
        }
        
        // Initialize upload manager
        uploadManager.initializeUploadZones();
        
        // Setup activations upload functionality
        setupActivationsUpload();
        
        // Setup sub-components
        setupNavigation();
        setupAdminTabs();
        
        // Setup settings tabs with a small delay to ensure DOM is ready
        setTimeout(() => {
        setupSettingsTabs();
        }, 100);
        
        // Window controls setup moved to HTML script tag
        
        
        // Setup offline detection
        setupOfflineDetection();
        
        // Setup developer tools shortcut with delay to ensure Electron API is loaded
        setTimeout(() => {
            setupDevToolsShortcut();
        }, 1000);

        console.log('Event handlers setup complete');
}

// Setup window controls
function setupWindowControls() {
    console.log('Setting up window controls...');
    
    // Only run in Electron
    if (!window.electronAPI) {
        console.log('Not in Electron - skipping window controls');
        return;
    }
    
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            if (window.electronAPI) {
                window.electronAPI.windowMinimize();
            }
        });
    }
    
    if (maximizeBtn) {
        maximizeBtn.addEventListener('click', () => {
            if (window.electronAPI) {
                window.electronAPI.windowMaximize();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (window.electronAPI) {
                window.electronAPI.windowClose();
            }
        });
    }
    
    console.log('Window controls setup complete');
}

// Theme Setup
function setupThemeHandlers() {
    try {
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', () => {
                const theme = card.dataset.theme;
                if (theme) applyTheme(theme);
            });
        });
        
        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const layout = btn.dataset.layout;
                if (layout) applyLayout(layout);
            });
        });
    } catch (error) {
        console.error('Error setting up theme handlers:', error);
    }
}

// IPC Event Handlers - Updated for new download system
try {
    if (window.electronAPI && window.electronAPI.onDownloadProgress) {
        console.log('Setting up download progress listener...');
        window.electronAPI.onDownloadProgress((data) => {
            try {
                console.log('Download progress received:', data);
                const download = window.downloadManager.activeDownloads.get(data.downloadId);
                if (download) {
                    console.log('Found download for progress update:', download.fileName);
                    download.progress = data.progress;
                    download.receivedBytes = data.receivedBytes;
                    download.totalBytes = data.totalBytes;
                    download.status = 'downloading';
                    
                    // Calculate enhanced progress information
                    if (download.actualStartTime) {
                        const timeElapsed = (Date.now() - download.actualStartTime) / 1000;
                        if (timeElapsed > 0) {
                            download.speed = data.receivedBytes / timeElapsed;
                            download.averageSpeed = download.speed;
                            
                            // Calculate ETA
                            const bytesRemaining = data.totalBytes - data.receivedBytes;
                            download.eta = bytesRemaining / download.speed;
                        }
                    }
                    
                    // Enhanced progress message with speed and ETA
                    const speedText = download.speed ? window.downloadManager.formatBytes(download.speed) + '/s' : 'Calculating...';
                    const etaText = download.eta ? `ETA: ${Math.round(download.eta)}s` : '';
                    const progressText = `Downloading... ${window.downloadManager.formatBytes(data.receivedBytes)}/${window.downloadManager.formatBytes(data.totalBytes)} (${speedText}) ${etaText}`;
                    
                    // Update download animation with enhanced info
                    window.downloadManager.updateDownloadAnimation(
                        data.downloadId,
                        data.progress,
                        progressText
                    );
                    
                    window.downloadManager.updateUI();
                } else {
                    console.log('Download not found in activeDownloads:', data.downloadId);
                }
            } catch (error) {
                console.error('Error handling download progress:', error);
            }
        });

        window.electronAPI.onDownloadComplete(async (data) => {
            try {
                const download = window.downloadManager.activeDownloads.get(data.downloadId);
                if (download) {
                    download.status = 'completed';
                    download.progress = 100;
                    download.endTime = Date.now();
                    download.destination = data.filePath;
                    
                    // Calculate download statistics
                    const downloadTime = (download.endTime - download.startTime) / 1000;
                    download.downloadTime = downloadTime;
                    download.averageSpeed = download.totalBytes / downloadTime;
                    
                    // Update global stats
                    window.downloadManager.downloadStats.totalDownloads++;
                    window.downloadManager.downloadStats.successfulDownloads++;
                    window.downloadManager.downloadStats.totalBytesDownloaded += download.totalBytes;
                    window.downloadManager.downloadStats.averageSpeed = 
                        (window.downloadManager.downloadStats.averageSpeed + download.averageSpeed) / 2;
                    
                    // Move to completed downloads
                    window.downloadManager.completedDownloads.set(data.downloadId, download);
                    
                    // Update animation to completed state
                    window.downloadManager.updateDownloadAnimation(data.downloadId, 100, 'Download completed!');
                    
                    // Remove animation after 3 seconds
                    setTimeout(() => {
                        window.downloadManager.removeDownloadAnimation(data.downloadId);
                    }, 3000);
                    
                    window.downloadManager.updateHistory(download);
                    window.downloadManager.activeDownloads.delete(data.downloadId);
                    window.downloadManager.saveState();
                    window.downloadManager.updateUI();
                    
                    // Show enhanced completion notification
                    if (window.downloadManager.downloadSettings.showNotifications) {
                        const speedText = window.downloadManager.formatBytes(download.averageSpeed) + '/s';
                        showToast(`✅ ${data.fileName} completed (${speedText})`, 'success');
                    }
                    
                    // Auto-open folder if setting is enabled
                    if (window.downloadManager.downloadSettings.autoOpenFolder && window.electronAPI?.openPath) {
                        setTimeout(() => {
                            window.electronAPI.openPath(path.dirname(data.filePath));
                        }, 2000);
                    }
                }
            } catch (error) {
                console.error('Error handling download completion:', error);
            }
        });

        window.electronAPI.onDownloadError(async (data) => {
            try {
                const download = window.downloadManager.activeDownloads.get(data.downloadId);
                if (download) {
                    window.downloadManager.updateDownloadAnimation(data.downloadId, 0, 'Download failed!');
                    window.downloadManager.handleError(download, new Error(data.error));
                }
            } catch (error) {
                console.error('Error handling download error:', error);
            }
        });

        window.electronAPI.onShowDirectorySelector((data) => {
            try {
                showDirectorySelector(data.downloadId, data.fileName);
            } catch (error) {
                console.error('Error showing directory selector:', error);
            }
        });

        window.electronAPI.onShowCompletionDirectorySelector((data) => {
            try {
                showCompletionDirectorySelector(data.downloadId, data.fileName, data.filePath);
            } catch (error) {
                console.error('Error showing completion directory selector:', error);
            }
        });
        
        // Handle update download progress
        if (window.electronAPI.onUpdateDownloadProgress) {
            window.electronAPI.onUpdateDownloadProgress((data) => {
                try {
                    console.log('Update download progress:', data);
                    // You can add UI updates here for update progress
                    showToast(`Downloading update: ${data.progress}%`, 'info');
                } catch (error) {
                    console.error('Error handling update download progress:', error);
                }
            });
        }
    }
} catch (error) {
    console.warn('Electron API not available, using browser-only download system');
}

// Directory Selector Functions
let currentDirectorySelection = null;

function showDirectorySelector(downloadId, fileName) {
    try {
        console.log('Opening directory selector for:', fileName);
        currentDirectorySelection = { downloadId, fileName };
        
        // Set the filename
        const filenameEl = document.getElementById('directory-selector-filename');
        if (filenameEl) {
            filenameEl.textContent = fileName;
        } else {
            console.warn('directory-selector-filename element not found');
        }
        
        // Set saved path if available
        const savedPath = localStorage.getItem('defaultDownloadPath');
        const pathDisplayEl = document.getElementById('selected-path-display');
        if (pathDisplayEl) {
            pathDisplayEl.textContent = savedPath || 'No path selected';
        } else {
            console.warn('selected-path-display element not found');
        }
        
        // Check if modal exists
        const modal = document.getElementById('directorySelector');
        if (!modal) {
            console.error('directorySelector modal not found in DOM');
            showToast('Directory selector modal not found', 'error');
            return;
        }
        
        console.log('Opening modal...');
        openModal('directorySelector');
        
        // Force visibility as fallback
        setTimeout(() => {
            const modal = document.getElementById('directorySelector');
            if (modal && !modal.classList.contains('active')) {
                console.log('Modal not active, forcing display...');
                modal.style.display = 'grid';
                modal.classList.add('active');
            }
        }, 100);
        
    } catch (error) {
        console.error('Error showing directory selector:', error);
        showToast('Error opening directory selector: ' + error.message, 'error');
    }
}

function showCompletionDirectorySelector(downloadId, fileName, filePath) {
    try {
        console.log('Opening completion directory selector for:', fileName);
        currentDirectorySelection = { downloadId, fileName, filePath, isCompletion: true };
        
        // Set the filename
        const filenameEl = document.getElementById('directory-selector-filename');
        if (filenameEl) {
            filenameEl.textContent = fileName;
        } else {
            console.warn('directory-selector-filename element not found');
        }
        
        // Set current file path as default
        const pathDisplayEl = document.getElementById('selected-path-display');
        if (pathDisplayEl && filePath) {
            const directoryPath = filePath.substring(0, filePath.lastIndexOf('\\') || filePath.lastIndexOf('/'));
            pathDisplayEl.textContent = directoryPath;
        }
        
        // Update modal title for completion
        const modalTitle = document.querySelector('#directorySelector h3');
        if (modalTitle) {
            modalTitle.textContent = '🎉 Download Complete - Select Destination';
        }
        
        // Check if modal exists
        const modal = document.getElementById('directorySelector');
        if (!modal) {
            console.error('directorySelector modal not found in DOM');
            showToast('Directory selector modal not found', 'error');
            return;
        }
        
        console.log('Opening completion directory selector modal...');
        openModal('directorySelector');
        
        console.log('Completion directory selector opened successfully');
    } catch (error) {
        console.error('Error showing completion directory selector:', error);
        showToast('Failed to show completion directory selector', 'error');
    }
}

function selectQuickPath(pathType) {
    try {
        let path = '';
        switch(pathType) {
            case 'downloads':
                if (window.electronAPI && window.electronAPI.getPath) {
                    path = window.electronAPI.getPath('downloads');
                } else {
                    // Fallback for browser or when Electron API is not available
                    path = `${navigator.platform.includes('Win') ? 'C:\\Users\\' + (process.env.USERNAME || 'User') + '\\Downloads' : '/Downloads'}`;
                }
                break;
            case 'desktop':
                if (window.electronAPI && window.electronAPI.getPath) {
                    path = window.electronAPI.getPath('desktop');
                } else {
                    path = `${navigator.platform.includes('Win') ? 'C:\\Users\\' + (process.env.USERNAME || 'User') + '\\Desktop' : '/Desktop'}`;
                }
                break;
            case 'documents':
                if (window.electronAPI && window.electronAPI.getPath) {
                    path = window.electronAPI.getPath('documents');
                } else {
                    path = `${navigator.platform.includes('Win') ? 'C:\\Users\\' + (process.env.USERNAME || 'User') + '\\Documents' : '/Documents'}`;
                }
                break;
        }
        
        if (path) {
            const pathDisplayEl = document.getElementById('selected-path-display');
            if (pathDisplayEl) {
                pathDisplayEl.textContent = path;
            }
            showToast(`Selected: ${pathType} folder`, 'info');
        } else {
            showToast(`Failed to get ${pathType} path`, 'error');
        }
    } catch (error) {
        console.error('Error selecting quick path:', error);
        showToast('Error selecting path: ' + error.message, 'error');
    }
}

async function selectCustomDirectory() {
    try {
        if (window.electronAPI && window.electronAPI.selectDirectory) {
            const result = await window.electronAPI.selectDirectory();
            if (result) {
                const pathDisplayEl = document.getElementById('selected-path-display');
                if (pathDisplayEl) {
                    pathDisplayEl.textContent = result;
                }
                showToast('Custom directory selected', 'success');
            }
        } else {
            // Fallback for browser environment
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Enter the directory path manually...';
            input.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                padding: 12px;
                border: 1px solid var(--stroke);
                border-radius: 8px;
                background: var(--card-bg);
                color: var(--text);
                width: 400px;
                font-family: monospace;
            `;
            
            document.body.appendChild(input);
            input.focus();
            
            const handleInput = (e) => {
                if (e.key === 'Enter') {
                    const path = input.value.trim();
                    if (path) {
                        const pathDisplayEl = document.getElementById('selected-path-display');
                        if (pathDisplayEl) {
                            pathDisplayEl.textContent = path;
                        }
                        showToast('Custom directory path set', 'success');
                    }
                    input.remove();
                } else if (e.key === 'Escape') {
                    input.remove();
                }
            };
            
            input.addEventListener('keydown', handleInput);
            input.addEventListener('blur', () => input.remove());
        }
    } catch (error) {
        console.error('Error selecting custom directory:', error);
        showToast('Failed to select directory: ' + error.message, 'error');
    }
}

function confirmDirectorySelection() {
    try {
        console.log('Confirming directory selection...');
        if (!currentDirectorySelection) {
            console.error('No current directory selection');
            showToast('No download selection found', 'error');
            return;
        }
        
        const pathDisplayEl = document.getElementById('selected-path-display');
        const rememberPathEl = document.getElementById('remember-path');
        
        const selectedPath = pathDisplayEl ? pathDisplayEl.textContent : '';
        const rememberPath = rememberPathEl ? rememberPathEl.checked : false;
        
        console.log('Selected path:', selectedPath);
        console.log('Remember path:', rememberPath);
        
        if (!selectedPath || selectedPath === 'No path selected') {
            showToast('Please select a directory first', 'warning');
            return;
        }
        
        // Send result to Electron if available
        if (window.electronAPI && window.electronAPI.send) {
            window.electronAPI.send('directory-selector-result', {
                downloadId: currentDirectorySelection.downloadId,
                path: selectedPath,
                remember: rememberPath
            });
        } else {
            // Browser fallback - directly start download with selected path
            console.log('Electron API not available, using browser fallback');
            window.downloadManager.continueDownloadWithPath(
                currentDirectorySelection.downloadId,
                selectedPath
            );
        }
        
        if (rememberPath) {
            localStorage.setItem('defaultDownloadPath', selectedPath);
            if (typeof rememberedDownloadPath !== 'undefined') {
                rememberedDownloadPath = selectedPath;
            }
        }
        
        showToast(`Download starting to: ${selectedPath}`, 'success');
        closeModal('directorySelector');
        currentDirectorySelection = null;
        
    } catch (error) {
        console.error('Error confirming directory selection:', error);
        showToast('Error confirming directory selection: ' + error.message, 'error');
    }
}

function cancelDirectorySelection() {
    try {
        if (currentDirectorySelection) {
            window.electronAPI.send('directory-selector-result', {
                downloadId: currentDirectorySelection.downloadId,
                cancelled: true
            });
        }
        
        closeModal('directorySelector');
        currentDirectorySelection = null;
    } catch (error) {
        console.error('Error cancelling directory selection:', error);
    }
}

// Installed Games Scanner and UI
function normalizeGameTitle(name) {
    try {
        if (!name) return '';
        const lower = ('' + name).toLowerCase();
        const expanded = expandAbbreviations(lower);
        return expanded
            .replace(/\b(remastered|remaster|remake|definitive|ultimate|game of the year|goty|edition)\b/g, ' ')
            .replace(/\b(the|and|of|for|to|a|an|on|in)\b/g, ' ')
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    } catch (_) { return ('' + name).toLowerCase(); }
}

function getInitials(text) {
    try {
        const words = normalizeGameTitle(text).split(' ').filter(Boolean);
        return words.map(w => w[0]).join('');
    } catch (_) { return ''; }
}

function initialsScore(a, b) {
    const na = normalizeGameTitle(a);
    const nb = normalizeGameTitle(b);
    const ia = getInitials(na);
    const ib = getInitials(nb);
    if (!ia || !ib) return 0;
    if (na === ib || nb === ia) return 1; // query equals initials of candidate or vice versa
    if (ia === ib) return 0.98; // same initials
    if (ia.startsWith(ib) || ib.startsWith(ia)) return 0.95; // prefix match on initials
    return 0;
}

function expandAbbreviations(text) {
    const dict = [
        // Popular shorthand → canonical names
        ['cod', 'call of duty'],
        ['mw', 'modern warfare'],
        ['bo', 'black ops'],
        ['gta', 'grand theft auto'],
        ['gtav', 'grand theft auto v'],
        ['gta v', 'grand theft auto v'],
        ['rdr', 'red dead redemption'],
        ['rdr2', 'red dead redemption 2'],
        ['ac', 'assassin s creed'],
        ['ac odyssey', 'assassin s creed odyssey'],
        ['ac origins', 'assassin s creed origins'],
        ['ac valhalla', 'assassin s creed valhalla'],
        ['nfs', 'need for speed'],
        ['fc', 'far cry'],
        ['fc5', 'far cry 5'],
        ['fc6', 'far cry 6'],
        ['ds', 'dark souls'],
        ['ds3', 'dark souls 3'],
        ['fh', 'forza horizon'],
        ['fh4', 'forza horizon 4'],
        ['fh5', 'forza horizon 5'],
        ['bf', 'battlefield'],
        ['bf1', 'battlefield 1'],
        ['bfv', 'battlefield v'],
        ['ow', 'overwatch'],
        ['re', 'resident evil'],
        ['re2', 'resident evil 2'],
        ['re3', 'resident evil 3'],
        ['re4', 'resident evil 4'],
        ['mk', 'mortal kombat'],
        ['mk11', 'mortal kombat 11'],
        ['sf', 'street fighter'],
        ['sfv', 'street fighter v'],
        ['hl', 'half life'],
        ['hl2', 'half life 2'],
        ['wd', 'watch dogs'],
        ['wd2', 'watch dogs 2']
    ];
    let out = text;
    // 1) Token matches
    for (const [abbr, full] of dict) {
        const re = new RegExp(`(^|\b)${abbr}(\b|$)`, 'g');
        out = out.replace(re, `$1${full}$2`);
    }
    // 2) Fused forms like 'codmw', 'gtav'
    for (const [abbr, full] of dict) {
        const fused = new RegExp(`${abbr}(?=[a-z0-9])`, 'g');
        out = out.replace(fused, `${full} `);
    }
    // 3) Suffix digits (bo3 -> black ops 3, re4 -> resident evil 4)
    const suffixRules = [
        { base: 'bo', full: 'black ops' },
        { base: 're', full: 'resident evil' },
        { base: 'fh', full: 'forza horizon' },
        { base: 'fc', full: 'far cry' },
        { base: 'ds', full: 'dark souls' },
        { base: 'mk', full: 'mortal kombat' },
        { base: 'bf', full: 'battlefield' },
        { base: 'ac', full: 'assassin s creed' }
    ];
    for (const r of suffixRules) {
        out = out.replace(new RegExp(`(^|\\b)${r.base}(\\d)(\\b|$)`, 'g'), `$1${r.full} $2$3`);
        out = out.replace(new RegExp(`${r.base}(\\d)`, 'g'), `${r.full} $1`);
    }
    // 4) Normalize MW to COD family
    out = out.replace(/modern warfare/g, 'call of duty modern warfare');
    return out;
}

function convertRomanNumerals(text) {
    const map = { 'ii':'2','iii':'3','iv':'4','v':'5','vi':'6','vii':'7','viii':'8','ix':'9','x':'10' };
    let out = text;
    for (const [r, n] of Object.entries(map)) {
        const re = new RegExp(`(^|\\b)${r}(\\b|$)`, 'g');
        out = out.replace(re, `$1${n}$2`);
    }
    return out;
}

function levenshteinRatio(a, b) {
    a = normalizeGameTitle(a);
    b = normalizeGameTitle(b);
    const m = a.length, n = b.length;
    if (!m && !n) return 1;
    if (!m || !n) return 0;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + cost
            );
        }
    }
    const dist = dp[m][n];
    const maxLen = Math.max(m, n);
    return 1 - dist / maxLen;
}

function tokenOverlapRatio(a, b) {
    const ta = new Set(normalizeGameTitle(a).split(' ').filter(Boolean));
    const tb = new Set(normalizeGameTitle(b).split(' ').filter(Boolean));
    if (ta.size === 0 || tb.size === 0) return 0;
    let inter = 0;
    for (const t of ta) if (tb.has(t)) inter++;
    const union = new Set([...ta, ...tb]).size;
    return inter / union;
}

function fuzzySimilarity(a, b) {
    // Prioritize initials comparisons first, then token overlap, containment, Levenshtein
    const na = normalizeGameTitle(a);
    const nb = normalizeGameTitle(b);
    const ri = initialsScore(na, nb);
    if (ri >= 0.93) return ri;
    const r1 = tokenOverlapRatio(na, nb);
    const contain = (na && nb) && (na.includes(nb) || nb.includes(na)) ? 1 : 0;
    const r2 = levenshteinRatio(na, nb);
    return Math.max(ri, r1, contain, r2);
}

// App Status Dashboard
function updateAppStatus() {
    try {
        // Memory usage
        if (performance.memory) {
            const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            document.getElementById('memory-usage').textContent = memoryMB + ' MB';
        }
        
        // App uptime
        const uptime = Date.now() - window.appStartTime;
        const hours = Math.floor(uptime / 3600000);
        const minutes = Math.floor((uptime % 3600000) / 60000);
        document.getElementById('app-uptime').textContent = `${hours}h ${minutes}m`;
        
        // Download status
        if (window.downloadManager) {
            const activeCount = window.downloadManager.activeDownloads.size;
            document.getElementById('active-downloads').textContent = activeCount;
            
            // Count completed today
            const today = new Date().toDateString();
            const completedToday = window.downloadManager.downloadHistory.filter(d => 
                d.status === 'completed' && new Date(d.endTime).toDateString() === today
            ).length;
            document.getElementById('completed-today').textContent = completedToday;
            
            // Count failed downloads
            const failedCount = window.downloadManager.downloadHistory.filter(d => 
                d.status === 'failed'
            ).length;
            document.getElementById('failed-downloads').textContent = failedCount;
        }
        
        // Game detection status
        const lastScan = localStorage.getItem('lastGameScan');
        if (lastScan) {
            const scanDate = new Date(parseInt(lastScan));
            document.getElementById('last-scan').textContent = scanDate.toLocaleString();
        }
        
        // Performance status
        if (performance.memory && performance.memory.usedJSHeapSize > 100 * 1024 * 1024) {
            document.getElementById('performance-status').textContent = 'High Memory';
            document.getElementById('performance-status').style.color = '#ff6b6b';
        } else {
            document.getElementById('performance-status').textContent = 'Good';
            document.getElementById('performance-status').style.color = '#4caf50';
        }
        
    } catch (error) {
        console.error('Error updating app status:', error);
    }
}

// Export app logs
function exportAppLogs() {
    try {
        const logs = {
            timestamp: new Date().toISOString(),
            appVersion: appVersion,
            userAgent: navigator.userAgent,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            downloadHistory: window.downloadManager ? window.downloadManager.downloadHistory : [],
            activeDownloads: window.downloadManager ? Array.from(window.downloadManager.activeDownloads.values()) : [],
            localStorage: Object.keys(localStorage).reduce((obj, key) => {
                obj[key] = localStorage.getItem(key);
                return obj;
            }, {}),
            errors: window.appErrors || []
        };
        
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crack-world-logs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('Logs exported successfully', 'success');
    } catch (error) {
        console.error('Error exporting logs:', error);
        showToast('Failed to export logs', 'error');
    }
}

// Clear app cache
function clearAppCache() {
    try {
        // Clear localStorage (except important settings)
        const importantKeys = ['siteTheme', 'siteLayout', 'rememberedDownloadPath'];
        const keysToRemove = Object.keys(localStorage).filter(key => !importantKeys.includes(key));
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear download history
        if (window.downloadManager) {
            window.downloadManager.downloadHistory = [];
            window.downloadManager.saveDownloadHistory();
        }
        
        // Clear any cached data
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => caches.delete(name));
            });
        }
        
        showToast('Cache cleared successfully', 'success');
        updateAppStatus();
    } catch (error) {
        console.error('Error clearing cache:', error);
        showToast('Failed to clear cache', 'error');
    }
}

// Initialize App
async function initializeApp() {
    console.log('Initializing Crack World App...');
    window.appStartTime = Date.now();
    
    try {
        // Load admin credentials from GitHub
        try {
            const credUrl = 'https://raw.githubusercontent.com/ABAID-CODER/crackworld-manifest/main/admin_credentials.json';
            const res = await fetch(credUrl, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data?.admins)) {
                    adminCredentials = data.admins.map(a => ({ username: a.username, password: a.password }));
                }
            } else {
                console.warn('Failed to load admin credentials:', res.status);
            }
        } catch (e) {
            console.warn('Admin credentials fetch error:', e);
        }

        // Add comprehensive global error handlers
        window.addEventListener('error', (event) => {
            console.error('Global error caught:', event.error);
            try {
                // Attempt to show user-friendly error message
                const errorMessage = event.error?.message || 'Unknown error occurred';
                showToast('An error occurred: ' + errorMessage, 'error');
                
                // Log error to console for debugging
                console.error('Error details:', {
                    message: event.error?.message,
                    stack: event.error?.stack,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            } catch (toastError) {
                console.error('Could not show error toast:', toastError);
            }
            
            // Prevent default error handling to avoid browser error popups
            event.preventDefault();
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            try {
                const errorMessage = event.reason?.message || event.reason || 'Promise rejection occurred';
                showToast('An error occurred: ' + errorMessage, 'error');
            } catch (toastError) {
                console.error('Could not show error toast:', toastError);
            }
            
            // Prevent unhandled rejection from being logged to console
            event.preventDefault();
        });
        
        // Add performance monitoring
        let performanceWarningShown = false;
        setInterval(() => {
            try {
                // Check for memory usage (if available)
                if (performance.memory && performance.memory.usedJSHeapSize > 150 * 1024 * 1024 && !performanceWarningShown) {
                    console.warn('High memory usage detected:', Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB');
                    performanceWarningShown = true;
                }
                
                // Check for stuck downloads (downloads running longer than 30 minutes)
                const now = Date.now();
                window.downloadManager.activeDownloads.forEach(download => {
                    if (download.status === 'downloading' && download.actualStartTime) {
                        const runningTime = now - download.actualStartTime;
                        if (runningTime > 30 * 60 * 1000) { // 30 minutes
                            console.warn('Long-running download detected:', download.fileName);
                        }
                    }
                });
            } catch (monitorError) {
                console.error('Performance monitoring error:', monitorError);
            }
        }, 30000); // Check every 30 seconds
        
        // Apply saved theme and layout
        applyTheme(currentTheme);
        applyLayout(currentLayout);
        
        // Setup event handlers after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setupEventHandlers();
                setupThemeHandlers();
            });
        } else {
            setupEventHandlers();
            setupThemeHandlers();
        }
        
        // Load configuration
        await loadAppConfiguration();
        
        // Load initial releases
        displayReleases('fixes');
        
        // Update downloads UI
        updateDownloadsPage();
        
        // Load initial settings content
        setTimeout(() => {
            try {
                loadAnnouncements();
                loadSavedConfigurations();
                // Auto-load GitHub configuration
                loadAppConfiguration();
                
                // Update app version in about section
                updateAppVersion();
                
                // Setup GitHub link
                setupGitHubLink();
                
                // Clear upload forms initially
                if (window.uploadManager) {
                    ['fixes', 'tools', 'software', 'activations'].forEach(type => {
                        try {
                            window.uploadManager.clearForm(type);
                        } catch (error) {
                            console.warn('Failed to clear form for type:', type, error);
                        }
                    });
                }
                try {
                    clearUpdateForm();
                } catch (error) {
                    console.warn('Failed to clear update form:', error);
                }
            } catch (error) {
                console.error('Error in delayed initialization:', error);
            }
        }, 1000);
        
        // Load app version (only in Electron)
        try {
            if (window.electronAPI && window.electronAPI.getAppVersion) {
                const version = await window.electronAPI.getAppVersion();
                appVersion = version;
                const versionEl = document.getElementById('app-version');
                if (versionEl) versionEl.textContent = version;
                console.log('App version loaded:', version);
            } else {
                // Set default version for browser
                appVersion = '2.1.1';
                const versionEl = document.getElementById('app-version');
                if (versionEl) versionEl.textContent = appVersion;
                console.log('Using default version for browser:', appVersion);
            }
        } catch (error) {
            console.error('Failed to load app version:', error);
            // Set default version
            appVersion = '2.1.1';
            const versionEl = document.getElementById('app-version');
            if (versionEl) versionEl.textContent = appVersion;
        }
        
        // Start automatic update checking (only in Electron)
        if (window.electronAPI) {
            // Check for updates on startup (after 3 seconds)
            setTimeout(() => checkForUpdates(false), 3000);
            
            // Set up periodic checking (every 2 hours)
            updateCheckInterval = setInterval(() => checkForUpdates(false), 2 * 60 * 60 * 1000);
            
            console.log('Automatic update checking enabled - will check in 3 seconds');
        } else {
            console.log('Not in Electron - update checking disabled');
        }
        
        console.log('App initialized successfully');
        
    } catch (error) {
        console.error('Error initializing app:', error);
        showToast('Failed to initialize app: ' + error.message, 'error');
    }
}

// Upload System Implementation
class UploadManager {
    constructor() {
        this.selectedFiles = new Map();
        this.maxFileSizes = {
            fixes: 500 * 1024 * 1024, // 500MB
            tools: 500 * 1024 * 1024, // 500MB
            software: 1024 * 1024 * 1024 // 1GB
        };
        this.allowedTypes = {
            fixes: null,
            tools: null,
            software: null
        };
    }
    
    initializeUploadZones() {
        try {
            ['fixes', 'tools', 'software'].forEach(type => {
                this.setupUploadZone(type);
                this.setupFormValidation(type);
                this.setupEventHandlers(type);
            });
            console.log('Upload zones initialized successfully');
        } catch (error) {
            console.error('Error initializing upload zones:', error);
        }
    }
    
    setupUploadZone(type) {
        const uploadZone = document.getElementById(`${type}-upload-zone`);
        const fileInput = document.getElementById(`${type}-file-input`);
        
        if (!uploadZone || !fileInput) return;
        
        // Click to select files
        uploadZone.addEventListener('click', () => fileInput.click());
        
        // Drag and drop events
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });
        
        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');
            this.handleFiles(type, e.dataTransfer.files);
        });
        
        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(type, e.target.files);
        });
    }
    
    handleFiles(type, files) {
        try {
            const validFiles = [];
            const maxSize = this.maxFileSizes[type];
            const allowedTypes = this.allowedTypes[type];
            
            Array.from(files).forEach(file => {
                // Accept all file types (no extension filtering)
                
                if (file.size > maxSize) {
                    showToast(`File too large: ${file.name} (max ${this.formatFileSize(maxSize)})`, 'error');
                    return;
                }
                
                validFiles.push(file);
            });
            
            if (validFiles.length > 0) {
                this.addFilesToList(type, validFiles);
                this.validateForm(type);
                showToast(`Added ${validFiles.length} file(s)`, 'success');
            }
        } catch (error) {
            console.error('Error handling files:', error);
            showToast('Error processing files', 'error');
        }
    }
    
    addFilesToList(type, files) {
        const fileList = document.getElementById(`${type}-file-list`);
        if (!fileList) return;
        
        if (!this.selectedFiles.has(type)) {
            this.selectedFiles.set(type, []);
        }
        
        const currentFiles = this.selectedFiles.get(type);
        
        files.forEach(file => {
            const fileId = Date.now() + Math.random();
            const fileData = { id: fileId, file: file };
            currentFiles.push(fileData);
            
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <div class="file-icon">${this.getFileIcon(file.name)}</div>
                    <div class="file-details">
                        <h4>${file.name}</h4>
                        <p>${this.formatFileSize(file.size)} • ${file.type || 'Unknown type'}</p>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="file-remove-btn" onclick="uploadManager.removeFile('${type}', ${fileId})">
                        Remove
                    </button>
                </div>
            `;
            
            fileList.appendChild(fileItem);
        });
    }
    
    removeFile(type, fileId) {
        try {
            const currentFiles = this.selectedFiles.get(type) || [];
            const updatedFiles = currentFiles.filter(f => f.id !== fileId);
            this.selectedFiles.set(type, updatedFiles);
            
            // Remove from UI
            const fileList = document.getElementById(`${type}-file-list`);
            if (fileList) {
                const fileItems = fileList.querySelectorAll('.file-item');
                fileItems.forEach(item => {
                    const removeBtn = item.querySelector('.file-remove-btn');
                    if (removeBtn && removeBtn.onclick.toString().includes(fileId)) {
                        item.remove();
                    }
                });
            }
            
            this.validateForm(type);
            showToast('File removed', 'info');
        } catch (error) {
            console.error('Error removing file:', error);
        }
    }
    
    setupFormValidation(type) {
        const tokenInput = document.getElementById(`${type}-github-token`);
        const repoInput = document.getElementById(`${type}-owner-repo`);
        const titleInput = document.getElementById(`${type}-release-title`);
        const tagInput = document.getElementById(`${type}-release-tag`);
        const descInput = document.getElementById(`${type}-release-description`);
        
        [tokenInput, repoInput, titleInput, tagInput, descInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => this.validateForm(type));
            }
        });
    }
    
    validateForm(type) {
        try {
            const tokenInput = document.getElementById(`${type}-github-token`);
            const repoInput = document.getElementById(`${type}-owner-repo`);
            const titleInput = document.getElementById(`${type}-release-title`);
            const tagInput = document.getElementById(`${type}-release-tag`);
            const descInput = document.getElementById(`${type}-release-description`);
            const uploadBtn = document.getElementById(`upload-${type}-btn`);
            
            if (!uploadBtn) return false;
            
            const hasToken = tokenInput && tokenInput.value.trim().length > 0;
            const hasRepo = repoInput && repoInput.value.trim().length > 0 && repoInput.value.includes('/');
            const hasTitle = titleInput && titleInput.value.trim().length > 0;
            const hasTag = tagInput && tagInput.value.trim().length > 0;
            const hasDescription = descInput && descInput.value.trim().length > 0;
            const hasFiles = (this.selectedFiles.get(type) || []).length > 0;
            
            const isValid = hasToken && hasRepo && hasTitle && hasTag && hasDescription && hasFiles;
            uploadBtn.disabled = !isValid;
            
            if (isValid) {
                uploadBtn.style.opacity = '1';
                uploadBtn.style.cursor = 'pointer';
            } else {
                uploadBtn.style.opacity = '0.5';
                uploadBtn.style.cursor = 'not-allowed';
            }
            
            return isValid;
        } catch (error) {
            console.error('Error validating form:', error);
            return false;
        }
    }
    
    setupEventHandlers(type) {
        try {
            // Upload button
            const uploadBtn = document.getElementById(`upload-${type}-btn`);
            if (uploadBtn) {
                uploadBtn.addEventListener('click', () => this.startUpload(type));
            }
            
            // Clear form button
            const clearBtn = document.getElementById(`clear-${type}-form`);
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearForm(type));
            }
        } catch (error) {
            console.error('Error setting up event handlers:', error);
        }
    }
    
    async startUpload(type) {
        try {
            let tokenInput, repoInput, tagInput, descInput, prereleaseInput, draftInput, titleInput;
            let releaseData = {};
            
            // Special handling for activations - use correct field IDs
            if (type === 'activations') {
                console.log('Setting up activations upload with correct field IDs...');
                tokenInput = document.getElementById('activations-token');
                repoInput = document.getElementById('activations-repo');
                titleInput = document.getElementById('activations-title');
                const bannerImageInput = document.getElementById('activations-banner-image');
                
                console.log('Activations fields found:', {
                    token: !!tokenInput,
                    repo: !!repoInput,
                    title: !!titleInput,
                    banner: !!bannerImageInput
                });
                
                console.log('Activations field values:', {
                    token: tokenInput ? tokenInput.value : 'null',
                    repo: repoInput ? repoInput.value : 'null',
                    title: titleInput ? titleInput.value : 'null',
                    banner: bannerImageInput ? bannerImageInput.value : 'null'
                });
                
                if (!titleInput || !titleInput.value.trim()) {
                    showToast('Title is required for activations', 'warning');
                    return;
                }
                
                const title = titleInput.value.trim();
                const bannerImage = bannerImageInput ? bannerImageInput.value.trim() : '';
                
                // Create JSON data for the activation
                const activationData = {
                    title: title,
                    bannerImage: bannerImage,
                    description: "Offline Activations are currently available only through our Discord server. Please visit our Discord server to get your offline activation.",
                    discordMessage: "Offline Activations are currently available only through our Discord server. Please visit our Discord server to get your offline activation.",
                    discordUrl: "https://discord.com/channels/1311229995787747339/1418663020023910400",
                    createdAt: new Date().toISOString(),
                    type: "activation"
                };
                
                // Create a JSON file
                const jsonContent = JSON.stringify(activationData, null, 2);
                const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
                const jsonFile = new File([jsonBlob], `${title}.json`, { type: 'application/json' });
                
                releaseData = {
                    title: title,
                    tag: `${title}-activation`,
                    description: `Activation: ${title}`,
                    prerelease: false,
                    draft: false,
                    files: [jsonFile],
                    token: tokenInput ? tokenInput.value.trim() : '',
                    repository: repoInput ? repoInput.value.trim() : '',
                    type: type
                };
            } else {
                // Standard handling for other types
                tokenInput = document.getElementById(`${type}-github-token`);
                repoInput = document.getElementById(`${type}-owner-repo`);
                tagInput = document.getElementById(`${type}-release-tag`);
                descInput = document.getElementById(`${type}-release-description`);
                prereleaseInput = document.getElementById(`${type}-prerelease`);
                draftInput = document.getElementById(`${type}-draft`);
                titleInput = document.getElementById(`${type}-release-title`);
                const bannerUrlInput = document.getElementById(`${type}-banner-url`);
                
                let description = descInput ? descInput.value.trim() : '';
                
                // Add banner URL to description if provided
                if (bannerUrlInput && bannerUrlInput.value.trim()) {
                    description += `\n\n🖼️ Banner: ${bannerUrlInput.value.trim()}`;
                }
                
                releaseData = {
                    title: titleInput ? titleInput.value.trim() : '',
                    tag: tagInput ? tagInput.value.trim() : '',
                    description: description,
                    prerelease: prereleaseInput ? prereleaseInput.checked : false,
                    draft: draftInput ? draftInput.checked : false,
                    files: this.selectedFiles.get(type) || [],
                    token: tokenInput ? tokenInput.value.trim() : '',
                    repository: repoInput ? repoInput.value.trim() : '',
                    type: type
                };
            }
            
            // Validation for activations
            if (type === 'activations') {
                console.log('Validating activations fields...');
                console.log('Token input:', tokenInput);
                console.log('Token value:', tokenInput ? tokenInput.value : 'null');
                console.log('Token trimmed:', tokenInput ? tokenInput.value.trim() : 'null');
            
            if (!tokenInput || !tokenInput.value.trim()) {
                    console.log('Token validation failed');
                showToast('GitHub token is required', 'warning');
                return;
            }
                
                console.log('Repository input:', repoInput);
                console.log('Repository value:', repoInput ? repoInput.value : 'null');
                console.log('Repository trimmed:', repoInput ? repoInput.value.trim() : 'null');
                console.log('Repository contains slash:', repoInput ? repoInput.value.includes('/') : 'null');
            
            if (!repoInput || !repoInput.value.trim() || !repoInput.value.includes('/')) {
                    console.log('Repository validation failed');
                showToast('Repository owner/repo is required (format: owner/repository)', 'warning');
                return;
            }
            
                console.log('Title value:', releaseData.title);
                if (!releaseData.title.trim()) {
                    console.log('Title validation failed');
                    showToast('Title is required', 'warning');
                    return;
                }
            } else {
                // Validation for other types
                if (!tokenInput || !tokenInput.value.trim()) {
                    showToast('GitHub token is required', 'warning');
                    return;
                }
                
                if (!repoInput || !repoInput.value.trim() || !repoInput.value.includes('/')) {
                    showToast('Repository owner/repo is required (format: owner/repository)', 'warning');
                    return;
                }
                
                if (!releaseData.title.trim()) {
                    showToast('Title is required', 'warning');
                    return;
                }
                
                if (!releaseData.tag.trim()) {
                    showToast('Release tag is required', 'warning');
                    return;
                }
                
                if (!releaseData.description.trim()) {
                    showToast('Description is required', 'warning');
                    return;
                }
            }
            
            await this.performUpload(type, releaseData);
        } catch (error) {
            console.error('Error starting upload:', error);
            showToast('Upload failed: ' + error.message, 'error');
        }
    }
    
    async performUpload(type, releaseData) {
        try {
            // Show progress
            this.showUploadProgress(type);
            this.updateUploadProgress(type, 10, 'Preparing upload...');
            
        const [owner, repo] = releaseData.repository.split('/');
            let result;
            
            if (type === 'activations') {
                // For activations, commit files to repository instead of creating release
                this.updateUploadProgress(type, 20, 'Committing files to repository...');
                
                result = await commitFilesToRepository({
                    token: releaseData.token,
                    owner: owner,
                    repo: repo,
                    title: releaseData.title,
                    description: releaseData.description,
                    files: releaseData.files && releaseData.files.length > 0 ? releaseData.files.map(f => f.file) : [],
                    onProgress: (progress, status) => {
                        this.updateUploadProgress(type, progress, status);
                    }
                });
            } else {
                // For other types, create GitHub release
                this.updateUploadProgress(type, 20, 'Creating release...');
                
                result = await createGitHubRelease({
            token: releaseData.token,
            owner: owner,
            repo: repo,
            title: releaseData.title,
            tag: releaseData.tag,
            description: releaseData.description,
            prerelease: releaseData.prerelease,
            draft: releaseData.draft,
                    files: releaseData.files && releaseData.files.length > 0 ? releaseData.files.map(f => f.file) : [],
            onProgress: (progress, status) => {
                        this.updateUploadProgress(type, progress, status);
            }
        });
            }
            
            if (result.success) {
                this.updateUploadProgress(type, 100, 'Upload completed successfully!');
                showToast(`${releaseData.title} ${type === 'activations' ? 'committed' : 'uploaded'} successfully!`, 'success');
                
                setTimeout(() => {
                    this.hideUploadProgress(type);
                    this.clearForm(type);
                    
                    // Refresh the releases if we're on the corresponding page
                    if (type === 'fixes' && document.getElementById('fixes-page').classList.contains('active')) {
                        displayReleases('fixes');
                    } else if (type === 'tools' && document.getElementById('tools-page').classList.contains('active')) {
                        displayReleases('tools');
                    } else if (type === 'software' && document.getElementById('softwares-page').classList.contains('active')) {
                        displayReleases('softwares');
                    } else if (type === 'activations' && document.getElementById('offline-activations-tab').classList.contains('active')) {
                        loadOfflineActivations();
                    }
                }, 2000);
            } else {
                throw new Error(result.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            this.updateUploadProgress(type, 0, 'Upload failed: ' + error.message);
            showToast('Upload failed: ' + error.message, 'error');
            
            setTimeout(() => {
                this.hideUploadProgress(type);
            }, 3000);
        }
    }
    
    showUploadProgress(type) {
        const progressDiv = document.getElementById(`${type}-upload-progress`);
        const formDiv = document.querySelector(`#upload-${type}-tab .upload-form`);
        
        if (progressDiv) {
            progressDiv.style.display = 'block';
        }
        if (formDiv) {
            formDiv.style.display = 'none';
        }
    }
    
    hideUploadProgress(type) {
        const progressDiv = document.getElementById(`${type}-upload-progress`);
        const formDiv = document.querySelector(`#upload-${type}-tab .upload-form`);
        
        if (progressDiv) {
            progressDiv.style.display = 'none';
        }
        if (formDiv) {
            formDiv.style.display = 'block';
        }
    }
    
    updateUploadProgress(type, progress, status) {
        const progressBar = document.getElementById(`${type}-progress-bar`);
        const statusText = document.querySelector(`#${type}-upload-progress .upload-status`);
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        if (statusText) {
            statusText.textContent = status || `Uploading... ${progress}%`;
        }
    }
    
    updateProgress(type, percentage, status) {
        try {
            const progressBar = document.getElementById(`${type}-progress-bar`);
            const progressStatus = document.querySelector(`#${type}-upload-progress .progress-status`);
            const progressDetails = document.getElementById(`${type}-progress-details`);
            
            if (progressBar) {
                progressBar.style.width = percentage + '%';
            }
            if (progressStatus) {
                progressStatus.textContent = status;
            }
            if (progressDetails) {
                progressDetails.textContent = status;
            }
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    }
    
    clearForm(type) {
        try {
            if (type === 'activations') {
                // Special handling for activations form
                const fields = [
                    'activations-token',
                    'activations-repo',
                    'activations-title',
                    'activations-banner-image'
                ];
                
                fields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) field.value = '';
                });
                
                // Clear selected files
                this.selectedFiles.set(type, []);
                
                // Disable upload button
                const uploadBtn = document.getElementById('upload-activations-btn');
                if (uploadBtn) uploadBtn.disabled = true;
                
            } else {
                // Standard form clearing for other types
            const tokenInput = document.getElementById(`${type}-github-token`);
            const repoInput = document.getElementById(`${type}-owner-repo`);
            const titleInput = document.getElementById(`${type}-release-title`);
            const tagInput = document.getElementById(`${type}-release-tag`);
            const descInput = document.getElementById(`${type}-release-description`);
            const prereleaseInput = document.getElementById(`${type}-prerelease`);
            const draftInput = document.getElementById(`${type}-draft`);
            const fileInput = document.getElementById(`${type}-file-input`);
            
            [tokenInput, repoInput, titleInput, tagInput, descInput].forEach(input => {
                if (input) input.value = '';
            });
            
            [prereleaseInput, draftInput].forEach(input => {
                if (input) input.checked = false;
            });
            
            if (fileInput) fileInput.value = '';
            
            // Clear file list
            const fileList = document.getElementById(`${type}-file-list`);
            if (fileList) {
                fileList.innerHTML = '';
            }
            
            // Clear selected files
            this.selectedFiles.set(type, []);
            
            // Validate form (will disable upload button)
            this.validateForm(type);
            }
            
            showToast('Form cleared', 'info');
        } catch (error) {
            console.error('Error clearing form:', error);
        }
    }
    
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️',
            'exe': '⚙️', 'msi': '⚙️',
            'dmg': '💿', 'deb': '📦',
            'pdf': '📄', 'txt': '📝',
            'jpg': '🖼️', 'png': '🖼️', 'gif': '🖼️'
        };
        return icons[ext] || '📄';
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize upload manager
const uploadManager = new UploadManager();
window.uploadManager = uploadManager;

// Offline Detection and Modal Management
let isOffline = false;
let offlineModalShown = false;

// Check internet connectivity
async function checkInternetConnection() {
    const endpoints = [
        'https://www.google.com/favicon.ico',
        'https://www.github.com/favicon.ico',
        'https://httpbin.org/get'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
                timeout: 5000
            });
            console.log(`✅ Connection check successful with ${endpoint}`);
            return true;
        } catch (error) {
            console.log(`❌ Connection check failed with ${endpoint}:`, error.message);
        }
    }
    
    console.log('❌ All connection checks failed');
    return false;
}

// Show offline modal
function showOfflineModal() {
    if (offlineModalShown) return;
    
    const offlineModal = document.getElementById('offline-modal');
    if (offlineModal) {
        offlineModal.style.display = 'flex';
        offlineModalShown = true;
        console.log('📡 Offline warning displayed');
    }
}

// Hide offline modal
function hideOfflineModal() {
    const offlineModal = document.getElementById('offline-modal');
    if (offlineModal) {
        offlineModal.style.display = 'none';
        offlineModalShown = false;
        console.log('📡 Offline warning hidden');
    }
}

// Close offline modal manually
function closeOfflineModal() {
    console.log('Closing offline modal manually');
    hideOfflineModal();
}

// Show reload countdown
function showReloadCountdown() {
    const countdownElement = document.getElementById('reload-countdown');
    const countdownNumber = document.getElementById('countdown-number');
    
    if (countdownElement && countdownNumber) {
        countdownElement.style.display = 'block';
        
        let count = 3;
        countdownNumber.textContent = count;
        
        const countdownInterval = setInterval(() => {
            count--;
            countdownNumber.textContent = count;
            
            if (count <= 0) {
                clearInterval(countdownInterval);
                countdownElement.style.display = 'none';
            }
        }, 1000);
    }
}

// Check connection and update status
async function checkConnection() {
    console.log('🔄 Checking internet connection...');
    
    try {
        const isOnline = await checkInternetConnection();
        console.log('Connection check result:', isOnline);
        
        if (isOnline) {
            console.log('✅ Internet connection restored');
            isOffline = false;
            hideOfflineModal(); // Hide the modal immediately
            showToast('Internet connection restored! Reloading app...', 'success');
            showReloadCountdown();
            
            // Reload the app after countdown
            setTimeout(() => {
                console.log('🔄 Reloading app due to manual connection check');
                window.location.reload();
            }, 3000);
        } else {
            console.log('❌ Still offline');
            showToast('Still no internet connection', 'error');
        }
        
        return isOnline;
    } catch (error) {
        console.error('Error checking connection:', error);
        showToast('Error checking connection', 'error');
        return false;
    }
}

// Monitor online/offline status
function setupOfflineDetection() {
    console.log('🌐 Setting up immediate offline detection...');
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
        console.log('🌐 Browser online event detected');
        isOffline = false;
        hideOfflineModal();
        showToast('Internet connection restored! Reloading app...', 'success');
        showReloadCountdown();
        
        // Reload the app after countdown
        setTimeout(() => {
            console.log('🔄 Reloading app due to online event');
            window.location.reload();
        }, 3000);
    });
    
    window.addEventListener('offline', () => {
        console.log('🌐 Browser offline event detected');
        isOffline = true;
        showOfflineModal();
    });
    
    // Immediate connection check
    console.log('🔍 Performing immediate connection check...');
    checkInternetConnection().then(isOnline => {
        console.log('📡 Initial connection check result:', isOnline);
        if (!isOnline) {
            console.log('❌ No internet connection detected on startup');
            isOffline = true;
            showOfflineModal();
        } else {
            console.log('✅ Internet connection confirmed on startup');
            isOffline = false;
        }
    }).catch(error => {
        console.error('❌ Error during initial connection check:', error);
        isOffline = true;
        showOfflineModal();
    });
    
    // More frequent periodic connection check
    setInterval(async () => {
        try {
            if (isOffline) {
                const isOnline = await checkInternetConnection();
                if (isOnline) {
                    console.log('✅ Connection restored via periodic check');
                    isOffline = false;
                    hideOfflineModal();
                    showToast('Internet connection restored! Reloading app...', 'success');
                    showReloadCountdown();
                    
                    // Reload the app after countdown
                    setTimeout(() => {
                        console.log('🔄 Reloading app due to periodic connection check');
                        window.location.reload();
                    }, 3000);
                }
            } else {
                const isOnline = await checkInternetConnection();
                if (!isOnline && !offlineModalShown) {
                    console.log('❌ Connection lost, showing offline modal');
                    isOffline = true;
                    showOfflineModal();
                }
            }
        } catch (error) {
            console.error('❌ Error in periodic connection check:', error);
        }
    }, 5000); // Check every 5 seconds for faster detection
}

// Window Controls Setup moved to HTML script tag


// Test Electron API directly
window.testElectronAPI = async () => {
    console.log('🧪 Testing Electron API...');
    
    if (window.electronAPI) {
        console.log('Available methods:', Object.keys(window.electronAPI));
        
        try {
            console.log('Testing windowMinimize...');
            await window.electronAPI.windowMinimize();
            console.log('✅ Minimize successful');
        } catch (error) {
            console.error('❌ Minimize error:', error);
        }
        
        try {
            console.log('Testing windowMaximize...');
            await window.electronAPI.windowMaximize();
            console.log('✅ Maximize successful');
        } catch (error) {
            console.error('❌ Maximize error:', error);
        }
        
        try {
            console.log('Testing windowClose...');
            await window.electronAPI.windowClose();
            console.log('✅ Close successful');
        } catch (error) {
            console.error('❌ Close error:', error);
        }
    } else {
        console.error('❌ Electron API not available');
    }
};

// Quick test function for window controls
window.testWindowControlsQuick = () => {
    console.log('🚀 Quick window controls test...');
    
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');
    
    console.log('Buttons:', { minimize: !!minimizeBtn, maximize: !!maximizeBtn, close: !!closeBtn });
    console.log('ElectronAPI:', !!window.electronAPI);
    
    if (minimizeBtn) {
        console.log('Testing minimize button click...');
        minimizeBtn.click();
    }
};

// Force enable activations button for debugging
window.forceEnableActivationsButton = () => {
    const btn = document.getElementById('upload-activations-btn');
    if (btn) {
        console.log('Force enabling activations button...');
        btn.disabled = false;
        console.log('Button disabled state:', btn.disabled);
        return true;
    } else {
        console.error('Activations button not found');
        return false;
    }
};

// Test activations form fields and values
window.testActivationsFields = () => {
    console.log('=== Testing Activations Form Fields ===');
    
    const tokenField = document.getElementById('activations-token');
    const repoField = document.getElementById('activations-repo');
    const titleField = document.getElementById('activations-title');
    const bannerField = document.getElementById('activations-banner-image');
    
    console.log('Fields found:', {
        token: !!tokenField,
        repo: !!repoField,
        title: !!titleField,
        banner: !!bannerField
    });
    
    console.log('Field values:', {
        token: tokenField ? tokenField.value : 'null',
        repo: repoField ? repoField.value : 'null',
        title: titleField ? titleField.value : 'null',
        banner: bannerField ? bannerField.value : 'null'
    });
    
    console.log('Trimmed values:', {
        token: tokenField ? tokenField.value.trim() : 'null',
        repo: repoField ? repoField.value.trim() : 'null',
        title: titleField ? titleField.value.trim() : 'null',
        banner: bannerField ? bannerField.value.trim() : 'null'
    });
    
    console.log('Validation checks:', {
        tokenValid: tokenField && tokenField.value.trim(),
        repoValid: repoField && repoField.value.trim() && repoField.value.includes('/'),
        titleValid: titleField && titleField.value.trim()
    });
    
    return {
        tokenField,
        repoField,
        titleField,
        bannerField
    };
};

// Manual refresh function for testing
window.refreshActivations = async () => {
    console.log('Manually refreshing activations...');
    try {
        await loadOfflineActivations();
        console.log('Activations refreshed successfully');
    } catch (error) {
        console.error('Error refreshing activations:', error);
    }
};

// Make functions globally available
window.checkConnection = checkConnection;
window.closeOfflineModal = closeOfflineModal;
window.showReloadCountdown = showReloadCountdown;


// Developer Tools Keyboard Shortcut
function setupDevToolsShortcut() {
    console.log('Setting up developer tools shortcut (Shift + -)');
    
    // Wait for Electron API to be available
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkElectronAPI = () => {
        attempts++;
        console.log(`Checking for Electron API (attempt ${attempts}/${maxAttempts})`);
        
        if (window.electronAPI && window.electronAPI.openDevTools) {
            console.log('✅ Electron API detected!');
            setupDevToolsEventListeners();
        } else if (attempts < maxAttempts) {
            console.log('⏳ Electron API not ready, retrying in 500ms...');
            setTimeout(checkElectronAPI, 500);
        } else {
            console.log('❌ Electron API not available after maximum attempts');
            setupDevToolsEventListeners(); // Setup anyway for fallback
        }
    };
    
    const setupDevToolsEventListeners = () => {
        // Disable right-click context menu to prevent "Inspect Element"
        document.addEventListener('contextmenu', (event) => {
            console.log('Right-click context menu disabled');
            event.preventDefault();
            return false;
        });
    
        document.addEventListener('keydown', (event) => {
            // Check for Shift + - (minus key)
            if (event.shiftKey && event.key === '-') {
                console.log('Developer tools shortcut triggered');
                event.preventDefault();
                
                // Open developer tools
                console.log('ElectronAPI available:', !!window.electronAPI);
                console.log('openDevTools function available:', !!(window.electronAPI && window.electronAPI.openDevTools));
                
                if (window.electronAPI && window.electronAPI.openDevTools) {
                    console.log('Calling openDevTools...');
                    window.electronAPI.openDevTools().then(result => {
                        console.log('openDevTools result:', result);
                        if (result && result.success) {
                            console.log('✅ Developer tools opened via Electron API');
                        } else {
                            console.error('❌ Failed to open developer tools:', result ? result.error : 'No result');
                        }
                    }).catch(error => {
                        console.error('❌ Error opening developer tools:', error);
                    });
                } else {
                    // Fallback for web version - show alert
                    console.log('⚠️ Electron API not available, showing fallback message');
                    console.log('Available electronAPI methods:', window.electronAPI ? Object.keys(window.electronAPI) : 'No electronAPI');
                    alert('Developer Tools Shortcut: Shift + -\n\nElectron API not detected. This should work in the Electron app.\nIn web version, use right-click → Inspect.');
                }
            }
            
            // Disable common developer tools shortcuts
            if (event.key === 'F12' || 
                (event.ctrlKey && event.shiftKey && event.key === 'I') ||
                (event.ctrlKey && event.shiftKey && event.key === 'C') ||
                (event.ctrlKey && event.shiftKey && event.key === 'J') ||
                (event.ctrlKey && event.key === 'U')) {
                console.log('Developer tools shortcut disabled:', event.key, 'Ctrl:', event.ctrlKey, 'Shift:', event.shiftKey);
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
        });
        
        console.log('✅ Developer tools shortcut setup complete');
    };
    
    // Start checking for Electron API
    checkElectronAPI();
}

// Manual button enable function for debugging
window.enableActivationsButton = () => {
    const uploadBtn = document.getElementById('upload-activations-btn');
    if (uploadBtn) {
        uploadBtn.disabled = false;
        console.log('✅ Activations button manually enabled');
        console.log('Button element:', uploadBtn);
        console.log('Button disabled property:', uploadBtn.disabled);
    } else {
        console.error('❌ Activations button not found');
    }
};

// Force enable button and check all fields
window.debugActivationsForm = () => {
    console.log('=== Debugging Activations Form ===');
    
    const uploadBtn = document.getElementById('upload-activations-btn');
    console.log('Upload button found:', !!uploadBtn);
    if (uploadBtn) {
        console.log('Button disabled state:', uploadBtn.disabled);
        console.log('Button element:', uploadBtn);
    }
    
    const fields = ['activations-token', 'activations-repo', 'activations-title'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        console.log(`Field ${fieldId}:`, field);
        if (field) {
            console.log(`  - Value: "${field.value}"`);
            console.log(`  - Trimmed: "${field.value.trim()}"`);
            console.log(`  - Has value: ${!!field.value.trim()}`);
        }
    });
    
    // Force enable button
    if (uploadBtn) {
        uploadBtn.disabled = false;
        console.log('Button force enabled');
    }
};

// Test Electron API and dev tools
window.testDevTools = () => {
    console.log('=== Testing Developer Tools ===');
    console.log('ElectronAPI available:', !!window.electronAPI);
    console.log('ElectronAPI object:', window.electronAPI);
    console.log('Window object keys:', Object.keys(window));
    console.log('Process object:', typeof process !== 'undefined' ? process : 'Not available');
    console.log('User agent:', navigator.userAgent);
    
    if (window.electronAPI) {
        console.log('Available methods:', Object.keys(window.electronAPI));
        console.log('openDevTools function:', typeof window.electronAPI.openDevTools);
        
        if (window.electronAPI.openDevTools) {
            console.log('Calling openDevTools...');
            window.electronAPI.openDevTools().then(result => {
                console.log('openDevTools result:', result);
            }).catch(error => {
                console.error('openDevTools error:', error);
            });
        } else {
            console.error('openDevTools function not found');
        }
    } else {
        console.error('ElectronAPI not available');
    }
};

// Force check for Electron environment
window.checkElectronEnvironment = () => {
    console.log('=== Checking Electron Environment ===');
    console.log('window.electronAPI:', window.electronAPI);
    console.log('typeof window.electronAPI:', typeof window.electronAPI);
    console.log('window.electronAPI keys:', window.electronAPI ? Object.keys(window.electronAPI) : 'No electronAPI');
    console.log('navigator.userAgent:', navigator.userAgent);
    console.log('process available:', typeof process !== 'undefined');
    console.log('process.versions:', typeof process !== 'undefined' ? process.versions : 'Not available');
    
    // Check if we're in Electron by looking for Electron-specific properties
    const isElectron = !!(window.electronAPI || (typeof process !== 'undefined' && process.versions && process.versions.electron));
    console.log('Detected as Electron:', isElectron);
    
    return isElectron;
};


// GitHub File Commit Function for Activations
async function commitFilesToRepository({ token, owner, repo, title, description, files, onProgress }) {
    try {
        if (onProgress) {
            onProgress(10, 'Preparing files for commit...');
        }

        // Get the latest commit SHA first
        const refResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!refResponse.ok) {
            throw new Error(`Failed to get branch reference: ${refResponse.status}`);
        }

        const refData = await refResponse.json();
        const latestCommitSha = refData.object.sha;

        // Get the current tree SHA from the latest commit
        const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!commitResponse.ok) {
            throw new Error(`Failed to get commit: ${commitResponse.status}`);
        }

        const commitData = await commitResponse.json();
        const baseTree = commitData.tree.sha;
        
        // Validate base tree SHA
        if (!baseTree || baseTree.length !== 40) {
            console.log('Invalid base tree SHA, will create tree without base_tree');
            baseTree = null;
        } else {
            console.log('Using base tree SHA:', baseTree);
        }

        if (onProgress) {
            onProgress(20, 'Creating file blobs...');
        }

        // Create blobs for each file
        const fileBlobs = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (onProgress) {
                onProgress(20 + (i / files.length) * 30, `Uploading ${file.name}...`);
            }

            // Sanitize file name to ensure valid Git path
            let sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            
            // Ensure the name doesn't start with a dot or dash
            if (sanitizedName.startsWith('.') || sanitizedName.startsWith('-')) {
                sanitizedName = 'file_' + sanitizedName;
            }
            
            // Ensure the name isn't too long
            if (sanitizedName.length > 100) {
                const extension = sanitizedName.split('.').pop();
                const baseName = sanitizedName.substring(0, 100 - extension.length - 1);
                sanitizedName = baseName + '.' + extension;
            }
            
            const filePath = `activations/${sanitizedName}`;

            console.log(`Creating blob for file: ${file.name} -> ${filePath}`);

            const blobResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: await fileToBase64(file),
                    encoding: 'base64'
                })
            });

            if (!blobResponse.ok) {
                const errorData = await blobResponse.json();
                console.error(`Blob creation failed for ${file.name}:`, errorData);
                throw new Error(`Failed to create blob for ${file.name}: ${blobResponse.status} - ${errorData.message || 'Unknown error'}`);
            }

            const blobData = await blobResponse.json();
            console.log(`Created blob for ${file.name}: ${blobData.sha}`);

            fileBlobs.push({
                path: filePath,
                mode: '100644',
                type: 'blob',
                sha: blobData.sha
            });
        }

        if (onProgress) {
            onProgress(50, 'Creating new tree...');
        }

        // Validate file blobs before creating tree
        console.log('File blobs to create tree:', fileBlobs);
        
        // Validate each blob entry
        for (const blob of fileBlobs) {
            if (!blob.path || !blob.sha || !blob.mode || !blob.type) {
                throw new Error(`Invalid blob entry: ${JSON.stringify(blob)}`);
            }
            if (blob.sha.length !== 40) {
                throw new Error(`Invalid SHA length for ${blob.path}: ${blob.sha.length}`);
            }
        }

        // Create a new tree with the files
        let treeResponse;
        
        if (baseTree) {
            console.log('Creating tree with base_tree:', baseTree);
            treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    base_tree: baseTree,
                    tree: fileBlobs
                })
            });
        } else {
            console.log('Creating tree without base_tree');
            treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tree: fileBlobs
                })
            });
        }

        // If tree creation fails, try without base_tree (for new repositories)
        if (!treeResponse.ok) {
            console.log('Tree creation failed, trying without base_tree...');
            const errorData = await treeResponse.json();
            console.error('Tree creation error:', errorData);
            
            treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tree: fileBlobs
                })
            });
        }

        if (!treeResponse.ok) {
            const errorData = await treeResponse.json();
            console.error('Tree creation error:', errorData);
            console.error('Tree data sent:', {
                base_tree: baseTree,
                tree: fileBlobs
            });
            throw new Error(`Failed to create tree: ${treeResponse.status} - ${errorData.message || 'Unknown error'}`);
        }

        const treeData = await treeResponse.json();

        if (onProgress) {
            onProgress(70, 'Creating commit...');
        }

        // Create a commit
        let commitBody = {
            message: `Add activation files: ${title}`,
            tree: treeData.sha
        };

        // Only add parents if we have a valid parent commit
        if (latestCommitSha && latestCommitSha !== '0000000000000000000000000000000000000000') {
            commitBody.parents = [latestCommitSha];
        }

        const newCommitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commitBody)
        });

        if (!newCommitResponse.ok) {
            const errorData = await newCommitResponse.json();
            console.error('Commit creation error:', errorData);
            throw new Error(`Failed to create commit: ${newCommitResponse.status} - ${errorData.message || 'Unknown error'}`);
        }

        const newCommitData = await newCommitResponse.json();

        if (onProgress) {
            onProgress(85, 'Updating branch reference...');
        }

        // Update the branch reference with retry mechanism
        let updateRefResponse;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            // Get the current branch reference
            const currentRefResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!currentRefResponse.ok) {
                throw new Error(`Failed to get current branch reference: ${currentRefResponse.status}`);
            }

            const currentRefData = await currentRefResponse.json();
            const currentSha = currentRefData.object.sha;

            // Update the branch reference
            updateRefResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sha: newCommitData.sha,
                    force: false
                })
            });

            if (updateRefResponse.ok) {
                break; // Success
            }

            if (updateRefResponse.status === 422) {
                // Branch was updated by another process, retry
                retryCount++;
                console.log(`Branch update conflict, retrying... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
            } else {
                break; // Different error, don't retry
            }
        }

        if (!updateRefResponse.ok) {
            const errorData = await updateRefResponse.json();
            console.error('Branch update error:', errorData);
            throw new Error(`Failed to update branch: ${updateRefResponse.status} - ${errorData.message || 'Unknown error'}`);
        }

        if (onProgress) {
            onProgress(100, 'Files committed successfully!');
        }

        return { success: true, commit: newCommitData };

    } catch (error) {
        console.error('Error committing files:', error);
        return { success: false, error: error.message };
    }
}

// Helper function to convert file to base64
async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// GitHub Release Creation Function
async function createGitHubRelease({ token, owner, repo, title, tag, description, prerelease, draft, files, onProgress }) {
    try {
        // Check if we have files to upload
        const fileList = Array.isArray(files) ? files : [];
        const hasFiles = fileList.length > 0;
        
        let zippedBlob = null;
        let zipName = null;
        
        if (hasFiles) {
        // Show upload progress
        if (onProgress) {
            onProgress(10, 'Creating ZIP archive...');
        }
        
        // Build a single zip from selected files named <game-name>_<tag>.zip
            zipName = `${(title || 'release').replace(/\s+/g, '_')}_${tag}.zip`;
        if (typeof JSZip !== 'undefined') {
            const zipper = new JSZip();
            for (const f of fileList) {
                // files here may be File objects or FileData with .file
                const fileObj = f && f.file ? f.file : f;
                if (fileObj && fileObj.name) {
                    zipper.file(fileObj.name, fileObj);
                }
            }
            
            if (onProgress) {
                onProgress(30, 'Generating ZIP file...');
            }
            
            zippedBlob = await zipper.generateAsync({ 
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });
        } else {
            throw new Error('Archiver not available');
            }
        } else {
            // No files to upload, skip ZIP creation
            if (onProgress) {
                onProgress(20, 'Preparing release...');
            }
        }

        // Create the release first
        if (onProgress) {
            onProgress(50, 'Creating GitHub release...');
        }
        
        const releaseData = {
            tag_name: tag,
            name: title,
            body: description,
            draft: draft || false,
            prerelease: prerelease || false
        };
        
        const createReleaseResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(releaseData)
        });
        
        if (!createReleaseResponse.ok) {
            const errorData = await createReleaseResponse.json();
            throw new Error(`GitHub API Error: ${createReleaseResponse.status} - ${errorData.message || createReleaseResponse.statusText}`);
        }
        
        const release = await createReleaseResponse.json();
        
        // Upload single zipped asset if we have files
        if (zippedBlob && zipName) {
            if (onProgress) {
                onProgress(70, 'Uploading files to GitHub...');
            }
            
            const uploadUrl = release.upload_url.replace('{?name,label}', `?name=${encodeURIComponent(zipName)}`);
            
            // Create XMLHttpRequest for progress tracking
            const xhr = new XMLHttpRequest();
            
            return new Promise((resolve, reject) => {
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const percentComplete = 70 + (event.loaded / event.total) * 25; // 70-95%
                        onProgress(Math.round(percentComplete), `Uploading: ${Math.round((event.loaded / event.total) * 100)}%`);
                    }
                });
                
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (onProgress) {
                            onProgress(100, 'Upload completed!');
                        }
                        resolve({ success: true, release });
                    } else {
                        reject(new Error(`Asset upload failed: ${xhr.status} ${xhr.responseText}`));
                    }
                });
                
                xhr.addEventListener('error', () => {
                    reject(new Error('Upload failed: Network error'));
                });
                
                xhr.open('POST', uploadUrl);
                xhr.setRequestHeader('Authorization', `token ${token}`);
                xhr.setRequestHeader('Content-Type', 'application/zip');
                xhr.send(zippedBlob);
            });
        } else {
            // No files to upload, just return success
            if (onProgress) {
                onProgress(100, 'Release created successfully!');
            }
            return { success: true, release };
        }
        
    } catch (error) {
        console.error('Error creating GitHub release:', error);
        return { success: false, error: error.message };
    }
}

// GitHub Helper Functions
async function testGitHubConnection() {
    try {
        const tokenInput = document.getElementById('admin-github-token');
        if (!tokenInput || !tokenInput.value.trim()) {
            showToast('Please enter a GitHub token first', 'warning');
            return;
        }
        
        const token = tokenInput.value.trim();
        showToast('Testing GitHub connection...', 'info');
        
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            showToast(`GitHub connection successful! Welcome, ${userData.login}`, 'success');
        } else {
            const errorData = await response.json();
            throw new Error(`GitHub API Error: ${response.status} - ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error testing GitHub connection:', error);
        showToast('GitHub connection failed: ' + error.message, 'error');
    }
}

async function commitConfigurationToGitHub(config, token, manifestRepo) {
    try {
        const [owner, repo] = manifestRepo.split('/');
        if (!owner || !repo) {
            throw new Error('Invalid manifest repository format');
        }
        
        // Get current file SHA if it exists
        let currentSha = null;
        try {
            const getResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/configured.json`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const currentFile = await getResponse.json();
                currentSha = currentFile.sha;
            }
        } catch (getError) {
            console.log('File does not exist yet, will create new');
        }
        
        // Create or update the file
        const content = btoa(JSON.stringify(config, null, 2));
        const updateData = {
            message: `Update configuration via Crack World Admin Panel - ${new Date().toISOString()}`,
            content: content,
            branch: 'main'
        };
        
        if (currentSha) {
            updateData.sha = currentSha;
        }
        
        const updateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/configured.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`GitHub API Error: ${updateResponse.status} - ${errorData.message || updateResponse.statusText}`);
        }
        
        return { success: true };
        
    } catch (error) {
        console.error('Error committing configuration to GitHub:', error);
        return { success: false, error: error.message };
    }
}

function showConfigStatus(message, type) {
    try {
        const statusEl = document.getElementById('config-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `config-status ${type}`;
            statusEl.style.display = 'block';
            
            if (type === 'success' || type === 'error') {
                setTimeout(() => {
                    statusEl.style.display = 'none';
                }, 3000);
            }
        }
    } catch (error) {
        console.error('Error showing config status:', error);
    }
}

// GitHub Configuration Management
async function loadGitHubConfig() {
    try {
        showConfigStatus('Loading configuration from GitHub...', 'loading');
        
        const manifestRepoInput = document.getElementById('manifest-repo');
        const manifestRepo = manifestRepoInput ? manifestRepoInput.value.trim() : MANIFEST_REPO_DEFAULT;
        
        if (!manifestRepo) {
            throw new Error('Manifest repository not specified');
        }
        
        const configUrl = `https://raw.githubusercontent.com/${manifestRepo}/main/configured.json`;
        const response = await fetch(configUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch config: ${response.status} ${response.statusText}`);
        }
        
        const config = await response.json();
        
        // Update form fields
        const fixesRepoInput = document.getElementById('fixes-repo');
        const toolsRepoInput = document.getElementById('tools-repo');
        const softwareRepoInput = document.getElementById('software-repo');
        const discordInviteInput = document.getElementById('discord-invite-config');
        
        if (fixesRepoInput && config.github?.fixes) fixesRepoInput.value = config.github.fixes;
        if (toolsRepoInput && config.github?.tools) toolsRepoInput.value = config.github.tools;
        if (softwareRepoInput && config.github?.softwares) softwareRepoInput.value = config.github.softwares;
        if (discordInviteInput && config.discord) discordInviteInput.value = config.discord;
        
        // Update global config
        appConfig = config;
        discordInviteLink = config.discord || discordInviteLink;
        
        showConfigStatus('Configuration loaded successfully!', 'success');
        showToast('Configuration loaded from GitHub!', 'success');
        
    } catch (error) {
        console.error('Error loading GitHub config:', error);
        showConfigStatus(`Failed to load: ${error.message}`, 'error');
        showToast('Failed to load configuration: ' + error.message, 'error');
    }
}

async function saveGitHubConfig() {
    try {
        const tokenInput = document.getElementById('admin-github-token');
        const manifestRepoInput = document.getElementById('manifest-repo');
        const fixesRepoInput = document.getElementById('fixes-repo');
        const toolsRepoInput = document.getElementById('tools-repo');
        const softwareRepoInput = document.getElementById('software-repo');
        const discordInviteInput = document.getElementById('discord-invite-config');
        
        if (!tokenInput || !tokenInput.value.trim()) {
            showToast('GitHub token is required', 'warning');
            return;
        }
        
        const token = tokenInput.value.trim();
        const manifestRepo = manifestRepoInput ? manifestRepoInput.value.trim() : MANIFEST_REPO_DEFAULT;
        
        if (!manifestRepo) {
            showToast('Manifest repository is required', 'warning');
            return;
        }
        
        showConfigStatus('Preparing configuration...', 'loading');
        
        // Build new configuration
        const newConfig = {
            github: {
                fixes: fixesRepoInput ? fixesRepoInput.value.trim() : '',
                tools: toolsRepoInput ? toolsRepoInput.value.trim() : '',
                softwares: softwareRepoInput ? softwareRepoInput.value.trim() : ''
            },
            discord: discordInviteInput ? discordInviteInput.value.trim() : discordInviteLink,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'Crack World Admin Panel'
        };
        
        // Validate configuration
        const validation = validateConfiguration(newConfig);
        if (!validation.valid) {
            showToast('Configuration validation failed: ' + validation.errors.join(', '), 'error');
            return;
        }
        
        showConfigStatus('Committing configuration to GitHub...', 'loading');
        
        // Commit to GitHub
        const result = await commitConfigurationToGitHub(newConfig, token, manifestRepo);
        
        if (result.success) {
            // Update global config
            appConfig = newConfig;
            discordInviteLink = newConfig.discord;
            
            // Save locally as backup
            localStorage.setItem('githubConfig', JSON.stringify({
                token: token,
                manifestRepo: manifestRepo,
                config: newConfig
            }));
            
            showConfigStatus('Configuration saved and committed successfully!', 'success');
            showToast('Configuration saved and committed to GitHub!', 'success');
            
            // Refresh any displayed releases
            setTimeout(() => {
                if (document.getElementById('fixes-page').classList.contains('active')) {
                    displayReleases('fixes');
                } else if (document.getElementById('tools-page').classList.contains('active')) {
                    displayReleases('tools');
                } else if (document.getElementById('softwares-page').classList.contains('active')) {
                    displayReleases('softwares');
                }
            }, 1000);
        } else {
            throw new Error(result.error || 'Failed to commit configuration');
        }
        
    } catch (error) {
        console.error('Error saving GitHub config:', error);
        showConfigStatus(`Save failed: ${error.message}`, 'error');
        showToast('Failed to save configuration: ' + error.message, 'error');
    }
}

function validateConfiguration(config) {
    const errors = [];
    
    if (!config.github) {
        errors.push('GitHub configuration missing');
    } else {
        if (!config.github.fixes) errors.push('Fixes repository missing');
        if (!config.github.tools) errors.push('Tools repository missing');
        if (!config.github.softwares) errors.push('Software repository missing');
    }
    
    if (!config.discord) {
        errors.push('Discord invite link missing');
    } else {
        try {
            new URL(config.discord);
        } catch {
            errors.push('Invalid Discord invite URL');
        }
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Additional helper functions for better file handling
async function uploadAssetToRelease(token, uploadUrl, file) {
    try {
        // Remove the {?name,label} template from upload URL
        const cleanUploadUrl = uploadUrl.replace('{?name,label}', '');
        const uploadUrlWithParams = `${cleanUploadUrl}?name=${encodeURIComponent(file.name)}`;
        
        const fileBuffer = await file.arrayBuffer();
        
        const response = await fetch(uploadUrlWithParams, {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/octet-stream'
            },
            body: fileBuffer
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Upload failed: ${response.status} - ${errorData.message || response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error uploading asset:', error);
        throw error;
    }
}

// Save Discord Configuration
async function saveDiscordConfig() {
    try {
        const inviteUrlInput = document.getElementById('discord-invite-config');
        const webhookUrlInput = document.getElementById('discord-webhook-config');
        
        const config = {
            inviteUrl: inviteUrlInput ? inviteUrlInput.value.trim() : '',
            webhookUrl: webhookUrlInput ? webhookUrlInput.value.trim() : '',
            lastUpdated: new Date().toISOString()
        };
        
        // Validate URLs
        if (config.inviteUrl) {
            try {
                new URL(config.inviteUrl);
            } catch {
                showToast('Invalid Discord invite URL', 'error');
                return;
            }
        }
        
        if (config.webhookUrl) {
            try {
                new URL(config.webhookUrl);
            } catch {
                showToast('Invalid Discord webhook URL', 'error');
                return;
            }
        }
        
        // Save to localStorage
        localStorage.setItem('crack-world-discord-config', JSON.stringify(config));
        
        // Update global Discord invite link
        if (config.inviteUrl) {
            discordInviteLink = config.inviteUrl;
        }
        
        showToast('Discord configuration saved!', 'success');
    } catch (error) {
        console.error('Error saving Discord config:', error);
        showToast('Failed to save Discord configuration: ' + error.message, 'error');
    }
}

// Save Theme Settings
async function saveThemeSettings() {
    try {
        const defaultThemeSelect = document.getElementById('default-theme-select');
        const defaultLayoutSelect = document.getElementById('default-layout-select');
        
        const config = {
            defaultTheme: defaultThemeSelect ? defaultThemeSelect.value : 'cyberpunk',
            defaultLayout: defaultLayoutSelect ? defaultLayoutSelect.value : 'grid',
            lastUpdated: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('crack-world-theme-config', JSON.stringify(config));
        
        // Apply the theme and layout immediately
        if (config.defaultTheme !== currentTheme) {
            applyTheme(config.defaultTheme);
        }
        
        if (config.defaultLayout !== currentLayout) {
            applyLayout(config.defaultLayout);
        }
        
        showToast('Theme settings saved!', 'success');
    } catch (error) {
        console.error('Error saving theme settings:', error);
        showToast('Failed to save theme settings: ' + error.message, 'error');
    }
}

// Duplicate function removed - using the first definition

// Duplicate function removed - using the first definition

// Duplicate function removed - using the first definition

// Duplicate function removed - using the first definition

// Load saved configurations on startup
function loadSavedConfigurations() {
    try {
        // Load GitHub configuration
        const savedGitHubConfig = localStorage.getItem('githubConfig');
        if (savedGitHubConfig) {
            const config = JSON.parse(savedGitHubConfig);
            
            const tokenInput = document.getElementById('admin-github-token');
            const fixesRepoInput = document.getElementById('fixes-repo');
            const toolsRepoInput = document.getElementById('tools-repo');
            const softwareRepoInput = document.getElementById('software-repo');
            
            if (tokenInput) tokenInput.value = config.token || '';
            if (fixesRepoInput) fixesRepoInput.value = config.repositories?.fixes || 'cwabaid/cw.fixes';
            if (toolsRepoInput) toolsRepoInput.value = config.repositories?.tools || 'cwabaid/cw.tools';
            if (softwareRepoInput) softwareRepoInput.value = config.repositories?.software || 'cwabaid/cw.softwares';
        }
        
        // Load Discord configuration
        const savedDiscordConfig = localStorage.getItem('discordConfig');
        if (savedDiscordConfig) {
            const config = JSON.parse(savedDiscordConfig);
            
            const inviteUrlInput = document.getElementById('discord-invite-url');
            const webhookUrlInput = document.getElementById('discord-webhook-url');
            
            if (inviteUrlInput) inviteUrlInput.value = config.inviteUrl || 'https://discord.gg/q7jukKbCZT';
            if (webhookUrlInput) webhookUrlInput.value = config.webhookUrl || '';
        }
        
        // Load Theme settings
        const savedThemeSettings = localStorage.getItem('themeSettings');
        if (savedThemeSettings) {
            const settings = JSON.parse(savedThemeSettings);
            
            const defaultThemeSelect = document.getElementById('default-theme');
            const defaultLayoutSelect = document.getElementById('default-layout');
            
            if (defaultThemeSelect) defaultThemeSelect.value = settings.defaultTheme || 'cyberpunk';
            if (defaultLayoutSelect) defaultLayoutSelect.value = settings.defaultLayout || 'grid';
        }
        
        console.log('Saved configurations loaded successfully');
    } catch (error) {
        console.error('Error loading saved configurations:', error);
    }
}

// Global Functions
window.showPage = showPage;
window.openModal = openModal;
window.closeModal = closeModal;
window.viewReleaseDetails = viewReleaseDetails;
window.downloadRelease = downloadRelease;
window.selectQuickPath = selectQuickPath;
window.selectCustomDirectory = selectCustomDirectory;
window.confirmDirectorySelection = confirmDirectorySelection;
window.cancelDirectorySelection = cancelDirectorySelection;
window.openUpdateReleaseModal = openUpdateReleaseModal;
window.updateRelease = updateRelease;
window.generateManifest = generateManifest;
window.publishAnnouncement = publishAnnouncement;
window.previewAnnouncement = previewAnnouncement;
window.loadAnnouncements = loadAnnouncements;
window.loadChangelog = loadChangelog;
window.loadTerms = loadTerms;
window.saveGitHubConfig = saveGitHubConfig;
window.testGitHubConnection = testGitHubConnection;
window.saveDiscordConfig = saveDiscordConfig;
window.saveThemeSettings = saveThemeSettings;
window.loadGitHubConfig = loadGitHubConfig;
window.startUpdate = startUpdate;
window.manualUpdateCheck = manualUpdateCheck;
window.checkForUpdates = checkForUpdates;


// Custom Directory Selector Implementation
class CustomDirectorySelector {
    constructor() {
        this.currentPath = 'C:\\';
        this.selectedPath = '';
        this.callback = null;
    }
    
    open(callback, initialPath = 'C:\\') {
        this.callback = callback;
        this.currentPath = initialPath;
        this.selectedPath = '';
        
        const modal = document.getElementById('customDirectoryModal');
        if (modal) {
            modal.classList.add('active');
            this.updateUI();
            this.loadDirectory(this.currentPath);
        }
    }
    
    close() {
        const modal = document.getElementById('customDirectoryModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.callback = null;
    }
    
    updateUI() {
        const pathDisplay = document.getElementById('current-directory-path');
        const selectedDisplay = document.getElementById('selected-directory-path');
        const selectBtn = document.getElementById('select-directory-btn');
        
        if (pathDisplay) pathDisplay.textContent = this.currentPath;
        if (selectedDisplay) selectedDisplay.textContent = this.selectedPath || 'No directory selected';
        if (selectBtn) selectBtn.disabled = !this.selectedPath;
    }
    
    async loadDirectory(path) {
        try {
            const content = document.getElementById('directory-content');
            if (!content) return;
            
            content.innerHTML = '<div style="text-align: center; padding: 20px; color: var(--muted);">Loading directory contents...</div>';
            
            // Use Electron API to get directory contents
            const result = await window.electronAPI.getDirectoryContents(path);
            
            if (result.success) {
                this.displayDirectoryContents(result.contents);
            } else {
                content.innerHTML = `<div style="text-align: center; padding: 20px; color: #ff4444;">Error: ${result.error}</div>`;
            }
        } catch (error) {
            console.error('Error loading directory:', error);
            const content = document.getElementById('directory-content');
            if (content) {
                content.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff4444;">Failed to load directory</div>';
            }
        }
    }
    
    displayDirectoryContents(contents) {
        const content = document.getElementById('directory-content');
        if (!content) return;
        
        let html = '';
        
        // Add parent directory option if not at root
        if (this.currentPath !== 'C:\\' && this.currentPath !== '/') {
            html += `
                <div class="directory-item" onclick="customDirectorySelector.navigateUp()">
                    <div class="directory-item-icon">⬆️</div>
                    <div class="directory-item-name">.. (Parent Directory)</div>
                    <div class="directory-item-info">Go up one level</div>
                </div>
            `;
        }
        
        // Add directories
        contents.forEach(item => {
            if (item.isDirectory) {
                html += `
                    <div class="directory-item" onclick="customDirectorySelector.navigateToDirectory('${item.path.replace(/\\/g, '\\\\')}')"
                         ondblclick="customDirectorySelector.selectAndConfirm('${item.path.replace(/\\/g, '\\\\')}')">
                        <div class="directory-item-icon">📁</div>
                        <div class="directory-item-name">${item.name}</div>
                        <div class="directory-item-info">${item.size ? this.formatSize(item.size) : 'Directory'}</div>
                    </div>
                `;
            }
        });
        
        // Add files (for reference, but they can't be selected)
        contents.forEach(item => {
            if (!item.isDirectory) {
                html += `
                    <div class="directory-item" style="opacity: 0.6; cursor: default;">
                        <div class="directory-item-icon">${this.getFileIcon(item.name)}</div>
                        <div class="directory-item-name">${item.name}</div>
                        <div class="directory-item-info">${this.formatSize(item.size)}</div>
                    </div>
                `;
            }
        });
        
        content.innerHTML = html || '<div style="text-align: center; padding: 20px; color: var(--muted);">Directory is empty</div>';
    }
    
    navigateToDirectory(path) {
        this.currentPath = path;
        this.selectedPath = path;
        this.updateUI();
        this.loadDirectory(path);
        
        // Update selection styling
        document.querySelectorAll('.directory-item').forEach(item => {
            item.classList.remove('selected');
        });
        event.target.closest('.directory-item')?.classList.add('selected');
    }
    
    navigateUp() {
        const pathParts = this.currentPath.split(/[\\/]/).filter(p => p);
        if (pathParts.length > 1) {
            pathParts.pop();
            this.currentPath = pathParts.join('\\') + '\\';
        } else {
            this.currentPath = 'C:\\';
        }
        this.loadDirectory(this.currentPath);
    }
    
    selectAndConfirm(path) {
        this.selectedPath = path;
        this.confirmSelection();
    }
    
    confirmSelection() {
        if (this.selectedPath && this.callback) {
            this.callback(this.selectedPath);
        }
        this.close();
    }
    
    async createNewFolder() {
        try {
            const folderName = prompt('Enter folder name:');
            if (!folderName) return;
            
            const newPath = this.currentPath + '\\' + folderName;
            const result = await window.electronAPI.createDirectory(newPath);
            
            if (result.success) {
                showToast('Folder created successfully', 'success');
                this.loadDirectory(this.currentPath);
            } else {
                showToast('Failed to create folder: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error creating folder:', error);
            showToast('Failed to create folder', 'error');
        }
    }
    
    refreshDirectory() {
        this.loadDirectory(this.currentPath);
    }
    
    getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'txt': '📝', 'doc': '📄', 'docx': '📄', 'pdf': '📕',
            'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️',
            'mp4': '🎥', 'avi': '🎥', 'mkv': '🎥',
            'mp3': '🎵', 'wav': '🎵', 'flac': '🎵',
            'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️',
            'exe': '⚙️', 'msi': '⚙️'
        };
        return icons[ext] || '📄';
    }
    
    formatSize(bytes) {
        if (!bytes) return '';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// Initialize custom directory selector
const customDirectorySelector = new CustomDirectorySelector();
window.customDirectorySelector = customDirectorySelector;

// Test function for directory selector modal
window.testDirectorySelector = function() {
    console.log('Testing directory selector modal...');
    showDirectorySelector('test-download-id', 'test-file.zip');
};

// Test function for view details functionality
window.testViewDetails = function() {
    console.log('Testing view details functionality...');
    
    // Check if releasesCache exists and has data
    console.log('ReleasesCache:', releasesCache);
    
    // Try to simulate a view details call
    const testTypes = ['fixes', 'tools', 'softwares'];
    
    testTypes.forEach(type => {
        const releases = releasesCache[type];
        if (releases && releases.length > 0) {
            console.log(`Found ${releases.length} releases for ${type}`);
            console.log('First release:', releases[0]);
            
            // Test viewing details of the first release
            try {
                viewReleaseDetails(type, releases[0].id);
                console.log(`Successfully called viewReleaseDetails for ${type}`);
                return;
            } catch (error) {
                console.error(`Error calling viewReleaseDetails for ${type}:`, error);
            }
        } else {
            console.log(`No releases found for ${type}`);
        }
    });
    
    console.log('Test complete');
};

// Global functions for HTML onclick events
window.closeCustomDirectorySelector = () => customDirectorySelector.close();
window.navigateToDirectory = (path) => customDirectorySelector.navigateToDirectory(path);
window.refreshDirectory = () => customDirectorySelector.refreshDirectory();
window.createNewFolder = () => customDirectorySelector.createNewFolder();
window.confirmDirectorySelection = confirmDirectorySelection;
window.cancelDirectorySelection = cancelDirectorySelection;
window.selectQuickPath = selectQuickPath;
window.selectCustomDirectory = selectCustomDirectory;
window.showDirectorySelector = showDirectorySelector;
window.loadGitHubConfig = loadGitHubConfig;

// Update System Variables
let currentUpdateData = null;
let updateCheckInterval = null;

// Automatic Update Checking
async function checkForUpdates(showNotification = false) {
    try {
        console.log('🔍 Starting update check...');
        
        if (!window.electronAPI) {
            console.log('❌ ElectronAPI not available, skipping update check');
            if (showNotification) {
                showToast('Update check not available in browser mode', 'warning');
            }
            return;
        }
        
        console.log('📡 Checking for updates via ElectronAPI...');
        const result = await window.electronAPI.checkForUpdates();
        console.log('📊 Update check result:', result);
        
        if (result.updateAvailable) {
            currentUpdateData = result;
            console.log(`✅ Update available: ${result.version}`);
            
            // Show downloading message
            showToast(`Update ${result.version} found! Downloading...`, 'info');
            
            // Always show update modal when update is available
            showUpdateModal(result);
        } else {
            console.log('✅ App is up to date');
            // Only show success message if manually requested
            if (showNotification) {
                showToast('Your app is up to date!', 'success');
            }
        }
    } catch (error) {
        console.error('❌ Update check failed:', error);
        if (showNotification) {
            showToast(`Failed to check for updates: ${error.message}`, 'error');
        }
    }
}

// Show Update Modal
function showUpdateModal(updateData) {
    try {
        const currentVersionEl = document.getElementById('currentVersion');
        const latestVersionEl = document.getElementById('latestVersion');
        const releaseNotesEl = document.getElementById('releaseNotes');
        
        if (currentVersionEl) currentVersionEl.textContent = appVersion || '2.1.0';
        if (latestVersionEl) latestVersionEl.textContent = updateData.version;
        
        if (releaseNotesEl) {
            if (updateData.releaseNotes && updateData.releaseNotes.trim()) {
                // Format the release notes
                const formattedNotes = updateData.releaseNotes
                    .replace(/#{1,6}\s/g, '') // Remove markdown headers
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
                    .replace(/\n/g, '<br>') // Line breaks
                    .replace(/^[-*+]\s/gm, '• '); // List items
                
                releaseNotesEl.innerHTML = formattedNotes;
            } else {
                releaseNotesEl.textContent = updateData.releaseName || `Version ${updateData.version}`;
            }
        }
        
        openModal('updateModal');
    } catch (error) {
        console.error('Error showing update modal:', error);
    }
}

// Start Update Process
async function startUpdate() {
    if (!currentUpdateData || !window.electronAPI) return;
    
    try {
        const updateBtn = document.getElementById('updateBtn');
        const updateProgress = document.getElementById('updateProgress');
        const updateActions = document.getElementById('updateActions');
        const updateStatus = document.getElementById('updateStatus');
        const updateProgressBar = document.getElementById('updateProgressBar');
        
        // Show progress and hide actions
        if (updateProgress) updateProgress.style.display = 'block';
        if (updateActions) updateActions.style.display = 'none';
        
        // Step 1: Download update
        console.log('📥 Downloading update...');
        showToast('Downloading update...', 'info');
        if (updateStatus) updateStatus.textContent = 'Downloading update...';
        if (updateProgressBar) updateProgressBar.style.width = '25%';
        
        const downloadResult = await window.electronAPI.downloadUpdate({
            downloadUrl: currentUpdateData.downloadUrl,
            version: currentUpdateData.version
        });
        
        if (!downloadResult.success) {
            throw new Error(downloadResult.error);
        }
        
        console.log('✅ Update downloaded successfully');
        showToast('Update downloaded! Preparing installation...', 'success');
        
        // Step 2: Prepare installation
        if (updateStatus) updateStatus.textContent = 'Preparing installation...';
        if (updateProgressBar) updateProgressBar.style.width = '75%';
        
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
        
        // Step 3: Install update
        console.log('🔧 Installing update...');
        showToast('Installing update automatically...', 'info');
        if (updateStatus) updateStatus.textContent = 'Installing update automatically...';
        if (updateProgressBar) updateProgressBar.style.width = '100%';
        
        const installResult = await window.electronAPI.installUpdate({
            filePath: downloadResult.filePath
        });
        
        if (!installResult.success) {
            throw new Error(installResult.error);
        }
        
        // Success - app will close automatically
        console.log('✅ Update installation started');
        showToast('Update is installing... App will restart shortly.', 'success');
        if (updateStatus) updateStatus.textContent = 'Update is installing... App will restart shortly.';
        
    } catch (error) {
        console.error('Update failed:', error);
        
        // Show error and restore UI
        const updateProgress = document.getElementById('updateProgress');
        const updateActions = document.getElementById('updateActions');
        
        if (updateProgress) updateProgress.style.display = 'none';
        if (updateActions) updateActions.style.display = 'flex';
        
        showToast(`Update failed: ${error.message}`, 'error');
    }
}

// Manual Update Check Function
async function manualUpdateCheck() {
    console.log('🔍 Manual update check requested');
    showToast('Checking for updates...', 'info');
    
    try {
        await checkForUpdates(true);
    } catch (error) {
        console.error('❌ Manual update check failed:', error);
        showToast('Update check failed. Please try again.', 'error');
    }
}

// Force update check (for testing)
window.forceUpdateCheck = async () => {
    console.log('🔍 Force update check requested');
    try {
        console.log('📡 Calling electronAPI.checkForUpdates()...');
        const result = await window.electronAPI.checkForUpdates();
        console.log('📊 Update check result:', result);
        
        if (result.updateAvailable) {
            console.log('✅ Update available!');
            showToast(`Update ${result.version} found!`, 'success');
            showUpdateModal(result);
        } else {
            console.log('ℹ️ No update available');
            showToast('No updates available', 'info');
        }
        
        return result;
    } catch (error) {
        console.error('❌ Force update check failed:', error);
        showToast(`Update check failed: ${error.message}`, 'error');
        return { error: error.message };
    }
};

// Test update system
window.testUpdateSystem = async () => {
    console.log('🧪 Testing update system...');
    
    // Test 1: Check if ElectronAPI is available
    console.log('ElectronAPI available:', !!window.electronAPI);
    if (window.electronAPI) {
        console.log('ElectronAPI methods:', Object.keys(window.electronAPI));
    }
    
    // Test 2: Force update check
    console.log('Running force update check...');
    const result = await window.forceUpdateCheck();
    console.log('Force update result:', result);
    
    console.log('🧪 Update system test complete');
};

// Update app version in about section
function updateAppVersion() {
    try {
        const versionElement = document.getElementById('app-version');
        if (versionElement) {
            versionElement.textContent = appVersion;
            console.log('App version updated in about section:', appVersion);
        }
    } catch (error) {
        console.error('Error updating app version:', error);
    }
}

// Setup GitHub link to open in app with back button
function setupGitHubLink() {
    try {
        const githubLink = document.getElementById('github-link');
        if (githubLink) {
            githubLink.onclick = (e) => {
                e.preventDefault();
                openGitHubInApp();
            };
            console.log('GitHub link setup complete');
        }
    } catch (error) {
        console.error('Error setting up GitHub link:', error);
    }
}

// Open GitHub in app with back button
function openGitHubInApp() {
    try {
        // Create GitHub view container
        const githubView = document.createElement('div');
        githubView.id = 'github-view';
        githubView.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--bg-gradient);
            z-index: 10000;
            display: flex;
            flex-direction: column;
        `;
        
        // Create header with back button
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 20px;
            border-bottom: 1px solid var(--stroke);
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        const title = document.createElement('h2');
        title.textContent = 'GitHub Repository';
        title.style.cssText = `
            margin: 0;
            color: var(--text);
            font-family: Orbitron, sans-serif;
        `;
        
        const backButton = document.createElement('button');
        backButton.textContent = '← Back to App';
        backButton.style.cssText = `
            background: linear-gradient(180deg, rgba(86,233,255,.4), rgba(10,16,30,.7));
            border: 1px solid var(--cyan);
            color: var(--cyan);
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            animation: glow 2s ease-in-out infinite alternate;
        `;
        
        // Add glow animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow {
                from { box-shadow: 0 0 5px var(--cyan); }
                to { box-shadow: 0 0 20px var(--cyan), 0 0 30px var(--cyan); }
            }
        `;
        document.head.appendChild(style);
        
        backButton.onclick = () => {
            document.body.removeChild(githubView);
            document.head.removeChild(style);
        };
        
        header.appendChild(title);
        header.appendChild(backButton);
        
        // Create iframe for GitHub
        const iframe = document.createElement('iframe');
        iframe.src = 'https://github.com/cwabaid/';
        iframe.style.cssText = `
            flex: 1;
            border: none;
            background: white;
        `;
        
        githubView.appendChild(header);
        githubView.appendChild(iframe);
        document.body.appendChild(githubView);
        
        console.log('GitHub opened in app');
    } catch (error) {
        console.error('Error opening GitHub in app:', error);
        // Fallback to external link
        window.open('https://github.com/cwabaid/', '_blank');
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing app...');
    
    // Initialize app without browser mode checks
    console.log('Initializing Crack World App...');
    
    // Initialize the app
    try {
        await initializeApp();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
});

// Download Page Management Functions
function setupDownloadPageControls() {
    try {
        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;
                filterDownloads(filter);
            });
        });
        
        // Bulk action buttons
        const pauseAllBtn = document.getElementById('pause-all-downloads');
        const resumeAllBtn = document.getElementById('resume-all-downloads');
        
        if (pauseAllBtn) {
            pauseAllBtn.addEventListener('click', () => pauseAllDownloads());
        }
        if (resumeAllBtn) {
            resumeAllBtn.addEventListener('click', () => resumeAllDownloads());
        }
        
        console.log('Download page controls setup complete');
    } catch (error) {
        console.error('Error setting up download page controls:', error);
    }
}

function updateDownloadsPage() {
    try {
        const downloadsContainer = document.getElementById('downloads-list-full');
        const emptyState = downloadsContainer?.querySelector('.empty-state');
        
        if (!downloadsContainer) return;
        
        const allDownloads = window.downloadManager.getAllDownloads();
        
        // Update statistics
        updateDownloadStats(allDownloads);
        
        if (allDownloads.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        // Clear existing downloads (except empty state)
        Array.from(downloadsContainer.children).forEach(child => {
            if (!child.classList.contains('empty-state')) {
                child.remove();
            }
        });
        
        // Add download entries
        allDownloads.forEach(download => {
            const entry = createDownloadEntry(download);
            downloadsContainer.appendChild(entry);
        });
        
    } catch (error) {
        console.error('Error updating downloads page:', error);
    }
}

function updateDownloadStats(downloads) {
    try {
        const stats = window.downloadManager.getDownloadStats();
        
        const activeCount = stats.activeDownloads;
        const queuedCount = stats.queuedDownloads;
        const completedCount = stats.completedDownloads;
        const failedCount = stats.failedDownloads;
        const totalCount = downloads.length;
        
        const activeEl = document.getElementById('active-downloads-count');
        const queuedEl = document.getElementById('queued-downloads-count');
        const totalEl = document.getElementById('total-downloads-count');
        const completedEl = document.getElementById('completed-downloads-count');
        const failedEl = document.getElementById('failed-downloads-count');
        const totalBytesEl = document.getElementById('total-bytes-downloaded');
        const averageSpeedEl = document.getElementById('average-download-speed');
        
        if (activeEl) activeEl.textContent = activeCount;
        if (queuedEl) queuedEl.textContent = queuedCount;
        if (totalEl) totalEl.textContent = totalCount;
        if (completedEl) completedEl.textContent = completedCount;
        if (failedEl) failedEl.textContent = failedCount;
        if (totalBytesEl) totalBytesEl.textContent = window.downloadManager.formatBytes(stats.totalBytesDownloaded);
        if (averageSpeedEl) averageSpeedEl.textContent = window.downloadManager.formatBytes(stats.averageSpeed) + '/s';
        
    } catch (error) {
        console.error('Error updating download stats:', error);
    }
}

function createDownloadEntry(download) {
    const entry = document.createElement('div');
    entry.className = `download-entry status-${download.status}`;
    entry.dataset.downloadId = download.id;
    
    // Format file size
    const formatSize = window.downloadManager.formatBytes;
    const sizeText = download.totalBytes > 0 
        ? `${formatSize(download.receivedBytes)}/${formatSize(download.totalBytes)}`
        : formatSize(download.receivedBytes || 0);
    
    // Calculate speed
    const speedText = download.speed > 0 ? `${formatSize(download.speed)}/s` : '';
    
    // Status icon
    const statusIcons = {
        downloading: '⬇️',
        completed: '✅',
        failed: '❌',
        paused: '⏸️',
        cancelled: '❌',
        queued: '⏳',
        starting: '🔄',
        retrying: '🔄'
    };
    
    const statusIcon = statusIcons[download.status] || '❓';
    
    entry.innerHTML = `
        <div class="download-entry-header">
            <div class="download-entry-info">
                <div class="download-entry-title">${statusIcon} ${download.fileName}</div>
                <div class="download-entry-meta">
                    <span>Status: ${download.status}</span>
                    <span>Size: ${sizeText}</span>
                    ${speedText ? `<span>Speed: ${speedText}</span>` : ''}
                    ${download.destination ? `<span>To: ${download.destination}</span>` : ''}
                </div>
            </div>
        </div>
        
        ${download.progress > 0 ? `
            <div class="download-entry-progress">
                <div class="download-progress-container">
                    <div class="download-progress-bar" style="width: ${download.progress}%"></div>
                </div>
                <div class="download-progress-text">
                    <span>${Math.round(download.progress)}%</span>
                    ${download.totalBytes > 0 ? `<span>${sizeText}</span>` : ''}
                </div>
            </div>
        ` : ''}
        
        ${download.extractionStatus && download.extractionStatus !== 'none' ? `
            <div class="download-extraction-status extraction-status-${download.extractionStatus}">
                📦 Extraction: ${download.extractionStatus}
                ${download.extractedPath ? ` → ${download.extractedPath}` : ''}
            </div>
        ` : ''}
        
        <div class="download-entry-controls">
            ${createDownloadControlButtons(download)}
        </div>
        
        ${download.destination ? `
            <div class="download-entry-path">${download.destination}/${download.fileName}</div>
        ` : ''}
    `;
    
    // Add event listeners to control buttons
    setupDownloadEntryControls(entry, download);
    
    return entry;
}

function createDownloadControlButtons(download) {
    const buttons = [];
    
    switch (download.status) {
        case 'downloading':
        case 'starting':
        case 'retrying':
            buttons.push('<button class="download-control-btn pause-btn" data-action="pause">⏸️ Pause</button>');
            buttons.push('<button class="download-control-btn cancel-btn" data-action="cancel">❌ Cancel</button>');
            break;
            
        case 'paused':
            buttons.push('<button class="download-control-btn resume-btn" data-action="resume">▶️ Resume</button>');
            buttons.push('<button class="download-control-btn cancel-btn" data-action="cancel">❌ Cancel</button>');
            break;
            
        case 'queued':
            buttons.push('<button class="download-control-btn pause-btn" data-action="pause">⏸️ Pause</button>');
            buttons.push('<button class="download-control-btn cancel-btn" data-action="cancel">❌ Cancel</button>');
            break;
            
        case 'completed':
        case 'failed':
        case 'cancelled':
            buttons.push('<button class="download-control-btn remove-btn" data-action="remove">🗑️ Remove</button>');
            break;
    }
    
    return buttons.join('');
}

function setupDownloadEntryControls(entry, download) {
    const buttons = entry.querySelectorAll('.download-control-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            const action = btn.dataset.action;
            
            try {
                let result;
                switch (action) {
                    case 'pause':
                        result = window.downloadManager.pauseDownload(download.id);
                        break;
                    case 'resume':
                        result = window.downloadManager.resumeDownload(download.id);
                        break;
                    case 'cancel':
                        result = window.downloadManager.cancelDownload(download.id);
                        break;
                    case 'remove':
                        result = removeDownload(download.id);
                        break;
                }
                
                if (result && !result.success) {
                    showToast(`Action failed: ${result.error}`, 'error');
                }
            } catch (error) {
                showToast(`Action failed: ${error.message}`, 'error');
            }
        });
    });
}

function removeDownload(downloadId) {
    try {
        console.log(`Attempting to remove download: ${downloadId}`);
        
        // Find the download in any collection
        let download = window.downloadManager.activeDownloads.get(downloadId) ||
                      window.downloadManager.pausedDownloads.get(downloadId) ||
                      window.downloadManager.downloadHistory.find(d => d.id === downloadId);
        
        if (!download) {
            console.log(`Download ${downloadId} not found in any collection`);
            return { success: false, error: 'Download not found' };
        }
        
        const fileName = download.fileName;
        console.log(`Found download to remove: ${fileName}`);
        
        // Cancel any active operations
        const controller = window.downloadManager.abortControllers.get(downloadId);
        if (controller) {
            controller.abort();
            window.downloadManager.abortControllers.delete(downloadId);
        }
        
        // Remove download animation if exists
        window.downloadManager.removeDownloadAnimation(downloadId);
        
        // Remove from ALL collections
        window.downloadManager.activeDownloads.delete(downloadId);
        window.downloadManager.pausedDownloads.delete(downloadId);
        
        // Remove from queue if present
        const queueIndex = window.downloadManager.downloadQueue.findIndex(d => d.id === downloadId);
        if (queueIndex !== -1) {
            window.downloadManager.downloadQueue.splice(queueIndex, 1);
        }
        
        // Remove from history
        const historyLength = window.downloadManager.downloadHistory.length;
        window.downloadManager.downloadHistory = window.downloadManager.downloadHistory.filter(
            d => d.id !== downloadId
        );
        const removedFromHistory = historyLength !== window.downloadManager.downloadHistory.length;
        
        console.log(`Removed from history: ${removedFromHistory}`);
        console.log(`Remaining downloads in history: ${window.downloadManager.downloadHistory.length}`);
        
        // Clean up any blob URLs
        if (download.blob) {
            try {
                URL.revokeObjectURL(download.blob);
            } catch (blobError) {
                console.warn('Error revoking blob URL:', blobError);
            }
        }
        
        // Save state and update UI
        window.downloadManager.saveState();
        window.downloadManager.updateUI();
        
        // Process next download in queue if needed
        if (window.downloadManager.processQueue) {
            window.downloadManager.processQueue();
        }
        
        showToast(`Removed: ${fileName}`, 'info');
        console.log(`Successfully removed download: ${fileName}`);
        return { success: true };
        
    } catch (error) {
        console.error('Error removing download:', error);
        showToast(`Failed to remove download: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

function filterDownloads(filter) {
    try {
        const entries = document.querySelectorAll('.download-entry');
        
        entries.forEach(entry => {
            const shouldShow = filter === 'all' || entry.classList.contains(`status-${filter}`);
            entry.style.display = shouldShow ? 'block' : 'none';
        });
        
    } catch (error) {
        console.error('Error filtering downloads:', error);
    }
}

function pauseAllDownloads() {
    try {
        const activeDownloads = Array.from(window.downloadManager.activeDownloads.values())
            .filter(d => ['downloading', 'starting', 'queued'].includes(d.status));
        
        if (activeDownloads.length === 0) {
            showToast('No active downloads to pause', 'info');
            return;
        }
        
        let pausedCount = 0;
        activeDownloads.forEach(download => {
            const result = window.downloadManager.pauseDownload(download.id);
            if (result.success) pausedCount++;
        });
        
        showToast(`Paused ${pausedCount} downloads`, 'success');
        
    } catch (error) {
        console.error('Error pausing all downloads:', error);
        showToast('Error pausing downloads', 'error');
    }
}

function resumeAllDownloads() {
    try {
        const pausedDownloads = Array.from(window.downloadManager.pausedDownloads.values())
            .concat(Array.from(window.downloadManager.activeDownloads.values())
                .filter(d => d.status === 'paused'));
        
        if (pausedDownloads.length === 0) {
            showToast('No paused downloads to resume', 'info');
            return;
        }
        
        let resumedCount = 0;
        pausedDownloads.forEach(download => {
            const result = window.downloadManager.resumeDownload(download.id);
            if (result.success) resumedCount++;
        });
        
        showToast(`Resumed ${resumedCount} downloads`, 'success');
        
    } catch (error) {
        console.error('Error resuming all downloads:', error);
        showToast('Error resuming downloads', 'error');
    }
}

// Setup event handlers for announcement admin panel
function setupAnnouncementEventHandlers() {
    try {
        const publishBtn = document.getElementById('publish-announcement-btn');
        const previewBtn = document.getElementById('preview-announcement-btn');
        const loadBtn = document.getElementById('load-announcements-btn');
        
        const tokenEl = document.getElementById('announcement-github-token');
        const repoEl = document.getElementById('announcement-repo');
        const titleEl = document.getElementById('announcement-title');
        const contentEl = document.getElementById('announcement-content-textarea');
        
        // Button event listeners
        if (publishBtn) {
            publishBtn.addEventListener('click', publishAnnouncement);
        }
        if (previewBtn) {
            previewBtn.addEventListener('click', previewAnnouncement);
        }
        if (loadBtn) {
            loadBtn.addEventListener('click', loadCurrentAnnouncements);
        }
        
        // Form validation on input
        const validateInputs = [tokenEl, repoEl, titleEl, contentEl];
        validateInputs.forEach(el => {
            if (el) {
                el.addEventListener('input', validateAnnouncementForm);
                el.addEventListener('change', validateAnnouncementForm);
            }
        });
        
        // Initial validation
        validateAnnouncementForm();
        
        console.log('Announcement event handlers setup complete');
        
    } catch (error) {
        console.error('Error setting up announcement event handlers:', error);
    }
}

// Make functions available globally
window.setupDownloadPageControls = setupDownloadPageControls;
window.updateDownloadsPage = updateDownloadsPage;

// Enhanced Download Management Functions
window.openDownloadSettings = function() {
    try {
        const modal = document.getElementById('download-settings-modal');
        if (modal) {
            // Populate current settings
            const settings = window.downloadManager.downloadSettings;
            document.getElementById('max-concurrent-downloads').value = window.downloadManager.maxConcurrentDownloads;
            document.getElementById('auto-retry').checked = settings.autoRetry;
            document.getElementById('max-retries').value = settings.maxRetries;
            document.getElementById('retry-delay').value = settings.retryDelay / 1000;
            document.getElementById('auto-extract').checked = settings.autoExtract;
            document.getElementById('delete-after-extract').checked = settings.deleteAfterExtract;
            document.getElementById('show-notifications').checked = settings.showNotifications;
            document.getElementById('remember-path').checked = settings.rememberPath;
            
            modal.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error opening download settings:', error);
        showToast('Failed to open download settings', 'error');
    }
};

window.saveDownloadSettings = function() {
    try {
        const newSettings = {
            autoRetry: document.getElementById('auto-retry').checked,
            maxRetries: parseInt(document.getElementById('max-retries').value),
            retryDelay: parseInt(document.getElementById('retry-delay').value) * 1000,
            autoExtract: document.getElementById('auto-extract').checked,
            deleteAfterExtract: document.getElementById('delete-after-extract').checked,
            showNotifications: document.getElementById('show-notifications').checked,
            rememberPath: document.getElementById('remember-path').checked
        };
        
        const maxConcurrent = parseInt(document.getElementById('max-concurrent-downloads').value);
        window.downloadManager.maxConcurrentDownloads = maxConcurrent;
        
        window.downloadManager.updateDownloadSettings(newSettings);
        
        // Close modal
        const modal = document.getElementById('download-settings-modal');
        if (modal) {
            modal.style.display = 'none';
        }
        
        showToast('Download settings saved successfully', 'success');
    } catch (error) {
        console.error('Error saving download settings:', error);
        showToast('Failed to save download settings', 'error');
    }
};

window.exportDownloadHistory = function() {
    try {
        window.downloadManager.exportDownloadHistory();
    } catch (error) {
        console.error('Error exporting download history:', error);
        showToast('Failed to export download history', 'error');
    }
};

window.importDownloadHistory = function() {
    try {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                window.downloadManager.importDownloadHistory(file);
            }
        };
        input.click();
    } catch (error) {
        console.error('Error importing download history:', error);
        showToast('Failed to import download history', 'error');
    }
};

window.clearAllDownloads = function() {
    try {
        if (confirm('Are you sure you want to clear all downloads? This action cannot be undone.')) {
            window.downloadManager.clearAllDownloads();
        }
    } catch (error) {
        console.error('Error clearing all downloads:', error);
        showToast('Failed to clear all downloads', 'error');
    }
};

window.clearCompletedDownloads = function() {
    try {
        if (confirm('Are you sure you want to clear all completed downloads?')) {
            window.downloadManager.clearCompletedDownloads();
        }
    } catch (error) {
        console.error('Error clearing completed downloads:', error);
        showToast('Failed to clear completed downloads', 'error');
    }
};

window.clearFailedDownloads = function() {
    try {
        if (confirm('Are you sure you want to clear all failed downloads?')) {
            window.downloadManager.clearFailedDownloads();
        }
    } catch (error) {
        console.error('Error clearing failed downloads:', error);
        showToast('Failed to clear failed downloads', 'error');
    }
};
window.pauseAllDownloads = pauseAllDownloads;
window.resumeAllDownloads = resumeAllDownloads;
window.publishAnnouncement = publishAnnouncement;
window.previewAnnouncement = previewAnnouncement;
window.loadCurrentAnnouncements = loadCurrentAnnouncements;
window.confirmClearAllDownloads = () => {
    try {
        window.downloadManager.clearAll();
        closeModal('clearDownloadsModal');
        showToast('All downloads cleared', 'success');
    } catch (error) {
        console.error('Error clearing all downloads:', error);
        showToast('Error clearing downloads', 'error');
    }
};

// Installed Games Management
async function scanInstalledGames() {
    try {
        const gamesList = document.getElementById('installed-games-list');
        if (!gamesList) {
            console.error('Installed games list element not found');
            return;
        }
        
        // Show loading state
        gamesList.innerHTML = '<div class="loading-placeholder">🔍 Scanning for installed games...</div>';
        
        let installedGames = [];
        
        console.log('🔍 Starting game detection...');
        console.log('Electron API available:', !!window.electronAPI);
        console.log('detectInstalledGames available:', !!(window.electronAPI && window.electronAPI.detectInstalledGames));
        
        // Always try to scan games using full system scan
        if (window.electronAPI && window.electronAPI.detectInstalledGames) {
            try {
                console.log('🎮 Using Electron API for comprehensive game detection...');
                const result = await window.electronAPI.detectInstalledGames();
                console.log('📊 Full system scan result:', result);
                
                if (result && result.success && result.games) {
                    installedGames = result.games;
                    console.log(`✅ Full system scan completed: Found ${installedGames.length} games`);
                } else {
                    console.warn('⚠️ Full system scan failed:', result?.error);
                    console.log('🔄 Trying browser-based fallback detection...');
                    installedGames = await detectGamesFromRegistry();
                }
            } catch (error) {
                console.error('❌ Full system scan error:', error);
                console.log('🔄 Trying browser-based fallback detection...');
                installedGames = await detectGamesFromRegistry();
            }
        } else {
            console.log('⚠️ Electron API not available, using browser-based detection...');
            installedGames = await detectGamesFromRegistry();
        }
        
        console.log(`📋 Total games found: ${installedGames.length}`);
        console.log('Games:', installedGames.map(g => g.name));
        
        // Display the games
        await displayInstalledGames(installedGames);
        
    } catch (error) {
        console.error('❌ Error scanning installed games:', error);
        const gamesList = document.getElementById('installed-games-list');
        if (gamesList) {
            gamesList.innerHTML = `
                <div class="empty-state">
                    <h3>❌ Scan Failed</h3>
                    <p>Failed to scan for installed games: ${error.message}</p>
                    <button class="btn" onclick="scanInstalledGames()">🔄 Try Again</button>
                </div>
            `;
        }
    }
}

async function scanCommonGameDirectories() {
    console.log('🔍 This function is deprecated - using full system scan instead');
    return [];
}

// Browser-based game detection (fallback)
async function detectGamesFromRegistry() {
    console.log('🔍 Attempting browser-based game detection...');
    const games = [];
    
    // This is a fallback that provides some common game names
    // In a real implementation, this would try to access game registry data
    const commonGames = [
        { name: 'Steam', path: 'C:\\Program Files (x86)\\Steam', platform: 'Steam' },
        { name: 'Epic Games Launcher', path: 'C:\\Program Files (x86)\\Epic Games', platform: 'Epic' },
        { name: 'Origin', path: 'C:\\Program Files (x86)\\Origin Games', platform: 'Origin' },
        { name: 'Ubisoft Connect', path: 'C:\\Program Files (x86)\\Ubisoft', platform: 'Ubisoft' }
    ];
    
    // Check if these common launchers exist (this is a simplified check)
    for (const game of commonGames) {
        try {
            // In a browser environment, we can't actually check file system
            // But we can provide a helpful message
            games.push({
                name: game.name,
                path: game.path,
                platform: game.platform,
                detected: false,
                note: 'Launcher detected (requires Electron for full game detection)'
            });
        } catch (error) {
            console.log(`Could not detect ${game.name}:`, error.message);
        }
    }
    
    console.log(`📊 Browser-based detection found ${games.length} launchers`);
    return games;
}

// Display installed games with Get Fix buttons
async function displayInstalledGames(games) {
    const gamesList = document.getElementById('installed-games-list');
    if (!gamesList) return;
    
    if (games.length === 0) {
        gamesList.innerHTML = `
            <div class="empty-state">
                <h3>🎮 No Games Found</h3>
                <p>No installed games detected on your system.</p>
                <p style="color: var(--muted); font-size: 12px; margin-top: 10px;">Make sure games are installed in common locations like Steam, Epic Games, Origin, etc.</p>
                <button class="btn" onclick="scanInstalledGames()">🔄 Scan Again</button>
            </div>
        `;
        return;
    }
    
    // Clear the list first
    gamesList.innerHTML = '<div class="loading-placeholder">📊 Checking for available fixes...</div>';
    
    // Ensure fixes are loaded before checking matches
    await ensureFixesLoaded();
    
    // Create game cards
    gamesList.innerHTML = '';
    
    const gameCardsContainer = document.createElement('div');
    gameCardsContainer.style.display = 'grid';
    gameCardsContainer.style.gap = '12px';
    
    let gamesWithFixes = 0;
    games.forEach(game => {
        console.log(`📋 Displaying game: "${game.name}" (${game.platform}) at ${game.path}`);
        console.log(`📁 Path type: ${typeof game.path}, Path length: ${game.path ? game.path.length : 'null'}`);
        console.log(`📁 Path exists: ${game.path ? 'checking...' : 'null path'}`);
        
        const gameCard = createGameCard(game);
        gameCardsContainer.appendChild(gameCard);
        
        // Count games with available fixes
        const availableFix = findAvailableFixForGame(game.name);
        if (availableFix) {
            console.log(`✅ Fix available for "${game.name}": ${availableFix.name}`);
            gamesWithFixes++;
        } else {
            console.log(`❌ No fix available for "${game.name}"`);
        }
    });
    
    // Add summary header
    const summaryDiv = document.createElement('div');
    summaryDiv.style.cssText = `
        padding: 12px 16px;
        background: rgba(86, 233, 255, 0.1);
        border: 1px solid rgba(86, 233, 255, 0.3);
        border-radius: 8px;
        margin-bottom: 16px;
        text-align: center;
    `;
    summaryDiv.innerHTML = `
        <h3 style="margin: 0 0 8px 0; color: var(--cyan); font-family: Orbitron, sans-serif;">
            📊 Scan Results
        </h3>
        <p style="margin: 0; color: var(--text); font-size: 14px;">
            Found <strong>${games.length}</strong> installed games • 
            <span style="color: #00ff88;">${gamesWithFixes}</span> have fixes available
        </p>
    `;
    
    gamesList.appendChild(summaryDiv);
    gamesList.appendChild(gameCardsContainer);
}

// Ensure fixes are loaded before checking matches
async function ensureFixesLoaded() {
    if (!releasesCache['fixes'] || releasesCache['fixes'].length === 0) {
        console.log('Loading fixes for matching...');
        try {
            await displayReleases('fixes'); // This will load and cache fixes
            // Wait a moment for the cache to be populated
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.warn('Could not load fixes for matching:', error);
        }
    }
}

// Create game card with conditional Get Fix button
function createGameCard(game) {
    const card = document.createElement('div');
    card.className = 'game-card';
    
    console.log(`🎮 Creating card for game: "${game.name}" (${game.platform})`);
    
    // Check if fix is available for this game
    const availableFix = findAvailableFixForGame(game.name);
    
    const lastPlayedText = game.lastPlayed ? 
        formatRelativeTime(game.lastPlayed.getTime()) : 'Never';
    
    console.log(`🎮 Creating card for game: "${game.name}" (${game.platform})`);
    console.log(`📁 Game path for Open Folder button: "${game.path}"`);
    console.log(`📁 Path type: ${typeof game.path}`);
    
    card.innerHTML = `
        <div class="game-card-content">
            <div class="game-icon">🎮</div>
            <div class="game-info">
                <h4 class="game-name">${game.name}</h4>
                <div class="game-meta">
                    <span class="game-platform">${game.platform}</span>
                    <span class="game-size">${game.size}</span>
                    <span class="game-last-played">Last played: ${lastPlayedText}</span>
                </div>
                <div class="game-path" title="${game.path}">
                    📁 ${game.path}
                </div>
            </div>
            <div class="game-actions">
                <button class="btn open-folder-btn" data-game-path="${game.path}" onclick="openGameFolderFromButton(this)" title="Open game folder">
                    <span>📁</span> Open Folder
                </button>
                ${availableFix ? `
                    <button class="btn get-fix-btn" onclick="openGameFixDetails('${game.name}', ${availableFix.id})">
                        <span>🔧</span> Get Fix
                    </button>
                    <div class="fix-info" title="Fix available: ${availableFix.name}">
                        ✅ Fix Available
                    </div>
                ` : `
                    <div class="no-fix-info">
                        ❌ No Fix Available
                    </div>
                `}
            </div>
        </div>
    `;
    
    return card;
}

// Open game folder from button click (handles data attribute)
function openGameFolderFromButton(button) {
    const gamePath = button.getAttribute('data-game-path');
    if (gamePath) {
        openGameFolder(gamePath);
    } else {
        showToast('No game path found', 'error');
    }
}

// Make function globally available
window.openGameFolderFromButton = openGameFolderFromButton;

// Open game folder using the enhanced openFolder functionality
async function openGameFolder(gamePath) {
    try {
        console.log('Opening game folder:', gamePath);
        
        if (!gamePath) {
            showToast('No game path provided', 'error');
            return;
        }
        
        // Use the enhanced openPath function from Electron API
        if (window.electronAPI && window.electronAPI.openPath) {
            const result = await window.electronAPI.openPath(gamePath);
            if (result && result.success) {
                showToast(`Opened folder: ${gamePath}`, 'success');
            } else {
                showToast(`Failed to open folder: ${result?.error || 'Unknown error'}`, 'error');
            }
        } else {
            // Fallback for browser mode
            showToast('Folder opening not available in browser mode', 'warning');
        }
    } catch (error) {
        console.error('Error opening game folder:', error);
        showToast(`Failed to open folder: ${error.message}`, 'error');
    }
}

// Make function globally available
window.openGameFolder = openGameFolder;

// Find available fix for a game using strict matching criteria
function findAvailableFixForGame(gameName) {
    try {
        const fixes = releasesCache['fixes'] || [];
        if (fixes.length === 0) {
            console.log('No fixes available in cache');
            return null;
        }
        
        console.log(`Searching for fix matching game: "${gameName}"`);
        
        // Use strict matching to find genuine fixes
        let bestMatch = null;
        let bestScore = 0;
        let matchReason = '';
        
        fixes.forEach(fix => {
            const fixName = fix.name || fix.tag_name || '';
            const fixBody = fix.body || '';
            const searchableContent = `${fixName} ${fixBody}`.toLowerCase();
            const gameNameLower = gameName.toLowerCase();
            
            // 1. EXACT NAME MATCH (highest confidence)
            if (fixName.toLowerCase() === gameNameLower) {
                bestMatch = fix;
                bestScore = 1.0;
                matchReason = 'exact name match';
                return;
            }
            
            // 2. EXACT SUBSTRING MATCH in fix name
            if (fixName.toLowerCase().includes(gameNameLower) || gameNameLower.includes(fixName.toLowerCase())) {
                if (bestScore < 0.95) {
                    bestMatch = fix;
                    bestScore = 0.95;
                    matchReason = 'substring match in name';
                }
                return;
            }
            
            // 3. ABBREVIATION MATCHING (only for well-known games)
            const gameAbbrevs = generateAbbreviations(gameName);
            const fixAbbrevs = generateAbbreviations(fixName);
            
            for (const gameAbbrev of gameAbbrevs) {
                if (gameAbbrev.length >= 3) { // Only consider abbreviations 3+ chars
                    // Check if abbreviation appears prominently in fix name
                    if (fixName.toLowerCase().includes(gameAbbrev) || 
                        fixAbbrevs.includes(gameAbbrev)) {
                        if (bestScore < 0.85) {
                            bestMatch = fix;
                            bestScore = 0.85;
                            matchReason = `abbreviation match: ${gameAbbrev}`;
                        }
                    }
                }
            }
            
            // 4. KEY WORDS MATCHING (must match significant words)
            const gameWords = gameName.toLowerCase().split(/\s+/).filter(word => 
                word.length > 3 && !['the', 'and', 'for', 'with'].includes(word)
            );
            
            if (gameWords.length > 0) {
                const matchingWords = gameWords.filter(word => 
                    searchableContent.includes(word)
                );
                
                const wordMatchRatio = matchingWords.length / gameWords.length;
                if (wordMatchRatio >= 0.7 && bestScore < 0.8) { // At least 70% of key words must match
                    bestMatch = fix;
                    bestScore = 0.75 + (wordMatchRatio * 0.1);
                    matchReason = `key words match: ${matchingWords.join(', ')}`;
                }
            }
            
            // 5. HIGH SIMILARITY FUZZY MATCH (strict threshold)
            const similarity = calculateSimilarity(gameNameLower, fixName.toLowerCase());
            if (similarity >= 0.8 && similarity > bestScore) { // High threshold for fuzzy matching
                bestMatch = fix;
                bestScore = similarity;
                matchReason = `fuzzy match (${(similarity * 100).toFixed(1)}%)`;
            }
        });
        
        // Only return match if confidence is high enough (90%) AND fix has downloadable assets
        if (bestMatch && bestScore >= 0.90) {
            // Verify fix has actual downloadable content
            if (!bestMatch.assets || bestMatch.assets.length === 0) {
                console.log(`Fix found for "${gameName}" but no downloadable assets available`);
                return null;
            }
            
            console.log(`✅ Fix found for "${gameName}": "${bestMatch.name}" (score: ${(bestScore * 100).toFixed(1)}%, reason: ${matchReason})`);
            return bestMatch;
        }
        
        console.log(`❌ No suitable fix found for "${gameName}" (best score: ${(bestScore * 100).toFixed(1)}%, required: 90%)`);
        return null;
        
    } catch (error) {
        console.error('Error finding fix for game:', error);
        return null;
    }
}

// Open fix details page for a specific game
function openGameFixDetails(gameName, fixId) {
    try {
        console.log(`Opening fix details for ${gameName} (ID: ${fixId})`);
        
        const fixes = releasesCache['fixes'] || [];
        const fix = fixes.find(f => f.id === fixId);
        
        if (!fix) {
            showToast('Fix not found', 'error');
            return;
        }
        
        // Use the existing viewReleaseDetails function to show fix details
        viewReleaseDetails('fixes', fixId);
        
    } catch (error) {
        console.error('Error opening fix details:', error);
        showToast(`Failed to open fix details: ${error.message}`, 'error');
    }
}

// Make function globally available
window.openGameFixDetails = openGameFixDetails;

// Download fix for a specific game (kept for backward compatibility)
async function downloadGameFix(gameName, fixId) {
    try {
        console.log(`Downloading fix for ${gameName} (ID: ${fixId})`);
        
        const fixes = releasesCache['fixes'] || [];
        const fix = fixes.find(f => f.id === fixId);
        
        if (!fix) {
            showToast('Fix not found', 'error');
            return;
        }
        
        if (!fix.assets || fix.assets.length === 0) {
            showToast('No downloadable files available for this fix', 'warning');
            return;
        }
        
        showToast(`Starting download: ${fix.name}`, 'info');
        
        // Download all assets for this fix
        for (const asset of fix.assets) {
            if (asset && asset.browser_download_url && asset.name) {
                await window.downloadManager.startDownload(
                    asset.browser_download_url,
                    asset.name,
                    null,
                    { priority: 'high', showDirectorySelector: false, silentExtraction: true }
                );
            }
        }
        
        showToast(`Fix download started for ${gameName}`, 'success');
        
    } catch (error) {
        console.error('Error downloading game fix:', error);
        showToast(`Failed to download fix: ${error.message}`, 'error');
    }
}


// Offline Activations Management
async function loadOfflineActivations() {
    try {
        const activationsList = document.getElementById('activations-list');
        if (!activationsList) {
            console.error('Activations list element not found');
            return;
        }
        
        // Show loading state
        activationsList.innerHTML = '<div class="loading-placeholder">🔍 Searching for avilable activations...</div>';
        
        // Load activations from cw.activations repository
        try {
            // First try to get from configured repository
            const activationsRepo = getActivationsRepository();
            
            if (activationsRepo) {
                // Load from configured repository
                await loadActivationsFromRepository(activationsRepo);
            } else {
                // Default to cw.activations repository
                await fetchActivationsFromCW();
            }
            
            const activations = releasesCache['activations'] || [];
            
            if (activations.length === 0) {
                activationsList.innerHTML = `
                    <div class="empty-state">
                        <h3>🔑 No Activations Found</h3>
                        <p>No offline activations are currently available in the repository.</p>
                        <button class="btn" onclick="loadOfflineActivations()">🔄 Refresh</button>
                    </div>
                `;
                return;
            }
            
            // Display activations
            displayActivations(activations);
            
        } catch (error) {
            console.error('Error loading activations:', error);
            activationsList.innerHTML = `
                <div class="empty-state">
                    <h3>❌ Load Failed</h3>
                    <p>Failed to load offline activations: ${error.message}</p>
                    <button class="btn" onclick="loadOfflineActivations()">🔄 Try Again</button>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error in loadOfflineActivations:', error);
    }
}

// Get activations repository from config
function getActivationsRepository() {
    try {
        // Try to get from saved configuration
        const savedConfig = localStorage.getItem('githubConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            return config.activationsRepo || null;
        }
        
        // Fallback to default or empty
        return null;
    } catch (error) {
        console.error('Error getting activations repository:', error);
        return null;
    }
}

// Load activations from specific repository
async function loadActivationsFromRepository(repo) {
    try {
        const [owner, repository] = repo.split('/');
        if (!owner || !repository) {
            throw new Error('Invalid repository format. Expected: owner/repository');
        }
        
        // Use the new fetchRepositoryFiles function (root directory)
        const result = await fetchRepositoryFiles(owner, repository);
        
        if (result && result.success) {
            releasesCache['activations'] = result.files || [];
        } else {
            throw new Error(result?.error || 'Failed to fetch activations');
        }
    } catch (error) {
        console.error('Error loading activations from repository:', error);
        throw error;
    }
}

// Fetch activations from cw.activations repository
async function fetchActivationsFromCW() {
    try {
        console.log('Fetching activations from cw.activations repository...');
        
        // Fetch files from the root directory of the repository
        const result = await fetchRepositoryFiles('cwabaid', 'cw.activations');
        
        if (result && result.success) {
            releasesCache['activations'] = result.files || [];
            console.log('Successfully fetched activations:', result.files?.length || 0);
            return result.files || [];
        } else {
            throw new Error(result?.error || 'Failed to fetch activations from cw.activations');
        }
    } catch (error) {
        console.error('Error fetching activations from cw.activations:', error);
        throw error;
    }
}

// Fetch files from repository folder
async function fetchRepositoryFiles(owner, repo, folder = '') {
    try {
        console.log(`Fetching files from ${owner}/${repo}/${folder || 'root'}...`);
        
        // Get the repository contents for the root directory (or specified folder)
        const url = folder ? 
            `https://api.github.com/repos/${owner}/${repo}/contents/${folder}` : 
            `https://api.github.com/repos/${owner}/${repo}/contents`;
        
        const response = await fetch(url, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'CrackWorld-App'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                // Folder doesn't exist yet, return empty array
                return { success: true, files: [] };
            }
            throw new Error(`GitHub API Error: ${response.status} - ${response.statusText}`);
        }
        
        const contents = await response.json();
        console.log('Repository contents:', contents);
        
        // Filter for JSON files only (not directories)
        const files = contents.filter(item => item.type === 'file' && item.name.endsWith('.json'));
        console.log('Filtered JSON files:', files);
        
        // Transform to activation format
        const activations = await Promise.all(files.map(async file => {
            let activationData = null;
            let bannerImage = null;
            
            // If it's a JSON file, try to fetch and parse the content
            if (file.name.endsWith('.json')) {
                try {
                    const response = await fetch(file.download_url);
                    if (response.ok) {
                        const jsonContent = await response.text();
                        activationData = JSON.parse(jsonContent);
                        bannerImage = activationData.bannerImage;
                    }
                } catch (error) {
                    console.log(`Could not parse JSON file ${file.name}:`, error);
                }
            }
            
            const activation = {
                id: file.sha,
                name: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
                tag_name: file.name,
                published_at: file.last_modified || new Date().toISOString(),
                body: 'Offline activations are currently available only through our Discord server. Please visit our Discord server to get your offline activation.',
                bannerImage: bannerImage,
                activationData: activationData
            };
            
            console.log('Created activation:', {
                id: activation.id,
                name: activation.name,
                bannerImage: activation.bannerImage
            });
            
            return activation;
        }));
        
        return { success: true, files: activations };
        
    } catch (error) {
        console.error('Error fetching repository files:', error);
        return { success: false, error: error.message };
    }
}

// Display offline activations
function displayActivations(activations) {
    const activationsList = document.getElementById('activations-list');
    if (!activationsList) return;
    
    activationsList.innerHTML = '';
    
    const activationsContainer = document.createElement('div');
    activationsContainer.style.display = 'grid';
    activationsContainer.style.gap = '12px';
    
    activations.forEach(activation => {
        const activationCard = createActivationCard(activation);
        activationsContainer.appendChild(activationCard);
    });
    
    activationsList.appendChild(activationsContainer);
}

// Create activation card with image banner
function createActivationCard(activation) {
    const card = document.createElement('div');
    card.className = 'activation-card';
    
    const publishedDate = activation.published_at ? 
        formatRelativeTime(new Date(activation.published_at).getTime()) : 'Unknown';
    
    // For JSON files, try to get banner image from the file content
    let imageUrl = null;
    let activationData = null;
    
    // If it's a JSON file, try to fetch and parse the content
    if (activation.tag_name && activation.tag_name.endsWith('.json')) {
        try {
            // Try to get banner image from the JSON content if available
            if (activation.bannerImage) {
                imageUrl = activation.bannerImage;
            }
        } catch (error) {
            console.log('Could not parse JSON content for banner image');
        }
    } else {
        // Fallback to extracting from description
        imageUrl = extractImageFromDescription(activation.body);
    }
    
    card.innerHTML = `
        ${imageUrl ? `
            <div class="activation-banner" style="
                height: 120px;
                background: linear-gradient(135deg, var(--cyan), var(--purple));
                background-image: url('${imageUrl}');
                background-size: cover;
                background-position: center;
                background-blend-mode: overlay;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 8px 8px 0 0;
            ">
                <div style="
                    background: rgba(0, 0, 0, 0.7);
                    padding: 8px 16px;
                    border-radius: 20px;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
                ">
                    🔑 ${activation.name || activation.tag_name}
                </div>
            </div>
        ` : ''}
        
        <div class="activation-card-content">
            ${!imageUrl ? `
                <div class="activation-icon">🔑</div>
            ` : ''}
            <div class="activation-info">
                ${!imageUrl ? `
                    <h4 class="activation-name">${activation.name || activation.tag_name}</h4>
                ` : ''}
                <div class="activation-meta">
                    <span class="activation-version">${activation.tag_name}</span>
                    <span class="activation-date">${publishedDate}</span>
                </div>
                <div class="activation-description">
                    Offline activations are currently available only through our Discord server. Please visit our Discord server to get your offline activation.
                </div>
                <div class="activation-status" style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 8px;
                ">
                    <span style="color: var(--cyan); font-size: 12px; font-weight: 600;">
                        💬 Discord Only
                    </span>
                </div>
            </div>
            <div class="activation-actions">
                <button class="btn details-btn" onclick="openActivationDetails('${activation.id}')" title="View activation details">
                    <span>📋</span> Details
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// Extract image URL from description
function extractImageFromDescription(description) {
    if (!description) return null;
    
    // Look for image URLs in the description
    const imageRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|bmp|svg)(?:\?[^\s]*)?)/gi;
    const matches = description.match(imageRegex);
    
    if (matches && matches.length > 0) {
        return matches[0]; // Return the first image found
    }
    
    return null;
}

// Open activation details
function openActivationDetails(activationId) {
    try {
        console.log('Opening activation details for ID:', activationId);
        const activations = releasesCache['activations'] || [];
        console.log('Available activations:', activations.map(a => ({ id: a.id, name: a.name })));
        
        const activation = activations.find(a => a.id === activationId);
        console.log('Found activation:', activation);
        
        if (!activation) {
            console.error('Activation not found for ID:', activationId);
            showToast('Activation not found', 'error');
            return;
        }
        
        // Hide the offline activations tab content
        const offlineActivationsTab = document.getElementById('offline-activations-tab');
        if (offlineActivationsTab) {
            offlineActivationsTab.style.display = 'none';
        }
        
        // Create full page details view
        const detailsPage = document.createElement('div');
        detailsPage.id = 'activation-details-page';
        detailsPage.className = 'activation-details-page';
        detailsPage.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--ink);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        `;
        
        detailsPage.innerHTML = `
            <div class="activation-details-header" style="
                padding: 20px;
                background: linear-gradient(135deg, var(--cyan), var(--purple));
                color: white;
                display: flex;
                align-items: center;
                justify-content: space-between;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 600;">
                        🔑 ${activation.name || activation.tag_name}
                    </h1>
                    <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">
                        Version: ${activation.tag_name} | Published: ${activation.published_at ? new Date(activation.published_at).toLocaleDateString() : 'Unknown'}
                    </p>
                </div>
                <button onclick="closeActivationDetails()" style="
                    background: rgba(255,255,255,0.2);
                    border: 1px solid rgba(255,255,255,0.3);
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                " onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    ← Back to List
                </button>
            </div>
            
            <div class="activation-details-content" style="
                flex: 1;
                padding: 40px 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: calc(100vh - 100px);
            ">
                <div class="discord-message-container" style="
                    max-width: 600px;
                    width: 100%;
                    text-align: center;
                    background: linear-gradient(135deg, rgba(86,233,255,0.1), rgba(138,43,226,0.1));
                    border: 1px solid var(--cyan);
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 8px 32px rgba(86,233,255,0.2);
                ">
                    <div class="discord-icon" style="
                        font-size: 64px;
                        margin-bottom: 20px;
                        animation: pulse 2s infinite;
                    ">💬</div>
                    
                    <h2 style="
                        color: var(--cyan);
                        margin: 0 0 16px 0;
                        font-size: 28px;
                        font-weight: 700;
                        text-shadow: 0 0 20px rgba(86,233,255,0.5);
                    ">Offline Activations Available via Discord</h2>
                    
                    <p style="
                        color: var(--text);
                        font-size: 16px;
                        line-height: 1.6;
                        margin: 0 0 30px 0;
                        opacity: 0.9;
                    ">Offline activations are currently available only through our Discord server. Please visit our Discord server to get your offline activation.</p>
                    
                    <button onclick="openDiscordServer()" style="
                        background: linear-gradient(135deg, var(--cyan), var(--purple));
                        border: none;
                        color: white;
                        padding: 16px 32px;
                        border-radius: 12px;
                        font-size: 18px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        box-shadow: 0 4px 20px rgba(86,233,255,0.4);
                        display: inline-flex;
                        align-items: center;
                        gap: 10px;
                    " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 25px rgba(86,233,255,0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 20px rgba(86,233,255,0.4)'">
                        <span>🚀</span> Join Discord Server
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(detailsPage);
        
    } catch (error) {
        console.error('Error opening activation details:', error);
        showToast('Failed to open activation details', 'error');
    }
}

// Close activation details and return to list
function closeActivationDetails() {
    try {
        const detailsPage = document.getElementById('activation-details-page');
        if (detailsPage) {
            detailsPage.remove();
        }
        
        // Show the offline activations tab content again
        const offlineActivationsTab = document.getElementById('offline-activations-tab');
        if (offlineActivationsTab) {
            offlineActivationsTab.style.display = 'block';
        }
    } catch (error) {
        console.error('Error closing activation details:', error);
    }
}

// Make closeActivationDetails globally available
window.closeActivationDetails = closeActivationDetails;

// Open Discord server
function openDiscordServer() {
    try {
        const discordLink = 'https://discord.com/channels/1311229995787747339/1418663020023910400';
        
        if (window.electronAPI && window.electronAPI.openExternal) {
            window.electronAPI.openExternal(discordLink);
        } else {
            window.open(discordLink, '_blank');
        }
        
        showToast('Opening Discord server...', 'info');
    } catch (error) {
        console.error('Error opening Discord server:', error);
        showToast('Failed to open Discord server', 'error');
    }
}


// Setup activations upload functionality
function setupActivationsUpload() {
    try {
        console.log('Setting up activations upload...');
        
        // Upload activations button
        const uploadActivationsBtn = document.getElementById('upload-activations-btn');
        if (uploadActivationsBtn) {
            console.log('Found upload activations button');
            console.log('Button initial disabled state:', uploadActivationsBtn.disabled);
            console.log('Button element:', uploadActivationsBtn);
            
            uploadActivationsBtn.addEventListener('click', () => {
                console.log('Upload activations button clicked');
                uploadManager.startUpload('activations');
            });
        } else {
            console.error('Upload activations button not found');
        }
        
        // Clear activations form button
        const clearActivationsBtn = document.getElementById('clear-activations-form');
        if (clearActivationsBtn) {
            console.log('Found clear activations button');
            clearActivationsBtn.addEventListener('click', () => {
                console.log('Clear activations button clicked');
                uploadManager.clearForm('activations');
            });
        } else {
            console.error('Clear activations button not found');
        }
        
        // No file upload needed for JSON-only activations
        
        // No form validation for activations - button is always enabled
        
        console.log('✅ Activations upload setup complete');
        
        // No form validation needed for activations
        
    } catch (error) {
        console.error('Error setting up activations upload:', error);
    }
}

// Handle activations files
function handleActivationsFiles(files) {
    try {
        const validFiles = [];
        
        Array.from(files).forEach(file => {
            if (file.size > 500 * 1024 * 1024) { // 500MB limit for activations
                showToast(`File too large: ${file.name} (max 500MB)`, 'error');
                return;
            }
            
            validFiles.push(file);
        });
        
        if (validFiles.length > 0) {
            addActivationsFilesToList(validFiles);
            showToast(`Added ${validFiles.length} activation file(s)`, 'success');
        }
    } catch (error) {
        console.error('Error handling activations files:', error);
        showToast('Error processing files', 'error');
    }
}

// Add activations files to list
function addActivationsFilesToList(files) {
    const fileList = document.getElementById('activations-file-list');
    if (!fileList) return;
    
    files.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--stroke);
            border-radius: 6px;
            margin-bottom: 8px;
        `;
        
        fileItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 16px;">🔑</span>
                <span style="font-weight: 500;">${file.name}</span>
                <span style="color: var(--muted); font-size: 12px;">(${formatFileSize(file.size)})</span>
            </div>
            <button onclick="removeActivationsFile(this)" style="background: none; border: none; color: var(--muted); cursor: pointer; padding: 4px;">❌</button>
        `;
        
        fileItem.file = file;
        fileList.appendChild(fileItem);
    });
    
    // Update upload button state
    const uploadBtn = document.getElementById('upload-activations-btn');
    if (uploadBtn) {
        uploadBtn.disabled = false;
    }
}

// Remove activations file
function removeActivationsFile(button) {
    const fileItem = button.parentElement;
    fileItem.remove();
    
    // Check if any files remain
    const fileList = document.getElementById('activations-file-list');
    const remainingFiles = fileList.querySelectorAll('.file-item');
    
    const uploadBtn = document.getElementById('upload-activations-btn');
    if (uploadBtn) {
        uploadBtn.disabled = remainingFiles.length === 0;
    }
}


// Make functions globally available
window.scanInstalledGames = scanInstalledGames;
window.openGameFolder = openGameFolder;
window.downloadGameFix = downloadGameFix;
window.findAvailableFixForGame = findAvailableFixForGame;
window.openGameFixDetails = openGameFixDetails;

// Denuvo Token Console Management
let tokenGeneratorProcess = null;
let consoleOutput = [];

// Initialize Denuvo Token Console
function initializeDenuvoTokenConsole() {
    console.log('🎫 Initializing Denuvo Token Console...');
    
    // Setup console event listeners
    const consoleInput = document.getElementById('console-input');
    const sendButton = document.getElementById('send-command');
    const clearButton = document.getElementById('clear-console');
    const exportButton = document.getElementById('export-console');
    
    if (consoleInput && sendButton) {
        // Send command on Enter key
        consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendConsoleCommand();
            }
        });
        
        // Send command on button click
        sendButton.addEventListener('click', sendConsoleCommand);
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', clearConsole);
    }
    
    if (exportButton) {
        exportButton.addEventListener('click', exportConsoleOutput);
    }
    
    // Start the token generator process
    startTokenGenerator();
    
    // Setup event listeners for token generator output
    if (window.electronAPI && window.electronAPI.onTokenGeneratorOutput) {
        window.electronAPI.onTokenGeneratorOutput((data) => {
            addConsoleLine(data, 'info');
        });
    }
    
    if (window.electronAPI && window.electronAPI.onTokenGeneratorError) {
        window.electronAPI.onTokenGeneratorError((data) => {
            addConsoleLine(data, 'error');
        });
    }
}

// Start the token generator executable
async function startTokenGenerator() {
    try {
        console.log('🎫 Starting token_generator.exe...');
        addConsoleLine('Starting Token Generator...', 'info');
        
        if (window.electronAPI && window.electronAPI.startTokenGenerator) {
            const result = await window.electronAPI.startTokenGenerator();
            if (result.success) {
                addConsoleLine('Token Generator started successfully', 'info');
                addConsoleLine('Ready to process denuvo tickets...', 'info');
            } else {
                addConsoleLine(`Failed to start Token Generator: ${result.error}`, 'error');
            }
        } else {
            addConsoleLine('Token Generator API not available', 'error');
        }
    } catch (error) {
        console.error('Error starting token generator:', error);
        addConsoleLine(`Error starting Token Generator: ${error.message}`, 'error');
    }
}

// Send command to console
async function sendConsoleCommand() {
    const consoleInput = document.getElementById('console-input');
    if (!consoleInput) return;
    
    const command = consoleInput.value.trim();
    if (!command) return;
    
    // Add user input to console
    addConsoleLine(`> ${command}`, 'info');
    consoleInput.value = '';
    
    try {
        if (window.electronAPI && window.electronAPI.sendTokenGeneratorCommand) {
            const result = await window.electronAPI.sendTokenGeneratorCommand(command);
            
            if (result.success) {
                if (result.output) {
                    addConsoleLine(result.output, 'info');
                }
            } else {
                addConsoleLine(`Error: ${result.error}`, 'error');
            }
        } else {
            addConsoleLine('Token Generator API not available', 'error');
        }
    } catch (error) {
        console.error('Error sending command:', error);
        addConsoleLine(`Error: ${error.message}`, 'error');
    }
}

// Add line to console output (raw CMD style)
function addConsoleLine(text, type = 'info') {
    const consoleOutput = document.getElementById('token-console');
    if (!consoleOutput) return;
    
    // Create a pre element to preserve whitespace and formatting
    const line = document.createElement('pre');
    line.className = 'console-line';
    line.style.color = '#00ff00'; // Green text like CMD
    line.style.margin = '0';
    line.style.padding = '0';
    line.style.fontFamily = 'Consolas, "Courier New", monospace';
    line.style.fontSize = '13px';
    line.style.lineHeight = '1.2';
    line.style.whiteSpace = 'pre-wrap';
    line.style.wordWrap = 'break-word';
    
    // Add the text exactly as received (no formatting)
    line.textContent = text;
    
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
    
    // Store in console output array
    window.consoleOutput = window.consoleOutput || [];
    window.consoleOutput.push({ text, type, timestamp: new Date().toISOString() });
}

// Clear console
function clearConsole() {
    const consoleOutput = document.getElementById('token-console');
    if (consoleOutput) {
        consoleOutput.innerHTML = `
            <div class="console-line">Microsoft Windows [Version 10.0.19045.3693]</div>
            <div class="console-line">(c) Microsoft Corporation. All rights reserved.</div>
            <div class="console-line"></div>
            <div class="console-line">C:\\&gt; token_generator.exe</div>
        `;
    }
    window.consoleOutput = [];
}

// Export console output
async function exportConsoleOutput() {
    try {
        if (window.electronAPI && window.electronAPI.exportConsoleOutput) {
            const result = await window.electronAPI.exportConsoleOutput(window.consoleOutput || []);
            if (result.success) {
                showToast('Console output exported successfully', 'success');
            } else {
                showToast(`Export failed: ${result.error}`, 'error');
            }
        } else {
            showToast('Export functionality not available', 'error');
        }
    } catch (error) {
        console.error('Error exporting console:', error);
        showToast(`Export error: ${error.message}`, 'error');
    }
}

// Make functions globally available
window.initializeDenuvoTokenConsole = initializeDenuvoTokenConsole;
window.sendConsoleCommand = sendConsoleCommand;
window.clearConsole = clearConsole;
window.exportConsoleOutput = exportConsoleOutput;
// Enhanced Window Control Functions
function minimizeWindow() {
    console.log('minimizeWindow called');
    console.log('electronAPI available:', !!window.electronAPI);
    console.log('windowMinimize available:', !!(window.electronAPI && window.electronAPI.windowMinimize));
    
    if (window.electronAPI && window.electronAPI.windowMinimize) {
        try {
            window.electronAPI.windowMinimize();
            console.log('Window minimize request sent');
            // Add visual feedback
            showWindowControlFeedback('minimize');
        } catch (error) {
            console.error('Error minimizing window:', error);
            showToast('Failed to minimize window', 'error');
            showWindowControlFeedback('minimize', 'error');
        }
    } else {
        console.log('Electron API not available for minimize');
        showToast('Window controls not available', 'warning');
        showWindowControlFeedback('minimize', 'error');
    }
}

function maximizeWindow() {
    console.log('maximizeWindow called');
    console.log('electronAPI available:', !!window.electronAPI);
    console.log('windowMaximize available:', !!(window.electronAPI && window.electronAPI.windowMaximize));
    
    if (window.electronAPI && window.electronAPI.windowMaximize) {
        try {
            window.electronAPI.windowMaximize();
            console.log('Window maximize request sent');
            // Add visual feedback
            showWindowControlFeedback('maximize');
        } catch (error) {
            console.error('Error maximizing window:', error);
            showToast('Failed to maximize window', 'error');
            showWindowControlFeedback('maximize', 'error');
        }
    } else {
        console.log('Electron API not available for maximize');
        showToast('Window controls not available', 'warning');
        showWindowControlFeedback('maximize', 'error');
    }
}

function closeWindow() {
    console.log('closeWindow called');
    console.log('electronAPI available:', !!window.electronAPI);
    console.log('windowClose available:', !!(window.electronAPI && window.electronAPI.windowClose));
    
    if (window.electronAPI && window.electronAPI.windowClose) {
        try {
            window.electronAPI.windowClose();
            console.log('Window close request sent');
            // Add visual feedback
            showWindowControlFeedback('close');
        } catch (error) {
            console.error('Error closing window:', error);
            showToast('Failed to close window', 'error');
            showWindowControlFeedback('close', 'error');
        }
    } else {
        console.log('Electron API not available for close');
        showToast('Window controls not available', 'warning');
        showWindowControlFeedback('close', 'error');
    }
}

// Additional window control functions
function toggleMaximize() {
    if (window.electronAPI && window.electronAPI.windowMaximize) {
        try {
            window.electronAPI.windowMaximize();
            showWindowControlFeedback('toggle-maximize');
        } catch (error) {
            console.error('Error toggling maximize:', error);
            showToast('Failed to toggle maximize', 'error');
        }
    }
}

function restoreWindow() {
    if (window.electronAPI && window.electronAPI.windowMaximize) {
        try {
            window.electronAPI.windowMaximize();
            showWindowControlFeedback('restore');
        } catch (error) {
            console.error('Error restoring window:', error);
            showToast('Failed to restore window', 'error');
        }
    }
}

function showWindowControlFeedback(action, type = 'success') {
    try {
        const button = document.querySelector(`.${action}-btn`);
        if (button) {
            // Add pressed class for visual feedback
            button.classList.add('pressed');
            
            // Add success/error class based on type
            if (type === 'success') {
                button.classList.add('success');
            } else if (type === 'error') {
                button.classList.add('error');
            }
            
            // Remove classes after animation
            setTimeout(() => {
                button.classList.remove('pressed', 'success', 'error');
            }, 300);
        }
    } catch (error) {
        console.error('Error showing window control feedback:', error);
    }
}

// Window state management
let windowState = {
    isMaximized: false,
    isMinimized: false,
    isFullscreen: false
};

function updateWindowState(state) {
    windowState = { ...windowState, ...state };
    console.log('Window state updated:', windowState);
}

function getWindowState() {
    return windowState;
}

// Keyboard shortcuts for window controls
function setupWindowControlShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Alt + F4 for close
        if (e.altKey && e.key === 'F4') {
            e.preventDefault();
            console.log('Alt+F4 pressed - closing window');
            closeWindow();
        }
        // Alt + F9 for minimize
        if (e.altKey && e.key === 'F9') {
            e.preventDefault();
            console.log('Alt+F9 pressed - minimizing window');
            minimizeWindow();
        }
        // Alt + F10 for maximize
        if (e.altKey && e.key === 'F10') {
            e.preventDefault();
            console.log('Alt+F10 pressed - maximizing window');
            maximizeWindow();
        }
        // Alt + F11 for toggle maximize
        if (e.altKey && e.key === 'F11') {
            e.preventDefault();
            console.log('Alt+F11 pressed - toggling maximize');
            toggleMaximize();
        }
    });
    
    console.log('Window control keyboard shortcuts enabled');
    console.log('Available shortcuts: Alt+F4 (close), Alt+F9 (minimize), Alt+F10 (maximize), Alt+F11 (toggle)');
}

// Make all functions globally available
window.loadOfflineActivations = loadOfflineActivations;
window.openActivationDetails = openActivationDetails;
window.openDiscordServer = openDiscordServer;
window.removeActivationsFile = removeActivationsFile;

// Window Control Functions (Global)
window.minimizeWindow = minimizeWindow;
window.maximizeWindow = maximizeWindow;
window.closeWindow = closeWindow;
window.toggleMaximize = toggleMaximize;
window.restoreWindow = restoreWindow;
window.showWindowControlFeedback = showWindowControlFeedback;
window.updateWindowState = updateWindowState;
window.getWindowState = getWindowState;
window.setupWindowControlShortcuts = setupWindowControlShortcuts;

// Test function to check Electron API
window.testElectronAPI = function() {
    console.log('=== Electron API Test ===');
    console.log('window.electronAPI exists:', !!window.electronAPI);
    console.log('Available methods:', window.electronAPI ? Object.keys(window.electronAPI) : 'None');
    
    if (window.electronAPI) {
        console.log('windowMinimize:', typeof window.electronAPI.windowMinimize);
        console.log('windowMaximize:', typeof window.electronAPI.windowMaximize);
        console.log('windowClose:', typeof window.electronAPI.windowClose);
    }
    
    console.log('=== End Test ===');
    return !!window.electronAPI;
};

console.log('Crack World renderer loaded successfully');
