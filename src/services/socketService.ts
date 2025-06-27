import { io, Socket } from 'socket.io-client';
import { SOCKET_SERVER_URL } from '@/config/environment';

export interface RoomData {
  id: string;
  players: PlayerData[];
  isFull: boolean;
  gameState?: any;
}

export interface PlayerData {
  id: string;
  name: string;
  isHost: boolean;
}

export interface GameAction {
  type: string;
  payload: any;
}

class SocketService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private playerName: string | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) {
      console.log('Already connected to server');
      return;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    console.log('Connecting to server:', SOCKET_SERVER_URL);
    
    // Connect to the socket server using environment configuration
    this.socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      forceNew: true
    });
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to server:', SOCKET_SERVER_URL);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      // Emit error to handlers
      this.emitToHandlers('error', `Connection failed: ${error.message}`);
    });

    // Set up all event listeners
    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('room-created', (roomId: string) => {
      console.log('✅ Room created:', roomId);
      this.roomId = roomId;
      this.emitToHandlers('room-created', roomId);
    });

    this.socket.on('joined-room', (roomData: RoomData) => {
      console.log('✅ Joined room:', roomData);
      this.emitToHandlers('joined-room', roomData);
    });

    this.socket.on('player-joined', (player: PlayerData) => {
      console.log('✅ Player joined:', player);
      this.emitToHandlers('player-joined', player);
    });

    this.socket.on('player-left', (playerId: string) => {
      console.log('❌ Player left:', playerId);
      this.emitToHandlers('player-left', playerId);
    });

    this.socket.on('game-state-update', (gameState: any) => {
      console.log('🎮 Game state update:', gameState);
      this.emitToHandlers('game-state-update', gameState);
    });

    this.socket.on('room-list-update', (rooms: RoomData[]) => {
      console.log('📋 Room list update:', rooms);
      this.emitToHandlers('room-list-update', rooms);
    });

    this.socket.on('error', (error: string) => {
      console.error('❌ Socket error:', error);
      this.emitToHandlers('error', error);
    });
  }

  private emitToHandlers(event: string, data: any) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.roomId = null;
    this.playerName = null;
    this.eventHandlers.clear();
  }

  createRoom(playerName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server. Please check your connection.'));
        return;
      }

      this.playerName = playerName;
      
      console.log('🚀 Creating room for player:', playerName);
      
      // Set up one-time listeners for this specific request
      const timeout = setTimeout(() => {
        reject(new Error('Room creation timed out. Please try again.'));
      }, 15000);

      const onRoomCreated = (roomId: string) => {
        clearTimeout(timeout);
        this.roomId = roomId;
        resolve(roomId);
      };

      const onError = (error: string) => {
        clearTimeout(timeout);
        reject(new Error(error));
      };

      // Add temporary handlers
      this.on('room-created', onRoomCreated);
      this.on('error', onError);

      // Emit the create room event
      this.socket.emit('create-room', playerName);

      // Clean up handlers after timeout
      setTimeout(() => {
        this.off('room-created', onRoomCreated);
        this.off('error', onError);
      }, 16000);
    });
  }

  joinRoom(roomId: string, playerName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        reject(new Error('Not connected to server. Please check your connection.'));
        return;
      }

      this.roomId = roomId;
      this.playerName = playerName;
      
      console.log('🚀 Joining room:', roomId, 'as player:', playerName);

      const timeout = setTimeout(() => {
        reject(new Error('Join room timed out. Please try again.'));
      }, 15000);

      const onJoinedRoom = (roomData: any) => {
        clearTimeout(timeout);
        resolve(true);
      };

      const onError = (error: string) => {
        clearTimeout(timeout);
        reject(new Error(error));
      };

      // Add temporary handlers
      this.on('joined-room', onJoinedRoom);
      this.on('error', onError);
      
      this.socket.emit('join-room', roomId, playerName);

      // Clean up handlers after timeout
      setTimeout(() => {
        this.off('joined-room', onJoinedRoom);
        this.off('error', onError);
      }, 16000);
    });
  }

  leaveRoom() {
    if (this.roomId) {
      console.log('👋 Leaving room:', this.roomId);
      // The server will handle cleanup when the socket disconnects
      this.roomId = null;
      this.playerName = null;
    }
  }

  sendGameAction(action: GameAction) {
    if (this.socket?.connected && this.roomId) {
      console.log('🎮 Sending game action:', action);
      this.socket.emit('game-action', {
        roomId: this.roomId,
        action
      });
    } else {
      console.error('❌ Cannot send game action: not connected or no room');
    }
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Getters
  getRoomId(): string | null {
    return this.roomId;
  }

  getPlayerName(): string | null {
    return this.playerName;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;