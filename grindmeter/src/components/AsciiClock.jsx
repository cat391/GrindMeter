import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { GLYPHS, TONES, renderClock } from "./asciiClockScene";

const FRAME_MS = 1000 / 30;
const TAU = Math.PI * 2;
const REST_POSE = { pitch: -0.88, yaw: 0.52, roll: -0.24 };
const HOVER_POSE = { pitch: -0.68, yaw: 0.38, roll: -0.17 };
// Integer ratios let all three hands land back on the real time together
const SPIN_RATIOS = [1, 3, 8];

const approach = (current, target, rate, dt) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

// A quick mechanical snap with a small settle
const tickEase = (progress) =>
  1 - Math.exp(-progress * 26) * Math.cos(progress * 38);

function clockHandAngles(now, reduceMotion) {
  const date = new Date(now);
  const seconds = date.getSeconds();
  const minutes = date.getMinutes() + seconds / 60;
  const hours = (date.getHours() % 12) + minutes / 60;
  const secondPosition = reduceMotion
    ? seconds
    : seconds - 1 + tickEase(date.getMilliseconds() / 1000);
  return [(hours / 12) * TAU, (minutes / 60) * TAU, (secondPosition / 60) * TAU];
}

function buildGrid(canvas, width, height) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cellWidth = Math.max(Math.round(dpr * 3.8), Math.round((width * dpr) / 150));
  const cellHeight = Math.round(cellWidth * 1.85);
  const cols = Math.floor((width * dpr) / cellWidth);
  const rows = Math.floor((height * dpr) / cellHeight);
  const pixelWidth = cols * cellWidth;
  const pixelHeight = rows * cellHeight;

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;
  canvas.style.width = `${pixelWidth / dpr}px`;
  canvas.style.height = `${pixelHeight / dpr}px`;

  const atlas = document.createElement("canvas");
  atlas.width = GLYPHS.length * cellWidth;
  atlas.height = TONES.length * cellHeight;
  const atlasContext = atlas.getContext("2d");
  atlasContext.font = `${cellWidth / 0.6}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  atlasContext.textAlign = "center";
  atlasContext.textBaseline = "middle";
  TONES.forEach((tone, toneIndex) => {
    atlasContext.fillStyle = tone;
    for (let glyph = 1; glyph < GLYPHS.length; glyph++) {
      atlasContext.fillText(
        GLYPHS[glyph],
        (glyph + 0.5) * cellWidth,
        (toneIndex + 0.5) * cellHeight
      );
    }
  });

  const cellCount = cols * rows;
  const noise = new Float32Array(cellCount);
  for (let index = 0; index < cellCount; index++) noise[index] = Math.random();

  return {
    atlas,
    cols,
    rows,
    cellWidth,
    cellHeight,
    unit: Math.min(pixelWidth, pixelHeight) * 0.44,
    noise,
    glyphs: new Uint8Array(cellCount),
    tones: new Uint8Array(cellCount),
  };
}

function drawGrid(context, grid) {
  const { atlas, cols, rows, cellWidth, cellHeight, glyphs, tones } = grid;
  context.clearRect(0, 0, cols * cellWidth, rows * cellHeight);
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = row * cols + col;
      if (glyphs[cell] === 0) continue;
      context.drawImage(
        atlas,
        glyphs[cell] * cellWidth,
        tones[cell] * cellHeight,
        cellWidth,
        cellHeight,
        col * cellWidth,
        row * cellHeight,
        cellWidth,
        cellHeight
      );
    }
  }
}

export default function AsciiClock({ phase, lifted }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const inputRef = useRef({ phase, lifted });

  useEffect(() => {
    inputRef.current = { phase, lifted };
  }, [phase, lifted]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    let grid = null;
    let frame = 0;
    let lastFrame = 0;
    let lastSecond = -1;
    let needsDraw = true;
    let spin = 0;
    let spinSpeed = 0;
    let pointerX = 0;
    let pointerY = 0;
    const pose = {
      ...REST_POSE,
      pitch: REST_POSE.pitch - 0.3,
      yaw: REST_POSE.yaw + 0.5,
      scale: 0.94,
      reveal: 0,
      hands: [0, 0, 0],
    };

    const resize = () => {
      const { width, height } = wrapper.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      grid = buildGrid(canvas, width, height);
      needsDraw = true;
    };

    const handlePointer = (event) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const step = (time) => {
      frame = requestAnimationFrame(step);
      if (!grid || time - lastFrame < FRAME_MS) return;
      const dt = Math.min((time - lastFrame) / 1000, 0.05);
      lastFrame = time;

      const reduceMotion = motionQuery.matches;
      const { phase: currentPhase, lifted: isLifted } = inputRef.current;
      const leaving = currentPhase === "leaving";
      const now = Date.now();
      const angles = clockHandAngles(now, reduceMotion);

      if (reduceMotion) {
        const second = Math.floor(now / 1000);
        const revealTarget = leaving ? 0 : 1;
        if (second === lastSecond && pose.reveal === revealTarget && !needsDraw) return;
        lastSecond = second;
        Object.assign(pose, REST_POSE, { scale: 1, reveal: revealTarget, hands: angles });
      } else {
        const seconds = time / 1000;
        const target = isLifted ? HOVER_POSE : REST_POSE;
        pose.pitch = approach(
          pose.pitch,
          target.pitch + Math.sin(seconds * 0.55) * 0.035 + pointerY * 0.09,
          4,
          dt
        );
        pose.yaw = approach(
          pose.yaw,
          target.yaw + Math.sin(seconds * 0.38) * 0.06 + pointerX * 0.14,
          4,
          dt
        );
        pose.roll = approach(pose.roll, target.roll, 4, dt);
        pose.scale = approach(pose.scale, leaving ? 1.08 : isLifted ? 1.035 : 1, 6, dt);
        pose.reveal = leaving
          ? Math.max(0, pose.reveal - dt * 2.2)
          : Math.min(1, pose.reveal + dt * 0.8);

        // Hands wind forward during sign-in, then settle back on the real time
        if (currentPhase === "pending") {
          spinSpeed = approach(spinSpeed, 1.1, 3, dt);
          spin += spinSpeed * dt;
        } else if (spin !== 0) {
          spinSpeed = 0;
          const landing = Math.ceil(spin / TAU - 1e-4) * TAU;
          spin = approach(spin, landing, 5, dt);
          if (Math.abs(landing - spin) < 0.001) spin = 0;
        }
        pose.hands = angles.map((angle, index) => angle + spin * SPIN_RATIOS[index]);
      }

      renderClock(grid, pose);
      drawGrid(context, grid);
      needsDraw = false;
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    resize();
    window.addEventListener("pointermove", handlePointer, { passive: true });
    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", handlePointer);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="flex h-[min(44dvh,26rem)] w-[min(78vw,32rem)] items-center justify-center"
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

AsciiClock.propTypes = {
  phase: PropTypes.oneOf(["idle", "pending", "leaving"]).isRequired,
  lifted: PropTypes.bool,
};
