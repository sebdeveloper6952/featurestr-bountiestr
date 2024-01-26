import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "./ndk";
import { SolutionKind } from "./kinds";
import { getEventCoordinate } from "../helpers/event";

export async function useGetSolutionsForFeature(feature: NDKEvent) {
  const { ndk } = useNdk();

  return await ndk.fetchEvents([
    { kinds: [SolutionKind], "#a": [getEventCoordinate(feature)] },
  ]);
}
