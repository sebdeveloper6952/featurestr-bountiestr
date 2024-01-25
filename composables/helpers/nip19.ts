import { getPublicKey, nip19 } from "nostr-tools";

export function isHexKey(key?: string) {
  if (key?.toLowerCase()?.match(/^[0-9a-f]{64}$/)) return true;
  return false;
}

export function safeDecode(str: string) {
  try {
    return nip19.decode(str);
  } catch (e) {}
}

export function getPubkeyFromDecodeResult(result?: nip19.DecodeResult) {
  if (!result) return;
  switch (result.type) {
    case "naddr":
    case "nprofile":
      return result.data.pubkey;
    case "npub":
      return result.data;
    case "nsec":
      return getPublicKey(result.data);
  }
}
export function getEventIdFromDecodeResult(result?: nip19.DecodeResult) {
  if (!result) return;
  switch (result.type) {
    case "note":
      return result.data;
    case "nevent":
      return result.data.id;
  }
}

export function normalizeToHexPubkey(hex: string) {
  if (isHexKey(hex)) return hex;
  const decode = safeDecode(hex);
  if (!decode) return null;
  return getPubkeyFromDecodeResult(decode) ?? null;
}
