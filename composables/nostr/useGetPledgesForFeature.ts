import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "./ndk";
import { PledgeKind } from "./kinds";
import { getEventCoordinate } from "../helpers/event";

export async function useGetPledgesForFeature(feature: NDKEvent) {
  const { ndk } = useNdk();

  return await ndk.fetchEvents([
    { kinds: [PledgeKind], "#a": [getEventCoordinate(feature)] },
  ]);
}
