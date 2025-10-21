// main.js - Working Implementation
import { app, BrowserWindow, ipcMain, shell, dialog, session } from 'electron';
import { spawn } from 'child_process';
import path from 'path';
import extract from "extract-zip";
import fs from 'fs-extra';
import { Octokit } from '@octokit/rest';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
let isInstallerMode = false;

// Check if running as installer
if (process.argv.includes('--installer') || process.env.NODE_ENV === 'installer') {
  isInstallerMode = true;
}

const createWindow = () => {
  // Configure window based on mode
  const windowConfig = {
    width: isInstallerMode ? 1200 : 1200,
    height: isInstallerMode ? 800 : 800,
    minWidth: isInstallerMode ? 800 : 940,
    minHeight: isInstallerMode ? 600 : 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, isInstallerMode ? 'installer-preload.js' : 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    webSecurity: true,
    allowRunningInsecureContent: false,
    enableRemoteModule: false,
    sandbox: false
    },
    icon: path.join(__dirname, 'build/icon.png'),
    titleBarStyle: 'hidden',
    backgroundColor: isInstallerMode ? '#0a0a0f' : '#050a15',
    show: false,
    transparent: isInstallerMode,
    resizable: !isInstallerMode
  };

  mainWindow = new BrowserWindow(windowConfig);

  // Set Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'self\' \'unsafe-inline\' \'unsafe-eval\' data: blob: https:; script-src \'self\' \'unsafe-inline\' \'unsafe-eval\' https://cdnjs.cloudflare.com; style-src \'self\' \'unsafe-inline\' https://fonts.googleapis.com; img-src \'self\' data: https:; connect-src \'self\' https:; font-src \'self\' https://fonts.gstatic.com;']
      }
    });
  });

  // Load appropriate HTML file
  const htmlFile = isInstallerMode ? 'installer.html' : 'index.html';
  mainWindow.loadFile(htmlFile);
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
  
  // Setup download handler after window is created
  setupDownloadHandler();
  
  mainWindow.on('closed', () => {
    mainWindow = null;
    activeDownloadItems.clear();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

app.whenReady().then(() => {
  createWindow();
  
  const ses = session.defaultSession;
  ses.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['downloads'];
    callback(allowedPermissions.includes(permission));
  });
}).catch(err => console.error('app.whenReady error:', err));
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Enhanced Extraction System
const silentExtractAndCleanup = async (filePath, destination) => {
  if (!await fs.pathExists(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  const st = await fs.stat(filePath);
  if (st.isDirectory()) {
    throw new Error(`Expected archive file, found directory: ${filePath}`);
  }

  const ext = path.extname(filePath).toLowerCase();
  console.log(`🔧 Extracting ${filePath} to ${destination} (${ext})`);
  
  try {
    if (ext === '.zip') {
      await extract(filePath, { dir: destination });
    } else {
      throw new Error(`Unsupported archive format: ${ext}`);
    }

    await flattenExtractedContents(destination);
    await fs.remove(filePath);
    console.log(`✅ Extraction complete, archive deleted: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Extraction failed:`, error);
    throw error;
  }
}

const flattenExtractedContents = async (destination) => {
  try {
    const contents = await fs.readdir(destination);
    
    if (contents.length === 1) {
      const single = path.join(destination, contents[0]);
      const stat = await fs.stat(single);
      
      if (stat.isDirectory()) {
        console.log(`📁 Flattening root folder: ${contents[0]}`);
        const inner = await fs.readdir(single);
        
        for (const file of inner) {
          const sourcePath = path.join(single, file);
          const destPath = path.join(destination, file);
          
          if (await fs.pathExists(destPath)) {
            await fs.remove(destPath);
          }
          
          await fs.move(sourcePath, destPath);
        }
        
        await fs.remove(single);
        console.log(`✅ Successfully flattened ${contents[0]}`);
      }
    } else {
      console.log(`📁 No flattening needed - ${contents.length} items in root`);
    }
  } catch (error) {
    console.warn('⚠️ Could not flatten extracted contents:', error.message);
  }
}

// Game Scanning Functionality
ipcMain.handle('scan-installed-games', async (event) => {
    try {
        console.log('🎮 Starting real game scan...');
        const installedGames = await scanForInstalledGames();
        console.log(`✅ Found ${installedGames.length} installed games:`, installedGames.map(g => g.name));
        return { success: true, games: installedGames };
    } catch (error) {
        console.error('❌ Error scanning for games:', error);
        return { success: false, error: error.message, games: [] };
    }
});

// Scan specific directory for games
ipcMain.handle('scan-directory', async (event, directoryPath) => {
    try {
        console.log(`🔍 Scanning directory: ${directoryPath}`);
        if (!await fs.pathExists(directoryPath)) {
            return [];
        }
        
        const games = await scanGameDirectory(directoryPath, 'custom');
        console.log(`✅ Found ${games.length} games in ${directoryPath}`);
        return games;
    } catch (error) {
        console.error(`❌ Error scanning directory ${directoryPath}:`, error);
        return [];
    }
});

// Simplified game scanning - Default Store Directories Only
const scanForInstalledGames = async () => {
    const foundGames = [];
    console.log('🔍 Starting simplified game scan (store directories only)...');
    
    // Only scan default store directories
    const storePaths = getDefaultStorePaths();
    console.log(`📁 Scanning ${storePaths.length} default store directories...`);
    
    for (const pathInfo of storePaths) {
        try {
            console.log(`🔍 Checking if directory exists: ${pathInfo.path}`);
            if (await fs.pathExists(pathInfo.path)) {
                console.log(`✅ Directory exists: ${pathInfo.path}`);
                console.log(`📁 Directory path type: ${typeof pathInfo.path}`);
                console.log(`📁 Directory path normalized: ${pathInfo.path.replace(/\\/g, '\\\\')}`);
                console.log(`🔍 Scanning ${pathInfo.platform} directory: ${pathInfo.path}`);
                const games = await scanGameDirectory(pathInfo.path, pathInfo.platform);
                console.log(`📊 Scan result: ${games.length} games found in ${pathInfo.platform}`);
                foundGames.push(...games);
                console.log(`✅ Total games so far: ${foundGames.length}`);
            } else {
                console.log(`⚠️ Directory not found: ${pathInfo.path}`);
            }
        } catch (error) {
            console.warn(`❌ Error scanning ${pathInfo.platform} directory:`, error.message);
            console.error(`❌ Full error:`, error);
        }
    }
    
    // Remove duplicates and sort
    const uniqueGames = removeDuplicateGames(foundGames);
    console.log(`🎮 Total unique games found: ${uniqueGames.length}`);
    return uniqueGames.sort((a, b) => a.name.localeCompare(b.name));
}

// Get default store directories only - Simplified
const getDefaultStorePaths = () => {
    const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
    const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';
    
    return [
        // Steam - Default locations only
        { path: path.join(programFilesX86, 'Steam', 'steamapps', 'common'), platform: 'Steam' },
        { path: path.join(programFiles, 'Steam', 'steamapps', 'common'), platform: 'Steam' },
        { path: 'C:\\Steam\\steamapps\\common', platform: 'Steam' },
        
        // Epic Games - Default locations only
        { path: path.join(programFiles, 'Epic Games'), platform: 'Epic Games' },
        { path: path.join(programFilesX86, 'Epic Games'), platform: 'Epic Games' },
        
        // Origin/EA - Default locations only
        { path: path.join(programFiles, 'Origin Games'), platform: 'Origin' },
        { path: path.join(programFilesX86, 'Origin Games'), platform: 'Origin' },
        { path: path.join(programFiles, 'EA Games'), platform: 'EA Games' },
        { path: path.join(programFilesX86, 'EA Games'), platform: 'EA Games' },
        
        // Ubisoft - Default locations only
        { path: path.join(programFiles, 'Ubisoft'), platform: 'Ubisoft' },
        { path: path.join(programFilesX86, 'Ubisoft'), platform: 'Ubisoft' },
        { path: path.join(programFiles, 'Ubisoft Game Launcher', 'games'), platform: 'Ubisoft' },
        
        // GOG - Default locations only
        { path: path.join(programFiles, 'GOG Galaxy', 'Games'), platform: 'GOG' },
        { path: path.join(programFilesX86, 'GOG.com'), platform: 'GOG' },
        { path: 'C:\\GOG Games', platform: 'GOG' },
        
        // Rockstar - Default locations only
        { path: path.join(programFiles, 'Rockstar Games'), platform: 'Rockstar' },
        { path: path.join(programFilesX86, 'Rockstar Games'), platform: 'Rockstar' },
        
        // Battle.net - Default locations only
        { path: path.join(programFiles, 'Battle.net'), platform: 'Battle.net' },
        { path: path.join(programFilesX86, 'Battle.net'), platform: 'Battle.net' },
        
        // Microsoft Store Games
        { path: path.join(programFiles, 'WindowsApps'), platform: 'Microsoft Store' }
    ];
}

// Registry scanning removed - causes issues and is not reliable for game detection

// Scan user directories for games
const scanUserDirectories = async () => {
    const games = [];
    const userProfile = process.env.USERPROFILE || 'C:\\Users\\Default';
    const userPaths = [
        path.join(userProfile, 'Documents', 'My Games'),
        path.join(userProfile, 'Documents', 'Games'),
        path.join(userProfile, 'Downloads'),
        path.join(userProfile, 'Desktop'),
        path.join(userProfile, 'Games'),
        path.join(userProfile, 'AppData', 'Local', 'Programs'),
        path.join(userProfile, 'AppData', 'Roaming', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
    ];
    
    for (const userPath of userPaths) {
        try {
            if (await fs.pathExists(userPath)) {
                console.log(`🔍 Scanning user directory: ${userPath}`);
                const userGames = await scanGameDirectory(userPath, 'User Directory');
                games.push(...userGames);
            }
        } catch (error) {
            console.log(`Could not scan user directory ${userPath}:`, error.message);
        }
    }
    return games;
}

// Scan additional drives for games (with WMIC fallback)
const scanAdditionalDrives = async () => {
    const games = [];
    let drives = [];
    
    try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        // Try WMIC first
        try {
            console.log('🔍 Attempting to get drives via WMIC...');
            const { stdout } = await execAsync('wmic logicaldisk get caption');
            drives = stdout.split('\n')
                .filter(line => line.includes(':'))
                .map(line => line.trim().split(' ')[0])
                .filter(drive => drive && drive !== 'C:' && drive.length === 2);
            console.log(`✅ Found drives via WMIC: ${drives.join(', ')}`);
        } catch (wmicError) {
            console.log('⚠️ WMIC not available, trying alternative method...');
            
            // Fallback: Try PowerShell
            try {
                const { stdout } = await execAsync('powershell "Get-WmiObject -Class Win32_LogicalDisk | Select-Object -ExpandProperty DeviceID"');
                drives = stdout.split('\n')
                    .filter(line => line.includes(':'))
                    .map(line => line.trim())
                    .filter(drive => drive && drive !== 'C:' && drive.length === 2);
                console.log(`✅ Found drives via PowerShell: ${drives.join(', ')}`);
            } catch (psError) {
                console.log('⚠️ PowerShell not available, using manual drive detection...');
                
                // Manual fallback: Check common drive letters
                const commonDrives = ['D:', 'E:', 'F:', 'G:', 'H:', 'I:', 'J:', 'K:', 'L:', 'M:', 'N:', 'O:', 'P:', 'Q:', 'R:', 'S:', 'T:', 'U:', 'V:', 'W:', 'X:', 'Y:', 'Z:'];
                drives = [];
                
                for (const drive of commonDrives) {
                    try {
                        if (await fs.pathExists(drive + '\\')) {
                            drives.push(drive);
                        }
                    } catch (error) {
                        // Drive doesn't exist or is inaccessible
                    }
                }
                console.log(`✅ Found drives via manual detection: ${drives.join(', ')}`);
            }
        }
        
        // Scan each drive for games
        for (const drive of drives) {
            const gamePaths = [
                path.join(drive, 'Games'),
                path.join(drive, 'Steam'),
                path.join(drive, 'steamapps', 'common'),
                path.join(drive, 'Epic Games'),
                path.join(drive, 'Origin Games'),
                path.join(drive, 'Program Files'),
                path.join(drive, 'Program Files (x86)'),
                path.join(drive, 'GOG Games'),
                path.join(drive, 'Ubisoft'),
                path.join(drive, 'Rockstar Games')
            ];
            
            for (const gamePath of gamePaths) {
                try {
                    if (await fs.pathExists(gamePath)) {
                        console.log(`🔍 Scanning drive directory: ${gamePath}`);
                        const driveGames = await scanGameDirectory(gamePath, `Drive ${drive}`);
                        games.push(...driveGames);
                    }
                } catch (error) {
                    console.log(`Could not scan ${gamePath}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.warn('Error scanning additional drives:', error.message);
    }
    return games;
}

// Scan a specific directory for games
const scanGameDirectory = async (dirPath, platform) => {
    const games = [];
    
    try {
        console.log(`📁 Reading directory: ${dirPath}`);
        const items = await fs.readdir(dirPath);
        console.log(`📁 Found ${items.length} items in ${dirPath}`);
        
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            
            try {
                const stat = await fs.stat(itemPath);
                
                if (stat.isDirectory()) {
                    console.log(`🔍 Analyzing directory: ${item}`);
                    console.log(`📁 Item path: "${itemPath}"`);
                    console.log(`📁 Item path type: ${typeof itemPath}`);
                    console.log(`📁 Item path normalized: ${itemPath.replace(/\\/g, '\\\\')}`);
                    const gameInfo = await analyzeGameDirectory(itemPath, item, platform);
                    if (gameInfo) {
                        console.log(`✅ Game detected: ${gameInfo.name}`);
                        console.log(`📁 Game path: "${gameInfo.path}"`);
                        games.push(gameInfo);
                    } else {
                        console.log(`❌ Not a game: ${item}`);
                    }
                } else {
                    console.log(`📄 File found: ${item}`);
                }
            } catch (error) {
                console.log(`⚠️ Could not access ${item}: ${error.message}`);
                continue;
            }
        }
    } catch (error) {
        console.warn(`❌ Could not read directory ${dirPath}:`, error.message);
    }
    
    console.log(`📊 Total games found in ${dirPath}: ${games.length}`);
    return games;
}

// Analyze a directory to determine if it's a game
const analyzeGameDirectory = async (dirPath, dirName, platform) => {
    try {
        // Very minimal filtering for store directories
        const skipDirs = [
            'common redistributables', 'redist', 'redistributables', 
            '_commonredist', 'directx', 'vcredist', 'dotnet'
        ];
        
        const lowerDirName = dirName.toLowerCase();
        
        // Skip only the most obvious non-game directories
        if (skipDirs.some(skip => lowerDirName.includes(skip))) {
            console.log(`⚠️ Skipping redistributable directory: ${dirName}`);
            return null;
        }
        
        // For store directories, be very lenient - accept almost all directories
        console.log(`🔍 Checking directory: ${dirName} in ${platform}`);
        
        const files = await fs.readdir(dirPath);
        
        // Very lenient executable detection for store directories
        const gameExecutables = files.filter(file => {
            const lowerFile = file.toLowerCase();
            return lowerFile.endsWith('.exe') && 
                   !lowerFile.includes('unin') && // Skip uninstallers
                   !lowerFile.includes('setup') &&
                   !lowerFile.includes('installer');
        });
        
        console.log(`📁 Found ${files.length} files, ${gameExecutables.length} executables in ${dirName}`);
        
        // Very lenient game file detection for store directories
        if (gameExecutables.length === 0) {
            // For store directories, check if there are any files at all
            const hasAnyFiles = files.length > 0;
            
            if (!hasAnyFiles) {
                console.log(`⚠️ Directory ${dirName} is empty, skipping`);
            return null;
            } else {
                console.log(`✅ Directory ${dirName} has files, including as potential game`);
            }
        } else {
            console.log(`✅ Directory ${dirName} has ${gameExecutables.length} executables, including as game`);
        }
        
        // Additional game detection - look for game-specific files
        const gameFileIndicators = [
            '.pak', '.unity3d', '.assets', '.resource', '.data',
            'save', 'config', 'settings', 'profile', 'character',
            'world', 'level', 'map', 'mission', 'campaign',
            'game', 'play', 'battle', 'war', 'combat', 'fight',
            'adventure', 'quest', 'story', 'legend', 'myth',
            'space', 'galaxy', 'star', 'planet', 'alien',
            'zombie', 'monster', 'dragon', 'magic', 'spell',
            'city', 'empire', 'civilization', 'kingdom', 'castle',
            'puzzle', 'mystery', 'detective', 'crime', 'thief',
            'simulation', 'sim', 'tycoon', 'manager', 'builder',
            'strategy', 'tactics', 'warfare', 'conquest',
            'rpg', 'role', 'character', 'hero', 'adventurer',
            'shooter', 'fps', 'tps', 'action', 'platform',
            'racing', 'driving', 'car', 'vehicle', 'motor',
            'flying', 'flight', 'pilot', 'aircraft', 'plane',
            'sailing', 'ship', 'boat', 'naval', 'pirate',
            'survival', 'craft', 'build', 'create', 'design'
        ];
        
        const hasGameFiles = files.some(file => {
            const lowerFile = file.toLowerCase();
            return gameFileIndicators.some(indicator => 
                lowerFile.includes(indicator) || lowerFile.endsWith(indicator)
            );
        });
        
        // No size validation for store directories - accept all directories with files
        console.log(`✅ Accepting directory ${dirName} as potential game`);
        
        // Get directory size
        let totalSize = 0;
        try {
            totalSize = await getDirectorySize(dirPath);
        } catch (error) {
            totalSize = 0;
        }
        
        // Get last modified time as approximation for last played
        const stat = await fs.stat(dirPath);
        
        const cleanedName = cleanGameName(dirName);
        console.log(`🎮 Game detected: "${dirName}" -> "${cleanedName}" (${platform})`);
        console.log(`📁 Full path: "${dirPath}"`);
        console.log(`📁 Path type: ${typeof dirPath}`);
        console.log(`📁 Path length: ${dirPath.length}`);
        console.log(`📁 Path exists check: ${await fs.pathExists(dirPath)}`);
        
        // Use the original directory name if cleaning made it too short or empty
        const displayName = (cleanedName && cleanedName.length > 2) ? cleanedName : dirName;
        
        // Ensure the path is properly normalized for Windows
        let normalizedPath = dirPath.replace(/\//g, '\\');
        
        // Note: Removed aggressive path normalization that was corrupting paths
        
        const gameInfo = {
            name: displayName,
            path: normalizedPath,
            size: formatBytes(totalSize),
            sizeBytes: totalSize,
            lastPlayed: stat.mtime,
            platform: platform,
            executable: files.find(f => f.toLowerCase().endsWith('.exe'))
        };
        
        console.log(`📋 Returning game info with normalized path:`, gameInfo);
        return gameInfo;
        
    } catch (error) {
        return null;
    }
}

// Get directory size (with reasonable limits to avoid hanging)
const getDirectorySize = async (dirPath) => {
    let totalSize = 0;
    const MAX_FILES = 1000; // Limit to prevent hanging on huge directories
    let fileCount = 0;
    
    try {
        const files = await fs.readdir(dirPath);
        
        for (const file of files) {
            if (fileCount >= MAX_FILES) break;
            
            try {
                const filePath = path.join(dirPath, file);
                const stat = await fs.stat(filePath);
                
                if (stat.isFile()) {
                    totalSize += stat.size;
                    fileCount++;
                } else if (stat.isDirectory() && fileCount < MAX_FILES / 2) {
                    // Recursively get size of subdirectories (limited)
                    const subSize = await getDirectorySize(filePath);
                    totalSize += subSize;
                    fileCount += 50; // Approximate file count for subdirs
                }
            } catch (error) {
                // Skip inaccessible files
                continue;
            }
        }
    } catch (error) {
        // Return 0 if can't read directory
        return 0;
    }
    
    return totalSize;
}

// Clean up game names - be more conservative
const cleanGameName = (rawName) => {
    // Only remove very obvious non-essential suffixes, keep important parts
    let cleaned = rawName
        .replace(/\s*\([^)]*\)$/g, '') // Remove parentheses at end like "(2023)"
        .replace(/^(The\s+)/i, '') // Remove "The " prefix
        .replace(/\s+(Game|GOTY|Deluxe|Ultimate|Premium|Standard|Edition)$/i, '') // Remove edition suffixes
        .trim();
    
    // Don't remove version numbers or numbers that are part of the game name
    // Don't be too aggressive with capitalization
    
    return cleaned || rawName; // Fallback to original if cleaning resulted in empty string
}

// Remove duplicate games (same name, keep the one with larger size)
const removeDuplicateGames = (games) => {
    const gameMap = new Map();
    
    games.forEach(game => {
        const key = game.name.toLowerCase();
        const existing = gameMap.get(key);
        
        if (!existing || game.sizeBytes > existing.sizeBytes) {
            gameMap.set(key, game);
        }
    });
    
    return Array.from(gameMap.values());
}

// Format bytes to human readable
const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Manifest Generation
ipcMain.handle('generate-manifest', async (event, appId) => {
    try {
        if (!appId) throw new Error('AppID is required');
        console.log(`Generating manifest for AppID: ${appId}`);
        const manifestUrl = `https://codeload.github.com/SteamAutoCracks/ManifestHub/zip/refs/heads/${appId}`;
        const tempDir = path.join(app.getPath('temp'), 'crackworld-manifests');
        const extractDir = path.join(tempDir, appId);
        const zipPath = path.join(tempDir, `${appId}.zip`);
        await fs.ensureDir(tempDir);
        console.log(`Downloading manifest from: ${manifestUrl}`);
        const response = await fetch(manifestUrl);
        if (!response.ok) {
            if (response.status === 404) throw new Error(`Manifest not found for AppID: ${appId}. This AppID may not be supported.`);
            throw new Error(`Failed to download manifest: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        await fs.writeFile(zipPath, buffer);
        console.log(`Manifest ZIP saved to: ${zipPath}`);
        await fs.ensureDir(extractDir);
        await extract(zipPath, { dir: extractDir });
        await flattenExtractedContents(extractDir);
        const steamappsPath = await findSteamappsDirectory(extractDir);
        await fs.remove(zipPath);
        console.log(`✅ Manifest generation completed for AppID: ${appId}`);
        return { success: true, message: `Manifest successfully generated for AppID: ${appId}`, extractDir: steamappsPath || extractDir, appId: appId };
    } catch (error) {
        console.error('Manifest generation failed:', error);
        return { success: false, error: error.message };
    }
});

const findSteamappsDirectory = async (rootDir) => {
  try {
    const items = await fs.readdir(rootDir);
    for (const item of items) {
      const itemPath = path.join(rootDir, item);
      const stat = await fs.stat(itemPath);
      if (stat.isDirectory() && item.toLowerCase().includes('steamapps')) return itemPath;
      if (stat.isDirectory()) {
        const found = await findSteamappsDirectory(itemPath);
        if (found) return found;
      }
    }
  } catch (error) {
    console.warn('Error searching for steamapps directory:', error.message);
  }
  return null;
}

// Configuration Fetching
ipcMain.handle('fetch-github-config', async (event, configUrl) => {
  try {
    if (!configUrl) throw new Error('Configuration URL is required');
    const response = await fetch(configUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const config = await response.json();
    return { success: true, config };
  } catch (error) {
    console.error('Failed to fetch GitHub config:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('fetch-releases-with-config', async (event, { configUrl, type }) => {
    try {
        const configResponse = await fetch(configUrl);
        if (!configResponse.ok) throw new Error(`Failed to fetch config: ${configResponse.status}`);
        const config = await configResponse.json();
        
        let repoString = '';
        switch (type) {
            case 'fixes': repoString = config.fixesRepo || 'cwabaid/cw.fixes'; break;
            case 'tools': repoString = config.toolsRepo || 'cwabaid/cw.tools'; break;
            case 'softwares': repoString = config.softwaresRepo || 'cwabaid/cw.softwares'; break;
            default: throw new Error(`Unknown type: ${type}`);
        }
        
        if (!repoString) return { success: false, error: `No repository configured for ${type}` };
        
        // Handle both 'owner/repo' and 'https://github.com/owner/repo' formats
        let owner, repo;
        if (repoString.includes('github.com/')) {
            const repoMatch = repoString.match(/github\.com\/([^\/]+)\/([^\/\?]+)/);
            if (!repoMatch) throw new Error(`Invalid GitHub repository URL: ${repoString}`);
            [, owner, repo] = repoMatch;
        } else {
            // Handle 'owner/repo' format
            const parts = repoString.split('/');
            if (parts.length !== 2) throw new Error(`Invalid repository format: ${repoString}. Expected 'owner/repo'`);
            [owner, repo] = parts;
        }
        
        // Clean up repo name (remove .git extension if present)
        repo = repo.replace(/\.git$/, '');
        
        console.log(`Fetching all releases from ${owner}/${repo}`);
        
        // Fetch all releases with pagination
        const allReleases = [];
        let page = 1;
        const perPage = 100; // Maximum per page allowed by GitHub API
        
        while (true) {
            const releasesUrl = `https://api.github.com/repos/${owner}/${repo}/releases?page=${page}&per_page=${perPage}`;
            const releasesResponse = await fetch(releasesUrl, {
                headers: {
                    'User-Agent': 'Crack-World-App',
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (!releasesResponse.ok) {
                throw new Error(`GitHub API Error: ${releasesResponse.status} ${releasesResponse.statusText}`);
            }
            
            const releases = await releasesResponse.json();
            
            if (!Array.isArray(releases) || releases.length === 0) {
                break; // No more releases to fetch
            }
            
            allReleases.push(...releases);
            
            // If we got fewer releases than requested, we've reached the end
            if (releases.length < perPage) {
                break;
            }
            
            page++;
        }
        
        const releases = allReleases;
        console.log(`✅ Fetched ${releases.length} releases from ${owner}/${repo}`);
        return { success: true, releases, config };
    } catch (error) {
        console.error(`Error fetching releases for ${type}:`, error);
        return { success: false, error: error.message };
    }
});

// Direct Release Fetching
ipcMain.handle('fetch-releases-direct', async (event, { owner, repo }) => {
  try {
    if (!owner || !repo) throw new Error('Owner and repo are required');
    
    console.log(`Fetching all releases from ${owner}/${repo}`);
    
    // Fetch all releases with pagination
    const allReleases = [];
    let page = 1;
    const perPage = 100; // Maximum per page allowed by GitHub API
    
    while (true) {
      const releasesUrl = `https://api.github.com/repos/${owner}/${repo}/releases?page=${page}&per_page=${perPage}`;
      const releasesResponse = await fetch(releasesUrl, {
        headers: {
          'User-Agent': 'Crack-World-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (!releasesResponse.ok) {
        throw new Error(`GitHub API Error: ${releasesResponse.status} - ${releasesResponse.statusText}`);
      }
      
      const releases = await releasesResponse.json();
      
      if (!Array.isArray(releases) || releases.length === 0) {
        break; // No more releases to fetch
      }
      
      allReleases.push(...releases);
      
      // If we got fewer releases than requested, we've reached the end
      if (releases.length < perPage) {
        break;
      }
      
      page++;
    }
    
    console.log(`✅ Fetched ${allReleases.length} total releases from ${owner}/${repo}`);
    return { success: true, releases: allReleases };
  } catch (error) {
    console.error(`Error fetching releases from ${owner}/${repo}:`, error);
    return { success: false, error: error.message };
  }
});

// Window Controls
ipcMain.handle('window-minimize', () => { 
  console.log('Window minimize requested');
  console.log('mainWindow exists:', !!mainWindow);
  if (mainWindow) {
    mainWindow.minimize();
    console.log('Window minimized successfully');
    return { success: true };
  } else {
    console.error('mainWindow is null or undefined');
    return { success: false, error: 'mainWindow is null' };
  }
});

ipcMain.handle('window-maximize', () => {
  console.log('Window maximize requested');
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
      console.log('Window unmaximized successfully');
      return { success: true, maximized: false };
    } else {
      mainWindow.maximize();
      console.log('Window maximized successfully');
      return { success: true, maximized: true };
    }
  } else {
    console.error('mainWindow is null or undefined');
    return { success: false, error: 'mainWindow not available' };
  }
});

ipcMain.handle('window-close', () => { 
  console.log('Window close requested');
  if (mainWindow) {
    mainWindow.close();
    console.log('Window close requested successfully');
  } else {
    console.error('mainWindow is null or undefined');
  }
  return { success: true }; 
});

ipcMain.handle('open-dev-tools', () => {
  console.log('Opening developer tools');
  if (mainWindow) {
    mainWindow.webContents.openDevTools();
    console.log('Developer tools opened successfully');
    return { success: true };
  } else {
    console.error('mainWindow is null or undefined');
    return { success: false, error: 'mainWindow not available' };
  }
});

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});


// Directory selector result handler
ipcMain.handle('directory-selector-result', async (event, data) => {
    // This handler is used by the frontend to send back directory selection results
    return { success: true };
});

// Enhanced pause/resume functionality



// File Operations
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { 
    properties: ['openDirectory'],
    title: 'Select Download Directory'
  });
  if (!result || result.canceled) return null;
  return result.filePaths?.[0] || null;
});

ipcMain.handle('show-item-in-folder', (event, filePath) => {
    shell.showItemInFolder(filePath);
    return { success: true };
});

// Open a folder path directly using Windows explorer
ipcMain.handle('open-folder', async (event, folderPath) => {
  try {
    console.log('IPC: Opening folder:', folderPath);
    
    if (!folderPath) {
      console.log('IPC: No folder path provided');
      return { success: false, error: 'No folder path provided' };
    }
    
    // Ensure proper Windows backslash format
    let normalizedPath = folderPath.replace(/\//g, '\\');
    
    // Fix missing backslash after drive letter (e.g., C: -> C:\)
    if (normalizedPath.match(/^[A-Za-z]:[^\\]/)) {
      normalizedPath = normalizedPath.replace(/^([A-Za-z]:)/, '$1\\');
    }
    
    // Note: Removed aggressive path normalization that was corrupting paths
    
    console.log('IPC: After directory separator fix:', normalizedPath);
    
    console.log('IPC: Original path:', folderPath);
    console.log('IPC: Normalized path (Windows format):', normalizedPath);
    
    // Check if path exists first
    const pathExists = await fs.pathExists(normalizedPath);
    console.log('IPC: Path exists:', pathExists);
    
    if (!pathExists) {
      console.log('IPC: Path does not exist');
      return { success: false, error: `Path does not exist: ${normalizedPath}` };
    }
    
    console.log('IPC: Using Windows explorer command directly');
    
    // Use Windows explorer command directly
    try {
      console.log('IPC: Spawning explorer with path:', normalizedPath);
      
      const explorer = spawn('explorer', [normalizedPath], { 
        detached: true,
        stdio: 'ignore'
      });
      
      explorer.unref();
      console.log('IPC: Explorer command executed successfully');
      return { success: true };
      
    } catch (explorerError) {
      console.error('IPC: Explorer command failed:', explorerError);
      return { success: false, error: `Failed to open with explorer: ${explorerError.message}` };
    }
    
  } catch (error) {
    console.error('IPC: Error opening folder:', error);
    return { success: false, error: error.message };
  }
});

// Check if a path exists
ipcMain.handle('check-path-exists', async (event, pathToCheck) => {
  try {
    if (!pathToCheck) return false;
    return await fs.pathExists(pathToCheck);
  } catch (error) {
    console.error('Error checking path existence:', error);
    return false;
  }
});

// Token Generator Management
let tokenGeneratorProcess = null;

// Start token generator executable
ipcMain.handle('start-token-generator', async (event) => {
  try {
    console.log('🎫 Starting token_generator.exe...');
    
    const exePath = path.join(__dirname, 'token_generator.exe');
    
    // Check if exe exists
    if (!await fs.pathExists(exePath)) {
      return { success: false, error: 'token_generator.exe not found in project root' };
    }
    
    // Kill existing process if running
    if (tokenGeneratorProcess) {
      tokenGeneratorProcess.kill();
    }
    
    // Start new process
    tokenGeneratorProcess = spawn(exePath, [], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    console.log('🎫 Token generator process started with PID:', tokenGeneratorProcess.pid);
    
    // Handle process output
    tokenGeneratorProcess.stdout.on('data', (data) => {
      console.log('Token Generator Output:', data.toString());
      // Send output to renderer
      event.sender.send('token-generator-output', data.toString());
    });
    
    tokenGeneratorProcess.stderr.on('data', (data) => {
      console.error('Token Generator Error:', data.toString());
      // Send error to renderer
      event.sender.send('token-generator-error', data.toString());
    });
    
    tokenGeneratorProcess.on('close', (code) => {
      console.log('Token Generator process closed with code:', code);
      tokenGeneratorProcess = null;
    });
    
    tokenGeneratorProcess.on('error', (error) => {
      console.error('Token Generator process error:', error);
      tokenGeneratorProcess = null;
    });
    
    return { success: true };
    
  } catch (error) {
    console.error('Error starting token generator:', error);
    return { success: false, error: error.message };
  }
});

// Send command to token generator
ipcMain.handle('send-token-generator-command', async (event, command) => {
  try {
    if (!tokenGeneratorProcess) {
      return { success: false, error: 'Token generator not running' };
    }
    
    console.log('🎫 Sending command to token generator:', command);
    
    // Send command to process stdin
    tokenGeneratorProcess.stdin.write(command + '\n');
    
    return { success: true };
    
  } catch (error) {
    console.error('Error sending command to token generator:', error);
    return { success: false, error: error.message };
  }
});

// Export console output
ipcMain.handle('export-console-output', async (event, consoleData) => {
  try {
    const { dialog } = require('electron');
    
    // Show save dialog
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Console Output',
      defaultPath: 'token-generator-console.txt',
      filters: [
        { name: 'Text Files', extensions: ['txt'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (result.canceled) {
      return { success: false, error: 'Export cancelled' };
    }
    
    // Format console data
    const output = consoleData.map(entry => {
      const timestamp = new Date(entry.timestamp).toLocaleString();
      return `[${timestamp}] ${entry.type.toUpperCase()}: ${entry.text}`;
    }).join('\n');
    
    // Write to file
    await fs.writeFile(result.filePath, output);
    
    console.log('🎫 Console output exported to:', result.filePath);
    return { success: true, filePath: result.filePath };
    
  } catch (error) {
    console.error('Error exporting console output:', error);
    return { success: false, error: error.message };
  }
});


// Remove duplicate scan-installed-games handler - using the one from earlier
// (This duplicate handler was causing the registration error)

// Enhanced Auto-extraction System
async function extractDownloadedFile(filePath, destination) {
    try {
        console.log(`Starting extraction: ${filePath} -> ${destination}`);
        
        const ext = path.extname(filePath).toLowerCase();
        if (!['.zip', '.rar', '.7z'].includes(ext)) {
            console.log('File is not an extractable archive');
            return { success: false, extracted: false };
        }
        
        // Create extraction directory
        const extractDir = path.join(destination, path.basename(filePath, ext) + '_extracted');
        await fs.ensureDir(extractDir);
        
        let extractionSuccess = false;
        
        if (ext === '.zip') {
            extractionSuccess = await extractZipFile(filePath, extractDir);
        } else if (ext === '.rar') {
            extractionSuccess = await extractRarFile(filePath, extractDir);
        } else if (ext === '.7z') {
            extractionSuccess = await extract7zFile(filePath, extractDir);
        }
        
        if (!extractionSuccess) {
            await fs.remove(extractDir).catch(() => {}); // Clean up on failure
            return { success: false, extracted: false, error: 'Extraction failed' };
        }
        
        // Flatten single root folder if present
        await flattenSingleRootFolder(extractDir);
        
        // Always delete original archive after successful extraction
        try {
            await fs.remove(filePath);
            console.log(`✅ Original archive deleted: ${filePath}`);
        } catch (error) {
            console.warn(`⚠️ Could not delete original archive: ${error.message}`);
            // Don't fail the extraction if we can't delete the original
        }
        
        console.log(`Extraction completed: ${extractDir}`);
        return { 
            success: true, 
            extracted: true, 
            extractedPath: extractDir 
        };
        
    } catch (error) {
        console.error('Extraction error:', error);
        return { success: false, extracted: false, error: error.message };
    }
}

// Self-contained ZIP extraction
async function extractZipFile(zipPath, extractPath) {
    try {
        await extract(zipPath, { dir: extractPath });
        return true;
    } catch (error) {
        console.error('ZIP extraction failed:', error);
        return false;
    }
}

// Enhanced RAR extraction using system unrar or 7zip
async function extractRarFile(rarPath, extractPath) {
    try {
        console.log(`Extracting RAR file: ${rarPath}`);
        
        // Try to use system unrar command first
        try {
            const unrarProcess = spawn('unrar', ['x', '-y', rarPath, extractPath + path.sep], {
                stdio: 'pipe'
            });
            
            return new Promise((resolve) => {
                let errorOutput = '';
                
                unrarProcess.stderr.on('data', (data) => {
                    errorOutput += data.toString();
                });
                
                unrarProcess.on('close', (code) => {
                    if (code === 0) {
                        console.log('RAR extracted successfully with unrar');
                        resolve(true);
                    } else {
                        console.warn('unrar failed, trying 7zip...');
                        extractRarWith7zip(rarPath, extractPath).then(resolve);
                    }
                });
                
                unrarProcess.on('error', () => {
                    console.warn('unrar not found, trying 7zip...');
                    extractRarWith7zip(rarPath, extractPath).then(resolve);
                });
            });
        } catch (error) {
            console.warn('unrar spawn failed, trying 7zip...');
            return await extractRarWith7zip(rarPath, extractPath);
        }
    } catch (error) {
        console.error('RAR extraction failed:', error);
        return false;
    }
}

// Extract RAR using 7zip
async function extractRarWith7zip(rarPath, extractPath) {
    try {
        const sevenZipProcess = spawn('7z', ['x', '-y', rarPath, `-o${extractPath}`], {
            stdio: 'pipe'
        });
        
        return new Promise((resolve) => {
            let errorOutput = '';
            
            sevenZipProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            sevenZipProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('RAR extracted successfully with 7zip');
                    resolve(true);
                } else {
                    console.warn('7zip also failed, copying file as fallback');
                    extractRarFallback(rarPath, extractPath).then(resolve);
                }
            });
            
            sevenZipProcess.on('error', () => {
                console.warn('7zip not found, using fallback method');
                extractRarFallback(rarPath, extractPath).then(resolve);
            });
        });
    } catch (error) {
        console.error('7zip extraction failed:', error);
        return await extractRarFallback(rarPath, extractPath);
    }
}

// Fallback method - copy file if extraction tools not available
async function extractRarFallback(rarPath, extractPath) {
    try {
        console.warn('No RAR extraction tools available - copying file as fallback');
        const fileName = path.basename(rarPath);
        await fs.copy(rarPath, path.join(extractPath, fileName));
        return true;
    } catch (error) {
        console.error('RAR fallback failed:', error);
        return false;
    }
}

// Enhanced 7z extraction using system 7zip
async function extract7zFile(archivePath, extractPath) {
    try {
        console.log(`Extracting 7z file: ${archivePath}`);
        
        const sevenZipProcess = spawn('7z', ['x', '-y', archivePath, `-o${extractPath}`], {
            stdio: 'pipe'
        });
        
        return new Promise((resolve) => {
            let errorOutput = '';
            
            sevenZipProcess.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });
            
            sevenZipProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('7z extracted successfully');
                    resolve(true);
                } else {
                    console.warn('7z extraction failed, copying file as fallback');
                    extract7zFallback(archivePath, extractPath).then(resolve);
                }
            });
            
            sevenZipProcess.on('error', () => {
                console.warn('7z not found, using fallback method');
                extract7zFallback(archivePath, extractPath).then(resolve);
            });
        });
    } catch (error) {
        console.error('7z extraction failed:', error);
        return await extract7zFallback(archivePath, extractPath);
    }
}

// Fallback method for 7z files
async function extract7zFallback(archivePath, extractPath) {
    try {
        console.warn('7z extraction tool not available - copying file as fallback');
        const fileName = path.basename(archivePath);
        await fs.copy(archivePath, path.join(extractPath, fileName));
        return true;
    } catch (error) {
        console.error('7z fallback failed:', error);
        return false;
    }
}

// Flatten single root folder
async function flattenSingleRootFolder(extractDir) {
    try {
        const contents = await fs.readdir(extractDir);
        
        if (contents.length === 1) {
            const singleItem = path.join(extractDir, contents[0]);
            const stat = await fs.stat(singleItem);
            
            if (stat.isDirectory()) {
                console.log(`Flattening single root folder: ${contents[0]}`);
                const innerContents = await fs.readdir(singleItem);
                
                // Move all inner contents to extract directory
                for (const item of innerContents) {
                    const sourcePath = path.join(singleItem, item);
                    const destPath = path.join(extractDir, item);
                    
                    // Replace if exists
                    if (await fs.pathExists(destPath)) {
                        await fs.remove(destPath);
                    }
                    
                    await fs.move(sourcePath, destPath);
                }
                
                // Remove the now empty single folder
                await fs.remove(singleItem);
                console.log('Root folder flattened successfully');
            }
        }
    } catch (error) {
        console.warn('Could not flatten root folder:', error.message);
    }
}

// Enhanced ZIP Creation with Upload Integration
ipcMain.handle('create-zip-from-files', async (event, { files, outputPath, uploadOptions = null }) => {
    try {
        console.log(`Creating ZIP: ${outputPath} with ${files.length} files`);
        
        const output = fs.createWriteStream(outputPath);
        const archive = archiver.default('zip', { zlib: { level: 9 } });
        
        return new Promise(async (resolve, reject) => {
            output.on('close', () => {
                console.log(`ZIP created: ${archive.pointer()} total bytes`);
                resolve({ 
                    success: true, 
                    path: outputPath, 
                    size: archive.pointer(),
                    message: 'ZIP file created successfully'
                });
            });
            
            output.on('error', (err) => {
                console.error('ZIP output error:', err);
                reject(err);
            });
            
            archive.on('error', (err) => {
                console.error('ZIP creation error:', err);
                reject(err);
            });
            
            archive.pipe(output);
            
            // Add files to archive
            for (const file of files) {
                if (file.path && file.name && await fs.pathExists(file.path)) {
                    const stat = await fs.stat(file.path);
                    if (stat.isFile()) {
                        archive.file(file.path, { name: file.name });
                        console.log(`Added to ZIP: ${file.name}`);
                    } else {
                        console.warn(`Skipping non-file: ${file.path}`);
                    }
                } else {
                    console.warn(`Invalid file entry:`, file);
                }
            }
            
            archive.finalize();
        });
    } catch (error) {
        console.error('ZIP creation failed:', error);
        return { success: false, error: error.message };
    }
});

// Create ZIP and Upload to GitHub
ipcMain.handle('create-zip-and-upload', async (event, { files, zipName, uploadOptions }) => {
    try {
        if (!files || files.length === 0) {
            throw new Error('No files provided for ZIP creation');
        }
        
        if (!uploadOptions || !uploadOptions.token || !uploadOptions.owner || !uploadOptions.repo) {
            throw new Error('Upload options are required (token, owner, repo)');
        }
        
        // Create temporary ZIP file
        const tempDir = path.join(app.getPath('temp'), 'crack-world-zips');
        await fs.ensureDir(tempDir);
        const tempZipPath = path.join(tempDir, zipName || `archive-${Date.now()}.zip`);
        
        console.log(`Creating ZIP with ${files.length} files...`);
        
        // Create the ZIP file
        const zipResult = await new Promise(async (resolve, reject) => {
            const output = fs.createWriteStream(tempZipPath);
            const archive = archiver.default('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
                console.log(`ZIP created: ${archive.pointer()} total bytes`);
                resolve({ 
                    success: true, 
                    path: tempZipPath, 
                    size: archive.pointer()
                });
            });
            
            output.on('error', (err) => {
                console.error('ZIP output error:', err);
                reject(err);
            });
            
            archive.on('error', (err) => {
                console.error('ZIP creation error:', err);
                reject(err);
            });
            
            archive.pipe(output);
            
            // Add files to archive
            for (const file of files) {
                if (file.path && file.name && await fs.pathExists(file.path)) {
                    const stat = await fs.stat(file.path);
                    if (stat.isFile()) {
                        archive.file(file.path, { name: file.name });
                        console.log(`Added to ZIP: ${file.name}`);
                    } else {
                        console.warn(`Skipping non-file: ${file.path}`);
                    }
                } else {
                    console.warn(`Invalid file entry:`, file);
                }
            }
            
            archive.finalize();
        });
        
        if (!zipResult.success) {
            throw new Error('Failed to create ZIP file');
        }
        
        // Read ZIP file as base64 for upload
        const zipBuffer = await fs.readFile(tempZipPath);
        const zipDataB64 = zipBuffer.toString('base64');
        
        // Upload to GitHub
        console.log(`Uploading ZIP to GitHub: ${uploadOptions.owner}/${uploadOptions.repo}`);
        const uploadResult = await uploadReleaseToGitHub({
            token: uploadOptions.token,
            owner: uploadOptions.owner,
            repo: uploadOptions.repo,
            releaseName: uploadOptions.releaseName || `Release ${new Date().toLocaleDateString()}`,
            versionTag: uploadOptions.versionTag || `v${Date.now()}`,
            releaseNotes: uploadOptions.releaseNotes || 'Automated release created from selected files',
            zipName: zipName || `archive-${Date.now()}.zip`,
            zipDataB64: zipDataB64
        });
        
        // Clean up temporary file
        try {
            await fs.remove(tempZipPath);
            console.log('Temporary ZIP file cleaned up');
        } catch (cleanupError) {
            console.warn('Could not clean up temporary file:', cleanupError.message);
        }
        
        return {
            success: true,
            message: 'ZIP created and uploaded successfully',
            releaseUrl: uploadResult.releaseUrl,
            zipSize: zipResult.size
        };
        
    } catch (error) {
        console.error('Create ZIP and upload failed:', error);
        return { success: false, error: error.message };
    }
});

