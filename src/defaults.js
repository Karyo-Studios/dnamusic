import { Playhead } from "./playhead";

export const p1 = new Playhead({
  playing: true,
  pattern: [0, 2 / 8, 3 / 8, 5 / 8, 6 / 8],
  interval: 4,
  offset: 0,
  legato: 0.5,
  instrument: 92,
  // instrument: 96,
  color: "#0000ff",
});

export const p2 = new Playhead({
  playing: true,
  interval: 2,
  pattern: [0, 0.5, 0.75],
  offset: 12,
  instrument: 66,
  legato: 0.5,
  color: "#ed1c51",
});

export const p3 = new Playhead({
  playing: true,
  pattern: [0, 3 / 8, 6 / 8], // 1(3,8)
  interval: 4,
  instrument: 92,
  offset: -12,
  legato: 0.6,
  color: "#ffa333",
});

export const p4 = new Playhead({
  playing: false,
  pattern: [0],
  interval: 8,
  offset: -24,
  instrument: 80,
  legato: 1,
  color: "#33ff74",
});

export const p5 = new Playhead({
  playing: false,
  pattern: [0, 0.75],
  interval: 4,
  offset: 0,
  legato: 0.5,
  instrument: 92,
  // instrument: 96,
  color: "#ff00ff",
});