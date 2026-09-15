

// ===============================
// DOM ELEMENTS
// ===============================

const usersList = document.getElementById("usersList");
const currentUsername = document.getElementById("currentUsername");

const chatUsername = document.getElementById("chatUsername");
const chatStatus = document.getElementById("chatStatus");

const messagesContainer = document.getElementById("messages");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

const typingIndicator = document.getElementById("typingIndicator");

const logoutBtn = document.getElementById("logoutBtn");


// ===============================
// LOGGED-IN USER
// ===============================

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const username = localStorage.getItem("username");


// ===============================
// CHECK LOGIN
// ===============================

if (!token || !userId) {
    window.location.href = "/login.html";
}


// Display current username
currentUsername.textContent = username;


// ===============================
// CURRENT CHAT USER
// ===============================

let selectedUser = null;


// ===============================
// UNREAD MESSAGE COUNTS
// ===============================

const unreadCounts = {};


// ===============================
// SOCKET.IO CONNECTION
// ===============================

const socket = io("http://localhost:5000", {
    auth: {
        token: token
    }
});


// ===============================
// SOCKET CONNECTION
// ===============================

socket.on("connect", () => {

    console.log("Connected to Socket.io:", socket.id);

    // Join logged-in user's room
    socket.emit("join");

});

socket.on("connect_error", (error) => {
    console.error("Socket authentication failed:", error.message);
});


// ===============================
// LOAD USERS
// ===============================

async function loadUsers() {

    try {

       const response = await fetch("/api/users", {
    headers: {
        Authorization: `Bearer ${token}`
    }
});

        const data = await response.json();

        console.log("Users:", data);

        allUsers = data.users;

displayUsers(data.users);

    } catch (error) {

        console.error("Failed to load users:", error);

    }
}

// ===============================
// FORMAT LAST SEEN
// ===============================

function formatLastSeen(lastSeen) {
    if (!lastSeen) {
        return "Offline";
    }

    const date = new Date(lastSeen);
    const now = new Date();

    const isToday =
        date.toDateString() === now.toDateString();

    if (isToday) {
        return `Last seen ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
        date.toDateString() === yesterday.toDateString();

    if (isYesterday) {
        return `Last seen yesterday at ${date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        })}`;
    }

    return `Last seen ${date.toLocaleDateString([], {
        day: "2-digit",
        month: "short"
    })} at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    })}`;
}

// ===============================
// DISPLAY USERS
// ===============================

function displayUsers(users) {
    usersList.innerHTML = "";

    users.forEach((user) => {
        if (user._id === userId) {
            return;
        }

        const userElement = document.createElement("div");
        userElement.classList.add("user-item");

        const statusText = user.isOnline
            ? "Online"
            : formatLastSeen(user.lastSeen);

        const unreadCount =
            unreadCounts[user._id] || 0;

        userElement.innerHTML = `
            <div class="user-info">
                <span class="status-dot ${
                    user.isOnline ? "online" : ""
                }"></span>

                <span>${user.username}</span>
            </div>

            <div class="user-status-container">
                <span class="user-status">
                    ${statusText}
                </span>

                ${
                    unreadCount > 0
                        ? `<span class="unread-badge">${unreadCount}</span>`
                        : ""
                }
            </div>
        `;

        userElement.addEventListener("click", () => {
            selectUser(user);
        });

        usersList.appendChild(userElement);
    });
}
// ===============================
// SELECT USER
// ===============================

async function selectUser(user) {

    selectedUser = user;
    unreadCounts[user._id] = 0;

    chatUsername.textContent = user.username;

    chatStatus.textContent =
        user.isOnline ? "Online" : formatLastSeen(user.lastSeen);


    messageInput.disabled = false;
    sendBtn.disabled = false;


    // Remove empty chat message
    messagesContainer.innerHTML = "";

    displayUsers(allUsers);


    // Load conversation
    await loadMessages(user._id);

}
// ===============================
// LOAD CHAT HISTORY
// ===============================

async function loadMessages(otherUserId) {
    try {
        const response = await fetch(
            `/api/messages/${userId}/${otherUserId}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        console.log("Messages:", data);

        if (!response.ok) {
            console.error("Failed to load messages:", data.message);
            return;
        }

        messagesContainer.innerHTML = "";

        data.data.forEach((message) => {
            displayMessage(message);
        });

        scrollToBottom();

    } catch (error) {
        console.error("Failed to load messages:", error);
    }
}

// ===============================
// DISPLAY MESSAGE
// ===============================

