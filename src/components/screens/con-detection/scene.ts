/**
 * con-Detection scene — design §7.5. The screen is an illustration of the
 * detection loop; the notebook runs the real model. No confidence figures are
 * shown because none are documented (R4.27).
 */
export const PIPELINE = ["video", "frame", "YOLOv5", "boxes"] as const;

export const FIRST_FRAME = 400;
export const FRAME_COUNT = 24;
export const FRAME_MS = 400;

export const CAPTION = "Illustration of the detection loop; the notebook runs the real model.";

export interface Cone {
  /** Where the cone sits across the road, -1 (left verge) to 1 (right verge). */
  lane: number;
  /** Depth at frame 0; larger is nearer. Cones scale up as the frames advance. */
  depth: number;
  speed: number;
}

export const CONES: Cone[] = [
  { lane: -0.55, depth: 0.18, speed: 0.026 },
  { lane: 0.12, depth: 0.42, speed: 0.021 },
  { lane: 0.62, depth: 0.06, speed: 0.03 },
];
