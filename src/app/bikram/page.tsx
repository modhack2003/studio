import { AdminShell } from '@/components/admin/admin-shell';
import { getCurrentAdminSession } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Restricted',
  robots: { index: false, follow: false },
};

/** Real admin console. The session is checked on the server, so a reload keeps you signed in. */
export default async function BikramPage() {
  const session = await getCurrentAdminSession();
  return <AdminShell initialAuthenticated={!!session} />;
}
