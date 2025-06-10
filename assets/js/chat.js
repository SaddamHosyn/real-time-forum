// Enhanced chat.js with pure DOM logic (no innerHTML)
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
        this.currentPage = 1;
        this.hasMoreMessages = true;
        this.isLoadingMessages = false;
        
        console.log('🔧 Calling initializeChat...');
        this.initializeChat();
    }

    initializeChat() {
        console.log('🚀 initializeChat called');
        console.log('🔍 Current appState:', window.appState);
        
        if (!window.appState?.isAuthenticated) {
            console.log('❌ User not authenticated, skipping chat initialization');
            return;
        }

        console.log('✅ User authenticated, setting up chat...');
        this.setupEventListeners();
        this.connectWebSocket();
        this.loadChatUsers();
        this.setupScrollPagination();
    }

    setupEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Message input
        this.messageInput = document.getElementById('message-input');
        console.log('📝 Message input found:', !!this.messageInput);
        
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            // Typing indicators
            this.messageInput.addEventListener('input', () => {
                this.handleTyping();
            });
            
            this.messageInput.addEventListener('blur', () => {
                this.stopTyping();
            });
        }

        // Send button
        const sendButton = document.getElementById('send-button');
        console.log('📤 Send button found:', !!sendButton);
        
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                this.sendMessage();
            });
        }

        // User list container
        this.userListContainer = document.querySelector('#user-list .users');
        console.log('👥 User list container found:', !!this.userListContainer);
        
        if (this.userListContainer) {
            this.userListContainer.addEventListener('click', (e) => {
                const userElement = e.target.closest('.user');
                if (userElement) {
                    const userId = userElement.dataset.userId;
                    this.openChat(userId);
                }
            });
        }

        this.messagesContainer = document.querySelector('.message-history');
        console.log('💬 Messages container found:', !!this.messagesContainer);
    }

    connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log('🔌 Connecting to WebSocket:', wsUrl);
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            console.log('✅ WebSocket connected successfully');
        };
        
        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('📨 WebSocket message received:', message);
            this.handleWebSocketMessage(message);
        };
        
        this.ws.onclose = () => {
            console.log('❌ WebSocket disconnected, attempting to reconnect...');
            setTimeout(() => this.connectWebSocket(), 3000);
        };
        
        this.ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };
    }

    handleWebSocketMessage(message) {
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
        }
    }

    handleNewMessage(messageData) {
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
            this.displayMessage(messageData);
            this.scrollToBottom();
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

    handleUserStatusChange(data) {
        this.updateUserOnlineStatus(data.user_id, data.is_online);
    }

    async loadChatUsers() {
        console.log('👥 Loading chat users...');
        try {
            const response = await fetch('/api/chat/users', {
                credentials: 'include'
            });
            
            console.log('📡 Chat users response status:', response.status);
            
            if (response.ok) {
                const users = await response.json();
                console.log('👥 Chat users loaded:', users);
                this.renderUserList(users);
            } else {
                console.error('❌ Failed to load chat users:', response.statusText);
            }
        } catch (error) {
            console.error('❌ Error loading chat users:', error);
        }
    }

    renderUserList(users) {
        console.log('🎨 Rendering user list with DOM methods...');
        if (!this.userListContainer) {
            console.error('❌ User list container not found');
            return;
        }

        // Clear existing users using DOM methods
        while (this.userListContainer.firstChild) {
            this.userListContainer.removeChild(this.userListContainer.firstChild);
        }

        users.forEach(user => {
            const userElement = this.createUserElement(user);
            this.userListContainer.appendChild(userElement);
        });
        
        console.log('✅ User list rendered with', users.length, 'users');
    }

    createUserElement(user) {
        console.log('🎨 Creating user element with DOM methods for:', user.username);
        
        // Create main li element
        const li = document.createElement('li');
        li.className = `user ${user.is_online ? 'online' : 'offline'}`;
        li.dataset.userId = user.id;

        // Create user-info container
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';

        // Create user-details container
        const userDetails = document.createElement('div');
        userDetails.className = 'user-details';

        // Create username span
        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = user.username;
        userDetails.appendChild(usernameSpan);

        // Add unread badge if needed
        if (user.unread_count > 0) {
            const unreadBadge = document.createElement('span');
            unreadBadge.className = 'unread-badge';
            unreadBadge.textContent = user.unread_count.toString();
            userDetails.appendChild(unreadBadge);
        }

        // Create user-meta container
        const userMeta = document.createElement('div');
        userMeta.className = 'user-meta';

        // Create last message span
        const lastMessageSpan = document.createElement('span');
        lastMessageSpan.className = 'last-message';
        const messageText = user.last_message ? 
            (user.last_message.length > 30 ? user.last_message.slice(0, 30) + '...' : user.last_message) : 
            'No messages yet';
        lastMessageSpan.textContent = messageText;

        // Create last message time span
        const lastMessageTimeSpan = document.createElement('span');
        lastMessageTimeSpan.className = 'last-message-time';
        lastMessageTimeSpan.textContent = this.getTimeAgo(user.last_message_time);

        // Assemble the structure
        userMeta.appendChild(lastMessageSpan);
        userMeta.appendChild(lastMessageTimeSpan);
        userInfo.appendChild(userDetails);
        userInfo.appendChild(userMeta);
        li.appendChild(userInfo);

        return li;
    }

    async openChat(userId) {
        // Find user data
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (!userElement) return;

        const username = userElement.querySelector('.username').textContent;
        this.currentChatUser = { id: userId, username: username };

        // Update UI
        this.updateChatHeader(username);
        this.clearMessages();
        this.currentPage = 1;
        this.hasMoreMessages = true;

        // Load messages
        await this.loadMessages(userId, 1);
        
        // Clear unread indicator
        this.clearUnreadIndicator(userId);
        
        // Focus message input
        if (this.messageInput) {
            this.messageInput.focus();
        }
    }

    async loadMessages(userId, page = 1) {
        if (this.isLoadingMessages) return;
        this.isLoadingMessages = true;

        try {
            const response = await fetch(`/api/chat/messages/${userId}?page=${page}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                
                if (page === 1) {
                    this.clearMessages();
                }
                
                this.displayMessages(data.messages, page > 1);
                this.hasMoreMessages = data.has_more;
                
                if (page === 1) {
                    this.scrollToBottom();
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            this.isLoadingMessages = false;
        }
    }

    displayMessages(messages, prepend = false) {
        if (!this.messagesContainer) return;

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

    createMessageElement(message) {
        console.log('💬 Creating message element with DOM methods');
        
        // Create main message div
        const messageDiv = document.createElement('div');
        const isOwn = message.sender_id === window.appState.user.id;
        messageDiv.className = `message ${isOwn ? 'sent' : 'received'}`;
        
        // Create message content div
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        // Create message user span
        const messageUser = document.createElement('span');
        messageUser.className = 'message-user';
        messageUser.textContent = isOwn ? 'You:' : `${message.sender_name}:`;

        // Create message text paragraph
        const messageText = document.createElement('p');
        messageText.textContent = message.message; // Safe text content (auto-escapes)

        // Create message date span
        const messageDate = document.createElement('span');
        messageDate.className = 'message-date';
        const time = new Date(message.created_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        messageDate.textContent = time;

        // Assemble message structure
        messageContent.appendChild(messageUser);
        messageContent.appendChild(messageText);
        messageContent.appendChild(messageDate);
        messageDiv.appendChild(messageContent);

        return messageDiv;
    }

    sendMessage() {
        if (!this.currentChatUser || !this.messageInput || !this.ws) return;

        const message = this.messageInput.value.trim();
        if (!message) return;

        const messageData = {
            type: 'chat_message',
            data: {
                receiver_id: this.currentChatUser.id,
                message: message
            }
        };

        this.ws.send(JSON.stringify(messageData));
        this.messageInput.value = '';
        this.stopTyping();
    }

    handleTyping() {
        if (!this.currentChatUser || !this.ws) return;

        if (!this.isTyping) {
            this.isTyping = true;
            this.sendTypingEvent(true);
        }

        // Reset the timer
        clearTimeout(this.typingTimer);
        this.typingTimer = setTimeout(() => {
            this.stopTyping();
        }, 2000);
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

        this.ws.send(JSON.stringify(typingData));
    }

    showTypingIndicator(isTyping, username) {
        const indicator = document.getElementById('typing-indicator');
        
        if (isTyping) {
            if (!indicator) {
                console.log('⌨️ Creating typing indicator with DOM methods');
                
                // Create main typing indicator div
                const indicatorDiv = document.createElement('div');
                indicatorDiv.id = 'typing-indicator';
                indicatorDiv.className = 'typing-indicator';

                // Create text span
                const textSpan = document.createElement('span');
                textSpan.textContent = `${username} is typing`;

                // Create dots container
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'typing-dots';

                // Create 3 dots
                for (let i = 0; i < 3; i++) {
                    const dot = document.createElement('span');
                    dotsContainer.appendChild(dot);
                }

                // Assemble typing indicator
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

    // Utility methods
    updateChatHeader(username) {
        const header = document.getElementById('chat-with-user');
        if (header) {
            header.textContent = `Chat with ${username}`;
        }
    }

    clearMessages() {
        if (this.messagesContainer) {
            // Use DOM methods to clear (not innerHTML)
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
            
            // Move to top of list using DOM methods
            if (this.userListContainer.firstChild) {
                this.userListContainer.insertBefore(userElement, this.userListContainer.firstChild);
            } else {
                this.userListContainer.appendChild(userElement);
            }
        }
    }

    updateUserOnlineStatus(userId, isOnline) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            userElement.className = `user ${isOnline ? 'online' : 'offline'}`;
        }
    }

    clearUnreadIndicator(userId) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement) {
            const badge = userElement.querySelector('.unread-badge');
            if (badge) {
                badge.parentNode.removeChild(badge); // Pure DOM removal
            }
        }
    }

    showNotification(message) {
        // Simple notification - you can enhance this
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New message from ${message.sender_name}`, {
                body: message.message,
                icon: '/assets/images/chat-icon.png'
            });
        }
    }

    // Public methods for integration
    initializeForAuthenticatedUser() {
        this.initializeChat();
    }

    destroy() {
        if (this.ws) {
            this.ws.close();
        }
        clearTimeout(this.typingTimer);
    }
}

