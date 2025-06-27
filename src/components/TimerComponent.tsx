
import { useState, useEffect } from 'react';
import { Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TimerComponentProps {
  onComplete: (skipped: boolean) => void;
}

const TimerComponent = ({ onComplete }: TimerComponentProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      onComplete(false);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onComplete]);

  const handleDone = () => {
    setIsActive(false);
    onComplete(false);
  };

  const handleSkip = () => {
    setIsActive(false);
    onComplete(true);
  };

  const progress = ((60 - timeLeft) / 60) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-2">
        <Clock className="w-6 h-6 text-purple-600" />
        <span className="text-2xl font-bold text-purple-700">
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>
      
      <Progress value={progress} className="h-3" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={handleDone}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Done Explaining! ✅
        </Button>
        <Button
          onClick={handleSkip}
          variant="outline"
          className="border-pink-300 text-pink-600 hover:bg-pink-50"
        >
          Skip (Dare Risk!) 😈
        </Button>
      </div>
      
      <p className="text-sm text-gray-500 text-center">
        Skipping explanations increases your chance of getting a dare! 🔥
      </p>
    </div>
  );
};

export default TimerComponent;
