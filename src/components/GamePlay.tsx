
import { useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GameState } from '@/pages/Index';
import TimerComponent from '@/components/TimerComponent';
import DareComponent from '@/components/DareComponent';

interface GamePlayProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
}

const GamePlay = ({ gameState, setGameState }: GamePlayProps) => {
  const [currentInput, setCurrentInput] = useState('');
  const [showTimer, setShowTimer] = useState(false);
  const [showDare, setShowDare] = useState(false);

  const currentPlayer = gameState.players.find(p => p.isCurrentPlayer);
  const otherPlayer = gameState.players.find(p => !p.isCurrentPlayer);

  const handleQuestionSubmit = () => {
    if (!currentInput.trim()) return;
    
    const newState = { ...gameState };
    newState.currentQuestion = currentInput;
    newState.waitingFor = 'answer';
    setGameState(newState);
    setCurrentInput('');
  };

  const handleAnswerSubmit = () => {
    const answer = currentInput.toUpperCase();
    if (answer !== 'YES' && answer !== 'NO') {
      alert("Oops! Just YES or NO, lovebirds 💕");
      return;
    }
    
    const newState = { ...gameState };
    newState.currentAnswer = answer;
    newState.waitingFor = 'explanation';
    setGameState(newState);
    setCurrentInput('');
    setShowTimer(true);
  };

  const handleTimerComplete = (skipped: boolean) => {
    setShowTimer(false);
    const newState = { ...gameState };
    
    if (skipped) {
      const currentPlayerIndex = gameState.players.findIndex(p => p.isCurrentPlayer);
      newState.players[currentPlayerIndex].skippedExplanations++;
    }
    
    const currentPlayerIndex = gameState.players.findIndex(p => p.isCurrentPlayer);
    newState.players[currentPlayerIndex].questionsAsked++;
    
    // Check if dare is needed (after 5 questions or based on skipped explanations)
    const questionsAsked = newState.players[currentPlayerIndex].questionsAsked;
    const skippedCount = newState.players[currentPlayerIndex].skippedExplanations;
    
    if (questionsAsked >= 5 || skippedCount >= 2) {
      setShowDare(true);
      newState.dareCount++;
      newState.players[currentPlayerIndex].questionsAsked = 0;
      newState.players[currentPlayerIndex].skippedExplanations = 0;
    } else {
      // Switch players
      newState.players.forEach(p => p.isCurrentPlayer = !p.isCurrentPlayer);
      newState.waitingFor = 'question';
      newState.currentQuestion = '';
      newState.currentAnswer = '';
    }
    
    setGameState(newState);
  };

  const handleDareComplete = () => {
    setShowDare(false);
    const newState = { ...gameState };
    
    // Check if game should end
    if (newState.dareCount >= 4) {
      newState.phase = 'end';
    } else {
      // Switch players
      newState.players.forEach(p => p.isCurrentPlayer = !p.isCurrentPlayer);
      newState.waitingFor = 'question';
      newState.currentQuestion = '';
      newState.currentAnswer = '';
    }
    
    setGameState(newState);
  };

  if (showDare) {
    return <DareComponent onComplete={handleDareComplete} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Truth or Dare: Love Edition 💞
        </h1>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
          <span>Round: {gameState.currentRound}</span>
          <span>•</span>
          <span>Dares Given: {gameState.dareCount}</span>
        </div>
      </div>

      <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-purple-700">
            <Heart className="w-5 h-5 mr-2 text-pink-500" />
            {currentPlayer?.name}'s Turn
          </CardTitle>
          <CardDescription>
            Questions asked: {currentPlayer?.questionsAsked || 0}/5 • 
            Skipped explanations: {currentPlayer?.skippedExplanations || 0}
          </CardDescription>
        </CardHeader>
      </Card>

      {gameState.waitingFor === 'question' && (
        <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center text-lg text-purple-700">
              <MessageCircle className="w-5 h-5 mr-2" />
              {currentPlayer?.name}, please ask your question:
            </CardTitle>
            <CardDescription>
              Ask {otherPlayer?.name} anything you want to know! 💕
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="What would you like to ask your partner? 💭"
              className="min-h-[80px] border-pink-200 focus:border-pink-400"
            />
            <Button 
              onClick={handleQuestionSubmit}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              disabled={!currentInput.trim()}
            >
              Ask Question 💫
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState.waitingFor === 'answer' && (
        <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-purple-700">
              {otherPlayer?.name}, {currentPlayer?.name} asked:
            </CardTitle>
            <CardDescription className="text-base font-medium text-gray-700">
              "{gameState.currentQuestion}"
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-lg font-semibold text-purple-600">
              Your answer? (YES/NO only) 💬
            </p>
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="YES or NO"
              className="text-center text-lg font-semibold border-pink-200 focus:border-pink-400"
              onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
            />
            <Button 
              onClick={handleAnswerSubmit}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={!currentInput.trim()}
            >
              Submit Answer ✨
            </Button>
          </CardContent>
        </Card>
      )}

      {gameState.waitingFor === 'explanation' && showTimer && (
        <Card className="backdrop-blur-sm bg-white/80 border-pink-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg text-purple-700">
              {otherPlayer?.name} answered: {gameState.currentAnswer}
            </CardTitle>
            <CardDescription className="text-base">
              To the question: "{gameState.currentQuestion}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-lg font-semibold text-purple-600 mb-4">
                You now have 1 minute to explain why 💬⏳
              </p>
              <TimerComponent onComplete={handleTimerComplete} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamePlay;
