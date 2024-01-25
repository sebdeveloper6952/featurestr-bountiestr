import { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import { nip19 } from "nostr-tools";

export const useFeatureEvent = (event: NDKEvent) => {
  const nevent = nip19.neventEncode({
    id: event.id,
    author: event.pubkey,
  });
  const title = event.tags.find((t) => t[0] === "title")?.[1];
  const hashtags = event.tags.filter((t) => t[0] === "t").map((t) => t[1]);

  return { title, hashtags, description: event.content };
};
