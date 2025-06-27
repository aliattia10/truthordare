import { useState, useEffect } from 'react';
import { Heart, Users, Copy, Check, Globe, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { GameState } from '@/pages/Index';
import socketService, { RoomData, PlayerData } from '@/services/socketService';

interface RoomManagerProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  onBackToLocal: () => void;
}

const RoomManager = ({ gameState, setGameState, onBackToLocal }: RoomManagerProps) => {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<RoomData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();
    setIsConnected(true);

    // Set up event listeners
    socketService.on('room-created', (roomId: string) => {
      setRoomId(roomId);
      setIsLoading(false);
      toast({
        title: "Room created!",
        description: `Share this room code: ${roomId}`,
      });
    });

    socketService.on('player-joined', (player: PlayerData) => {
      setIsLoading(false);
      toast({
        title: "Player joined!",
        description: `${player.name} has joined the room.`,
      });
    });

    socketService.on('room-list-update', (rooms: RoomData[]) => {
      setAvailableRooms(rooms);
    });

    socketService.on('error', (error: string) => {
      setIsLoading(false);
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

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
    try {
      const newRoomId = await socketService.createRoom(playerName);
      
      // Update game state for online play
      const newState = { ...gameState };
      newState.players[0].name = playerName;
      newState.players[1].name = 'Waiting for player...';
      newState.phase = 'playing';
      newState.players[0].isCurrentPlayer = true;
      newState.isOnline = true;
      setGameState(newState);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error creating room",
        description: "Please try again.",
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
    try {
      const success = await socketService.joinRoom(roomId, playerName);
      
      if (success) {
        // Update game state for online play
        const newState = { ...gameState };
        newState.players[1].name = playerName;
        newState.players[0].name = 'Host';
        newState.phase = 'playing';
        newState.players[1].isCurrentPlayer = false;
        newState.isOnline = true;
        setGameState(newState);
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error joining room",
        description: "Please check the room code and try again.",
        variant: "destructive",
      });
    }
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Room code copied!",
      description: "Share this code with your partner.",
    });
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
                className="h-16 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                <Heart className="w-5 h-5 mr-2" />
                Create Room
              </Button>
              <Button
                onClick={() => setMode('join')}
                className="h-16 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
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
              />
            </div>
            
            <Button
              onClick={createRoom}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Room...' : 'Create Room'}
            </Button>

            {roomId && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-blue-700">Room Code:</span>
                  <Button
                    onClick={copyRoomCode}
                    size="sm"
                    variant="outline"
                    className="h-8"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="text-2xl font-mono font-bold text-blue-600 bg-white p-2 rounded border">
                  {roomId}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Share this code with your partner to join the game!
                </p>
              </div>
            )}

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
              disabled={isLoading}
            >
              {isLoading ? 'Joining Room...' : 'Join Room'}
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-purple-700 mb-2">Available Rooms:</h3>
              <div className="space-y-2">
                {availableRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div>
                      <span className="font-mono text-sm">{room.id}</span>
                      <div className="text-xs text-gray-500">
                        Players: {room.players.map(p => p.name).join(', ')}
                      </div>
                    </div>
                    <Badge variant={room.isFull ? "destructive" : "default"}>
                      {room.isFull ? "Full" : "Available"}
                    </Badge>
                  </div>
                ))}
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

      <div className="text-center">
        <Badge variant="outline" className="mb-2">
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </Badge>
      </div>
    </div>
  );
};

export default RoomManager; 