
import { useState } from 'react';
import GameStart from '@/components/GameStart';
import GamePlay from '@/components/GamePlay';
import GameEnd from '@/components/GameEnd';

export interface Player {
  name: string;
  questionsAsked: number;
  skippedExplanations: number;
  isCurrentPlayer: boolean;
}

export interface GameState {
  phase: 'start' | 'playing' | 'end';
  players: Player[];
  currentRound: number;
  totalRounds: number;
  waitingFor: 'question' | 'answer' | 'explanation' | 'dare';
  currentQuestion: string;
  currentAnswer: string;
  dareCount: number;
}

const Index = () => {
  const [gameState, setGameState] = useState<GameState>({
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-rose-100">
      <div className="container mx-auto px-4 py-8">
        {gameState.phase === 'start' && (
          <GameStart gameState={gameState} setGameState={setGameState} />
        )}
        {gameState.phase === 'playing' && (
          <GamePlay gameState={gameState} setGameState={setGameState} />
        )}
        {gameState.phase === 'end' && (
          <GameEnd gameState={gameState} setGameState={setGameState} />
        )}
      </div>
    </div>
  );
};

export default Index;
