/**
 * Chatooly Shell AI Sidebar - Persistent Chat Interface
 *
 * This is the AI sidebar that lives in the shell (parent container).
 * Key difference from ai-sidebar.js: refreshes the IFRAME, not the page.
 *
 * WebSocket connection and chat history persist across tool refreshes.
 */

(function() {
  'use strict';

  // Configuration
  const WS_URL = `ws://${window.location.hostname}:3001/ws`;
  const RECONNECT_DELAY = 3000;
  const MAX_RECONNECT_ATTEMPTS = 5;
  const AUTO_REFRESH_DELAY = 1500;

  // BroadcastChannel for iframe communication
  const ipcChannel = new BroadcastChannel('chatooly-ipc');

  // DOM Elements
  const statusEl = document.getElementById('ai-status');
  const messagesEl = document.getElementById('ai-messages');
  const inputEl = document.getElementById('ai-input');
  const sendBtn = document.getElementById('ai-send');
  const clearBtn = document.getElementById('ai-clear');
  const toggleBtn = document.getElementById('ai-sidebar-toggle');
  const resetBtn = document.getElementById('ai-reset');
  const themeToggleBtn = document.getElementById('ai-theme-toggle');
  const shellContainer = document.getElementById('shell-container');
  const toolFrame = document.getElementById('tool-frame');
  const loadingOverlay = document.getElementById('tool-loading-overlay');
  const typingIndicator = document.getElementById('ai-typing');
  const resizeHandle = document.getElementById('ai-resize-handle');
  const sidebar = document.querySelector('.chatooly-ai-sidebar');
  const resizeOverlay = document.getElementById('resize-overlay');
  const attachBtn = document.getElementById('ai-attach');
  const fileInput = document.getElementById('ai-file-input');
  const attachmentsEl = document.getElementById('ai-attachments');
  const stopBtn = document.getElementById('ai-stop');

  // State
  let socket = null;
  let reconnectAttempts = 0;
  let isConnected = false;
  let isThinking = false;
  let changedFilesInTask = new Set(); // Track files changed during agent execution
  let attachedImages = []; // Array of {data: base64, media_type: string}
  let lastToolUsed = null; // Track last tool to avoid duplicate messages

  // Resize state
  let isResizing = false;
  let startX = 0;
  let startWidth = 0;
  const MIN_WIDTH = 280;
  const MAX_WIDTH = 600;
  const DEFAULT_WIDTH = 400;

  /**
   * Initialize the AI sidebar
   */
  function init() {
    if (!statusEl || !messagesEl || !inputEl || !sendBtn) {
      console.warn('Shell AI Sidebar: Required elements not found');
      return;
    }

    // Connect to WebSocket
    connect();

    // Setup event listeners
    setupEventListeners();

    // Setup IPC listeners
    setupIPCListeners();

    console.log('🤖 Shell AI Sidebar initialized (iframe mode)');
  }

  /**
   * Connect to WebSocket server
   */
  function connect() {
    try {
      socket = new WebSocket(WS_URL);

      socket.onopen = handleOpen;
      socket.onclose = handleClose;
      socket.onerror = handleError;
      socket.onmessage = handleMessage;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket open event
   */
  function handleOpen() {
    console.log('🔌 Connected to AI server');
    isConnected = true;
    reconnectAttempts = 0;
    updateStatus('connected', 'Connected');
    sendBtn.disabled = false;
  }

  /**
   * Handle WebSocket close event
   */
  function handleClose() {
    console.log('🔌 Disconnected from AI server');
    isConnected = false;
    updateStatus('disconnected', 'Disconnected');
    sendBtn.disabled = true;
    scheduleReconnect();
  }

  /**
   * Handle WebSocket error event
   */
  function handleError(error) {
    console.error('WebSocket error:', error);
    updateStatus('disconnected', 'Error');
  }

  /**
   * Handle incoming WebSocket messages
   */
  function handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 Received:', data.type);

      switch (data.type) {
        case 'connected':
          if (!data.hasApiKey) {
            addMessage('system', '⚠️ API key not configured. Add your ANTHROPIC_API_KEY to the .env file and restart the server.');
          }
          break;

        case 'thinking':
          setThinkingUI(true);
          updateStatus('thinking', 'Thinking...');
          showTypingIndicator(true);
          break;

        case 'assistant':
          // Don't hide typing indicator yet - agent may still be working
          // Only hide on 'result' message
          addMessage('assistant', data.content, data.thinking);
          break;

        case 'tool_use':
          // Only show tool message if it's a different tool than the last one
          if (data.tool !== lastToolUsed) {
            addMessage('tool-use', `Using ${data.tool}...`);
            lastToolUsed = data.tool;
          }
          // Show loading overlay when agent is editing files
          if (loadingOverlay && (data.tool === 'Edit' || data.tool === 'Write' || data.tool === 'MultiEdit')) {
            loadingOverlay.style.display = 'flex';
          }
          break;

        case 'result':
          setThinkingUI(false);
          updateStatus('connected', 'Connected');
          showTypingIndicator(false);
          lastToolUsed = null; // Reset for next task

          // Hide loading overlay
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
          }

          if (data.subtype === 'success') {
            addMessage('system', `✅ Done`);

            // Only auto-refresh if HTML was changed during this task
            const htmlChanged = Array.from(changedFilesInTask).some(f => f.endsWith('.html'));
            if (htmlChanged) {
              scheduleAutoRefresh();
            }
            changedFilesInTask.clear(); // Reset for next task
          } else {
            addMessage('error', `❌ ${data.errors?.join(', ') || 'Error'}`);
            changedFilesInTask.clear(); // Reset on error too
          }
          break;

        case 'system':
          // Don't show init message - too noisy
          break;

        case 'error':
          setThinkingUI(false);
          updateStatus('connected', 'Connected');
          showTypingIndicator(false);
          // Hide loading overlay on error
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
          }
          changedFilesInTask.clear();
          addMessage('error', data.message);
          break;

        case 'file-changed':
          changedFilesInTask.add(data.file); // Track changed files
          handleFileChange(data);
          break;

        case 'pong':
          // Heartbeat response
          break;

        case 'cancelled':
          setThinkingUI(false);
          updateStatus('connected', 'Connected');
          showTypingIndicator(false);
          // Hide loading overlay on cancellation
          if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
          }
          changedFilesInTask.clear();
          addMessage('system', '🛑 ' + data.message);
          break;

        case 'reset-complete':
          addMessage('system', '✅ Tool reset to blank template');
          refreshToolFrame();
          break;

        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  }

  /**
   * Handle file change events - forward to iframe
   */
  function handleFileChange(data) {
    const { file, eventType } = data;
    console.log(`📝 File ${eventType}: ${file}`);

    // Forward file change to iframe via BroadcastChannel
    ipcChannel.postMessage({
      type: 'file-changed',
      file,
      eventType
    });

    // For HTML changes (index.html), refresh the iframe silently
    if (file.endsWith('.html') && file.includes('index')) {
      refreshToolFrame();
    }
  }

  /**
   * Schedule an automatic refresh of the TOOL IFRAME (not parent page!)
   * This is the KEY DIFFERENCE from the original ai-sidebar.js
   */
  function scheduleAutoRefresh() {
    // No message - just show loading state briefly
    updateStatus('thinking', 'Refreshing...');

    setTimeout(() => {
      refreshToolFrame();
      updateStatus('connected', 'Connected');
    }, AUTO_REFRESH_DELAY);
  }

  /**
   * Refresh the tool iframe
   */
  function refreshToolFrame() {
    if (toolFrame) {
      // Method 1: Reload iframe by resetting src
      toolFrame.src = toolFrame.src;

      // Alternative: Use BroadcastChannel to tell iframe to reload itself
      // ipcChannel.postMessage({ type: 'refresh-tool' });
    }
  }

  /**
   * Setup IPC listeners for messages from the iframe
   */
  function setupIPCListeners() {
    ipcChannel.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'tool-ready':
          console.log('📱 Tool iframe loaded');
          break;

        case 'tool-error':
          addMessage('error', `Tool error: ${data?.message || 'Unknown error'}`);
          break;

        default:
          console.log('IPC message:', type, data);
      }
    };
  }

  /**
   * Schedule a reconnection attempt
   */
  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      addMessage('error', '❌ Could not connect to server. Please ensure the server is running (npm start)');
      return;
    }

    reconnectAttempts++;
    const delay = RECONNECT_DELAY * reconnectAttempts;

    console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);

    setTimeout(() => {
      if (!isConnected) {
        connect();
      }
    }, delay);
  }

  /**
   * Update the status indicator
   */
  function updateStatus(state, text) {
    statusEl.className = `ai-status ${state}`;
    statusEl.textContent = text;
  }

  /**
   * Show or hide the typing indicator
   */
  function showTypingIndicator(show) {
    if (typingIndicator) {
      typingIndicator.classList.toggle('visible', show);
    }
  }

  /**
   * Update UI for thinking/idle state - toggles stop/send buttons
   */
  function setThinkingUI(thinking) {
    isThinking = thinking;
    if (stopBtn) {
      stopBtn.style.display = thinking ? 'inline-block' : 'none';
      stopBtn.disabled = false;
    }
    if (sendBtn) {
      sendBtn.style.display = thinking ? 'none' : 'inline-block';
    }
  }

  /**
   * Add a message to the chat
   * @param {string} type - Message type (assistant, user, system, error, tool-use)
   * @param {string} content - Message content
   * @param {string|null} thinking - Optional thinking/reasoning content for assistant messages
   */
  function addMessage(type, content, thinking = null) {
    // Remove welcome message if present
    const welcome = messagesEl.querySelector('.ai-welcome');
    if (welcome) {
      welcome.remove();
    }

    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ${type}`;

    // For assistant messages, wrap content and add collapse button
    if (type === 'assistant') {
      // Add thinking section if present (collapsible)
      if (thinking) {
        const thinkingSection = document.createElement('details');
        thinkingSection.className = 'ai-thinking-section';

        const summary = document.createElement('summary');
        summary.textContent = 'Thinking...';
        thinkingSection.appendChild(summary);

        const thinkingContent = document.createElement('div');
        thinkingContent.className = 'ai-thinking-content';
        thinkingContent.innerHTML = formatContent(thinking);
        thinkingSection.appendChild(thinkingContent);

        messageEl.appendChild(thinkingSection);
      }

      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'ai-message-content';
      contentWrapper.innerHTML = formatContent(content);

      const collapseBtn = document.createElement('button');
      collapseBtn.className = 'ai-message-collapse';
      collapseBtn.textContent = '▼';
      collapseBtn.title = 'Collapse/Expand';
      collapseBtn.onclick = () => {
        messageEl.classList.toggle('collapsed');
        collapseBtn.textContent = messageEl.classList.contains('collapsed') ? '▶' : '▼';
      };

      messageEl.appendChild(collapseBtn);
      messageEl.appendChild(contentWrapper);
    } else {
      // Format content (handle markdown-like formatting)
      messageEl.innerHTML = formatContent(content);
    }

    messagesEl.appendChild(messageEl);

    // Scroll to bottom
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /**
   * Format message content with basic markdown support
   */
  function formatContent(content) {
    if (!content) return '';

    // Escape HTML
    let formatted = content
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    formatted = formatted.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="${lang}">${code.trim()}</code></pre>`;
    });

    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }

  /**
   * Convert file to base64
   */
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result.split(',')[1]; // Remove data:image/...;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Render attachment previews
   */
  function renderAttachments() {
    if (!attachmentsEl) return;

    attachmentsEl.innerHTML = attachedImages.map((img, index) => `
      <div class="ai-attachment-preview">
        <img src="data:${img.media_type};base64,${img.data}" alt="Attachment ${index + 1}">
        <button class="ai-attachment-remove" data-index="${index}">×</button>
      </div>
    `).join('');

    // Add remove handlers
    attachmentsEl.querySelectorAll('.ai-attachment-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        attachedImages.splice(index, 1);
        renderAttachments();
        updateSendButton();
      });
    });
  }

  /**
   * Clear attachments after send
   */
  function clearAttachments() {
    attachedImages = [];
    if (attachmentsEl) {
      attachmentsEl.innerHTML = '';
    }
  }

  /**
   * Handle file selection for attachments
   */
  async function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        // Limit file size to 5MB
        if (file.size > 5 * 1024 * 1024) {
          addMessage('error', `Image ${file.name} is too large (max 5MB)`);
          continue;
        }
        // Limit to 5 images
        if (attachedImages.length >= 5) {
          addMessage('error', 'Maximum 5 images per message');
          break;
        }
        try {
          const base64 = await fileToBase64(file);
          attachedImages.push({
            data: base64,
            media_type: file.type
          });
          renderAttachments();
          updateSendButton();
        } catch (err) {
          console.error('Error reading file:', err);
        }
      }
    }
    if (fileInput) {
      fileInput.value = ''; // Reset for re-selection
    }
  }

  /**
   * Update send button state based on input and attachments
   */
  function updateSendButton() {
    sendBtn.disabled = !isConnected || (!inputEl.value.trim() && attachedImages.length === 0);
  }

  /**
   * Send a message to the agent
   */
  function sendMessage() {
    const text = inputEl.value.trim();

    // Allow sending if we have text OR images
    if ((!text && attachedImages.length === 0) || !isConnected || isThinking) {
      return;
    }

    // Show user message with image indicator
    const displayText = attachedImages.length > 0
      ? `${text || '(image)'} [${attachedImages.length} image(s) attached]`
      : text;
    addMessage('user', displayText);

    // Build message with images
    const message = {
      type: 'chat',
      prompt: text || 'What do you see in this image?',
      images: attachedImages.map(img => ({
        type: 'base64',
        media_type: img.media_type,
        data: img.data
      }))
    };

    // Send to server
    socket.send(JSON.stringify(message));

    // Clear input and attachments
    inputEl.value = '';
    clearAttachments();
    updateSendButton();
    inputEl.focus();
  }

  /**
   * Clear the conversation
   */
  function clearConversation() {
    // Reset messages area
    messagesEl.innerHTML = `
      <div class="ai-welcome">
        <h4>Welcome to Chatooly AI</h4>
        <p>Describe the tool you want to build, and I'll create it for you following all Chatooly conventions.</p>
        <p style="margin-top: 12px; font-size: 11px;">Examples:<br>
        "Create a gradient generator"<br>
        "Build a mandala pattern tool"<br>
        "Make a color palette picker"</p>
      </div>
    `;

    inputEl.focus();
  }

  /**
   * Toggle sidebar visibility
   */
  function toggleSidebar() {
    if (shellContainer) {
      shellContainer.classList.toggle('ai-sidebar-collapsed');
      // Save state to localStorage
      const isCollapsed = shellContainer.classList.contains('ai-sidebar-collapsed');
      localStorage.setItem('ai-sidebar-collapsed', isCollapsed);
    }
  }

  /**
   * Toggle dark/light theme
   */
  function toggleTheme() {
    if (shellContainer) {
      shellContainer.classList.toggle('dark-theme');
      const isDark = shellContainer.classList.contains('dark-theme');
      localStorage.setItem('ai-sidebar-dark-theme', isDark);
      // Update button icon
      if (themeToggleBtn) {
        themeToggleBtn.textContent = isDark ? '☀️' : '🌙';
      }
    }
  }

  /**
   * Restore theme from localStorage
   */
  function restoreTheme() {
    const isDark = localStorage.getItem('ai-sidebar-dark-theme') === 'true';
    if (isDark && shellContainer) {
      shellContainer.classList.add('dark-theme');
      if (themeToggleBtn) {
        themeToggleBtn.textContent = '☀️';
      }
    }
  }

  /**
   * Restore sidebar state from localStorage
   */
  function restoreSidebarState() {
    const isCollapsed = localStorage.getItem('ai-sidebar-collapsed') === 'true';
    if (isCollapsed && shellContainer) {
      shellContainer.classList.add('ai-sidebar-collapsed');
    }
  }

  /**
   * Restore sidebar width from localStorage
   */
  function restoreSidebarWidth() {
    const savedWidth = localStorage.getItem('ai-sidebar-width');
    if (savedWidth && sidebar) {
      const width = parseInt(savedWidth, 10);
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        setSidebarWidth(width);
      }
    }
  }

  /**
   * Set sidebar width and update CSS variable
   */
  function setSidebarWidth(width) {
    if (sidebar) {
      sidebar.style.width = width + 'px';
      sidebar.style.minWidth = width + 'px';
      sidebar.style.flexBasis = width + 'px';
      document.documentElement.style.setProperty('--sidebar-current-width', width + 'px');
    }
  }

  /**
   * Initialize resize functionality
   */
  function initResize(e) {
    if (!sidebar) return;

    isResizing = true;
    startX = e.clientX;
    startWidth = sidebar.offsetWidth;

    resizeHandle.classList.add('resizing');
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    // Show overlay to capture mouse events over iframe
    if (resizeOverlay) {
      resizeOverlay.classList.add('active');
    }

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
    e.preventDefault();
  }

  /**
   * Handle resize mouse move
   */
  function handleResize(e) {
    if (!isResizing) return;

    // Since sidebar is on the right, dragging left increases width
    const diff = startX - e.clientX;
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + diff));

    setSidebarWidth(newWidth);
  }

  /**
   * Stop resize operation
   */
  function stopResize() {
    if (!isResizing) return;

    isResizing = false;
    resizeHandle.classList.remove('resizing');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';

    // Hide overlay
    if (resizeOverlay) {
      resizeOverlay.classList.remove('active');
    }

    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);

    // Persist width preference
    if (sidebar) {
      localStorage.setItem('ai-sidebar-width', sidebar.offsetWidth);
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Send button
    sendBtn.addEventListener('click', sendMessage);

    // Stop button - cancel agent execution
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN && isThinking) {
          socket.send(JSON.stringify({ type: 'cancel' }));
          updateStatus('thinking', 'Stopping...');
          stopBtn.disabled = true;
        }
      });
    }

    // Clear button
    clearBtn.addEventListener('click', clearConversation);

    // Toggle button
    if (toggleBtn) {
      toggleBtn.addEventListener('click', toggleSidebar);
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset tool to blank template? This will clear all current work.')) {
          socket.send(JSON.stringify({ type: 'reset' }));
          addMessage('system', '🔄 Resetting tool...');
        }
      });
    }

    // Restore sidebar state, width, and theme
    restoreSidebarState();
    restoreSidebarWidth();
    restoreTheme();

    // Theme toggle button
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Attach button
    if (attachBtn && fileInput) {
      attachBtn.addEventListener('click', () => fileInput.click());
      fileInput.addEventListener('change', handleFileSelect);
    }

    // Resize handle
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', initResize);
    }

    // Enter to send (Shift+Enter for new line)
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Escape key to stop agent execution
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isThinking && stopBtn) {
        stopBtn.click();
      }
    });

    // Enable/disable send button based on input and attachments
    inputEl.addEventListener('input', updateSendButton);

    // Heartbeat to keep connection alive
    setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.ShellAI = {
    connect,
    sendMessage,
    clearConversation,
    toggleSidebar,
    toggleTheme,
    refreshToolFrame,
    setSidebarWidth,
    isConnected: () => isConnected,
    isThinking: () => isThinking,
    ipcChannel
  };

})();
