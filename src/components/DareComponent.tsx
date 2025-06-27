
import { useState, useEffect } from 'react';
import { Zap, Heart, Music, MessageHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DareComponentProps {
  onComplete: () => void;
}

const DareComponent = ({ onComplete }: DareComponentProps) => {
  const [currentDare, setCurrentDare] = useState('');

  const dares = [
    {
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      text: "Look into each other's eyes for 30 seconds and say what you see 👀💕",
      category: "romantic"
    },
    {
      icon: <MessageHeart className="w-6 h-6 text-purple-500" />,
      text: "Tell your partner your favorite memory with them in exactly 3 sentences 💭✨",
      category: "emotional"
    },
    {
      icon: <Music className="w-6 h-6 text-pink-500" />,
      text: "Sing 15 seconds of your favorite love song together (or hum if shy!) 🎵💞",
      category: "cute"
    },
    {
      icon: <Heart className="w-6 h-6 text-rose-500" />,
      text: "Describe your partner using only food comparisons for 1 minute 🍯🍓",
      category: "fun"
    },
    {
      icon: <MessageHeart className="w-6 h-6 text-purple-500" />,
      text: "Whisper the moment you knew you had feelings for each other 💕👂",
      category: "intimate"
    },
    {
      icon: <Zap className="w-6 h-6 text-pink-500" />,
      text: "Give each other a compliment you've never said before 🌟💫",
      category: "sweet"
    },
    {
      icon: <Heart className="w-6 h-6 text-red-500" />,
      text: "Share your biggest crush moment about your partner (when did they make your heart skip?) 💓",
      category: "flirty"
    },
    {
      icon: <Music className="w-6 h-6 text-purple-500" />,
      text: "Create a couple's handshake or dance move together right now! 💃🕺",
      category: "playful"
    }
  ];

  useEffect(() => {
    const randomDare = dares[Math.floor(Math.random() * dares.length)];
    setCurrentDare(randomDare.text);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Dare Time! 🔥
        </h1>
        <p className="text-gray-600">Time for some romantic fun! 💕</p>
      </div>

      <Card className="backdrop-blur-sm bg-gradient-to-br from-pink-50/80 to-purple-50/80 border-pink-200 shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center text-2xl text-purple-700">
            <Zap className="w-7 h-7 mr-2 text-pink-500 animate-pulse" />
            Your Romantic Dare
          </CardTitle>
          <CardDescription className="text-lg">
            Complete this together and strengthen your bond! 💞
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-gradient-to-r from-pink-100 to-purple-100 rounded-lg border-2 border-pink-200">
            <p className="text-lg font-medium text-purple-800 leading-relaxed">
              {currentDare}
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={onComplete}
              className="w-full h-14 text-lg bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transform hover:scale-105 transition-all duration-200"
            >
              <Heart className="w-5 h-5 mr-2" />
              Dare Completed! Continue Game 💫
            </Button>
            
            <p className="text-sm text-gray-500 text-center">
              Take your time and enjoy this moment together! There's no rush 💕
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DareComponent;
