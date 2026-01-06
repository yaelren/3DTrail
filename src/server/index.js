/**
 * Chatooly AI Tool Builder - Server
 *
 * Express + WebSocket server that:
 * 1. Serves static files from project root
 * 2. Manages Claude Agent SDK sessions
 * 3. Broadcasts file changes for live updates
 */

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import dotenv from 'dotenv';

import { createAgent, handleAgentMessage } from './agent.js';
import { setupFileWatcher } from './file-watcher.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const PORT = process.env.PORT || 3001;

// Express app setup
const app = express();
app.use(express.json());

// Default route serves shell.html (persistent AI sidebar container)
// MUST come before static middleware to override index.html default
app.get('/', (req, res) => {
  res.sendFile(join(PROJECT_ROOT, 'shell.html'));
});

// Serve static files from project root
// index: false prevents serving index.html for / (we handle that above)
app.use(express.static(PROJECT_ROOT, { index: false }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Create HTTP server
const server = createServer(app);

// WebSocket server
const wss = new WebSocketServer({ server, path: '/ws' });

// Track active connections and agent sessions
const clients = new Set();
const agentSessions = new Map();
const conversationHistory = new Map(); // Track chat history per WebSocket
const sessionFilenames = new Map(); // Track log filename per WebSocket session

// Logs directory
const LOGS_DIR = join(PROJECT_ROOT, '..', 'logs');

wss.on('connection', (ws) => {
  console.log('🔌 Client connected');
  clients.add(ws);

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'Connected to Chatooly AI Server',
    hasApiKey: !!process.env.ANTHROPIC_API_KEY
  }));

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log('📨 Received:', message.type);

      switch (message.type) {
        case 'chat':
          await handleChatMessage(ws, message);
          break;

        case 'cancel':
          cancelAgentSession(ws);
          break;

        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;

        case 'reset':
          await resetToolToTemplate(ws);
          break;

        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: `Unknown message type: ${message.type}`
          }));
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('🔌 Client disconnected');
    clients.delete(ws);
    cancelAgentSession(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

/**
 * Add a message to the conversation history
 */
function addToHistory(ws, role, content) {
  if (!conversationHistory.has(ws)) {
    conversationHistory.set(ws, []);
  }
  conversationHistory.get(ws).push({
    timestamp: new Date().toISOString(),
    role,
    content
  });
  console.log(`📝 Added to history: ${role} (${content.substring(0, 50)}...)`);
}

/**
 * Get current tool name from chatooly-config.js
 */
function getCurrentToolName() {
  try {
    const configPath = join(PROJECT_ROOT, 'js', 'chatooly-config.js');
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, 'utf-8');
      const match = content.match(/name:\s*["']([^"']+)["']/);
      if (match) {
        return match[1];
      }
    }
  } catch (error) {
    console.warn('Could not read tool name from config:', error.message);
  }
  return 'unnamed-tool';
}

/**
 * Get or create a stable filename for this session's conversation log
 */
function getSessionFilename(ws) {
  if (!sessionFilenames.has(ws)) {
    const toolName = getCurrentToolName();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    sessionFilenames.set(ws, `${toolName}_${timestamp}.txt`);
  }
  return sessionFilenames.get(ws);
}

/**
 * Save conversation history to a txt file (overwrites same file each time)
 */
function saveConversationHistory(ws) {
  console.log('📝 saveConversationHistory called');
  const history = conversationHistory.get(ws);
  console.log('📝 History length:', history?.length || 0);
  if (!history || history.length === 0) {
    return null;
  }

  // Ensure logs directory exists
  if (!existsSync(LOGS_DIR)) {
    mkdirSync(LOGS_DIR, { recursive: true });
  }

  const filename = getSessionFilename(ws);
  const filepath = join(LOGS_DIR, filename);

  const content = history.map(msg =>
    `[${msg.timestamp}] ${msg.role.toUpperCase()}:\n${msg.content}\n`
  ).join('\n---\n\n');

  writeFileSync(filepath, content, 'utf-8');
  console.log(`📝 Auto-saved conversation to: ${filename}`);
  return filename;
}

/**
 * Handle incoming chat messages from the frontend
 */