// Helper function for GitHub upload
async function uploadReleaseToGitHub({ token, owner, repo, releaseName, versionTag, releaseNotes, zipName, zipDataB64 }) {
    try {
        const octokit = new Octokit({ auth: token });
        
        // Create release
        const release = await octokit.repos.createRelease({
            owner,
            repo,
            tag_name: versionTag,
            name: releaseName,
            body: releaseNotes,
            draft: false,
            prerelease: false
        });
        
        // Upload ZIP as release asset
        const zipDataBuffer = Buffer.from(zipDataB64, 'base64');
        await octokit.repos.uploadReleaseAsset({
            owner,
            repo,
            release_id: release.data.id,
            name: zipName,
            data: zipDataBuffer,
            headers: {
                'content-type': 'application/zip',
                'content-length': zipDataBuffer.length
            }
        });
        
        return {
            success: true,
            message: `Release '${releaseName}' created successfully!`,
            releaseUrl: release.data.html_url
        };
    } catch (error) {
        console.error('GitHub upload failed:', error);
        throw new Error(error.message || 'An unknown error occurred during upload.');
    }
}

// Manual Archive Extraction with Deletion
ipcMain.handle('extract-archive-and-delete', async (event, { archivePath, destinationPath }) => {
    try {
        if (!await fs.pathExists(archivePath)) {
            throw new Error(`Archive file not found: ${archivePath}`);
        }
        
        if (!destinationPath) {
            destinationPath = path.dirname(archivePath);
        }
        
        console.log(`Manual extraction: ${archivePath} -> ${destinationPath}`);
        
        const extractResult = await extractDownloadedFile(archivePath, destinationPath);
        
        if (extractResult.success && extractResult.extracted) {
            return {
                success: true,
                message: 'Archive extracted successfully and original deleted',
                extractedPath: extractResult.extractedPath,
                originalDeleted: true,
                originalFile: archivePath
            };
        } else {
            return {
                success: false,
                error: extractResult.error || 'Extraction failed',
                originalFile: archivePath
            };
        }
    } catch (error) {
        console.error('Manual extraction failed:', error);
        return {
            success: false,
            error: error.message,
            originalFile: archivePath
        };
    }
});

