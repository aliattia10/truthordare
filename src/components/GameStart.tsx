import { useState } from 'react';
import { Heart, Users, Edit, Globe, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GameState } from '@/pages/Index';
import RoomManager from './RoomManager';

interface GameStartProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

const GameStart = ({ gameState, setGameState }: GameStartProps) => {
  const [playerNames, setPlayerNames] = useState(['Player 1', 'Player 2']);
  const [isEditing, setIsEditing] = useState(false);
  const [gameMode, setGameMode] = useState<'select' | 'local' | 'online'>('select');

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name || `Player ${index + 1}`;
    setPlayerNames(newNames);
  };

  const startGame = (firstPlayer: number) => {
    const newState = { ...gameState };
    newState.phase = 'playing';
    newState.players[0].name = playerNames[0];
    newState.players[1].name = playerNames[1];
    newState.players[firstPlayer].isCurrentPlayer = true;
    newState.isOnline = false; // Local game
    setGameState(newState);
  };

  if (gameMode === 'online') {
    return (
      <RoomManager 
        gameState={gameState} 
        setGameState={setGameState} 
        onBackToLocal={() => setGameMode('select')}
      />
    );
  }

  if (gameMode === 'select') {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-pink-500 mr-2 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Truth or Dare: Love Edition
            </h1>
            <Heart className="w-8 h-8 text-pink-500 ml-2 animate-pulse" />
          </div>
          <p className="text-lg text-gray-600">💞 A romantic game for two lovebirds 💞</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
              <Users className="w-6 h-6 mr-2" />
              Choose Game Mode
            </CardTitle>
            <CardDescription>
              Play locally or online with your partner
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setGameMode('local')}
                className="h-16 text-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200"
              >
                <Home className="w-5 h-5 mr-2" />
                Local Game
              </Button>
              <Button
                onClick={() => setGameMode('online')}
                className="h-16 text-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
              >
                <Globe className="w-5 h-5 mr-2" />
                Online Game
              </Button>
            </div>
            
            <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
              <h3 className="font-semibold text-purple-700 mb-2">Game Modes:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Local Game:</strong> Play together on the same device 💻</li>
                <li>• <strong>Online Game:</strong> Play remotely with room codes 🌐</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-pink-500 mr-2 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Truth or Dare: Love Edition
          </h1>
          <Heart className="w-8 h-8 text-pink-500 ml-2 animate-pulse" />
        </div>
        <p className="text-lg text-gray-600">💞 A romantic game for two lovebirds 💞</p>
      </div>

      <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl mb-6">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
            <Users className="w-6 h-6 mr-2" />
            Player Names
          </CardTitle>
          <CardDescription>
            Customize your names for a personal touch! 💕
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playerNames.map((name, index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium text-purple-700">
                  Player {index + 1}:
                </label>
                <Input
                  value={name}
                  onChange={(e) => updatePlayerName(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="border-pink-200 focus:border-pink-400"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
            <Users className="w-6 h-6 mr-2" />
            Who Goes First?
          </CardTitle>
          <CardDescription className="text-lg">
            Choose who will start this romantic adventure! 💕
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => startGame(0)}
              className="h-16 text-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200"
            >
              <Heart className="w-5 h-5 mr-2" />
              {playerNames[0]} starts! 💪
            </Button>
            <Button
              onClick={() => startGame(1)}
              className="h-16 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            >
              <Heart className="w-5 h-5 mr-2" />
              {playerNames[1]} starts! 💫
            </Button>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
            <h3 className="font-semibold text-purple-700 mb-2">How to Play:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Ask your partner a question (anything you want to know!)</li>
              <li>• They answer YES or NO only</li>
              <li>• Then they have 1 minute to explain why 💬⏳</li>
              <li>• After 5 questions, get ready for a romantic dare! 🔥</li>
              <li>• Skip explanations and face more dares! 😈</li>
            </ul>
          </div>

          <Button
            onClick={() => setGameMode('select')}
            variant="outline"
            className="w-full"
          >
            <Globe className="w-4 h-4 mr-2" />
            Switch to Online Mode
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStart;
