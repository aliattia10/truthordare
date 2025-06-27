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

  // Event handlers
  private onRoomCreated?: (roomId: string) => void;
  private onPlayerJoined?: (player: PlayerData) => void;
  private onPlayerLeft?: (playerId: string) => void;
  private onGameStateUpdate?: (gameState: any) => void;
  private onRoomListUpdate?: (rooms: RoomData[]) => void;
  private onError?: (error: string) => void;

  connect() {
    if (this.socket) {
      this.socket.disconnect();
    }

    // Connect to the socket server using environment configuration
    this.socket = io(SOCKET_SERVER_URL);
    
    this.socket.on('connect', () => {
      console.log('Connected to server:', SOCKET_SERVER_URL);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error: string) => {
      console.error('Socket error:', error);
      this.onError?.(error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.roomId = null;
    this.playerName = null;
  }

  createRoom(playerName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.playerName = playerName;
      
      this.socket.emit('create-room', playerName);
      
      this.socket.once('room-created', (roomId: string) => {
        this.roomId = roomId;
        resolve(roomId);
      });

      this.socket.once('error', (error: string) => {
        reject(new Error(error));
      });
    });
  }

  joinRoom(roomId: string, playerName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.roomId = roomId;
      this.playerName = playerName;
      
      this.socket.emit('join-room', roomId, playerName);
      
      this.socket.once('joined-room', (roomData: any) => {
        resolve(true);
      });

      this.socket.once('error', (error: string) => {
        reject(new Error(error));
      });
    });
  }

  leaveRoom() {
    if (this.roomId) {
      // The server will handle cleanup when the socket disconnects
      this.roomId = null;
      this.playerName = null;
    }
  }

  sendGameAction(action: GameAction) {
    if (this.socket && this.roomId) {
      this.socket.emit('game-action', {
        roomId: this.roomId,
        action
      });
    }
  }

  // Event listeners
  on(event: string, callback: Function) {
    if (!this.socket) return;

    switch (event) {
      case 'room-created':
        this.onRoomCreated = callback as (roomId: string) => void;
        this.socket.on('room-created', callback);
        break;
      case 'player-joined':
        this.onPlayerJoined = callback as (player: PlayerData) => void;
        this.socket.on('player-joined', callback);
        break;
      case 'player-left':
        this.onPlayerLeft = callback as (playerId: string) => void;
        this.socket.on('player-left', callback);
        break;
      case 'game-state-update':
        this.onGameStateUpdate = callback as (gameState: any) => void;
        this.socket.on('game-state-update', callback);
        break;
      case 'room-list-update':
        this.onRoomListUpdate = callback as (rooms: RoomData[]) => void;
        this.socket.on('room-list-update', callback);
        break;
      case 'error':
        this.onError = callback as (error: string) => void;
        this.socket.on('error', callback);
        break;
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