// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

const rooms = {};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Handle joining a room
  socket.on('joinRoom', (username, room) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;

    // Create room if not exists
    if (!rooms[room]) {
      rooms[room] = [];
    }

    // Add user to the room
    rooms[room].push(username);

    // Broadcast to all users in the room
    io.to(room).emit('updateUserList', rooms[room]);
    io.to(room).emit('chatMessage', 'System', `${username} has joined the room`);

    // Send message history to the new user
    const messageHistory = rooms[room].length > 1 ? rooms[room].slice(-10) : [];
    socket.emit('messageHistory', messageHistory);
  });

  // Handle chat messages
  socket.on('chatMessage', (message) => {
    io.to(socket.room).emit('chatMessage', socket.username, message);
  });

  // Handle private messages
  socket.on('privateMessage', ({ targetUser, message }) => {
    io.to(targetUser).emit('privateMessage', socket.username, message);
  });

  // Handle typing indicator
  socket.on('typing', () => {
    socket.to(socket.room).emit('typing', socket.username);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected');

    if (socket.room && rooms[socket.room]) {
      // Remove user from the room
      rooms[socket.room] = rooms[socket.room].filter(user => user !== socket.username);

      // Broadcast to all users in the room
      io.to(socket.room).emit('updateUserList', rooms[socket.room]);
      io.to(socket.room).emit('chatMessage', 'System', `${socket.username} has left the room`);
    }
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
