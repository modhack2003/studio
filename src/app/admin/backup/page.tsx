import { CryptoPuzzle } from '@/components/crypto-puzzle';
import { ShadowShell, shadowMetadata } from '@/components/shadow-shell';
export const metadata = shadowMetadata;
export default function Page() {
  return <ShadowShell label="Recovery terminal"><CryptoPuzzle track="archive" /></ShadowShell>;
}
