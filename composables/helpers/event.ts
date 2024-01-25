import { NDKEvent } from "@nostr-dev-kit/ndk";

export function getEventCoordinate(event: NDKEvent) {
  const d = event.tags.find((t) => t[0] === "d")?.[1];
  if (!d) throw new Error("event missing d tag");
  return `${event.kind}:${event.author.pubkey}:${d}`;
}

export function sortEventsByDate(events: Iterable<NDKEvent>) {
  return Array.from(events).sort((a, b) => b.created_at! - a.created_at!);
}
