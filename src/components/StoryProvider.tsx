'use client';
import { createContext, useContext, useMemo } from 'react';
import type { StoryConfig } from '@/config/ourStory';
import { DEFAULT_TIME_ZONE, isValidTimeZone } from '@/lib/time';
const StoryContext = createContext<StoryConfig | null>(null);
export function StoryProvider({
  story,
  children,
}: {
  story: StoryConfig;
  children: React.ReactNode;
}) {
  const safeStory = useMemo(
    () => ({
      ...story,
      timezone: isValidTimeZone(story.timezone) ? story.timezone : DEFAULT_TIME_ZONE,
    }),
    [story],
  );
  return <StoryContext.Provider value={safeStory}>{children}</StoryContext.Provider>;
}
export function useStory(): StoryConfig {
  const story = useContext(StoryContext);
  if (!story) throw new Error('StoryProvider is required');
  return story;
}
