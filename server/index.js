const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "https://couple-dare-date.netlify.app"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

app.use(cors({
  origin: ["http://localhost:5173", "https://couple-dare-date.netlify.app"],
  credentials: true
}));
app.use(express.json());

// Store active rooms and their data
const rooms = new Map();
const players = new Map();

// Generate a random room ID
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Get room data for a room ID
function getRoomData(roomId) {
  return rooms.get(roomId) || null;
}

// Create a new room
function createRoom(hostName, hostSocketId) {
  const roomId = generateRoomId();
  const roomData = {
    id: roomId,
    players: [
      {
        id: hostSocketId,
        name: hostName,
        isHost: true
      }
    ],
    isFull: false,
    gameState: {
      phase: 'playing',
      players: [
        { name: hostName, questionsAsked: 0, skippedExplanations: 0, isCurrentPlayer: true },
        { name: 'Waiting for player...', questionsAsked: 0, skippedExplanations: 0, isCurrentPlayer: false }
      ],
      currentRound: 1,
      totalRounds: 6,
      waitingFor: 'question',
      currentQuestion: '',
      currentAnswer: '',
      dareCount: 0,
      isOnline: true
    }
  };
  
  rooms.set(roomId, roomData);
  players.set(hostSocketId, { roomId, name: hostName });
  
  console.log(`✅ Room ${roomId} created by ${hostName} (${hostSocketId})`);
  return roomData;
}

// Join an existing room
function joinRoom(roomId, playerName, playerSocketId) {
  const roomData = getRoomData(roomId);
  
  if (!roomData) {
    throw new Error('Room not found');
  }
  
  if (roomData.isFull) {
    throw new Error('Room is full');
  }
  
  // Add player to room
  roomData.players.push({
    id: playerSocketId,
    name: playerName,
    isHost: false
  });
  
  roomData.isFull = true;
  
  // Update game state
  roomData.gameState.players[1].name = playerName;
  
  players.set(playerSocketId, { roomId, name: playerName });
  
  console.log(`✅ ${playerName} (${playerSocketId}) joined room ${roomId}`);
  return roomData;
}

// Remove player from room
function removePlayerFromRoom(socketId) {
  const playerData = players.get(socketId);
  if (!playerData) return null;
  
  const roomData = getRoomData(playerData.roomId);
  if (!roomData) return null;
  
  console.log(`❌ Removing player ${playerData.name} (${socketId}) from room ${playerData.roomId}`);
  
  // Remove player from room
  roomData.players = roomData.players.filter(p => p.id !== socketId);
  roomData.isFull = false;
  
  // Update game state
  if (roomData.players.length === 0) {
    // Room is empty, delete it
    console.log(`🗑️ Deleting empty room ${playerData.roomId}`);
    rooms.delete(playerData.roomId);
  } else {
    // Update waiting player name
    roomData.gameState.players[1].name = 'Waiting for player...';
  }
  
  players.delete(socketId);
  
  return roomData;
}

// Get all available rooms
function getAvailableRooms() {
  return Array.from(rooms.values()).map(room => ({
    id: room.id,
    players: room.players.map(p => ({ name: p.name, isHost: p.isHost })),
    isFull: room.isFull
  }));
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);
  
  // Send available rooms to new connection
  socket.emit('room-list-update', getAvailableRooms());
  
  // Create room
  socket.on('create-room', (playerName) => {
    try {
      console.log(`🚀 Creating room for ${playerName} (${socket.id})`);
      
      if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
        socket.emit('error', 'Invalid player name');
        return;
      }
      
      const roomData = createRoom(playerName.trim(), socket.id);
      socket.join(roomData.id);
      
      // Emit success
      socket.emit('room-created', roomData.id);
      
      // Notify all clients about room list update
      io.emit('room-list-update', getAvailableRooms());
      
      console.log(`✅ Room ${roomData.id} created successfully for ${playerName}`);
    } catch (error) {
      console.error(`❌ Error creating room for ${playerName}:`, error);
      socket.emit('error', error.message || 'Failed to create room');
    }
  });
  
  // Join room
  socket.on('join-room', (roomId, playerName) => {
    try {
      console.log(`🚀 ${playerName} (${socket.id}) attempting to join room ${roomId}`);
      
      if (!roomId || !playerName || typeof roomId !== 'string' || typeof playerName !== 'string') {
        socket.emit('error', 'Invalid room ID or player name');
        return;
      }
      
      const roomData = joinRoom(roomId.trim().toUpperCase(), playerName.trim(), socket.id);
      socket.join(roomData.id);
      
      // Emit success to the joining player
      socket.emit('joined-room', roomData);
      
      // Notify other players in the room
      socket.to(roomData.id).emit('player-joined', {
        id: socket.id,
        name: playerName.trim(),
        isHost: false
      });
      
      // Notify all clients about room list update
      io.emit('room-list-update', getAvailableRooms());
      
      console.log(`✅ ${playerName} successfully joined room ${roomId}`);
    } catch (error) {
      console.error(`❌ Error joining room ${roomId}:`, error);
      socket.emit('error', error.message || 'Failed to join room');
    }
  });
  
  // Game actions
  socket.on('game-action', (data) => {
    try {
      const { roomId, action } = data;
      const roomData = getRoomData(roomId);
      
      if (!roomData) {
        socket.emit('error', 'Room not found');
        return;
      }
      
      console.log(`🎮 Game action in room ${roomId}:`, action.type);
      
      // Update game state based on action
      switch (action.type) {
        case 'ASK_QUESTION':
          // Handle asking a question
          roomData.gameState.waitingFor = 'answer';
          break;
          
        case 'ANSWER_QUESTION':
          // Handle answering a question
          roomData.gameState.waitingFor = 'explanation';
          roomData.gameState.currentAnswer = action.payload.answer;
          break;
          
        case 'SKIP_EXPLANATION':
          // Handle skipping explanation
          const playerIndex = roomData.gameState.players.findIndex(p => p.name === action.payload.playerName);
          if (playerIndex !== -1) {
            roomData.gameState.players[playerIndex].skippedExplanations++;
            roomData.gameState.dareCount++;
          }
          roomData.gameState.waitingFor = 'question';
          
          // Switch turns
          roomData.gameState.players.forEach((player, index) => {
            player.isCurrentPlayer = !player.isCurrentPlayer;
          });
          
          // Increment round if needed
          if (roomData.gameState.players[0].questionsAsked + roomData.gameState.players[1].questionsAsked >= 10) {
            roomData.gameState.phase = 'end';
          }
          break;
          
        default:
          console.log('❓ Unknown action:', action.type);
      }
      
      // Broadcast updated game state to all players in the room
      io.to(roomId).emit('game-state-update', roomData.gameState);
    } catch (error) {
      console.error('❌ Error handling game action:', error);
      socket.emit('error', 'Failed to process game action');
    }
  });
  
  // Disconnect handling
  socket.on('disconnect', (reason) => {
    console.log(`❌ User disconnected: ${socket.id} (${reason})`);
    
    const roomData = removePlayerFromRoom(socket.id);
    if (roomData) {
      // Notify remaining players
      socket.to(roomData.id).emit('player-left', socket.id);
      
      // Notify all clients about room list update
      io.emit('room-list-update', getAvailableRooms());
    }
  });
  
  // Handle errors
  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size, 
    players: players.size,
    timestamp: new Date().toISOString()
  });
});

// Get available rooms endpoint
app.get('/rooms', (req, res) => {
  res.json(getAvailableRooms());
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Couple Dare Date Server',
    status: 'running',
    rooms: rooms.size,
    players: players.size
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Available rooms: http://localhost:${PORT}/rooms`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});