// Settings Management
ipcMain.handle('save-download-path', async (event, downloadPath) => {
    try {
        if (downloadPath && await fs.pathExists(downloadPath)) {
            rememberedDownloadPath = downloadPath;
            console.log(`Saved download path: ${downloadPath}`);
            return { success: true, path: downloadPath };
        } else {
            return { success: false, error: 'Invalid download path' };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-download-path', async (event) => {
    return { 
        success: true, 
        path: rememberedDownloadPath || app.getPath('downloads'),
        isRemembered: !!rememberedDownloadPath 
    };
});

ipcMain.handle('clear-download-path', async (event) => {
    rememberedDownloadPath = null;
    console.log('Cleared remembered download path');
    return { success: true };
});

// File Reading Operations
ipcMain.handle('read-terms-file', async () => {
    try {
        const termsPath = path.join(__dirname, 'terms.txt');
        if (!await fs.pathExists(termsPath)) {
            const defaultTerms = `TERMS OF SERVICE\n\nThis application is for educational purposes only.\nThe publisher is not responsible for any illegal use of this app.`;
            await fs.writeFile(termsPath, defaultTerms);
            return { success: true, content: defaultTerms };
        }
        const content = await fs.readFile(termsPath, 'utf8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('read-changelog-file', async () => {
    try {
        const changelogPath = path.join(__dirname, 'changelog.txt');
        if (!await fs.pathExists(changelogPath)) {
            const defaultChangelog = `CHANGE LOG\n\nVersion 1.0.0\n- Initial release`;
            await fs.writeFile(changelogPath, defaultChangelog);
            return { success: true, content: defaultChangelog };
        }
        const content = await fs.readFile(changelogPath, 'utf8');
        return { success: true, content };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// Enhanced Bulletproof App Updater with Rollback
ipcMain.handle('check-for-updates', async () => {
    try {
        const response = await fetch('https://api.github.com/repos/ABAID-CODER/crackworld-manifest/releases/latest');
        if (!response.ok) {
            if (response.status === 404) return { updateAvailable: false, error: 'No releases found' };
            throw new Error(`Failed to fetch latest release: ${response.statusText}`);
        }
        const latestRelease = await response.json();
        const latestVersion = latestRelease.tag_name.replace('v', '');
        const currentVersion = app.getVersion(); // Get actual app version

        console.log(`Update check - Current: ${currentVersion}, Latest: ${latestVersion}`);

        // Enhanced version comparison
        if (compareVersions(latestVersion, currentVersion) > 0) {
            return {
                updateAvailable: true,
                version: latestVersion,
                releaseNotes: latestRelease.body,
                downloadUrl: latestRelease.assets?.[0]?.browser_download_url,
                publishedAt: latestRelease.published_at,
                releaseName: latestRelease.name || `Version ${latestVersion}`,
                checksum: latestRelease.assets?.[0]?.browser_download_url ? await getFileChecksum(latestRelease.assets[0].browser_download_url) : null
            };
        }
        return { updateAvailable: false, message: 'App is up to date' };
    } catch (error) {
        console.error('Update check failed:', error);
        return { updateAvailable: false, error: error.message };
    }
});

// Get file checksum for integrity verification
async function getFileChecksum(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const buffer = await response.arrayBuffer();
        const hash = require('crypto').createHash('sha256');
        hash.update(Buffer.from(buffer));
        return hash.digest('hex');
    } catch (error) {
        console.warn('Could not get file checksum:', error);
        return null;
    }
}

// Enhanced download and install update with rollback
ipcMain.handle('download-update', async (event, { downloadUrl, version, checksum }) => {
    try {
        if (!downloadUrl) {
            throw new Error('No download URL provided');
        }
        
        console.log(`Downloading update ${version} from: ${downloadUrl}`);
        
        const updateDir = path.join(app.getPath('temp'), 'crack-world-updates');
        await fs.ensureDir(updateDir);
        
        const fileName = `Crack-World-Update-${version}.exe`;
        const filePath = path.join(updateDir, fileName);
        
        // Create backup of current app before update
        const backupDir = path.join(app.getPath('userData'), 'backups');
        await fs.ensureDir(backupDir);
        const backupPath = path.join(backupDir, `backup-${Date.now()}`);
        
        try {
            await fs.copy(app.getAppPath(), backupPath);
            console.log(`Backup created at: ${backupPath}`);
        } catch (backupError) {
            console.warn('Could not create backup:', backupError);
        }
        
        // Download the update file with progress tracking
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`Download failed: ${response.status} ${response.statusText}`);
        }
        
        const contentLength = parseInt(response.headers.get('content-length') || '0');
        let downloadedBytes = 0;
        
        // Create a progress tracking stream
        const chunks = [];
        const reader = response.body.getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            chunks.push(value);
            downloadedBytes += value.length;
            
            // Send progress update
            if (contentLength > 0) {
                const progress = Math.round((downloadedBytes / contentLength) * 100);
                mainWindow.webContents.send('update-download-progress', {
                    progress,
                    downloadedBytes,
                    totalBytes: contentLength,
                    fileName: 'app-update'
                });
            }
        }
        
        const arrayBuffer = new Uint8Array(downloadedBytes);
        let offset = 0;
        for (const chunk of chunks) {
            arrayBuffer.set(chunk, offset);
            offset += chunk.length;
        }
        
        const buffer = Buffer.from(arrayBuffer);
        
        // Verify checksum if provided
        if (checksum) {
            const hash = require('crypto').createHash('sha256');
            hash.update(buffer);
            const downloadedChecksum = hash.digest('hex');
            
            if (downloadedChecksum !== checksum) {
                throw new Error('Checksum verification failed - file may be corrupted');
            }
            console.log('✅ Checksum verification passed');
        }
        
        await fs.writeFile(filePath, buffer);
        
        console.log(`Update downloaded to: ${filePath}`);
        
        return {
            success: true,
            filePath: filePath,
            backupPath: backupPath,
            message: 'Update downloaded successfully with backup created'
        };
    } catch (error) {
        console.error('Update download failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Enhanced install update with rollback capability
ipcMain.handle('install-update', async (event, { filePath, backupPath }) => {
    try {
        if (!await fs.pathExists(filePath)) {
            throw new Error('Update file not found');
        }
        
        console.log(`Installing update from: ${filePath}`);
        
        // Create installation log
        const logPath = path.join(app.getPath('userData'), 'update-install.log');
        const logContent = `Update installation started at ${new Date().toISOString()}\nFile: ${filePath}\nBackup: ${backupPath || 'None'}\n`;
        await fs.writeFile(logPath, logContent);
        
        // Run installer with silent installation flags
        const silentFlags = ['/S', '/SILENT', '/VERYSILENT'];
        let installerProcess;
        
        try {
            // Try with /S flag first (most common)
            installerProcess = spawn(filePath, ['/S'], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true
            });
        } catch (spawnError) {
            // If spawn fails, try running through shell
            console.log('Direct spawn failed, trying through shell');
            installerProcess = spawn('cmd', ['/c', `"${filePath}" /S`], {
                detached: true,
                stdio: 'ignore',
                windowsHide: true,
                shell: true
            });
        }
        
        // Unref the process so the main app can exit
        installerProcess.unref();
        
        console.log('Installer launched silently, closing application...');
        
        // Close the current application after a short delay
        setTimeout(() => {
            console.log('Quitting application for update installation...');
            app.quit();
        }, 1000);
        
        return { success: true, message: 'Update installation started' };
    } catch (error) {
        console.error('Update installation failed:', error);
        return { success: false, error: error.message };
    }
});

// Rollback to previous version
ipcMain.handle('rollback-update', async (event, { backupPath }) => {
    try {
        if (!backupPath || !await fs.pathExists(backupPath)) {
            throw new Error('Backup not found for rollback');
        }
        
        console.log(`Rolling back to backup: ${backupPath}`);
        
        const currentAppPath = app.getAppPath();
        const rollbackDir = path.join(app.getPath('userData'), 'rollback');
        await fs.ensureDir(rollbackDir);
        
        // Create backup of current (failed) version
        const failedBackup = path.join(rollbackDir, `failed-${Date.now()}`);
        await fs.copy(currentAppPath, failedBackup);
        
        // Restore from backup
        await fs.copy(backupPath, currentAppPath);
        
        console.log('Rollback completed successfully');
        
        return { 
            success: true, 
            message: 'Rollback completed successfully',
            rollbackPath: currentAppPath
        };
    } catch (error) {
        console.error('Rollback failed:', error);
        return { success: false, error: error.message };
    }
});

// Get available backups
ipcMain.handle('get-backups', async () => {
    try {
        const backupDir = path.join(app.getPath('userData'), 'backups');
        if (!await fs.pathExists(backupDir)) {
            return { success: true, backups: [] };
        }
        
        const backupFolders = await fs.readdir(backupDir);
        const backups = [];
        
        for (const folder of backupFolders) {
            const folderPath = path.join(backupDir, folder);
            const stat = await fs.stat(folderPath);
            
            if (stat.isDirectory()) {
                backups.push({
                    name: folder,
                    path: folderPath,
                    created: stat.birthtime,
                    size: await getDirectorySize(folderPath)
                });
            }
        }
        
        // Sort by creation date (newest first)
        backups.sort((a, b) => b.created - a.created);
        
        return { success: true, backups };
    } catch (error) {
        console.error('Failed to get backups:', error);
        return { success: false, error: error.message };
    }
});

// Helper function for version comparison
function compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
        const v1Part = v1Parts[i] || 0;
        const v2Part = v2Parts[i] || 0;
        if (v1Part > v2Part) return 1;
        if (v1Part < v2Part) return -1;
    }
    return 0;
}

// Announcements System
const ANNOUNCEMENT_REPO_OWNER = 'ABAID-CODER';
const ANNOUNCEMENT_REPO_NAME = 'crackworld-manifest';
const ANNOUNCEMENT_FILE_PATH = 'a.json';

ipcMain.handle('fetch-announcement', async () => {
    try {
        const url = `https://raw.githubusercontent.com/${ANNOUNCEMENT_REPO_OWNER}/${ANNOUNCEMENT_REPO_NAME}/main/${ANNOUNCEMENT_FILE_PATH}`;
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) return { success: true, announcement: null }; // No announcement found is not an error
            throw new Error(`Failed to fetch announcement: ${response.statusText}`);
        }
        const announcement = await response.json();
        return { success: true, announcement };
    } catch (error) {
        console.error('Fetch announcement error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('publish-announcement', async (event, { token, title, content }) => {
    if (!token || !title || !content) {
        return { success: false, error: 'Token, title, and content are required.' };
    }
    try {
        const octokit = new Octokit({ auth: token });
        const announcementData = {
            title,
            content,
            timestamp: new Date().toISOString()
        };
        const contentBase64 = Buffer.from(JSON.stringify(announcementData, null, 2)).toString('base64');
        let existingFileSha = null;

        try {
            const { data: existingFile } = await octokit.repos.getContent({
                owner: ANNOUNCEMENT_REPO_OWNER,
                repo: ANNOUNCEMENT_REPO_NAME,
                path: ANNOUNCEMENT_FILE_PATH,
            });
            existingFileSha = existingFile.sha;
        } catch (error) {
            if (error.status !== 404) throw error; // If it's not a 'not found' error, re-throw
        }

        await octokit.repos.createOrUpdateFileContents({
            owner: ANNOUNCEMENT_REPO_OWNER,
            repo: ANNOUNCEMENT_REPO_NAME,
            path: ANNOUNCEMENT_FILE_PATH,
            message: `📢 Publish announcement: ${title}`,
            content: contentBase64,
            sha: existingFileSha, // If null, creates a new file. If provided, updates existing.
        });

        return { success: true };
    } catch (error) {
        console.error('Publish announcement error:', error);
        return { success: false, error: error.message };
    }
});

// GitHub Operations
function getAuthenticatedOctokit(token) {
  if (!token) throw new Error('GitHub token is required');
  return new Octokit({ auth: token, userAgent: 'Crack-World-App/1.0.0' });
}

ipcMain.handle('upload-release', async (event, { token, owner, repo, releaseName, versionTag, releaseNotes, zipName, zipDataB64 }) => {
    try {
        if (!token || !owner || !repo || !releaseName || !versionTag || !zipDataB64 || !zipName) {
            throw new Error("All fields are required for upload.");
        }
        const octokit = getAuthenticatedOctokit(token);
        const release = await octokit.repos.createRelease({
            owner, repo, tag_name: versionTag, name: releaseName, body: releaseNotes,
        });
        const zipDataBuffer = Buffer.from(zipDataB64, 'base64');
        await octokit.repos.uploadReleaseAsset({
            owner, repo, release_id: release.data.id, name: zipName, data: zipDataBuffer,
            headers: { 'content-type': 'application/zip', 'content-length': zipDataBuffer.length }
        });
        return { success: true, message: `Release '${releaseName}' created successfully!`, releaseUrl: release.data.html_url };
    } catch (error) {
        console.error('GitHub release upload failed:', error);
        throw new Error(error.message || 'An unknown error occurred during upload.');
    }
});

ipcMain.handle('update-github-release', async (event, { type, releaseId, token, title, tag, description, prerelease, draft }) => {
    try {
        if (!token || !releaseId || !title || !tag) {
            throw new Error('Token, release ID, title, and tag are required for update.');
        }
        
        // Get repository information based on type
        const configResponse = await fetch('https://raw.githubusercontent.com/ABAID-CODER/crackworld-manifest/main/configured.json');
        if (!configResponse.ok) throw new Error('Failed to fetch configuration');
        const config = await configResponse.json();
        
        let repoString = '';
        switch (type) {
            case 'fixes': repoString = config.fixesRepo || 'cwabaid/cw.fixes'; break;
            case 'tools': repoString = config.toolsRepo || 'cwabaid/cw.tools'; break;
            case 'softwares': repoString = config.softwaresRepo || 'cwabaid/cw.softwares'; break;
            default: throw new Error(`Unknown type: ${type}`);
        }
        
        const [owner, repo] = repoString.split('/');
        if (!owner || !repo) throw new Error(`Invalid repository format: ${repoString}`);
        
        const octokit = getAuthenticatedOctokit(token);
        
        console.log(`Updating release ${releaseId} in ${owner}/${repo}`);
        
        const updatedRelease = await octokit.repos.updateRelease({
            owner,
            repo,
            release_id: releaseId,
            name: title,
            tag_name: tag,
            body: description,
            draft: draft,
            prerelease: prerelease
        });
        
        console.log(`✅ Release updated successfully: ${updatedRelease.data.html_url}`);
        return { 
            success: true, 
            message: `Release '${title}' updated successfully!`, 
            releaseUrl: updatedRelease.data.html_url 
        };
    } catch (error) {
        console.error('GitHub release update failed:', error);
        return { success: false, error: error.message || 'An unknown error occurred during update.' };
    }
});

// External Operations
ipcMain.handle('open-external', (event, url) => { shell.openExternal(url); return { success: true }; });

// Token Generator Operations
ipcMain.handle('run-token-generator', async (event, args = []) => {
    try {
        const tokenGeneratorPath = path.join(process.resourcesPath, 'token_generator.exe');
        
        if (!await fs.pathExists(tokenGeneratorPath)) {
            throw new Error('Token generator executable not found');
        }
        
        const result = await new Promise((resolve, reject) => {
            const child = spawn(tokenGeneratorPath, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });
            
            let stdout = '';
            let stderr = '';
            
            child.stdout.on('data', (data) => {
                // Remove any formatting characters and keep only plain text
                stdout += data.toString().replace(/[\x1b\x9b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
            });
            
            child.stderr.on('data', (data) => {
                // Remove any formatting characters and keep only plain text
                stderr += data.toString().replace(/[\x1b\x9b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
            });
            
            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output: stdout, error: stderr });
                } else {
                    reject(new Error(`Token generator exited with code ${code}: ${stderr}`));
                }
            });
            
            child.on('error', (error) => {
                reject(error);
            });
        });
        
        return result;
    } catch (error) {
        console.error('Token generator error:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-token-generator-path', async () => {
    try {
        const tokenGeneratorPath = path.join(process.resourcesPath, 'token_generator.exe');
        const exists = await fs.pathExists(tokenGeneratorPath);
        return { 
            success: true, 
            path: tokenGeneratorPath, 
            exists: exists 
        };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// App Management
ipcMain.handle('close-app', () => { app.quit(); });

// YouTube Integration
ipcMain.handle('validate-youtube-url', (event, url) => {
    if (!url) return { valid: false, error: 'URL is required' };
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(youtubeRegex);
    if (match) {
        const videoId = match[5];
        return { valid: true, videoId, embedUrl: `https://www.youtube.com/embed/${videoId}` };
    }
    return { valid: false, error: 'Invalid YouTube URL' };
});

// Enhanced Download Manager with Progress Tracking
let activeDownloadItems = new Map();
let rememberedDownloadPath = null;
let pendingDownloads = new Map();

// Setup download handler function
function setupDownloadHandler() {
    if (!mainWindow) {
        console.error('Main window not available for download handler setup');
        return;
    }
    
    // Check if handler is already set up
    if (mainWindow.webContents.session.listenerCount('will-download') > 0) {
        console.log('Download handler already set up');
        return;
    }
    
    // Handle will-download event
    mainWindow.webContents.session.on('will-download', (event, item, webContents) => {
        try {
            console.log(`will-download event triggered for URL: ${item.getURL()}`);
            console.log(`Item filename: ${item.getFilename()}`);
            console.log(`Item total bytes: ${item.getTotalBytes()}`);
            
            const downloadId = pendingDownloads.get(item.getURL());
            console.log(`Found download ID: ${downloadId}`);
            
            if (downloadId) {
                const downloadInfo = activeDownloadItems.get(downloadId);
                if (downloadInfo) {
                    // Set the download path
                    item.setSavePath(downloadInfo.path);
                    
                    // Prevent download from being cancelled
                    item.setSaveDialogOptions({
                        defaultPath: downloadInfo.path
                    });
                    
                    // Update the stored item
                    downloadInfo.item = item;
                    
                    console.log(`Download item configured for: ${downloadInfo.fileName}`);
                    
                    // Handle download progress
                    item.on('updated', (event, state) => {
                        try {
                            console.log(`Download updated: ${state} for ${downloadInfo.fileName}`);
                            
                            if (state === 'progressing') {
                                const totalBytes = item.getTotalBytes();
                                const receivedBytes = item.getReceivedBytes();
                                
                                console.log(`Progress: ${receivedBytes}/${totalBytes} bytes`);
                                
                                if (totalBytes > 0) {
                                    const progress = (receivedBytes / totalBytes) * 100;
                                    const elapsedTime = (Date.now() - downloadInfo.startTime) / 1000;
                                    const speed = elapsedTime > 0 ? receivedBytes / elapsedTime : 0;
                                    
                                    console.log(`Progress: ${progress.toFixed(2)}%, Speed: ${(speed / 1024).toFixed(2)} KB/s`);
                                    
                                    // Send progress update to renderer
                                    mainWindow.webContents.send('download-progress', {
                                        downloadId: downloadId,
                                        progress: progress,
                                        receivedBytes: receivedBytes,
                                        totalBytes: totalBytes,
                                        speed: speed
                                    });
                                } else {
                                    // Total bytes not available yet, send partial progress
                                    console.log(`Progress: ${receivedBytes} bytes (total unknown)`);
                                    mainWindow.webContents.send('download-progress', {
                                        downloadId: downloadId,
                                        progress: 0,
                                        receivedBytes: receivedBytes,
                                        totalBytes: 0,
                                        speed: 0
                                    });
                                }
                            } else if (state === 'interrupted') {
                                console.log(`Download interrupted: ${downloadInfo.fileName}`);
                                mainWindow.webContents.send('download-failed', {
                                    downloadId: downloadId,
                                    fileName: downloadInfo.fileName,
                                    error: 'Download interrupted'
                                });
                            }
                        } catch (error) {
                            console.error('Error handling download progress:', error);
                        }
                    });
                    
                    // Handle download completion
                    item.on('done', (event, state) => {
                        try {
                            console.log(`Download state changed: ${state} for ${downloadInfo.fileName}`);
                            console.log(`Download path: ${downloadInfo.path}`);
                            console.log(`Download size: ${item.getReceivedBytes()} bytes`);
                            
                            if (state === 'completed') {
                                // Check if file actually exists
                                if (fs.existsSync(downloadInfo.path)) {
                                    const stats = fs.statSync(downloadInfo.path);
                                    console.log(`File exists: ${downloadInfo.path}, Size: ${stats.size} bytes`);
                                    
                                    if (stats.size > 0) {
                                        console.log(`Download completed successfully: ${downloadInfo.fileName}`);
                                        mainWindow.webContents.send('download-completed', {
                                            downloadId: downloadId,
                                            fileName: downloadInfo.fileName,
                                            path: downloadInfo.path,
                                            size: stats.size
                                        });
                                    } else {
                                        console.log(`Download completed but file is empty: ${downloadInfo.fileName}`);
                                        mainWindow.webContents.send('download-failed', {
                                            downloadId: downloadId,
                                            fileName: downloadInfo.fileName,
                                            error: 'Downloaded file is empty'
                                        });
                                    }
                                } else {
                                    console.log(`Download completed but file not found: ${downloadInfo.path}`);
                                    mainWindow.webContents.send('download-failed', {
                                        downloadId: downloadId,
                                        fileName: downloadInfo.fileName,
                                        error: 'Downloaded file not found'
                                    });
                                }
                            } else {
                                console.log(`Download failed: ${downloadInfo.fileName} - ${state}`);
                                mainWindow.webContents.send('download-failed', {
                                    downloadId: downloadId,
                                    fileName: downloadInfo.fileName,
                                    error: state
                                });
                            }
                        } catch (error) {
                            console.error('Error handling download completion:', error);
                            mainWindow.webContents.send('download-failed', {
                                downloadId: downloadId,
                                fileName: downloadInfo.fileName,
                                error: error.message
                            });
                        } finally {
                            // Clean up
                            activeDownloadItems.delete(downloadId);
                            pendingDownloads.delete(item.getURL());
                        }
                    });
                } else {
                    console.warn(`No download info found for downloadId: ${downloadId}`);
                    pendingDownloads.delete(item.getURL());
                }
            } else {
                console.warn(`No pending download found for URL: ${item.getURL()}`);
            }
        } catch (error) {
            console.error('Error in will-download handler:', error);
        }
    });
    
    console.log('Download handler setup complete');
}

// Download file handler with progress tracking
ipcMain.handle('download-file', async (event, { url, fileName, destination, downloadId }) => {
    try {
        console.log(`Starting download: ${fileName} to ${destination}`);
        console.log(`Download URL: ${url}`);
        console.log(`Download ID: ${downloadId}`);
        
        const downloadPath = path.join(destination, fileName);
        console.log(`Full download path: ${downloadPath}`);
        
        // Check if destination directory exists
        if (!fs.existsSync(destination)) {
            console.log(`Creating destination directory: ${destination}`);
            fs.mkdirSync(destination, { recursive: true });
        }
        
        // Store download info for when the download starts
        activeDownloadItems.set(downloadId, {
            item: null, // Will be set when will-download fires
            path: downloadPath,
            fileName: fileName,
            startTime: Date.now()
        });
        
        // Store the mapping between URL and downloadId
        pendingDownloads.set(url, downloadId);
        console.log(`Stored pending download: ${url} -> ${downloadId}`);
        
        // No timeout - let downloads run naturally
        
        // Start the download
        console.log(`Initiating download URL: ${url}`);
        
        // Add a small delay to ensure proper setup
        setTimeout(() => {
            mainWindow.webContents.downloadURL(url);
        }, 100);
        
        return { success: true, downloadId: downloadId };
        
    } catch (error) {
        console.error('Download error:', error);
        return { success: false, error: error.message };
    }
});

// Get app paths handler
ipcMain.handle('get-app-paths', () => {
    return {
        downloads: app.getPath('downloads'),
        desktop: app.getPath('desktop'),
        documents: app.getPath('documents'),
        home: app.getPath('home')
    };
});

// Test download function (for debugging)
ipcMain.handle('test-download', async (event) => {
    try {
        const testUrl = 'https://httpbin.org/bytes/1024'; // 1KB test file
        const testFileName = 'test-download.bin';
        const testDestination = app.getPath('downloads');
        const testDownloadId = `test_${Date.now()}`;
        
        console.log('Starting test download...');
        console.log(`Test URL: ${testUrl}`);
        console.log(`Test destination: ${testDestination}`);
        
        const result = await event.sender.invoke('download-file', {
            url: testUrl,
            fileName: testFileName,
            destination: testDestination,
            downloadId: testDownloadId
        });
        
        return result;
    } catch (error) {
        console.error('Test download error:', error);
        return { success: false, error: error.message };
    }
});

export { mainWindow };