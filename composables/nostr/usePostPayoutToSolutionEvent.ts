import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import { FeatureRequestKind, PayoutKind } from "./kinds";
import { getEventCoordinate } from "../helpers/event";
import { Token, getEncodedToken } from "@cashu/cashu-ts";
import { getTokensTotal } from "../helpers/cashu";

export const usePostPayoutToSolutionEvent = async (
  solutionEvent: NDKEvent,
  content: string,
  token: Token,
) => {
  const { ndk } = useNdk();
  if (ndk === null) return;

  const e = new NDKEvent(ndk);
  e.kind = PayoutKind;
  e.content = content;

  const encodedToken = getEncodedToken(token);
  console.log(encodedToken);

  const total = getTokensTotal([token]).toString();

  const aTag = solutionEvent.tags.find(
    (t) => t[0] === "a" && t[1].startsWith(FeatureRequestKind.toString()),
  );
  if (aTag) {
    e.tags.push(aTag);
    const [k, pk, d] = aTag[1].split(":");
    e.tags.push(["p", pk]);
  }

  e.tags.push(
    ["p", solutionEvent.author.pubkey, "", "payee"],
    ["a", getEventCoordinate(solutionEvent)],
    ["e", solutionEvent.id],
    ["cashu", encodedToken],
    ["amount", total],
  );

  console.log(e);

  await e.publish();
};
