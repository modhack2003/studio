import { DecoyLogin } from '@/components/decoy-login';
import { ShadowShell, shadowMetadata } from '@/components/shadow-shell';
export const metadata = shadowMetadata;
export default function Page() {
  return <ShadowShell label="Restricted access"><DecoyLogin title="Hosting control" code="HST-04" /></ShadowShell>;
}
