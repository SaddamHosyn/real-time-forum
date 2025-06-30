




// Enhanced chat.js - FIXED: Prevent repeated function calls
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
        
        // ✅ CRITICAL: Add flags to prevent repeated operations
        this.isUpdating = false;
        this.isInitialized = false;
        this.lastAuthStatus = null;
        this.updateTimeout = null;
        
        // Request notification permission
        this.requestNotificationPermission();
        
        console.log('🔧 Calling initializeChat...');
        this.initializeChat();
    }

    initializeChat() {
        if (this.isInitialized) {
            console.log('⚠️ Chat already initialized, skipping...');
            return;
        }
        
        console.log('🚀 initializeChat called');
        console.log('🔍 Current appState:', window.appState);
        console.log('🔍 User authenticated:', window.appState?.isAuthenticated);
        
        // Always setup UI elements
        this.setupEventListeners();
        this.setupScrollPagination();
        
        // Update UI based on auth status
        this.updateForAuthStatus();
        
        this.isInitialized = true;
        console.log('✅ Chat initialization complete');
    }

    // ✅ FIXED: Enhanced prevention of repeated calls
    updateForAuthStatus() {
        const currentAuthStatus = !!window.appState?.isAuthenticated;
        
        // ✅ PREVENT: Skip if auth status hasn't changed
        if (this.lastAuthStatus === currentAuthStatus && this.isInitialized) {
            console.log('⚠️ Auth status unchanged, skipping update...');
            return;
        }
        
        // ✅ PREVENT: Multiple simultaneous updates
        if (this.isUpdating) {
            console.log('⚠️ Chat update already in progress, skipping...');
            return;
        }
        
        this.isUpdating = true;
        this.lastAuthStatus = currentAuthStatus;
        
        console.log('🔄 Updating chat for auth status:', currentAuthStatus);
        
        // Clear any pending update
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
        
        if (currentAuthStatus) {
            console.log('✅ User authenticated, enabling full chat...');
            this.enableChatFunctionality();
            this.connectWebSocket();
            
            // ✅ FIXED: Single delayed user load
            this.updateTimeout = setTimeout(() => {
                if (window.appState?.isAuthenticated) {
                    this.loadChatUsers();
                }
            }, 800);
            
        } else {
            console.log('❌ User not authenticated, showing limited chat...');
            this.disableChatFunctionality();
            this.disconnectWebSocket();
            this.showAuthRequiredPrompt();
        }
        
        // ✅ FIXED: Reset flag after update
        setTimeout(() => {
            this.isUpdating = false;
        }, 100);
    }

    enableChatFunctionality() {
        console.log('✅ Enabling chat functionality...');
        
        if (this.messageInput) {
            this.messageInput.disabled = false;
            this.messageInput.placeholder = 'Type a message...';
        }
        
        if (this.sendButton) {
            this.sendButton.disabled = false;
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

    // ✅ FIXED: Enhanced WebSocket connection with better state management
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
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket connected successfully');
                this.connectionAttempts = 0;
                
                // ✅ FIXED: Only load users if not already loaded recently
                if (window.appState?.isAuthenticated) {
                    setTimeout(() => {
                        this.loadChatUsers();
                    }, 1000);
                }
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.handleWebSocketMessage(message);
                } catch (error) {
                    console.error('❌ Error parsing WebSocket message:', error);
                }
            };
            
            this.ws.onclose = (event) => {
                console.log('❌ WebSocket disconnected:', event.code, event.reason);
                this.ws = null;
                
                // ✅ FIXED: Only refresh if authenticated and not already loading
                if (window.appState?.isAuthenticated && !this.isLoadingMessages) {
                    setTimeout(() => {
                        this.loadChatUsers();
                    }, 1000);
                }
                
                // Reconnect if still authenticated
                if (window.appState?.isAuthenticated && this.connectionAttempts < this.maxConnectionAttempts) {
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
        
        // Get DOM elements
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.loginPrompt = document.getElementById('login-prompt');
        this.userListContainer = document.querySelector('#user-list .users');
        this.messagesContainer = document.querySelector('.message-history');
        
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !this.messageInput.disabled) {
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

    // Request notification permission on initialization
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('🔔 Notification permission:', permission);
            });
        }
    }

    // Show browser notification
    showBrowserNotification(message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(`New message from ${message.sender_name}`, {
                body: message.message.length > 50 ? message.message.substring(0, 50) + '...' : message.message,
                tag: `chat-${message.sender_id}`,
                requireInteraction: false
            });

            notification.onclick = () => {
                window.focus();
                this.openChat(message.sender_id);
                notification.close();
            };

            setTimeout(() => {
                notification.close();
            }, 5000);
        }
    }

    // Show in-app notification
    showInAppNotification(message) {
        const existingNotification = document.querySelector('.chat-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = 'chat-notification';
        
        const header = document.createElement('div');
        header.className = 'notification-header';
        header.textContent = `New message from ${message.sender_name}`;
        
        const body = document.createElement('div');
        body.className = 'notification-body';
        body.textContent = message.message.length > 60 ? message.message.substring(0, 60) + '...' : message.message;
        
        notification.appendChild(header);
        notification.appendChild(body);
        
        notification.addEventListener('click', () => {
            this.openChat(message.sender_id);
            notification.remove();
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.remove();
            }
        }, 5000);
    }

    // Check if user should receive notification
    shouldShowNotification(message) {
        if (message.sender_id === window.appState?.user?.id) {
            return false;
        }
        
        if (this.currentChatUser && this.currentChatUser.id === message.sender_id) {
            return false;
        }
        
        return true;
    }

    // Mark user as having unread messages
    markUserAsUnread(userId) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (userElement && !userElement.classList.contains('has-unread')) {
            userElement.classList.add('has-unread');
            
            const userDetails = userElement.querySelector('.user-details');
            if (userDetails && !userDetails.querySelector('.notification-badge')) {
                const badge = document.createElement('span');
                badge.className = 'notification-badge';
                badge.textContent = '!';
                userDetails.appendChild(badge);
            }
        }
    }

    handleWebSocketMessage(message) {
        console.log('📨 Handling WebSocket message type:', message.type);
        
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
        
        // Show notification if conditions are met
        if (this.shouldShowNotification(messageData)) {
            this.showBrowserNotification(messageData);
            this.showInAppNotification(messageData);
            this.markUserAsUnread(messageData.sender_id);
        }
    }

    handleTypingIndicator(data) {
        if (this.currentChatUser && data.user_id === this.currentChatUser.id) {
            this.showTypingIndicator(data.is_typing, data.username);
        }
    }

    handleUserStatusChange(data) {
        console.log('👤 User status change received:', data);
        
        // Update individual user status
        this.updateUserOnlineStatus(data.user_id, data.is_online);
        
        // ✅ FIXED: Reduce refresh frequency
        if (window.appState?.isAuthenticated && !this.isLoadingMessages) {
            setTimeout(() => {
                this.loadChatUsers();
            }, 500);
        }
    }

    // ✅ ADDED: Loading state management
    isUserListLoading = false;

    async loadChatUsers() {
        // ✅ PREVENT: Multiple simultaneous loads
        if (this.isUserListLoading) {
            console.log('⚠️ User list already loading, skipping...');
            return;
        }
        
        this.isUserListLoading = true;
        console.log('👥 Loading chat users...');
        
        try {
            const response = await fetch('/api/chat/users', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const responseText = await response.text();
                let users;
                try {
                    users = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('❌ JSON parse error:', parseError);
                    users = [];
                }
                
                if (!Array.isArray(users)) {
                    users = [];
                }
                
                this.renderUserList(users);
            } else if (response.status === 401) {
                this.showAuthRequiredUserList();
            } else {
                this.showAuthRequiredUserList();
            }
        } catch (error) {
            console.error('❌ Error loading chat users:', error);
            this.showAuthRequiredUserList();
        } finally {
            // ✅ RESET: Loading flag
            setTimeout(() => {
                this.isUserListLoading = false;
            }, 500);
        }
    }

    showAuthRequiredUserList() {
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
        
        if (!this.userListContainer) {
            console.error('❌ User list container not found');
            return;
        }

        // Clear existing users
        while (this.userListContainer.firstChild) {
            this.userListContainer.removeChild(this.userListContainer.firstChild);
        }

        if (!users || !Array.isArray(users)) {
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
    }

    createUserElement(user) {
        const li = document.createElement('li');
        li.className = `user ${user.is_online ? 'online' : 'offline'}`;
        li.dataset.userId = user.id;

        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';

        const userDetails = document.createElement('div');
        userDetails.className = 'user-details';

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
        if (!window.appState?.isAuthenticated) {
            this.showMainLoginPrompt();
            return;
        }

        if (!this.currentChatUser) {
            this.showTemporaryMessage('Please select a user to chat with');
            return;
        }

        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.showTemporaryMessage('Chat connection lost. Reconnecting...');
            this.connectWebSocket();
            return;
        }

        const message = this.messageInput.value.trim();
        if (!message) return;

        const messageData = {
            type: 'chat_message',
            data: {
                receiver_id: this.currentChatUser.id,
                message: message
            }
        };

        try {
            this.ws.send(JSON.stringify(messageData));
            this.messageInput.value = '';
            this.stopTyping();
        } catch (error) {
            console.error('❌ Error sending message:', error);
            this.showTemporaryMessage('Failed to send message. Please try again.');
        }
    }

    async openChat(userId) {
        const userElement = document.querySelector(`[data-user-id="${userId}"]`);
        if (!userElement) return;

        const username = userElement.querySelector('.username').textContent;
        this.currentChatUser = { id: userId, username: username };

        // Clear unread status
        userElement.classList.remove('has-unread');
        const badge = userElement.querySelector('.notification-badge');
        if (badge) {
            badge.remove();
        }

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

    async loadMessages(userId, page = 1, showLoaderParam = false) {
        const loaderStartTime = Date.now();
        const MINIMUM_LOADER_DURATION = page === 1 ? 500 :3000; // 500ms for initial load, 1s for pagination

        try {
            const response = await fetch(`/api/chat/messages/${userId}?page=${page}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();

                const elapsedTime = Date.now() - loaderStartTime;
                const remainingTime = Math.max(0, MINIMUM_LOADER_DURATION - elapsedTime);

                setTimeout(() => {
                    const prevScrollHeight = this.messagesContainer.scrollHeight;
                    const prevScrollTop = this.messagesContainer.scrollTop;

                    if (page === 1) {
                        this.clearMessages();
                    }

                    this.displayMessages(data.messages, page > 1);
                    this.hasMoreMessages = data.has_more;

                    if (page === 1) {
                        this.scrollToBottom();
                    } else if (data.messages && data.messages.length > 0) {
                        requestAnimationFrame(() => {
                            const newScrollHeight = this.messagesContainer.scrollHeight;
                            const scrollDiff = newScrollHeight - prevScrollHeight;
                            this.messagesContainer.scrollTop = prevScrollTop + scrollDiff;
                            this.hideLoader();
                        });
                    } else {
                        this.hideLoader();
                    }

                    this.isLoadingMessages = false;
                }, remainingTime);

            } else {
                const elapsedTime = Date.now() - loaderStartTime;
                const remainingTime = Math.max(0, MINIMUM_LOADER_DURATION - elapsedTime);
                
                setTimeout(() => {
                    this.hideLoader();
                    this.isLoadingMessages = false;
                }, remainingTime);
            }
        } catch (error) {
            console.error('❌ Error loading messages:', error);
            
            const elapsedTime = Date.now() - loaderStartTime;
            const remainingTime = Math.max(0, MINIMUM_LOADER_DURATION - elapsedTime);
            
            setTimeout(() => {
                this.hideLoader();
                this.isLoadingMessages = false;
            }, remainingTime);
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
  



// ✅ FIXED: Always show date and time together
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
    
    // ✅ FIXED: Always show date and time together
    const messageTime = new Date(message.created_at);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };
    messageDate.textContent = new Intl.DateTimeFormat('en-US', options).format(messageTime);

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

        // Make sure loader exists at the top of the messages container
        if (!document.getElementById('chat-loader')) {
            // Create CSS animation for spinner if it doesn't exist
            if (!document.getElementById('spinner-animation-style')) {
                const style = document.createElement('style');
                style.id = 'spinner-animation-style';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }

            const loader = document.createElement('div');
            loader.id = 'chat-loader';
            loader.className = 'chat-loader';
            
            // Loader styling
            loader.style.display = 'none';
            loader.style.textAlign = 'center';
            loader.style.padding = '15px 10px';
            loader.style.color = '#666';
            loader.style.background = '#f8f9fa';
            loader.style.borderBottom = '1px solid #dee2e6';
            loader.style.fontSize = '14px';
            loader.style.fontWeight = '500';

            // Create container for spinner and text
            const loaderContent = document.createElement('div');
            loaderContent.style.display = 'flex';
            loaderContent.style.alignItems = 'center';
            loaderContent.style.justifyContent = 'center';
            loaderContent.style.gap = '8px';

            // Create spinner element
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            spinner.style.width = '16px';
            spinner.style.height = '16px';
            spinner.style.border = '2px solid #dee2e6';
            spinner.style.borderTop = '2px solid #007bff';
            spinner.style.borderRadius = '50%';
            spinner.style.animation = 'spin 1s linear infinite';
            spinner.style.flexShrink = '0';
            
            // Create text element
            const text = document.createElement('span');
            text.textContent = 'Loading messages...';
            text.style.color = '#666';
            text.style.fontSize = '14px';
            text.style.fontWeight = '500';
            
            loaderContent.appendChild(spinner);
            loaderContent.appendChild(text);
            loader.appendChild(loaderContent);

            this.messagesContainer.insertBefore(loader, this.messagesContainer.firstChild);
            console.log('✅ Loader created');
        }

        // ✅ UPDATED: Simplified scroll handler with better throttling
        let isScrollHandling = false;
        
        this.messagesContainer.addEventListener('scroll', (e) => {
            if (isScrollHandling) return;
            
            const scrollTop = this.messagesContainer.scrollTop;
            
            // ✅ IMMEDIATE: Trigger loading when hitting the top
            if (scrollTop <= 10 && 
                this.hasMoreMessages && 
                !this.isLoadingMessages && 
                this.currentChatUser) {
                
                isScrollHandling = true;
                
                // ✅ CRITICAL FIX: Show loader immediately and set loading flag
                this.showLoader();
                this.isLoadingMessages = true;
                
                // ✅ CRITICAL FIX: Start loading messages immediately
                this.currentPage++;
                this.loadMessages(this.currentChatUser.id, this.currentPage);
                
                // Reset handling flag after a delay
                setTimeout(() => {
                    isScrollHandling = false;
                }, 500);
            }
        });
    }

    showLoader() {
        const loader = document.getElementById('chat-loader');
        if (loader) {
            loader.style.display = 'block';
            console.log('👁️ Loader shown');
        }
    }

    hideLoader() {
        const loader = document.getElementById('chat-loader');
        if (loader) {
            loader.style.display = 'none';
            console.log('🙈 Loader hidden');
        }
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

    destroy() {
        this.disconnectWebSocket();
        clearTimeout(this.typingTimer);
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }
}

// Global chat manager instance
window.chatManager = null;

// ✅ FIXED: Add flag to prevent multiple initializations
let chatInitialized = false;

function initializeChat() {
    console.log('🎯 initializeChat function called');
    
    // ✅ PREVENT: Multiple simultaneous initializations
    if (chatInitialized) {
        console.log('⚠️ Chat already initialized globally, skipping...');
        return;
    }
    
    if (!window.chatManager) {
        console.log('🚀 Creating new ChatManager...');
        window.chatManager = new ChatManager();
        chatInitialized = true;
    }
    
    if (window.chatManager) {
        window.chatManager.updateForAuthStatus();
    }
}

// ✅ FIXED: Prevent cascading calls with debouncing
let authUpdateTimeout = null;

function updateChatForAuthStatus() {
    console.log('🔄 updateChatForAuthStatus called - syncing with main app auth');
    
    // ✅ DEBOUNCE: Prevent rapid successive calls
    if (authUpdateTimeout) {
        clearTimeout(authUpdateTimeout);
    }
    
    authUpdateTimeout = setTimeout(() => {
        if (!window.chatManager) {
            initializeChat();
        } else {
            window.chatManager.updateForAuthStatus();
        }
        authUpdateTimeout = null;
    }, 100);
}

function destroyChat() {
    console.log('🔥 destroyChat function called');
    if (window.chatManager) {
        console.log('🗑️ Destroying existing ChatManager...');
        window.chatManager.destroy();
        window.chatManager = null;
        chatInitialized = false;
    }
}

// ✅ FIXED: Only initialize once on DOM ready
let domReadyHandled = false;

document.addEventListener('DOMContentLoaded', () => {
    if (!domReadyHandled) {
        domReadyHandled = true;
        setTimeout(initializeChat, 100);
    }
});

// Export for use in other modules
window.initializeChat = initializeChat;
window.updateChatForAuthStatus = updateChatForAuthStatus;
window.destroyChat = destroyChat;

console.log('✅ Chat.js loaded successfully');








