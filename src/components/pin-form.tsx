'use client';

import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { KeyRound } from 'lucide-react';
import PixelCard from './pixel-card';

interface PinFormProps {
  onSuccess: () => void;
}

export function PinForm({ onSuccess }: PinFormProps) {
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const _correctPin = undefined as unknown as string; // no client-side pin

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (response.ok) {
        toast({ title: 'Access Granted', description: 'Welcome, Admin.' });
        onSuccess();
      } else {
        toast({ title: 'Access Denied', description: 'Incorrect PIN.', variant: 'destructive' });
        setPin('');
      }
    } catch {
      toast({ title: 'Error', description: 'Could not authenticate.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
        <PixelCard className="w-full">
            <div className="bg-transparent p-6 rounded-sm">
              <form onSubmit={handleSubmit}>
                  <CardHeader className="text-center">
                      <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                          <KeyRound className="h-8 w-8 text-primary" />
                      </div>
                      <CardTitle className="text-2xl font-headline mt-4">Admin Authentication</CardTitle>
                      <CardDescription>Enter the system access PIN.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Input
                          id="pin"
                          type="password"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          placeholder="* * * *"
                          required
                          className="text-center text-lg tracking-[0.5em]"
                          maxLength={4}
                      />
                  </CardContent>
                  <CardFooter>
                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                          {isSubmitting ? 'Authenticating...' : 'Authorize'}
                      </Button>
                  </CardFooter>
              </form>
            </div>
        </PixelCard>
    </div>
  );
}