async function handleChatMessage(ws, message) {
  const { prompt, images } = message;

  if (!process.env.ANTHROPIC_API_KEY) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'ANTHROPIC_API_KEY not configured. Please add your API key to the .env file.'
    }));
    return;
  }

  // Track user message in history
  const userContent = images && images.length > 0
    ? `${prompt}\n[${images.length} image(s) attached]`
    : prompt;
  addToHistory(ws, 'user', userContent);

  try {
    // Reuse existing agent session if available, otherwise create new one
    let agent = agentSessions.get(ws);

    if (!agent) {
      // First message - create new agent
      ws.send(JSON.stringify({ type: 'thinking', message: 'Initializing agent...' }));
      agent = await createAgent(PROJECT_ROOT);
      agentSessions.set(ws, agent);
      console.log('🤖 New agent session created');
    } else {
      // Subsequent messages - reuse existing agent
      ws.send(JSON.stringify({ type: 'thinking', message: 'Agent is processing...' }));
      console.log('🤖 Reusing existing agent session');
    }

    // Log if images are attached
    if (images && images.length > 0) {
      console.log(`📎 Message includes ${images.length} image(s)`);
    }

    // Process the message and stream responses (with images if provided)
    await handleAgentMessage(agent, prompt, images || [], (event) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event));
      }

      // Track assistant messages in history
      if (event.type === 'assistant' && event.content) {
        addToHistory(ws, 'assistant', event.content);
      }
    });

    // Auto-save conversation after each agent response
    saveConversationHistory(ws);

  } catch (error) {
    console.error('Agent error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: `Agent error: ${error.message}`
    }));
  }
}

/**
 * Cancel an active agent session
 */
function cancelAgentSession(ws) {
  const agent = agentSessions.get(ws);
  if (agent && agent.abortController) {
    agent.abortController.abort();
    agentSessions.delete(ws);
    console.log('🛑 Agent session cancelled');
  }
}

/**
 * Reset tool files to blank template state
 */
async function resetToolToTemplate(ws) {
  try {
    // Save conversation history before reset
    const savedFile = saveConversationHistory(ws);
    if (savedFile) {
      ws.send(JSON.stringify({
        type: 'system',
        message: `💾 Conversation saved to logs/${savedFile}`
      }));
    }

    // Clear conversation history, session filename, and agent session
    conversationHistory.delete(ws);
    sessionFilenames.delete(ws); // New session will get a new filename
    cancelAgentSession(ws);

    // Git paths are relative to repo root, which is parent of src/
    const repoRoot = join(PROJECT_ROOT, '..');
    execSync('git checkout origin/main -- src/index.html src/js/main.js src/js/ui.js src/js/chatooly-config.js', {
      cwd: repoRoot
    });

    // Restore author from USERNAME.txt
    updateAuthorFromUsername();

    ws.send(JSON.stringify({ type: 'reset-complete' }));
    // Broadcast file change to trigger iframe refresh
    broadcastFileChange('index.html', 'change');
    console.log('🔄 Tool reset to blank template');
  } catch (error) {
    console.error('Reset error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Reset failed: ' + error.message
    }));
  }
}

/**
 * Broadcast file changes to all connected clients
 */
function broadcastFileChange(file, eventType) {
  const message = JSON.stringify({
    type: 'file-changed',
    file: file.replace(PROJECT_ROOT, '').replace(/^[\/\\]/, ''),
    eventType
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Setup file watcher for live updates
setupFileWatcher(PROJECT_ROOT, broadcastFileChange);

/**
 * Update author in chatooly-config.js from USERNAME.txt
 */
function updateAuthorFromUsername() {
  const repoRoot = join(PROJECT_ROOT, '..');
  const usernamePath = join(repoRoot, 'USERNAME.txt');
  if (existsSync(usernamePath)) {
    const username = readFileSync(usernamePath, 'utf-8').trim();
    if (username) {
      const configPath = join(PROJECT_ROOT, 'js', 'chatooly-config.js');
      if (existsSync(configPath)) {
        let config = readFileSync(configPath, 'utf-8');
        config = config.replace(/author:\s*["'][^"']*["']/, `author: "${username}"`);
        writeFileSync(configPath, config);
        console.log(`👤 Updated author from USERNAME.txt: ${username}`);
      }
    }
  }
}

// Update author on server start
updateAuthorFromUsername();

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║          🤖 Chatooly AI Tool Builder Server                ║
╠════════════════════════════════════════════════════════════╣
║  🌐 Server:     http://localhost:${PORT}                      ║
║  🔌 WebSocket:  ws://localhost:${PORT}/ws                     ║
║  📁 Project:    ${PROJECT_ROOT}
╠════════════════════════════════════════════════════════════╣
║  API Key:       ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Missing (add to .env)'}                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export { app, server, wss };
