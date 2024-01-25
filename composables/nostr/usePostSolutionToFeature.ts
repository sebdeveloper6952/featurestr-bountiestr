import { NDKEvent } from "@nostr-dev-kit/ndk";
import { useNdk } from "~/composables/nostr/ndk";
import { SolutionKind } from "./kinds";
import { getEventCoordinate } from "../helpers/event";

export const usePostSolutionToFeature = async (
  featureEvent: NDKEvent,
  content: string,
) => {
  const { ndk } = useNdk();
  if (ndk === null) return;

  const e = new NDKEvent(ndk);
  e.kind = SolutionKind;
  e.content = content;

  const dTag = featureEvent.tags.find((t) => t[0] === "d")?.[1];
  if (!dTag) {
    throw new Error("d tag is required");
  }

  e.tags = [
    ["a", getEventCoordinate(featureEvent)],
    ["p", featureEvent.id],
  ];

  await e.publish();
};
