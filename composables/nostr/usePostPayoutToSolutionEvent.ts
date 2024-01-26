import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import { PayoutKind } from "./kinds";
import { getEventCoordinate } from "../helpers/event";

export const usePostSolutionToFeature = async (
  solutionEvent: NDKEvent,
  content: string,
  cashuToken: string,
  amountSats: string,
) => {
  const { ndk } = useNdk();
  if (ndk === null) return;

  const e = new NDKEvent(ndk);
  e.kind = PayoutKind;
  e.content = content;

  e.tags = [
    ["p", solutionEvent.author.pubkey],
    ["e", solutionEvent.id],
    ["cashu", cashuToken],
    ["amount", amountSats],
  ];

  await e.publish();
};