function displayMessage(message) {

    const messageElement = document.createElement("div");

    const isSent = message.sender === userId;

    messageElement.classList.add(
        "message",
        isSent ? "sent" : "received"
    );


    // Message text
    const messageText = document.createElement("div");

    messageText.classList.add("message-text");

    messageText.textContent = message.message;


    // Message time
    const messageTime = document.createElement("div");

    messageTime.classList.add("message-time");

    const time = new Date(message.createdAt);

    messageTime.textContent = time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });


    // Add elements to message
    messageElement.appendChild(messageText);

    messageElement.appendChild(messageTime);

    messagesContainer.appendChild(messageElement);
}


// ===============================
// SEND MESSAGE
// ===============================

function sendMessage() {

    const message = messageInput.value.trim();


    // Don't send empty message
    if (!message) {
        return;
    }


    // No selected user
    if (!selectedUser) {
        return;
    }


    // Send through Socket.io
socket.emit("sendMessage", {
    receiver: selectedUser._id,
    message: message
});


    // Clear input
    messageInput.value = "";

}


// ===============================
// SEND BUTTON
// ===============================

sendBtn.addEventListener("click", () => {

    sendMessage();

});


// ===============================
// ENTER KEY
// ===============================

messageInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();

    }

});

// ===============================
// SHOW MESSAGE NOTIFICATION
// ===============================

function showMessageNotification(message) {
    const notification =
        document.getElementById("messageNotification");

    const senderName =
        message.senderUsername || "New message";

    notification.textContent =
        `New message from ${senderName}`;

    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

// ===============================
// FIND USERNAME
// ===============================

let allUsers = [];

function getUsernameById(id) {
    const user = allUsers.find(
        (user) => user._id === id
    );

    return user ? user.username : "Someone";
}



/// Receive message from Socket.io


socket.on("receiveMessage", (message) => {
    console.log("New message:", message);

    const isCurrentConversation =
        selectedUser &&
        (
            (
                message.sender === userId &&
                message.receiver === selectedUser._id
            )
            ||
            (
                message.sender === selectedUser._id &&
                message.receiver === userId
            )
        );

    if (isCurrentConversation) {
        displayMessage(message);
        scrollToBottom();

        return;
    }

    // Ignore our own message if we are not viewing
    // the conversation
    if (message.sender === userId) {
        return;
    }

    // Increase unread count
    unreadCounts[message.sender] =
        (unreadCounts[message.sender] || 0) + 1;

    // Refresh user list to show unread badge
    displayUsers(allUsers);

    // Show notification
    const senderName =
        getUsernameById(message.sender);

    const notification =
        document.getElementById("messageNotification");

    notification.textContent =
        `New message from ${senderName}: ${message.message}`;

    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 4000);
});

// ===============================
// TYPING
// ===============================

let typingTimeout;


messageInput.addEventListener("input", () => {

    if (!selectedUser) {
        return;
    }


    socket.emit("typing", selectedUser._id);


    clearTimeout(typingTimeout);


    typingTimeout = setTimeout(() => {

        socket.emit(
            "stopTyping",
            selectedUser._id
        );

    }, 1000);

});


// ===============================
// USER TYPING
// ===============================

socket.on("userTyping", (typingUserId) => {

    if (
        selectedUser &&
        typingUserId === selectedUser._id
    ) {

        typingIndicator.textContent =
            `${selectedUser.username} is typing...`;

    }

});


// ===============================
// USER STOPPED TYPING
// ===============================

socket.on("userStoppedTyping", (typingUserId) => {

    if (
        selectedUser &&
        typingUserId === selectedUser._id
    ) {

        typingIndicator.textContent = "";

    }

});


// ===============================
// USER ONLINE
// ===============================

socket.on("userOnline", (onlineUserId) => {

    console.log("User online:", onlineUserId);

    loadUsers();

    if (
        selectedUser &&
        selectedUser._id === onlineUserId
    ) {

        chatStatus.textContent = "Online";

    }

});


// ===============================
// USER OFFLINE
// ===============================

socket.on("userOffline", (offlineUserId) => {

    console.log("User offline:", offlineUserId);

    loadUsers();

    if (
        selectedUser &&
        selectedUser._id === offlineUserId
    ) {

        chatStatus.textContent = "Offline";

    }

});


// ===============================
// SCROLL TO BOTTOM
// ===============================

function scrollToBottom() {

    messagesContainer.scrollTop =
        messagesContainer.scrollHeight;

}


// ===============================
// LOGOUT
// ===============================

logoutBtn.addEventListener("click", () => {

    localStorage.removeItem("token");

    localStorage.removeItem("userId");

    localStorage.removeItem("username");

    socket.disconnect();

    window.location.href = "/login.html";

});


// ===============================
// INITIAL LOAD
// ===============================

loadUsers();