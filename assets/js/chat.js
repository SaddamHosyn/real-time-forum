// Enhanced chat.js - Clean JavaScript without inline CSS
console.log('📦 Chat.js loading...');

class ChatManager {
    constructor() {
        console.log('🎯 ChatManager constructor called');
        this.ws = null;
        this.currentChatUser = null;
        this.messageHistory = new Map();
        this.typingTimer = null;
        this.isTyping = false;
        this.messagesContainer = null;
        this.userListContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.loginPrompt = null;
        this.currentPage = 1;
        this.hasMoreMessages = true;
        this.isLoadingMessages = false;
        this.connectionAttempts = 0;
        this.maxConnectionAttempts = 5;
        
        console.log('🔧 Calling initializeChat...');
        this.initializeChat();
    }

    initializeChat() {
        console.log('🚀 initializeChat called');
        console.log('🔍 Current appState:', window.appState);
        console.log('🔍 User authenticated:', window.appState?.isAuthenticated);
        console.log('🔍 User details:', window.appState?.user);
        
        // Always setup UI elements
        this.setupEventListeners();
        this.setupScrollPagination();
        
        // Update UI based on auth status
        this.updateForAuthStatus();
    }

    // ✅ UPDATED: Combined fix for better timing and user list refresh
    updateForAuthStatus() {
        console.log('🔄 Updating chat for auth status:', window.appState?.isAuthenticated);
        
        if (window.appState?.isAuthenticated) {
            console.log('✅ User authenticated, enabling full chat...');
            this.enableChatFunctionality();
            
            // ✅ COMBINED FIX: Connect WebSocket first, then load users with delay
            this.connectWebSocket();
            
            // ✅ COMBINED FIX: Load users with delay to ensure WebSocket connects
            setTimeout(() => {
                this.loadChatUsers();
            }, 1200);
            
        } else {
            console.log('❌ User not authenticated, showing limited chat...');
            this.disableChatFunctionality();
            this.disconnectWebSocket();
            this.showAuthRequiredPrompt();
        }
    }

    enableChatFunctionality() {
        console.log('✅ Enabling chat functionality...');
        
        if (this.messageInput) {
            this.messageInput.disabled = false;
            this.messageInput.placeholder = 'Type a message...';
            console.log('📝 Message input enabled');
        } else {
            console.error('❌ Message input not found!');
        }
        
        if (this.sendButton) {
            this.sendButton.disabled = false;
            console.log('📤 Send button enabled');
        } else {
            console.error('❌ Send button not found!');
        }
        
        if (this.loginPrompt) {
            this.loginPrompt.classList.add('d-none');
        }
    }

    disableChatFunctionality() {
        console.log('❌ Disabling chat functionality...');
        
        if (this.messageInput) {
            this.messageInput.disabled = true;
            this.messageInput.placeholder = 'Login to the website to send messages...';
            this.messageInput.value = '';
        }
        if (this.sendButton) {
            this.sendButton.disabled = true;
        }
        if (this.loginPrompt) {
            this.loginPrompt.classList.remove('d-none');
        }
        
        // Clear current chat
        this.currentChatUser = null;
        this.clearMessages();
        this.updateChatHeader('Login to start chatting');
    }

