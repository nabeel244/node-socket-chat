// scripts.js
const socket = io();

const room = prompt('Enter a room name:');
const username = prompt('Enter your username:');
socket.emit('joinRoom', username, room);

// Send Message
function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  if (message !== '') {
    socket.emit('chatMessage', message);
    input.value = '';
  }
}

// Receive Message
socket.on('chatMessage', (username, message) => {
  const messages = document.getElementById('messages');
  const li = document.createElement('li');
  li.textContent = `${username}: ${message}`;
  messages.appendChild(li);
});

// Private Message
socket.on('privateMessage', (sender, message) => {
  console.log(`Private message from ${sender}: ${message}`);
});

// Typing Indicator
const typingIndicator = document.getElementById('typing-indicator');
const messageInput = document.getElementById('message-input');

messageInput.addEventListener('input', () => {
  socket.emit('typing');
});

socket.on('typing', (username) => {
  typingIndicator.textContent = `${username} is typing...`;
});

// Update User List
socket.on('updateUserList', (userList) => {
  const userListContainer = document.getElementById('user-list');
  userListContainer.innerHTML = '';
  userList.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    userListContainer.appendChild(li);
  });
});

// Send Private Message
function sendPrivateMessage() {
  const input = document.getElementById('private-message-input');
  const privateMessage = input.value.trim();
  const targetUser = prompt('Enter the username to send a private message to:');

  if (privateMessage !== '' && targetUser !== null) {
    socket.emit('privateMessage', { targetUser, message: privateMessage });
    input.value = '';
  }
}
// Message History
socket.on('messageHistory', (messageHistory) => {
  const messages = document.getElementById('messages');
  messageHistory.forEach(({ username, message }) => {
    const li = document.createElement('li');
    li.textContent = `${username}: ${message}`;
    messages.appendChild(li);
  });
});
