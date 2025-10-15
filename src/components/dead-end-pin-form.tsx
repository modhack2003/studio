'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Lock, AlertTriangle } from 'lucide-react';
import PixelCard from './pixel-card';

interface DeadEndPinFormProps {
  onSuccess: () => void;
}

export function DeadEndPinForm({ onSuccess: _onSuccess }: DeadEndPinFormProps) {
  const { toast } = useToast();
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Always fail - this is a dead end
    setTimeout(() => {
      toast({ 
        title: 'Access Denied', 
        description: 'Invalid credentials. Please try again.', 
        variant: 'destructive' 
      });
      setPin('');
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <PixelCard className="w-full max-w-md mx-auto">
      <div className="bg-transparent p-6 rounded-sm">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-code text-glow">Admin Access</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your PIN to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="pin" className="text-sm font-medium">
                PIN
              </label>
              <Input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN..."
                className="font-mono text-center text-lg"
                disabled={isSubmitting}
                maxLength={10}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isSubmitting || pin.length === 0}
            >
              {isSubmitting ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
          </form>
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <div className="flex items-center gap-2 text-yellow-500 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>This is a restricted area. Unauthorized access is prohibited.</span>
            </div>
          </div>
        </CardContent>
      </div>
    </PixelCard>
  );
}
