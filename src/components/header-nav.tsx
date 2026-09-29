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
  hidden = [],
  solid = false,
}: {
  personalData: Pick<PersonalData, 'name'> | null;
  hidden?: string[];
  solid?: boolean;
}) {
  return <MainNav name={personalData?.name || undefined} hidden={hidden} solid={solid} />;
}
