import { type NDKEvent, type NDKUser } from "@nostr-dev-kit/ndk";
import { getDecodedToken, type Token } from "@cashu/cashu-ts";

export function getTokenFromEvent(event: NDKEvent) {
  const cashu = event.tags.find((t) => t[0] === "cashu")?.[1];
  if (!cashu) return null;
  return getDecodedToken(cashu);
}

export function getUsersFromPledges(pledges: Iterable<NDKEvent>) {
  const users = new Map<string, { user: NDKUser; tokens: Token[] }>();
  for (const pledge of pledges) {
    let existing = users.get(pledge.author.pubkey);
    if (!existing) {
      existing = { user: pledge.author, tokens: [] };
      users.set(pledge.author.pubkey, existing);
    }
    const token = getTokenFromEvent(pledge);
    if (token) existing.tokens.push(token);
  }
  return Array.from(users.values());
}
