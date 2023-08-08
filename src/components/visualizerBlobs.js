import React, { useState, useEffect, useMemo, useRef } from "react";

import { randRange } from "../utils";

import { aminoAcidhsls, noteMappings } from "../mappings";

export const VisualizerBlobs = ({
  playing,
  counter, // renderframes
  playheads, // main playheads
  activeNotes, // active note refs, for actual gate
  counters, // separate counts from each playhead
  countRefs, // count references
  sequence,
  nodes,
  zoom,
  width,
  height,
  param1,
  param2,
  cps,
}) => {
  // boxSide x amount =
  const fixedLength = false;
  const ANIMATION_TIME = 3.0;

  const lastCounter = useRef(counter);
  const spacingX = 16;
  const boxSide = 30 * zoom;
  const colSpace = boxSide / 5;
  const rowSpace = boxSide / 3;
  const boxAspect = 1.2; // w x h 1 : 1.4
  const perRow =
    Math.floor(
      Math.floor((width - spacingX * 2) / (boxSide + colSpace / 3)) / 3
    ) * 3;
  const rows = Math.ceil(sequence.length / perRow);
  const spacingY = height - rows * (boxSide * boxAspect + rowSpace * 1.5);

  useEffect(() => {
    lastCounter.current = playing ? counter : lastCounter.current;
  }, [counter]);

  const getCoord = (i) => {
    const col = i % perRow;
    const row = Math.floor(i / perRow);
    const offsetX = Math.floor(col / 3);
    const x = col * boxSide + offsetX * colSpace;
    const y = row * (boxSide + rowSpace);
    return {
      //   y: x%2 === 1 ? y : ((perRow - 1) * boxSide) - y ,
      y: spacingY + y * boxAspect,
      x: spacingX + x,
    };
  };

  // let lastTick = [-1, -1, -1, -1, -1];
  // let lastSpawned = [false, false, false, false, false];
  // let lastIndex = [-1, -1, -1, -1, -1];

  const [lastTick, setLastTick] = useState([-1, -1, -1, -1, -1]);
  const [lastSpawned, setLastSpawned] = useState([
    false,
    false,
    false,
    false,
    false,
  ]);
  const [lastIndex, setLastIndex] = useState([-1, -1, -1, -1, -1]);

  let blobCount = 0;

  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const timeWindow = cps * 1000;

    let updatedLastSpawn = [...lastSpawned];
    let updatedLastIndex = [...lastIndex];
    let updatedLastTick = [...lastTick];

    // check to add new blobs
    for (let i = 0; i < playheads.length; i++) {
      if (activeNotes[i].current) {
        // note is currently active
        const index = countRefs[i].current;
        const currentNode = nodes[Math.floor(index / 3)];
        if (currentNode === undefined) return;
        const note = noteMappings[currentNode.aminoacid];
        const { x, y } = getCoord(countRefs[i].current * 3);
        // check if just switched from note active to active
        if (lastIndex[i] !== index) {
          if (!updatedLastSpawn[i]) {
            blobCount += 1;
            console.log(">>> spawning ");
            startNoteAnimation(
              x + boxSide * 1.5,
              y,
              `${i}-${ticks}`,
              playheads[i].hsl,
              svg
            );
            updatedLastTick[i] = ticks;
          } else {
            if (updatedLastIndex[i] !== index) {
              console.log(
                "||-",
                blobCount,
                "despawn",
                `${i}-${updatedLastTick[i]}`
              );
              endNoteAnimation(
                `${i}-${updatedLastTick[i]}`,
                playheads[i].hsl,
                svg
              );

              console.log("||+", blobCount, "spawn", `${i}-${ticks}`);
              startNoteAnimation(
                x + boxSide * 1.5,
                y,
                `${i}-${ticks}`,
                playheads[i].hsl,
                svg
              );
              updatedLastTick[i] = ticks;
            }
          }
          updatedLastSpawn[i] = true;
          updatedLastIndex[i] = index;
        }
      } else {
        // check if note has become not active
        if (updatedLastSpawn[i]) {
          //   // check if note has just become not active
          // //   if (updatedLastTick[i] !== tick - 1) {
          blobCount -= 1;
          console.log(
            "---",
            blobCount,
            "despawn",
            `${i}-${updatedLastTick[i]}`
          );
          endNoteAnimation(`${i}-${updatedLastTick[i]}`, playheads[i].hsl, svg);
          // //   }
        }
        updatedLastSpawn[i] = false;
      }
    }

    setLastIndex(updatedLastIndex);
    setLastSpawned(updatedLastSpawn);
    setLastTick(updatedLastTick);
    setTicks(ticks + 1);
  }, [activeNotes, countRefs, playing, zoom, sequence]);

  // const animationCallbackRef = useRef(animationCallback);

  useEffect(() => {
    endAllAnimations();
    // animationCallbackRef.current = animationCallback;
  }, [zoom, sequence, cps]);

  useEffect(() => {
    if (!playing) {
      endAllAnimations();
    }
  }, [playing]);

  // main animation loop
  // useAnimationFrame(animationCallbackRef);

  var paramSet = 1;
  var params = [
    {
      x: 0.05227467811158796,
      y: 0.05744431418522861,
    },
    {
      x: 0.2618025751072961,
      y: 0.08366013071895424,
    },
    {
      x: 0.5507868383404864,
      y: 0.4856711915535445,
    },
    {
      x: 0.621173104434907,
      y: 0.53215686274509803,
    },
  ];

  var px = params[paramSet].x;
  var py = params[paramSet].y;

  var setBezierParams = () => {
    px = params[paramSet].x;
    py = params[paramSet].y;
  };

  var svg = document.querySelector(".svg");

  var generatePoints = (initialX, initialY) => {
    const num = 7;
    var scaleX = height / 88;
    var scaleY = height / num;
    var points = [];
    for (var i = 0; i < num; i++) {
      var dir = Math.random() < 0.5 ? -1 : 1;
      var offsetFactorX = randRange(0, 300) * px;
      var x = initialX + dir * 0.2 * i * offsetFactorX;
      var y = initialY - i * scaleY;
      points.push([x, y]);
    }
    points.push([initialX, -10]); // final point
    return points;
  };

  var getAnimationTimeForParam = (param) => {
    if (param === 0) {
      return "6s";
    } else if (param === 1) {
      return "7s";
    } else if (param === 2) {
      return "10s";
    } else if (param === 3) {
      return "11s";
    }
  };

  var createSVGPath = (path, animation, id, hsl) => {
    var newPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    newPath.setAttributeNS(null, "class", animation);
    newPath.setAttributeNS(null, "id", id);
    newPath.setAttributeNS(null, "d", path);
    // newPath.setAttributeNS(null, "data-velocity", velocity);

    var len = newPath.getTotalLength();
    var path_offset = len;
    var start = len;
    var initial = len;
    var segment_length = len;
    var end = len * 2;

    newPath.setAttributeNS(
      null,
      "style",
      `--h: ${hsl.h * 360};
      --s: ${hsl.s * 100}%;
      --l: ${hsl.l * 100}%;
      --stroke-width: ${50 * zoom};
        --offset: ${path_offset};
        --start: ${start};
        --end: ${end};
        --initial: ${initial};
        --timeout: ${getAnimationTimeForParam(paramSet)};
        --segment_length: ${segment_length}`
    );

    return newPath;
  };

  var startNoteAnimation = (x, y, id, hsl, svg) => {
    var steps = width / 65;
    // where do the notes appear?
    var points = generatePoints(x, y);
    var d = svgPath(points, bezierCommand);
    var path = createSVGPath(d, "animating", id, hsl);
    if (svg) {
      svg.appendChild(path);
    }
  };

  var endAllAnimations = () => {
    const animating = [...document.querySelectorAll(".animating")];
    let allPaths = animating.length;
    let removedCount = 0;
    if (animating.length) {
      svg = document.querySelector(".svg");
      animating.forEach((path) => {
        var i = path.id.split("-")[0];
        const playhead = playheads[i];
        // console.log(playhead)
        if (playhead) {
          endNoteAnimation(path.id, playhead.hsl, svg);
        } else {
          svg.removeChild(path);
        }
      });
    }

    const remaining = [...document.querySelectorAll(".animating")];
    remaining.forEach((path) => {
      svg.removeChild(path);
    });
  };

  var endNoteAnimation = (id, hsl, svg) => {
    var path = document.getElementById(id);
    if (!path) {
      // TODO: do this in a cleaner way
      return;
    }
    if (path.classList.contains("animatingEnd")) {
      return;
    }
    var matrix = getComputedStyle(path).getPropertyValue("stroke-dasharray");
    var dashArrayStart = parseFloat(matrix.split("px")[0], 10);

    var len = path.getTotalLength();
    var path_offset = len * 2;
    var start = len;
    var initial = len;
    var segment_length = dashArrayStart - len;
    var end = len + len + segment_length;

    path.setAttributeNS(
      null,
      "style",
      `--h: ${hsl.h * 360};
      --s: ${hsl.s * 100}%;
      --l: ${hsl.l * 100}%;
      --stroke-width: ${50 * zoom};
      --offset: ${path_offset};
      --start: ${start};
      --end: ${end};
      --initial: ${initial};
      --start_midway: ${(start + end) / 2};
      --timeout2: ${fixedLength ? "1.5s" : "2s"};
      --segment_length: ${segment_length}`
    );
    path.setAttributeNS(null, "class", "animatingEnd");

    setTimeout(() => {
      svg.removeChild(path);
    }, 1000 * ANIMATION_TIME);
  };

  var svgPath = (points, command) => {
    var d = points.reduce(
      (acc, point, i, a) =>
        i === 0
          ? `M ${point[0]},${point[1]}`
          : `${acc} ${command(point, i, a)}`,
      ""
    );
    return d;
  };

  var line = (pointA, pointB) => {
    var lengthX = pointB[0] - pointA[0];
    var lengthY = pointB[1] - pointA[1];
    return {
      length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
      angle: Math.atan2(lengthY, lengthX),
    };
  };

  var controlPoint = (current, previous, next, reverse) => {
    var p = previous || current;
    var n = next || current;
    // The smoothing ratio
    var smoothing = 2 * py;
    // Properties of the opposed-line
    var o = line(p, n);
    // If is end-control-point, add PI to the angle to go backward
    var angle = o.angle + (reverse ? Math.PI : 0);
    var length = o.length * smoothing;
    // The control point position is relative to the current point
    var x = current[0] + Math.cos(angle) * length;
    var y = current[1] + Math.sin(angle) * length;
    return [x, y];
  };

  var bezierCommand = (point, i, a) => {
    var [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    var [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
  };

  return <div></div>;
};
