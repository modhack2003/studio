'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, Terminal, Key, Shield } from 'lucide-react';
import PixelCard from './pixel-card';

interface CryptoPuzzleProps {
  onSuccess: () => void;
}

export function CryptoPuzzle({ onSuccess }: CryptoPuzzleProps) {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userInput, setUserInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Puzzle metadata only — solutions stay server-side
  const puzzles = [
    {
      title: "Level 1: ROT13 Cipher",
      description: "Decode this ROT13 encrypted message:",
      cipher: "nqzva",
      hint: "ROT13 shifts each letter by 13 positions in the alphabet",
    },
    {
      title: "Level 2: Base64 Decode",
      description: "Decode this Base64 string:",
      cipher: "YWRtaW4=",
      hint: "Base64 is a binary-to-text encoding scheme",
    },
    {
      title: "Level 3: Hex Decode",
      description: "Decode this hexadecimal string:",
      cipher: "61646d696e",
      hint: "Each pair of hex digits represents one ASCII character",
    },
    {
      title: "Level 4: Caesar Cipher",
      description: "Decode this Caesar cipher (shift by 3):",
      cipher: "dplq",
      hint: "Each letter is shifted 3 positions forward in the alphabet",
    },
    {
      title: "Level 5: Binary Decode",
      description: "Decode this binary string:",
      cipher: "01100001 01100100 01101101 01101001 01101110",
      hint: "Each 8-bit binary number represents one ASCII character",
    }
  ];

  const currentPuzzle = puzzles[currentLevel - 1];

  const checkAnswer = async () => {
    if (isChecking || !userInput.trim()) return;
    
    setIsChecking(true);
    setAttempts(attempts + 1);

    try {
      const response = await fetch('/api/ctf/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: currentLevel, answer: userInput }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: result.error || "Something went wrong",
          variant: "destructive",
        });
        return;
      }

      if (result.correct) {
        if (result.isLastLevel) {
          toast({
            title: "🎉 Puzzle Complete!",
            description: "All levels solved! Access granted.",
          });
          onSuccess();
        } else {
          setCurrentLevel(currentLevel + 1);
          setUserInput('');
          setAttempts(0);
          setShowHint(false);
          toast({
            title: "Correct!",
            description: `Level ${currentLevel} completed. Moving to level ${currentLevel + 1}...`,
          });
        }
      } else {
        toast({
          title: "Incorrect",
          description: `Wrong answer. Attempts: ${attempts + 1}`,
          variant: "destructive",
        });
        
        if (attempts >= 2) {
          setShowHint(true);
        }
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not verify answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  return (
    <PixelCard className="w-full max-w-2xl">
      <div className="bg-transparent p-6 rounded-sm">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline text-primary">
            🔐 Cryptographic Challenge
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Prove your hacking skills by solving these cryptographic puzzles
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{currentLevel} / {puzzles.length}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentLevel / puzzles.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Puzzle */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-code text-primary">{currentPuzzle.title}</h3>
            </div>
            
            <p className="text-muted-foreground">{currentPuzzle.description}</p>
            
            <div className="bg-muted/50 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-primary" />
                <span className="text-sm font-code text-primary">Ciphertext:</span>
              </div>
              <code className="text-lg font-mono break-all">{currentPuzzle.cipher}</code>
            </div>

            {/* Hint */}
            {showHint && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-semibold text-yellow-600">Hint:</span>
                </div>
                <p className="text-sm text-yellow-700">{currentPuzzle.hint}</p>
              </div>
            )}

            {/* Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Answer:</label>
              <div className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter decoded text..."
                  className="font-mono"
                  disabled={isChecking}
                />
                <Button onClick={checkAnswer} disabled={!userInput.trim() || isChecking}>
                  <Lock className="h-4 w-4 mr-2" />
                  {isChecking ? 'Checking...' : 'Submit'}
                </Button>
              </div>
            </div>

            {/* Hint Toggle */}
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHint(!showHint)}
                className="text-muted-foreground"
              >
                {showHint ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Attempts: {attempts}
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-muted/30 p-4 rounded-lg border border-primary/10">
            <h4 className="font-semibold text-sm mb-2">💡 Instructions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Solve each cryptographic puzzle in order</li>
              <li>• Enter the decoded plaintext (lowercase)</li>
              <li>• Use hints if you get stuck (after 3 attempts)</li>
              <li>• Complete all levels to gain admin access</li>
            </ul>
          </div>
        </CardContent>
      </div>
    </PixelCard>
  );
}
