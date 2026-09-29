'use client';

import { MainNav } from '@/components/main-nav';

interface PersonalData {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
}

export function HeaderNav({ personalData }: { personalData: PersonalData | null }) {
  return <MainNav name={personalData?.name || undefined} />;
}
