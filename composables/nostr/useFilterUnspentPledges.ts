import { type NDKEvent } from "@nostr-dev-kit/ndk";
import { type Token } from "@cashu/cashu-ts";
import { getTokenFromPeldge } from "../helpers/pledge";
import { filterValidTokens } from "../cashu/wallet";

export async function useFilterUnspentPledges(pledges: Iterable<NDKEvent>) {
  const pledgesByToken = new Map<Token, NDKEvent>();
  for (const pledge of pledges) {
    const token = getTokenFromPeldge(pledge);
    if (!token) continue;
    pledgesByToken.set(token, pledge);
  }

  const valid = await filterValidTokens(Array.from(pledgesByToken.keys()));

  return valid.map((t) => pledgesByToken.get(t)!);
}
