import { ref } from "vue";
import { useNdk } from "./ndk";
import { NDKUser, NDKUserProfile } from "@nostr-dev-kit/ndk";

const profiles = ref(new Map<string, NDKUserProfile | null>());

export const useProfiles = () => {
  const getProfile = async (user: NDKUser) => {
    if (profiles.value.has(user.pubkey)) {
      return;
    }

    const profile = await user.fetchProfile();
    if (profile != null) {
      profiles.value.set(user.pubkey, profile);
    }
  };

  return {
    profiles,
    getProfile,
  };
};