// Global chat manager instance
window.chatManager = null;

// Initialize chat when user is authenticated
function initializeChat() {
    console.log('🎯 initializeChat function called');
    console.log('🔍 Current chatManager:', window.chatManager);
    console.log('🔍 Is authenticated:', window.appState?.isAuthenticated);
    
    if (window.appState?.isAuthenticated && !window.chatManager) {
        console.log('🚀 Creating new ChatManager...');
        window.chatManager = new ChatManager();
    } else if (!window.appState?.isAuthenticated) {
        console.log('❌ User not authenticated');
    } else if (window.chatManager) {
        console.log('ℹ️ ChatManager already exists');
    }
}

// Clean up chat when user logs out
function destroyChat() {
    console.log('🔥 destroyChat function called');
    if (window.chatManager) {
        console.log('🗑️ Destroying existing ChatManager...');
        window.chatManager.destroy();
        window.chatManager = null;
    }
}

// Auto-initialize on auth state change
if (window.appState?.isAuthenticated) {
    initializeChat();
}

// Export for use in other modules
window.initializeChat = initializeChat;
window.destroyChat = destroyChat;

console.log('✅ Chat.js loaded successfully');
console.log('🔧 Functions exposed:', {
    initializeChat: typeof window.initializeChat,
    destroyChat: typeof window.destroyChat
});
