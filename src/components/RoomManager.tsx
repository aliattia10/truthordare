import { useState, useEffect } from 'react';
import { Heart, Users, Copy, Check, Globe, Home, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { GameState } from '@/pages/Index';
import socketService, { RoomData, PlayerData } from '@/services/socketService';

interface RoomManagerProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onBackToLocal: () => void;
}

const RoomManager = ({ gameState, setGameState, onBackToLocal }: RoomManagerProps) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join' | 'in-room'>('select');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentRoomData, setCurrentRoomData] = useState<RoomData | null>(null);

  useEffect(() => {
    let mounted = true;

    const initializeConnection = async () => {
      try {
        setConnectionError(null);
        setIsLoading(true);
        console.log('🔌 Initializing socket connection...');
        
        await socketService.connect();
        
        if (!mounted) return;
        
        setIsConnected(true);
        console.log('✅ Socket connection established');
      } catch (error) {
        console.error('❌ Failed to initialize connection:', error);
        if (mounted) {
          setConnectionError(error.message || 'Failed to connect to server');
          setIsConnected(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    const setupEventListeners = () => {
      socketService.on('room-created', (roomId: string) => {
        if (!mounted) return;
        console.log('✅ Room created successfully:', roomId);
        setRoomId(roomId);
        setIsLoading(false);
        setMode('in-room');
        
        // Update current room data
        setCurrentRoomData({
          id: roomId,
          players: [{ id: 'host', name: playerName, isHost: true }],
          isFull: false
        });

        toast({
          title: "Room created!",
          description: `Share this room code: ${roomId}`,
        });

        // Update game state for online play
        const newState = { ...gameState };
        newState.players[0].name = playerName;
        newState.players[1].name = 'Waiting for player...';
        newState.phase = 'playing';
        newState.players[0].isCurrentPlayer = true;
        newState.isOnline = true;
        setGameState(newState);
      });

      socketService.on('joined-room', (roomData: RoomData) => {
        if (!mounted) return;
        console.log('✅ Successfully joined room:', roomData);
        setIsLoading(false);
        setMode('in-room');
        setCurrentRoomData(roomData);
        
        toast({
          title: "Joined room!",
          description: `Welcome to room ${roomData.id}`,
        });

        // Update game state for online play
        const newState = { ...gameState };
        newState.players[1].name = playerName;
        newState.players[0].name = roomData.players[0]?.name || 'Host';
        newState.phase = 'playing';
        newState.players[1].isCurrentPlayer = false;
        newState.isOnline = true;
        setGameState(newState);
      });

      socketService.on('player-joined', (player: PlayerData) => {
        if (!mounted) return;
        console.log('✅ Player joined:', player);
        
        // Update current room data
        if (currentRoomData) {
          const updatedRoom = { ...currentRoomData };
          updatedRoom.players.push(player);
          updatedRoom.isFull = updatedRoom.players.length >= 2;
          setCurrentRoomData(updatedRoom);
        }

        toast({
          title: "Player joined!",
          description: `${player.name} has joined the room.`,
        });

        // Update game state
        const newState = { ...gameState };
        newState.players[1].name = player.name;
        setGameState(newState);
      });

      socketService.on('player-left', (playerId: string) => {
        if (!mounted) return;
        console.log('❌ Player left:', playerId);
        
        // Update current room data
        if (currentRoomData) {
          const updatedRoom = { ...currentRoomData };
          updatedRoom.players = updatedRoom.players.filter(p => p.id !== playerId);
          updatedRoom.isFull = false;
          setCurrentRoomData(updatedRoom);
        }

        toast({
          title: "Player left",
          description: "Your partner has left the game.",
          variant: "destructive",
        });

        // Update game state
        const newState = { ...gameState };
        newState.players[1].name = 'Waiting for player...';
        setGameState(newState);
      });

      socketService.on('room-list-update', (rooms: RoomData[]) => {
        if (!mounted) return;
        console.log('📋 Room list updated:', rooms);
        setAvailableRooms(rooms);
      });

      socketService.on('error', (error: string) => {
        if (!mounted) return;
        console.error('❌ Socket error:', error);
        setIsLoading(false);
        setConnectionError(error);
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      });

      socketService.on('disconnect', (reason: string) => {
        if (!mounted) return;
        console.log('❌ Disconnected:', reason);
        setIsConnected(false);
        setConnectionError('Disconnected from server');
      });
    };

    setupEventListeners();
    initializeConnection();

    return () => {
      mounted = false;
    };
  }, [gameState, setGameState, playerName, currentRoomData]);

  const createRoom = async () => {
    if (!playerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create a room.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setConnectionError(null);
    
    try {
      console.log('🚀 Attempting to create room...');
      const newRoomId = await socketService.createRoom(playerName.trim());
      console.log('✅ Room created successfully:', newRoomId);
    } catch (error: any) {
      console.error('❌ Failed to create room:', error);
      setIsLoading(false);
      setConnectionError(error.message || 'Failed to create room');
      toast({
        title: "Error creating room",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !roomId.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both your name and room code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setConnectionError(null);
    
    try {
      console.log('🚀 Attempting to join room...');
      await socketService.joinRoom(roomId.trim().toUpperCase(), playerName.trim());
      console.log('✅ Successfully joined room');
    } catch (error: any) {
      console.error('❌ Failed to join room:', error);
      setIsLoading(false);
      setConnectionError(error.message || 'Failed to join room');
      toast({
        title: "Error joining room",
        description: error.message || "Please check the room code and try again.",
        variant: "destructive",
      });
    }
  };

  const copyRoomCode = () => {
    const codeToShare = currentRoomData?.id || roomId;
    navigator.clipboard.writeText(codeToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Room code copied!",
      description: "Share this code with your partner.",
    });
  };

  const retryConnection = async () => {
    setConnectionError(null);
    setIsConnected(false);
    setIsLoading(true);
    
    try {
      socketService.disconnect();
      await socketService.connect();
      setIsConnected(true);
    } catch (error: any) {
      setConnectionError(error.message || 'Failed to reconnect');
    } finally {
      setIsLoading(false);
    }
  };

  const leaveRoom = () => {
    socketService.leaveRoom();
    setMode('select');
    setCurrentRoomData(null);
    setRoomId('');
    
    // Reset game state
    const newState = { ...gameState };
    newState.phase = 'start';
    newState.isOnline = false;
    setGameState(newState);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Globe className="w-8 h-8 text-blue-500 mr-2" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Online Multiplayer
          </h1>
          <Globe className="w-8 h-8 text-blue-500 ml-2" />
        </div>
        <p className="text-lg text-gray-600">💞 Play with your partner online! 💞</p>
      </div>

      {/* Connection Status */}
      <div className="text-center mb-6">
        <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center w-fit mx-auto">
          {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      {connectionError && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {connectionError}
            <Button 
              onClick={retryConnection} 
              variant="outline" 
              size="sm" 
              className="ml-2 h-6 text-xs"
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Retry'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* In Room View */}
      {mode === 'in-room' && currentRoomData && (
        <Card className="backdrop-blur-sm bg-white/80 border-green-200 shadow-xl mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl text-green-700">
              <Users className="w-6 h-6 mr-2" />
              Room: {currentRoomData.id}
            </CardTitle>
            <CardDescription>
              Share this room code with your partner to start playing!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-green-700">Room Code:</span>
                <Button
                  onClick={copyRoomCode}
                  size="sm"
                  variant="outline"
                  className="h-8"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <div className="text-3xl font-mono font-bold text-green-600 bg-white p-3 rounded border text-center">
                {currentRoomData.id}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Players in Room:</h3>
              {currentRoomData.players.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="font-medium">{player.name}</span>
                  <Badge variant={player.isHost ? "default" : "secondary"}>
                    {player.isHost ? "Host" : "Player"}
                  </Badge>
                </div>
              ))}
              {currentRoomData.players.length < 2 && (
                <div className="p-2 bg-yellow-50 rounded border border-yellow-200 text-center">
                  <span className="text-yellow-700">Waiting for another player to join...</span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={leaveRoom}
                variant="outline"
                className="flex-1"
              >
                Leave Room
              </Button>
              <Button
                onClick={copyRoomCode}
                className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              >
                <Copy className="w-4 h-4 mr-2" />
                Share Room Code
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mode Selection */}
      {mode === 'select' && (
        <Card className="backdrop-blur-sm bg-white/80 border-blue-200 shadow-xl mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl text-blue-700">
              <Users className="w-6 h-6 mr-2" />
              Choose Your Mode
            </CardTitle>
            <CardDescription>
              Create a room or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setMode('create')}
                disabled={!isConnected || isLoading}
                className="h-16 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="w-5 h-5 mr-2" />
                Create Room
              </Button>
              <Button
                onClick={() => setMode('join')}
                disabled={!isConnected || isLoading}
                className="h-16 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Heart className="w-5 h-5 mr-2" />
                Join Room
              </Button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={onBackToLocal}
                variant="outline"
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Back to Local Game
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Room */}
      {mode === 'create' && (
        <Card className="backdrop-blur-sm bg-white/80 border-blue-200 shadow-xl mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl text-blue-700">
              <Users className="w-6 h-6 mr-2" />
              Create a Room
            </CardTitle>
            <CardDescription>
              Set up a room and invite your partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-700">
                Your Name:
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="border-blue-200 focus:border-blue-400"
                disabled={isLoading}
                maxLength={20}
              />
            </div>
            
            <Button
              onClick={createRoom}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={isLoading || !isConnected || !playerName.trim()}
            >
              {isLoading ? 'Creating Room...' : 'Create Room'}
            </Button>

            <Button
              onClick={() => setMode('select')}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Join Room */}
      {mode === 'join' && (
        <Card className="backdrop-blur-sm bg-white/80 border-purple-200 shadow-xl mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
              <Users className="w-6 h-6 mr-2" />
              Join a Room
            </CardTitle>
            <CardDescription>
              Enter the room code from your partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700">
                Your Name:
              </label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="border-purple-200 focus:border-purple-400"
                disabled={isLoading}
                maxLength={20}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-purple-700">
                Room Code:
              </label>
              <Input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room code"
                className="border-purple-200 focus:border-purple-400 font-mono"
                maxLength={6}
                disabled={isLoading}
              />
            </div>
            
            <Button
              onClick={joinRoom}
              className="w-full h-12 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={isLoading || !isConnected || !playerName.trim() || !roomId.trim()}
            >
              {isLoading ? 'Joining Room...' : 'Join Room'}
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-purple-700 mb-2">Available Rooms:</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableRooms.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No rooms available</p>
                ) : (
                  availableRooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50"
                      onClick={() => !room.isFull && setRoomId(room.id)}
                    >
                      <div>
                        <span className="font-mono text-sm font-semibold">{room.id}</span>
                        <div className="text-xs text-gray-500">
                          Players: {room.players.map(p => p.name).join(', ')}
                        </div>
                      </div>
                      <Badge variant={room.isFull ? "destructive" : "default"}>
                        {room.isFull ? "Full" : "Available"}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={() => setMode('select')}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              Back
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RoomManager;