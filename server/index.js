const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Vite dev server
    methods: ["GET", "POST"]
  }
});

app.use(cors());
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
  
  return roomData;
}

// Remove player from room
function removePlayerFromRoom(socketId) {
  const playerData = players.get(socketId);
  if (!playerData) return;
  
  const roomData = getRoomData(playerData.roomId);
  if (!roomData) return;
  
  // Remove player from room
  roomData.players = roomData.players.filter(p => p.id !== socketId);
  roomData.isFull = false;
  
  // Update game state
  if (roomData.players.length === 0) {
    // Room is empty, delete it
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
    players: room.players.map(p => p.name),
    isFull: room.isFull
  }));
}

// Socket connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Send available rooms to new connection
  socket.emit('room-list-update', getAvailableRooms());
  
  // Create room
  socket.on('create-room', (playerName) => {
    try {
      const roomData = createRoom(playerName, socket.id);
      socket.join(roomData.id);
      socket.emit('room-created', roomData.id);
      
      // Notify all clients about room list update
      io.emit('room-list-update', getAvailableRooms());
      
      console.log(`Room ${roomData.id} created by ${playerName}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
  
  // Join room
  socket.on('join-room', (roomId, playerName) => {
    try {
      const roomData = joinRoom(roomId, playerName, socket.id);
      socket.join(roomData.id);
      socket.emit('joined-room', roomData);
      
      // Notify other players in the room
      socket.to(roomData.id).emit('player-joined', {
        id: socket.id,
        name: playerName,
        isHost: false
      });
      
      // Notify all clients about room list update
      io.emit('room-list-update', getAvailableRooms());
      
      console.log(`${playerName} joined room ${roomId}`);
    } catch (error) {
      socket.emit('error', error.message);
    }
  });
  
  // Game actions
  socket.on('game-action', (data) => {
    const { roomId, action } = data;
    const roomData = getRoomData(roomId);
    
    if (!roomData) {
      socket.emit('error', 'Room not found');
      return;
    }
    
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
        console.log('Unknown action:', action.type);
    }
    
    // Broadcast updated game state to all players in the room
    io.to(roomId).emit('game-state-update', roomData.gameState);
  });
  
  // Disconnect handling
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const roomData = removePlayerFromRoom(socket.id);
    if (roomData) {
      // Notify remaining players
      socket.to(roomData.id).emit('player-left', socket.id);
      
      // Notify all clients about room list update
      io.emit('room-list-update', getAvailableRooms());
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    rooms: rooms.size, 
    players: players.size 
  });
});

// Get available rooms endpoint
app.get('/rooms', (req, res) => {
  res.json(getAvailableRooms());
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Available rooms: http://localhost:${PORT}/rooms`);
}); 