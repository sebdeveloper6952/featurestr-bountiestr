import { NDKEvent, NDKTag } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";

export const useCreatePledge = async (
  title: string,
  description: string,
  additionalTags: string[]
) => {
  const { ndk } = useNdk();
  if (ndk === null) return;

  const e = new NDKEvent(ndk);
  e.kind = 37300;
  e.content = description;

  const tags = [["title", title]];
  additionalTags.forEach((t) => tags.push(["t", t]));
  e.tags = tags;

  await e.publish();
};
