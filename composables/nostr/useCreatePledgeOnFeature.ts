import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";

export const useCreatePledgeOnFeature = async (
  featureEvent: NDKEvent,
  content: string,
  cashuToken: string,
  amountSats: number,
  trustee: string,
) => {
  const { ndk } = useNdk();
  if (ndk === null) return;

  const event = new NDKEvent(ndk);
  event.kind = 73002;
  event.content = content;

  const dTag = featureEvent.tags.find((t) => t[0] === "d")?.[1];
  if (!dTag) {
    throw new Error("d tag is required");
  }

  event.tags = [
    ["a", `${featureEvent.kind}:${featureEvent.author.pubkey}:${dTag}`],
    ["e", featureEvent.id],
    ["p", featureEvent.author.pubkey],
    ["cashu", cashuToken],
    ["amount", amountSats.toString()],
  ];

  if (trustee !== ndk.activeUser?.pubkey) {
    event.tags.push(["p", trustee, "", "trustee"]);
  }

  await event.publish();
};
