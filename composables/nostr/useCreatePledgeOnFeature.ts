import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import { PledgeKind } from "./kinds";
import { getEventCoordinate } from "../helpers/event";

export const useCreatePledgeOnFeature = async (
  featureEvent: NDKEvent,
  content: string,
  cashuToken: string,
  amountSats: number,
  trustee: string,
) => {
  const { ndk } = useNdk();
  if (ndk === null) return;

  const e = new NDKEvent(ndk);
  e.kind = PledgeKind;
  e.content = content;

  const dTag = featureEvent.tags.find((t) => t[0] === "d")?.[1];
  if (!dTag) {
    throw new Error("d tag is required");
  }

  e.tags = [
    ["a", getEventCoordinate(featureEvent)],
    ["p", featureEvent.id],
    ["cashu", cashuToken],
    ["amount", amountSats.toString()],
  ];

  if (trustee !== ndk.activeUser?.pubkey) {
    e.tags.push(["p", trustee, "", "trustee"]);
  }

  await e.publish();
};
