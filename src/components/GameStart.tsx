
import { Heart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameState } from '@/pages/Index';

interface GameStartProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

const GameStart = ({ gameState, setGameState }: GameStartProps) => {
  const startGame = (firstPlayer: number) => {
    const newState = { ...gameState };
    newState.phase = 'playing';
    newState.players[firstPlayer].isCurrentPlayer = true;
    setGameState(newState);
  };

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
              Ali starts! 💪
            </Button>
            <Button
              onClick={() => startGame(1)}
              className="h-16 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200"
            >
              <Heart className="w-5 h-5 mr-2" />
              His Girlfriend starts! 💫
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
        </CardContent>
      </Card>
    </div>
  );
};

export default GameStart;
