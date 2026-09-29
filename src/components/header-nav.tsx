'use client';

import { MainNav } from '@/components/main-nav';

interface PersonalData {
  name: string;
  email: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
}

export function HeaderNav({
  personalData,
  hasExperience = false,
  solid = false,
}: {
  personalData: Pick<PersonalData, 'name'> | null;
  hasExperience?: boolean;
  solid?: boolean;
}) {
  return <MainNav name={personalData?.name || undefined} hasExperience={hasExperience} solid={solid} />;
}
