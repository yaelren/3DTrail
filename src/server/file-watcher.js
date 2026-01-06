/**
 * Chatooly AI Tool Builder - File Watcher
 *
 * Watches project files for changes and triggers live updates.
 * Uses chokidar for efficient file system monitoring.
 */

import chokidar from 'chokidar';
import { join } from 'path';

// Files/patterns to watch for live updates
const WATCH_PATTERNS = [
  'js/*.js',
  'index.html',
  'css/*.css'
];

// Files/patterns to ignore
const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/server/**',
  '**/.git/**',
  '**/package*.json',
  '**/.env*'
];

// Debounce timeout in milliseconds
const DEBOUNCE_MS = 300;

/**
 * Setup file watcher for the project
 * @param {string} projectRoot - Root directory of the project
 * @param {Function} onFileChange - Callback when a file changes
 */
export function setupFileWatcher(projectRoot, onFileChange) {
  const watchPaths = WATCH_PATTERNS.map(pattern => join(projectRoot, pattern));

  const watcher = chokidar.watch(watchPaths, {
    ignored: IGNORE_PATTERNS,
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: DEBOUNCE_MS,
      pollInterval: 100
    }
  });

  // Track last change time for debouncing
  const lastChange = new Map();

  const handleChange = (eventType) => (filePath) => {
    const now = Date.now();
    const lastTime = lastChange.get(filePath) || 0;

    // Debounce rapid changes
    if (now - lastTime < DEBOUNCE_MS) {
      return;
    }

    lastChange.set(filePath, now);

    // Determine file type for targeted reload
    const relativePath = filePath.replace(projectRoot, '').replace(/^[\/\\]/, '');
    const fileType = getFileType(relativePath);

    console.log(`📝 File ${eventType}: ${relativePath} (${fileType})`);

    onFileChange(filePath, eventType, fileType);
  };

  watcher
    .on('change', handleChange('change'))
    .on('add', handleChange('add'))
    .on('unlink', handleChange('unlink'))
    .on('error', (error) => {
      console.error('File watcher error:', error);
    })
    .on('ready', () => {
      console.log('👀 File watcher ready - monitoring for changes');
    });

  return watcher;
}

/**
 * Determine the type of file for targeted reload strategy
 */
function getFileType(filePath) {
  if (filePath.endsWith('.js')) {
    if (filePath.includes('main.js')) return 'main-script';
    if (filePath.includes('ui.js')) return 'ui-script';
    if (filePath.includes('ai-sidebar.js')) return 'sidebar-script';
    return 'script';
  }

  if (filePath.endsWith('.html')) return 'html';
  if (filePath.endsWith('.css')) return 'style';

  return 'other';
}

export default setupFileWatcher;
