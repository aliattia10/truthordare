import { useState, useEffect } from 'react';
import { Heart, Users, Wifi, WifiOff, MessageCircle, Clock, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { GameState } from '@/pages/Index';
import socketService from '@/services/socketService';
import TimerComponent from './TimerComponent';

interface OnlineGamePlayProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

const OnlineGamePlay = ({ gameState, setGameState }: OnlineGamePlayProps) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [opponentName, setOpponentName] = useState<string>('Waiting for player...');
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get current room info
    const currentRoomId = socketService.getRoomId();
    const currentPlayerName = socketService.getPlayerName();
    
    setRoomId(currentRoomId);
    setPlayerName(currentPlayerName);

    // Set up socket listeners for online gameplay
    socketService.on('game-state-update', (newGameState: GameState) => {
      setGameState(newGameState);
    });

    socketService.on('player-joined', (player) => {
      setOpponentName(player.name);
      toast({
        title: "Player joined!",
        description: `${player.name} has joined the game.`,
      });
    });

    socketService.on('player-left', (playerId) => {
      setOpponentName('Player disconnected');
      toast({
        title: "Player disconnected",
        description: "Your partner has left the game.",
        variant: "destructive",
      });
    });

    socketService.on('disconnect', () => {
      setIsConnected(false);
    });

    // Determine if it's this player's turn
    const currentPlayer = gameState.players.find(p => p.isCurrentPlayer);
    setIsMyTurn(currentPlayer?.name === currentPlayerName);

    // Set opponent name from game state
    const opponent = gameState.players.find(p => p.name !== currentPlayerName);
    if (opponent && opponent.name !== 'Waiting for player...') {
      setOpponentName(opponent.name);
    }

    return () => {
      // Cleanup
    };
  }, [gameState, setGameState]);

  const handleQuestion = () => {
    if (!isMyTurn) {
      toast({
        title: "Not your turn",
        description: "Please wait for your partner to finish.",
        variant: "destructive",
      });
      return;
    }

    // Send game action to server
    socketService.sendGameAction({
      type: 'ASK_QUESTION',
      payload: { playerName }
    });

    setShowTimer(true);
    setTimeLeft(60);
  };

  const handleAnswer = (answer: 'YES' | 'NO') => {
    if (isMyTurn) {
      toast({
        title: "Not your turn",
        description: "Please wait for your partner to ask a question.",
        variant: "destructive",
      });
      return;
    }

    // Send answer to server
    socketService.sendGameAction({
      type: 'ANSWER_QUESTION',
      payload: { answer, playerName }
    });

    setShowTimer(true);
    setTimeLeft(60);
  };

  const handleSkipExplanation = () => {
    if (!showTimer) return;

    socketService.sendGameAction({
      type: 'SKIP_EXPLANATION',
      payload: { playerName }
    });

    setShowTimer(false);
  };

  const handleTimerComplete = () => {
    setShowTimer(false);
    // Automatically skip explanation when timer runs out
    handleSkipExplanation();
  };

  const copyRoomCode = () => {
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Room code copied!",
        description: "Share this code with your partner.",
      });
    }
  };

  const getCurrentAction = () => {
    if (showTimer) {
      return 'explanation';
    }
    return isMyTurn ? 'question' : 'answer';
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Connection Status */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-pink-500 mr-2 animate-pulse" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Online Game
          </h1>
          <Heart className="w-8 h-8 text-pink-500 ml-2 animate-pulse" />
        </div>
        
        <div className="flex items-center justify-center space-x-4 mb-4">
          <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center">
            {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          {roomId && (
            <Badge variant="outline" className="font-mono flex items-center">
              Room: {roomId}
              <Button
                onClick={copyRoomCode}
                size="sm"
                variant="ghost"
                className="h-4 w-4 p-0 ml-2"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-center space-x-8">
          <div className="text-center">
            <div className="text-sm text-gray-600">You</div>
            <div className="font-semibold text-blue-600">{playerName}</div>
          </div>
          <Heart className="w-6 h-6 text-pink-500" />
          <div className="text-center">
            <div className="text-sm text-gray-600">Partner</div>
            <div className="font-semibold text-purple-600">{opponentName}</div>
          </div>
        </div>
      </div>

      {/* Game Status */}
      <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl mb-6">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-xl text-purple-700">
            <Users className="w-5 h-5 mr-2" />
            Game Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-pink-600">{gameState.currentRound}</div>
              <div className="text-sm text-gray-600">Round</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{gameState.dareCount}</div>
              <div className="text-sm text-gray-600">Dares</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{gameState.totalRounds}</div>
              <div className="text-sm text-gray-600">Total Rounds</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Action */}
      {showTimer ? (
        <Card className="backdrop-blur-sm bg-white/80 border-yellow-200 shadow-xl mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-xl text-yellow-700">
              <Clock className="w-5 h-5 mr-2" />
              Explanation Time
            </CardTitle>
            <CardDescription>
              Explain your answer in detail! 💬
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <TimerComponent 
              onComplete={handleTimerComplete}
            />
            <div className="mt-4">
              <Button
                onClick={handleSkipExplanation}
                variant="outline"
                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              >
                Skip Explanation 😈
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl mb-6">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-xl text-purple-700">
              {isMyTurn ? (
                <>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Your Turn - Ask a Question
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Waiting for Partner
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isMyTurn 
                ? "Ask your partner anything you want to know! 💕"
                : "Your partner is thinking of a question..."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {isMyTurn ? (
              <Button
                onClick={handleQuestion}
                className="h-16 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                <Heart className="w-5 h-5 mr-2" />
                Ask a Question! 💭
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="text-lg text-gray-600">
                  Waiting for {opponentName} to ask a question...
                </div>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => handleAnswer('YES')}
                    className="bg-green-500 hover:bg-green-600"
                    disabled={isMyTurn}
                  >
                    YES ✅
                  </Button>
                  <Button
                    onClick={() => handleAnswer('NO')}
                    className="bg-red-500 hover:bg-red-600"
                    disabled={isMyTurn}
                  >
                    NO ❌
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Player Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gameState.players.map((player, index) => (
          <Card key={index} className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-purple-700">
                {player.name}
                {player.isCurrentPlayer && (
                  <Badge className="ml-2" variant="default">
                    Current Turn
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-center">
                <div>
                  <span className="text-sm text-gray-600">Questions Asked:</span>
                  <div className="text-xl font-bold text-blue-600">{player.questionsAsked}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Skipped Explanations:</span>
                  <div className="text-xl font-bold text-red-600">{player.skippedExplanations}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OnlineGamePlay;