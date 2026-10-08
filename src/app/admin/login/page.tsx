import { DecoyLogin } from '@/components/decoy-login';
import { ShadowShell, shadowMetadata } from '@/components/shadow-shell';
export const metadata = shadowMetadata;
export default function Page() {
  return <ShadowShell label="Restricted access"><DecoyLogin title="Operator sign-in" code="OPS-05" /></ShadowShell>;
}
