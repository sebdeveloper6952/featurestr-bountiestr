import { NDKEvent } from "@nostr-dev-kit/ndk";

export const useFeatureEvent = (event: NDKEvent) => {
  const title = event.tags.find((t) => t[0] === "title")?.[1];
  const hashtags = event.tags.filter((t) => t[0] === "t").map((t) => t[1]);

  const ndkDTag = event.tags.find((t) => t[0] === "d");
  let dTag = "";
  if (ndkDTag) {
    dTag = ndkDTag[1];
  }

  return { title, hashtags, description: event.content, dTag };
};
