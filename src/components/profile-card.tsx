'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';
import { DecryptedText } from './decrypted-text';

interface ProfileCardProps {
    name: string;
    title: string;
    bio: string;
    avatarUrl: string;
    githubUrl: string;
    linkedinUrl: string;
}

export function ProfileCard({ name, title, bio, avatarUrl, githubUrl, linkedinUrl }: ProfileCardProps) {
    return (
        <Card className="bg-card/50 border-primary/20 backdrop-blur-sm overflow-hidden">
            <div className="h-24 bg-primary/10" />
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center -mt-16">
                    <Avatar className="w-24 h-24 border-4 border-background">
                        <AvatarImage src={avatarUrl} alt={name} />
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="md:ml-6 mt-4 md:mt-16 text-center md:text-left w-full">
                        <h2 className="text-2xl font-bold text-glow">
                           <DecryptedText text={name} />
                        </h2>
                        <p className="text-primary font-code">{title}</p>
                        <div className="flex justify-center md:justify-start gap-2 mt-2">
                            <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                <Link href={githubUrl} target="_blank"><Github /></Link>
                            </Button>
                             <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                                <Link href={linkedinUrl} target="_blank"><Linkedin /></Link>
                            </Button>
                        </div>
                    </div>
                </div>
                 <p className="text-muted-foreground mt-4 font-body">{bio}</p>
            </CardContent>
        </Card>
    )
}
