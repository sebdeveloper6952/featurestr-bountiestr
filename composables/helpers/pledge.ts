import { type NDKEvent, type NDKUser } from "@nostr-dev-kit/ndk";
import { getDecodedToken } from "@cashu/cashu-ts";

export function getTokenFromPeldge(pledge: NDKEvent) {
  const cashu = pledge.tags.find((t) => t[0] === "cashu")?.[1];
  if (!cashu) return null;
  return getDecodedToken(cashu);
}

export function getUsersFromPledges(pledges: Iterable<NDKEvent>) {
  const users = new Map<string, NDKUser>();
  for (const pledge of pledges) {
    if (!users.has(pledge.author.pubkey)) {
      users.set(pledge.author.pubkey, pledge.author);
    }
  }
  return Array.from(users.values());
}
