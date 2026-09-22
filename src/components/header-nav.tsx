'use client';

import { PersonalIcon } from '@/components/personal-icon';
import { MainNav } from '@/components/main-nav';
import { SiteFooter } from '@/components/site-footer';

interface PersonalData {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
}

export function HeaderNav({ personalData }: { personalData: PersonalData | null }) {
  return (
    <>
      <MainNav />
      <SiteFooter personalData={personalData} />
    </>
  );
}