    // ✅ UPDATED: Enhanced WebSocket connection with multiple refresh strategy
    connectWebSocket() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('🔌 WebSocket already connected');
            return;
        }
        
        if (this.connectionAttempts >= this.maxConnectionAttempts) {
            console.error('❌ Max WebSocket connection attempts reached');
            this.showConnectionError();
            return;
        }
        
        this.connectionAttempts++;
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log(`🔌 Connecting to WebSocket (attempt ${this.connectionAttempts}):`, wsUrl);
        console.log('🔍 Current user for WebSocket:', window.appState?.user);
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            // ✅ ENHANCED: Updated onopen handler with multiple refresh strategy
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                console.log('👤 User should now be marked online:', window.appState?.user?.username);
                this.connectionAttempts = 0; // Reset on successful connection
                
                // ✅ ENHANCED: Multiple refresh strategy for better sync
                setTimeout(() => {
                    if (window.appState?.isAuthenticated) {
                        console.log('🔄 First refresh after WebSocket connection');
                        this.loadChatUsers();
                    }
                }, 500);
                
                // ✅ NEW: Second refresh to catch any missed status updates
                setTimeout(() => {
                    if (window.appState?.isAuthenticated) {
                        console.log('🔄 Second refresh to ensure all online statuses are synced');
                        this.loadChatUsers();
                    }
                }, 1500);
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    console.log('📨 WebSocket message received:', message);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onclose = (event) => {
                console.log('❌ WebSocket disconnected:', event.code, event.reason);
                console.log('👤 User should now be marked offline:', window.appState?.user?.username);
                this.ws = null;
                
                // ✅ COMBINED FIX: Refresh user list when disconnected
                if (window.appState?.isAuthenticated) {
                    setTimeout(() => {
                        this.loadChatUsers();
                    }, 500);
                }
                
                // Only reconnect if user is still authenticated and we haven't exceeded max attempts
                if (window.appState?.isAuthenticated && this.connectionAttempts < this.maxConnectionAttempts) {
                    console.log('🔄 Attempting to reconnect in 3 seconds...');
                    setTimeout(() => this.connectWebSocket(), 3000);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket error:', error);
                this.showConnectionError();
            };
            
        } catch (error) {
            console.error('❌ Error creating WebSocket:', error);
            this.showConnectionError();
        }
    }

    showConnectionError() {
        this.showTemporaryMessage('Chat connection failed. Please refresh the page.');
    }

    disconnectWebSocket() {
        if (this.ws) {
            console.log('🔌 Disconnecting WebSocket');
            this.ws.close();
            this.ws = null;
        }
        this.connectionAttempts = 0;
    }

    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Get DOM elements with detailed logging
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.loginPrompt = document.getElementById('login-prompt');
        this.userListContainer = document.querySelector('#user-list .users');
        this.messagesContainer = document.querySelector('.message-history');
        
        console.log('📝 Message input found:', !!this.messageInput);
        console.log('📤 Send button found:', !!this.sendButton);
        console.log('🔐 Login prompt found:', !!this.loginPrompt);
        console.log('👥 User list container found:', !!this.userListContainer);
        console.log('💬 Messages container found:', !!this.messagesContainer);
        
        // Detailed DOM element debugging
        if (!this.messageInput) console.error('❌ CRITICAL: message-input element not found in DOM!');
        if (!this.sendButton) console.error('❌ CRITICAL: send-button element not found in DOM!');
        if (!this.userListContainer) console.error('❌ CRITICAL: user-list .users element not found in DOM!');
        if (!this.messagesContainer) console.error('❌ CRITICAL: .message-history element not found in DOM!');
        
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                console.log('⌨️ Key pressed in message input:', e.key);
                if (e.key === 'Enter' && !this.messageInput.disabled) {
                    console.log('📤 Enter pressed, sending message...');
                    this.sendMessage();
                }
            });
            
            this.messageInput.addEventListener('input', () => {
                if (!this.messageInput.disabled) {
                    this.handleTyping();
                }
            });
            
            this.messageInput.addEventListener('blur', () => {
                this.stopTyping();
            });
        }

        if (this.sendButton) {
            this.sendButton.addEventListener('click', (e) => {
                console.log('🖱️ Send button clicked');
                e.preventDefault();
                if (!this.sendButton.disabled) {
                    this.sendMessage();
                }
            });
        }

        if (this.userListContainer) {
            this.userListContainer.addEventListener('click', (e) => {
                const userElement = e.target.closest('.user');
                if (userElement && window.appState?.isAuthenticated) {
                    const userId = userElement.dataset.userId;
                    console.log('👤 User clicked:', userId);
                    this.openChat(userId);
                } else if (userElement && !window.appState?.isAuthenticated) {
                    this.showMainLoginPrompt();
                }
            });
        }
    }

    showMainLoginPrompt() {
        this.showTemporaryMessage('Please login to the website first to start chatting');
    }

    // ✅ CLEAN: No inline CSS, only className
    showTemporaryMessage(message) {
        console.log('💬 Showing temporary message:', message);
        const overlay = document.createElement('div');
        overlay.className = 'temporary-message-overlay';
        overlay.textContent = message;
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 3000);
    }

    handleWebSocketMessage(message) {
        console.log('📨 Handling WebSocket message type:', message.type);
        
        // In handleWebSocketMessage method
    switch (message.type) {
        case 'new_message':
            this.handleNewMessage(message.data);
           break;
        case 'typing':
            this.handleTypingIndicator(message.data);
          break;
        case 'user_status':
            this.handleUserStatusChange(message.data);
          break;
        case 'force_refresh':
         console.log('🔄 Force refreshing user list');
            this.loadChatUsers();
            break;
        default:
        console.log('❓ Unknown message type:', message.type);
    }

}

    handleNewMessage(messageData) {
        console.log('💬 Handling new message:', messageData);
        console.log('🔍 Current chat user:', this.currentChatUser);
        console.log('🔍 Message sender:', messageData.sender_id);
        console.log('🔍 Message receiver:', messageData.receiver_id);
        console.log('🔍 Current user ID:', window.appState?.user?.id);
        
        // Update message history
        const chatKey = this.getChatKey(messageData.sender_id, messageData.receiver_id);
        if (!this.messageHistory.has(chatKey)) {
            this.messageHistory.set(chatKey, []);
        }
        this.messageHistory.get(chatKey).push(messageData);

        // If this message is for the current chat, display it
        if (this.currentChatUser && 
            (messageData.sender_id === this.currentChatUser.id || 
             messageData.receiver_id === this.currentChatUser.id)) {
            console.log('✅ Displaying message in current chat');
            this.displayMessage(messageData);
            this.scrollToBottom();
        } else {
            console.log('❌ Message not for current chat or no chat open');
        }

        // Update user list with new message
        this.updateUserListItem(messageData.sender_id, messageData.message, messageData.created_at);
        
        // Show notification if not current chat
        if (!this.currentChatUser || messageData.sender_id !== this.currentChatUser.id) {
            this.showNotification(messageData);
        }
    }

    handleTypingIndicator(data) {
        if (this.currentChatUser && data.user_id === this.currentChatUser.id) {
            this.showTypingIndicator(data.is_typing, data.username);
        }
    }

    // ✅ ENHANCED: Better status change handling with forced UI update
    handleUserStatusChange(data) {
        console.log('👤 User status change received:', data);
        console.log('🔄 Updating online status and refreshing user list');
        
        // ✅ IMMEDIATE: Update individual user status right away
        this.updateUserOnlineStatus(data.user_id, data.is_online);
        
        // ✅ ENHANCED: Force refresh user list with shorter delay
        if (window.appState?.isAuthenticated) {
            setTimeout(() => {
                console.log('🔄 Force refreshing user list due to status change');
                this.loadChatUsers();
            }, 200); // Shorter delay for faster updates
        }
    }

    async loadChatUsers() {
        console.log('👥 Loading chat users...');
        try {
            const response = await fetch('/api/chat/users', {
                credentials: 'include'
            });
            
            console.log('📡 Chat users response status:', response.status);
            
            if (response.ok) {
                const responseText = await response.text();
                console.log('📡 Raw response:', responseText);
                
                let users;
                try {
                    users = JSON.parse(responseText);
                    console.log('👥 Chat users loaded:', users);
                    console.log('🔍 Users type:', typeof users, 'Is array:', Array.isArray(users));
                } catch (parseError) {
                    console.error('❌ JSON parse error:', parseError);
                    users = [];
                }
                
                // ✅ Ensure users is always an array
                if (!Array.isArray(users)) {
                    console.warn('⚠️ Backend returned non-array, converting to array');
                    users = [];
                }
                
                this.renderUserList(users);
            } else if (response.status === 401) {
                console.log('🔒 Unauthorized - showing auth required');
                this.showAuthRequiredUserList();
            } else {
                console.error('❌ Failed to load chat users:', response.statusText);
                this.showAuthRequiredUserList();
            }
        } catch (error) {
            console.error('❌ Error loading chat users:', error);
            this.showAuthRequiredUserList();
        }
    }

    showAuthRequiredUserList() {
        console.log('🔐 Showing auth required user list');
        if (!this.userListContainer) return;

        while (this.userListContainer.firstChild) {
            this.userListContainer.removeChild(this.userListContainer.firstChild);
        }

        const authMessage = document.createElement('li');
        authMessage.className = 'auth-required-message';

        const messageText = document.createElement('div');
        messageText.textContent = 'Login to the website';

        const messageText2 = document.createElement('div');
        messageText2.textContent = 'to see online users';

        authMessage.appendChild(messageText);
        authMessage.appendChild(messageText2);
        this.userListContainer.appendChild(authMessage);
    }

    showAuthRequiredPrompt() {
        if (this.messagesContainer) {
            this.clearMessages();
            
            const promptDiv = document.createElement('div');
            promptDiv.className = 'chat-auth-prompt';

            const title = document.createElement('h4');
            title.textContent = 'Chat Available';

            const message = document.createElement('p');
            message.textContent = 'Login to the website to start chatting with other users';

            const note = document.createElement('small');
            note.textContent = 'Use the login button in the top navigation';

            promptDiv.appendChild(title);
            promptDiv.appendChild(message);
            promptDiv.appendChild(note);
            this.messagesContainer.appendChild(promptDiv);
        }
    }

    renderUserList(users) {
        console.log('🎨 Rendering user list with', users?.length || 0, 'users');
        console.log('🔍 Users data type:', typeof users, 'Value:', users);
        
        if (!this.userListContainer) {
            console.error('❌ User list container not found');
            return;
        }

        // Clear existing users
        while (this.userListContainer.firstChild) {
            this.userListContainer.removeChild(this.userListContainer.firstChild);
        }

        // ✅ FIX: Handle null/undefined users gracefully
        if (!users || !Array.isArray(users)) {
            console.log('⚠️ Users data is null/invalid, showing empty state');
            const noUsersMessage = document.createElement('li');
            noUsersMessage.className = 'no-users-message';
            noUsersMessage.textContent = users === null ? 'No users found' : 'Loading users...';
            this.userListContainer.appendChild(noUsersMessage);
            return;
        }

        if (users.length === 0) {
            const noUsersMessage = document.createElement('li');
            noUsersMessage.className = 'no-users-message';
            noUsersMessage.textContent = 'No users available';
            this.userListContainer.appendChild(noUsersMessage);
            return;
        }

        users.forEach(user => {
            const userElement = this.createUserElement(user);
            this.userListContainer.appendChild(userElement);
        });
        
        console.log('✅ User list rendered successfully');
    }

    // ✅ ENHANCED createUserElement with better UX
    createUserElement(user) {
        const li = document.createElement('li');
        li.className = `user ${user.is_online ? 'online' : 'offline'}`;
        li.dataset.userId = user.id;

        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';

        const userDetails = document.createElement('div');
        userDetails.className = 'user-details';

        // ✅ Show online status more prominently
        if (user.is_online) {
            const onlineIndicator = document.createElement('span');
            onlineIndicator.className = 'online-indicator';
            onlineIndicator.textContent = '●';
            userDetails.appendChild(onlineIndicator);
        }

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = user.username;
        userDetails.appendChild(usernameSpan);

        // ✅ Show unread count badge
        if (user.unread_count > 0) {
            const unreadBadge = document.createElement('span');
            unreadBadge.className = 'unread-badge';
            unreadBadge.textContent = user.unread_count.toString();
            userDetails.appendChild(unreadBadge);
        }

        const userMeta = document.createElement('div');
        userMeta.className = 'user-meta';

        const lastMessageSpan = document.createElement('span');
        lastMessageSpan.className = 'last-message';
        const messageText = user.last_message ? 
            (user.last_message.length > 30 ? user.last_message.slice(0, 30) + '...' : user.last_message) : 
            'Click to start chatting';
        lastMessageSpan.textContent = messageText;

        const lastMessageTimeSpan = document.createElement('span');
        lastMessageTimeSpan.className = 'last-message-time';
        lastMessageTimeSpan.textContent = this.getTimeAgo(user.last_message_time);

        userMeta.appendChild(lastMessageSpan);
        userMeta.appendChild(lastMessageTimeSpan);
        userInfo.appendChild(userDetails);
        userInfo.appendChild(userMeta);
        li.appendChild(userInfo);

        return li;
    }

    sendMessage() {
        console.log('📤 sendMessage called');
        console.log('🔍 Current user authenticated:', window.appState?.isAuthenticated);
        console.log('🔍 Current chat user:', this.currentChatUser);
        console.log('🔍 Message input value:', this.messageInput?.value);
        console.log('🔍 WebSocket state:', this.ws?.readyState);
        
        if (!window.appState?.isAuthenticated) {
            console.log('❌ User not authenticated');
            this.showMainLoginPrompt();
            return;
        }

        if (!this.currentChatUser) {
            console.log('❌ No chat user selected');
            this.showTemporaryMessage('Please select a user to chat with');
            return;
        }

        if (!this.messageInput) {
            console.error('❌ Message input not found');
            return;
        }

        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.error('❌ WebSocket not connected');
            this.showTemporaryMessage('Chat connection lost. Reconnecting...');
            this.connectWebSocket();
            return;
        }

        const message = this.messageInput.value.trim();
        if (!message) {
            console.log('❌ Empty message');
            return;
        }

        console.log('📤 Sending message:', message, 'to user:', this.currentChatUser.id);

        const messageData = {
            type: 'chat_message',
            data: {
                receiver_id: this.currentChatUser.id,
                message: message
            }
        };

        try {
            this.ws.send(JSON.stringify(messageData));
            console.log('✅ Message sent successfully');
            this.messageInput.value = '';
            this.stopTyping();
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.showTemporaryMessage('Failed to send message. Please try again.');
        }
    }

    async openChat(userId) {
        console.log('💬 Opening chat with user:', userId);
        
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (!userElement) {
            console.error('❌ User element not found for:', userId);
            return;
        }

        const username = userElement.querySelector('.username').textContent;
        this.currentChatUser = { id: userId, username: username };
        
        console.log('✅ Chat opened with:', this.currentChatUser);

        this.updateChatHeader(username);
        this.clearMessages();
        this.currentPage = 1;
        this.hasMoreMessages = true;

        await this.loadMessages(userId, 1);
        this.clearUnreadIndicator(userId);
        
        if (this.messageInput && !this.messageInput.disabled) {
            this.messageInput.focus();
        }
    }

    async loadMessages(userId, page = 1) {
        if (this.isLoadingMessages) return;
        this.isLoadingMessages = true;

        console.log(`📥 Loading messages for user ${userId}, page ${page}`);

        try {
            const response = await fetch(`/api/chat/messages/${userId}?page=${page}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('📥 Messages loaded:', data);
                
                if (page === 1) {
                    this.clearMessages();
                }
                
                this.displayMessages(data.messages, page > 1);
                this.hasMoreMessages = data.has_more;
                
                if (page === 1) {
                    this.scrollToBottom();
                }
            } else {
                console.error('❌ Failed to load messages:', response.status);
            }
        } catch (error) {
            console.error('❌ Error loading messages:', error);
        } finally {
            this.isLoadingMessages = false;
        }
    }

    displayMessages(messages, prepend = false) {
        if (!this.messagesContainer) return;

        // ✅ Handle null/undefined messages
        if (!messages || !Array.isArray(messages)) {
            console.log('⚠️ Messages is null/invalid, skipping display');
            return;
        }

        const fragment = document.createDocumentFragment();
        
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            fragment.appendChild(messageElement);
        });

        if (prepend) {
            this.messagesContainer.insertBefore(fragment, this.messagesContainer.firstChild);
        } else {
            this.messagesContainer.appendChild(fragment);
        }
    }

    displayMessage(message) {
        if (!this.messagesContainer) return;

        const messageElement = this.createMessageElement(message);
        this.messagesContainer.appendChild(messageElement);
    }

    // ✅ ENHANCED createMessageElement with better date formatting
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        const isOwn = message.sender_id === window.appState.user.id;
        messageDiv.className = `message ${isOwn ? 'sent' : 'received'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const messageUser = document.createElement('span');
        messageUser.className = 'message-user';
        messageUser.textContent = isOwn ? 'You' : message.sender_name;

        const messageText = document.createElement('p');
        messageText.textContent = message.message;

        const messageDate = document.createElement('span');
        messageDate.className = 'message-date';
        
        // ✅ Enhanced date formatting
        const messageTime = new Date(message.created_at);
        const now = new Date();
        const isToday = messageTime.toDateString() === now.toDateString();
        
        let timeString;
        if (isToday) {
            timeString = messageTime.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
        } else {
            timeString = messageTime.toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        messageDate.textContent = timeString;

        messageContent.appendChild(messageUser);
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageDate);
        messageDiv.appendChild(messageContent);

        return messageDiv;
    }

    // ✅ NEW: IMPROVED Debounced typing handler
    handleTyping() {
        if (!this.currentChatUser || !this.ws) return;

        // ✅ DEBOUNCE: Only send typing=true once, then debounce the stop event
        if (!this.isTyping) {
            this.isTyping = true;
            this.sendTypingEvent(true);
        }

        // ✅ DEBOUNCE: Stop typing after 1 second of no input
        this.debouncedStopTyping = this.debouncedStopTyping || this.debounce(() => {
            this.stopTyping();
        }, 1000);

        this.debouncedStopTyping();
    }

    stopTyping() {
        if (this.isTyping) {
            this.isTyping = false;
            this.sendTypingEvent(false);
        }
        clearTimeout(this.typingTimer);
    }

    sendTypingEvent(isTyping) {
        if (!this.ws || !this.currentChatUser) return;

        const typingData = {
            type: 'typing',
            data: {
                receiver_id: this.currentChatUser.id,
                is_typing: isTyping
            }
        };

        try {
            this.ws.send(JSON.stringify(typingData));
        } catch (error) {
            console.error('❌ Error sending typing event:', error);
        }
    }

    showTypingIndicator(isTyping, username) {
        const indicator = document.getElementById('typing-indicator');
        
        if (isTyping) {
            if (!indicator) {
                const indicatorDiv = document.createElement('div');
                indicatorDiv.id = 'typing-indicator';
                indicatorDiv.className = 'typing-indicator';

                const textSpan = document.createElement('span');
                textSpan.textContent = `${username} is typing`;

                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'typing-dots';

                for (let i = 0; i < 3; i++) {
                    const dot = document.createElement('span');
                    dotsContainer.appendChild(dot);
                }

                indicatorDiv.appendChild(textSpan);
                indicatorDiv.appendChild(dotsContainer);
                this.messagesContainer.appendChild(indicatorDiv);
                this.scrollToBottom();
            }
        } else {
            if (indicator) {
                indicator.parentNode.removeChild(indicator);
            }
        }
    }

    setupScrollPagination() {
        if (!this.messagesContainer) return;

        this.messagesContainer.addEventListener('scroll', 
            this.throttle(() => {
                if (this.messagesContainer.scrollTop === 0 && 
                    this.hasMoreMessages && 
                    !this.isLoadingMessages &&
                    this.currentChatUser) {
                    
                    this.currentPage++;
                    this.loadMessages(this.currentChatUser.id, this.currentPage);
                }
            }, 200)
        );
    }

    updateChatHeader(username) {
        const header = document.getElementById('chat-with-user');
        if (header) {
            header.textContent = `Chat with ${username}`;
        }
    }

    clearMessages() {
        if (this.messagesContainer) {
            while (this.messagesContainer.firstChild) {
                this.messagesContainer.removeChild(this.messagesContainer.firstChild);
            }
        }
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    getChatKey(user1, user2) {
        return [user1, user2].sort().join('-');
    }

    getTimeAgo(dateString) {
        if (!dateString) return '';
        
        const now = new Date();
        const date = new Date(dateString);
        const diff = now - date;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    // ✅ EXISTING: Throttle function (already implemented)
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // ✅ NEW: Add debounce method after the throttle method
    debounce(func, delay) {
        let timer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timer);
            timer = setTimeout(() => func.apply(context, args), delay);
        }
    }

    updateUserListItem(userId, lastMessage, time) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            const lastMessageEl = userElement.querySelector('.last-message');
            const timeEl = userElement.querySelector('.last-message-time');
            
            if (lastMessageEl) {
                lastMessageEl.textContent = lastMessage.length > 30 ? 
                    lastMessage.slice(0, 30) + '...' : lastMessage;
            }
            if (timeEl) {
                timeEl.textContent = this.getTimeAgo(time);
            }
            
            if (this.userListContainer.firstChild) {
                this.userListContainer.insertBefore(userElement, this.userListContainer.firstChild);
            } else {
                this.userListContainer.appendChild(userElement);
            }
        }
    }

    // ✅ ENHANCED: More robust online status updating
    updateUserOnlineStatus(userId, isOnline) {
        console.log(`🟢 Updating user ${userId} online status to: ${isOnline}`);
        
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            // Update user class
            userElement.className = `user ${isOnline ? 'online' : 'offline'}`;
            
            // ✅ ENHANCED: Better indicator management
            const userDetails = userElement.querySelector('.user-details');
            if (userDetails) {
                // Remove all existing indicators first
                const existingIndicators = userDetails.querySelectorAll('.online-indicator');
                existingIndicators.forEach(indicator => indicator.remove());
                
                // Add new indicator if online
                if (isOnline) {
                    const onlineIndicator = document.createElement('span');
                    onlineIndicator.className = 'online-indicator';
                    onlineIndicator.textContent = '●';
                    onlineIndicator.style.color = '#28a745'; // Force green color
                    onlineIndicator.style.marginRight = '5px';
                    userDetails.insertBefore(onlineIndicator, userDetails.firstChild);
                    console.log(`✅ Green indicator added for user ${userId}`);
                } else {
                    console.log(`❌ Green indicator removed for user ${userId}`);
                }
            }
            
            console.log(`✅ User ${userId} status updated in UI - Online: ${isOnline}`);
        } else {
            console.log(`⚠️ User element not found for ${userId} - will be updated on next refresh`);
        }
    }

    clearUnreadIndicator(userId) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            const badge = userElement.querySelector('.unread-badge');
            if (badge) {
                badge.parentNode.removeChild(badge);
            }
        }
    }

    showNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${message.sender_name}`, {
                body: message.message,
                icon: '/assets/images/chat-icon.png'
            });
        }
    }

    destroy() {
        this.disconnectWebSocket();
        clearTimeout(this.typingTimer);
    }
}

// Global chat manager instance
window.chatManager = null;

function initializeChat() {
    console.log('🎯 initializeChat function called');
    
    if (!window.chatManager) {
        console.log('🚀 Creating new ChatManager...');
        window.chatManager = new ChatManager();
    }
    
    if (window.chatManager) {
        window.chatManager.updateForAuthStatus();
    }
}

function updateChatForAuthStatus() {
    console.log('🔄 updateChatForAuthStatus called - syncing with main app auth');
    
    if (!window.chatManager) {
        initializeChat();
    } else {
        window.chatManager.updateForAuthStatus();
    }
}

function destroyChat() {
    console.log('🔥 destroyChat function called');
    if (window.chatManager) {
        console.log('🗑️ Destroying existing ChatManager...');
        window.chatManager.destroy();
        window.chatManager = null;
    }
}

// Always initialize chat on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeChat, 100);
});

// Export for use in other modules
window.initializeChat = initializeChat;
window.updateChatForAuthStatus = updateChatForAuthStatus;
window.destroyChat = destroyChat;

console.log('✅ Chat.js loaded successfully');
