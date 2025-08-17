'use client';

import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface DecryptedTextProps {
  text: string;
  className?: string;
  as?: React.ElementType;
}

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  className,
  as: Component = 'span',
}) => {
  const [displayText, setDisplayText] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let iteration = 0;
    
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
        setDisplayText(
            text
            .split('')
            .map((_letter, index) => {
                if (index < iteration) {
                    return text[index];
                }
                return CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
            })
            .join('')
        );

      if (iteration >= text.length) {
        if(intervalRef.current) clearInterval(intervalRef.current);
      }

      iteration += 1 / 3;
    }, 40);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [text]);

  return (
    <Component
      className={cn('font-code text-primary', className)}
    >
      {displayText}
    </Component>
  );
};
