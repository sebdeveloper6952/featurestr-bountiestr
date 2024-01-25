import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";

export const useCreatePledgeOnFeature = async (
  featureEvent: NDKEvent,
  content: string,
  cashuToken: string,
  amountSats: number,
) => {
  const { ndk } = useNdk();
  if (ndk === null) return;

  const e = new NDKEvent(ndk);
  e.kind = 73002;
  e.content = content;

  const dTag = featureEvent.tags.find((t) => t[0] === "d")?.[1];
  if (!dTag) {
    throw new Error("d tag is required");
  }

  e.tags = [
    ["a", `${featureEvent.kind}:${featureEvent.author.pubkey}:${dTag}`],
    ["p", featureEvent.id],
    ["cashu", cashuToken],
    ["amount", amountSats.toString()],
  ];

  await e.publish();
};
