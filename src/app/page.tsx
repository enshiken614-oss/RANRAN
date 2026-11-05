import { hasAccess, isDemoMode } from '@/lib/auth';
import { AccessGate } from '@/components/AccessGate';
import { Universe } from '@/components/Universe';
import { StoryProvider } from '@/components/StoryProvider';
import { ourStory } from '@/config/ourStory';

export const dynamic = 'force-dynamic';
export default async function Home() {
  if (!(await hasAccess())) return <AccessGate />;
  return (
    <StoryProvider story={ourStory}>
      <Universe demo={isDemoMode()} />
    </StoryProvider>
  );
}
