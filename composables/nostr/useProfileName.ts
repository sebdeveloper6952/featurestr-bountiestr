import { type NDKUserProfile } from "@nostr-dev-kit/ndk";

export const useGetProfileName = (
  profile: NDKUserProfile | undefined | null,
  fallback: string
): string => {
  if (profile === undefined || profile === null) return fallback;
  return profile.name !== undefined
    ? profile.name
    : profile.displayName !== undefined
    ? profile.displayName
    : fallback;
};
