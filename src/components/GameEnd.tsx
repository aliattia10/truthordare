
import { useState } from 'react';
import { Heart, Trophy, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GameState } from '@/pages/Index';

interface GameEndProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

const GameEnd = ({ gameState, setGameState }: GameEndProps) => {
  const [showBonusDare, setShowBonusDare] = useState(false);

  const bonusDares = [
    "Plan your next date together by each suggesting one romantic activity 💕",
    "Write a love note to each other and exchange them 💌",
    "Share three things you're grateful for about your relationship 🙏💞",
    "Create a couple's bucket list of 5 things you want to do together 📝✨",
    "Give each other a 2-minute appreciation speech 🎤💕",
    "Plan a surprise for each other that you'll do this week 🎁",
    "Share your favorite 'us' moment from the past month 💭💖"
  ];

  const randomBonusDare = bonusDares[Math.floor(Math.random() * bonusDares.length)];

  const restartGame = () => {
    setGameState({
      phase: 'start',
      players: [
        { name: 'Player 1', questionsAsked: 0, skippedExplanations: 0, isCurrentPlayer: false },
        { name: 'Player 2', questionsAsked: 0, skippedExplanations: 0, isCurrentPlayer: false }
      ],
      currentRound: 1,
      totalRounds: 6,
      waitingFor: 'question',
      currentQuestion: '',
      currentAnswer: '',
      dareCount: 0
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Trophy className="w-8 h-8 text-yellow-500 mr-2 animate-bounce" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Game Complete!
          </h1>
          <Trophy className="w-8 h-8 text-yellow-500 ml-2 animate-bounce" />
        </div>
        <p className="text-xl text-gray-600">🎉 Congratulations, lovebirds! 🎉</p>
      </div>

      <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl mb-6">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
            <Heart className="w-6 h-6 mr-2 text-pink-500" />
            Game Summary
          </CardTitle>
          <CardDescription>
            You both did amazingly! Here's how your romantic journey went:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {gameState.players.map((player, index) => (
              <div key={index} className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200">
                <h3 className="font-semibold text-purple-700 mb-2">{player.name}</h3>
                <p className="text-sm text-gray-600">Questions Asked: {player.questionsAsked}</p>
                <p className="text-sm text-gray-600">Explanations Skipped: {player.skippedExplanations}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <p className="font-semibold text-orange-700">
              Total Dares Completed: {gameState.dareCount} 🔥
            </p>
            <p className="text-sm text-gray-600 mt-1">
              You both stepped out of your comfort zones and grew closer! 💕
            </p>
          </div>
        </CardContent>
      </Card>

      {!showBonusDare ? (
        <Card className="backdrop-blur-sm bg-gradient-to-br from-pink-100/80 to-purple-100/80 border-pink-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
              <Sparkles className="w-6 h-6 mr-2 text-pink-500 animate-spin" />
              Bonus Time!
            </CardTitle>
            <CardDescription className="text-lg">
              Ready for one final romantic challenge? 💖
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setShowBonusDare(true)}
              className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Give Us The Bonus Dare! ✨
            </Button>
            
            <Button
              onClick={restartGame}
              variant="outline"
              className="w-full h-12 border-pink-300 text-pink-600 hover:bg-pink-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Play Again Instead 🔄
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="backdrop-blur-sm bg-gradient-to-br from-pink-100/80 to-purple-100/80 border-pink-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
              <Heart className="w-6 h-6 mr-2 text-pink-500 animate-pulse" />
              Your Bonus Dare
            </CardTitle>
            <CardDescription className="text-lg">
              The perfect way to end your romantic game night! 💕
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-pink-200 to-purple-200 rounded-lg border-2 border-pink-300">
              <p className="text-lg font-medium text-purple-800 leading-relaxed">
                {randomBonusDare}
              </p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={restartGame}
                className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Play Another Round! 💫
              </Button>
              
              <p className="text-center text-gray-600">
                Thank you for playing Truth or Dare: Love Edition! 💞<br />
                <span className="text-sm">May your love continue to grow stronger every day! ✨</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GameEnd;
