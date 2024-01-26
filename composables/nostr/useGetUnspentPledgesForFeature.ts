import { type NDKEvent } from "@nostr-dev-kit/ndk";
import { type Token } from "@cashu/cashu-ts";
import { useNdk } from "./ndk";
import { PledgeKind } from "./kinds";
import { getEventCoordinate } from "../helpers/event";
import { getTokenFromEvent } from "../helpers/pledge";
import { filterValidTokens } from "../cashu/wallet";

export async function useGetUnspentPledgesForFeature(feature: NDKEvent) {
  const { ndk } = useNdk();

  const pledges = await ndk.fetchEvents([
    { kinds: [PledgeKind], "#a": [getEventCoordinate(feature)] },
  ]);

  const pledgesByToken = new Map<Token, NDKEvent>();
  for (const pledge of pledges) {
    const token = getTokenFromEvent(pledge);
    if (!token) continue;
    pledgesByToken.set(token, pledge);
  }

  const valid = await filterValidTokens(Array.from(pledgesByToken.keys()));

  return valid.map((t) => pledgesByToken.get(t)!);
}
