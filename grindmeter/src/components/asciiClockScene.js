// Ray-traced clock drawn into a character grid. Holds no DOM or React state.

export const GLYPHS = " .:-=+*#%@";

const GRAY_TONES = [
  "#2e2e2e",
  "#444444",
  "#5e5e5e",
  "#7a7a7a",
  "#979797",
  "#b6b6b6",
  "#d6d6d6",
  "#f4f4f4",
];
const GREEN_TONES = ["#136929", "#1c8c39", "#23a946", "#46d36c"];
export const TONES = [...GRAY_TONES, ...GREEN_TONES];

const CAMERA_DISTANCE = 3.2;
const FACE_RADIUS = 0.88;
const RIM_HEIGHT = 0.12;
const BODY_DEPTH = 0.26;

const SURFACE = { FACE: 1, RIM: 2, OUTER_WALL: 3, INNER_WALL: 4, BACK: 5 };

const HAND_SHAPES = [
  { length: 0.44, tail: 0.08, base: 0.046, tip: 0.03, height: 0.03, light: 0.78 },
  { length: 0.68, tail: 0.1, base: 0.034, tip: 0.018, height: 0.055, light: 0.95 },
  { length: 0.77, tail: 0.16, base: 0.024, tip: 0.02, height: 0.08, light: 1, green: true },
];

const LIGHT = normalize(-0.48, 0.66, 0.58);

function normalize(x, y, z) {
  const length = Math.sqrt(x * x + y * y + z * z);
  return [x / length, y / length, z / length];
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

// Local-to-world rotation: roll * pitch * yaw
function rotationMatrix({ pitch, yaw, roll }) {
  const [sx, cx] = [Math.sin(pitch), Math.cos(pitch)];
  const [sy, cy] = [Math.sin(yaw), Math.cos(yaw)];
  const [sz, cz] = [Math.sin(roll), Math.cos(roll)];
  const r0 = [cy, 0, sy];
  const r1 = [sx * sy, cx, -sx * cy];
  const r2 = [-cx * sy, sx, cx * cy];
  return [
    cz * r0[0] - sz * r1[0],
    cz * r0[1] - sz * r1[1],
    cz * r0[2] - sz * r1[2],
    sz * r0[0] + cz * r1[0],
    sz * r0[1] + cz * r1[1],
    sz * r0[2] + cz * r1[2],
    r2[0],
    r2[1],
    r2[2],
  ];
}

function handCoverage(x, y, hand, softness) {
  const along = clamp(x * hand.sin + y * hand.cos, -hand.tail, hand.length);
  const dx = x - along * hand.sin;
  const dy = y - along * hand.cos;
  const progress = (along + hand.tail) / (hand.length + hand.tail);
  const halfWidth = hand.base + (hand.tip - hand.base) * progress;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return clamp((halfWidth + softness / 2 - distance) / softness, 0, 1);
}

function tickCoverage(x, y, radius, softness) {
  if (radius < 0.62 || radius > 0.86) return 0;
  const angle = (Math.atan2(x, y) + Math.PI * 2) % (Math.PI * 2);
  const step = (Math.PI * 2) / 60;
  const index = Math.round(angle / step);
  const across = Math.abs(angle - index * step) * radius;

  // Hours are solid bars, minutes are small round dots
  if (index % 5 === 0) {
    const width = clamp((0.03 + softness / 2 - across) / softness, 0, 1);
    const inner = clamp((radius - 0.67) / softness + 0.5, 0, 1);
    const outer = clamp((0.82 - radius) / softness + 0.5, 0, 1);
    return width * inner * outer;
  }
  const along = radius - 0.79;
  const distance = Math.sqrt(across * across + along * along);
  return clamp((0.016 + softness / 2 - distance) / softness, 0, 1) * 0.5;
}

export function renderClock(grid, pose) {
  const { cols, rows, cellWidth, cellHeight, unit, noise, glyphs, tones } = grid;
  const m = rotationMatrix(pose);
  // One character row measured on the tilted face, so thin lines never fall between rows
  const softness =
    Math.max(cellWidth, cellHeight) / (unit * pose.scale * Math.max(Math.abs(m[8]), 0.35));

  const originX = m[6] * CAMERA_DISTANCE;
  const originY = m[7] * CAMERA_DISTANCE;
  const originZ = m[8] * CAMERA_DISTANCE;
  const lightX = m[0] * LIGHT[0] + m[3] * LIGHT[1] + m[6] * LIGHT[2];
  const lightY = m[1] * LIGHT[0] + m[4] * LIGHT[1] + m[7] * LIGHT[2];
  const lightZ = m[2] * LIGHT[0] + m[5] * LIGHT[1] + m[8] * LIGHT[2];

  const hands = HAND_SHAPES.map((shape, index) => ({
    ...shape,
    sin: Math.sin(pose.hands[index]),
    cos: Math.cos(pose.hands[index]),
  }));

  for (let row = 0; row < rows; row++) {
    const screenY = ((rows / 2 - row - 0.5) * cellHeight) / (unit * pose.scale);
    for (let col = 0; col < cols; col++) {
      const cell = row * cols + col;
      const screenX = ((col + 0.5 - cols / 2) * cellWidth) / (unit * pose.scale);

      const screenRadius = Math.sqrt(screenX * screenX + screenY * screenY);
      const threshold = Math.min(1, screenRadius / 1.35) * 0.72 + noise[cell] * 0.28;
      if (pose.reveal <= threshold) {
        glyphs[cell] = 0;
        continue;
      }

      // Ray direction in the clock's local space
      let dirX = m[0] * screenX + m[3] * screenY - m[6] * CAMERA_DISTANCE;
      let dirY = m[1] * screenX + m[4] * screenY - m[7] * CAMERA_DISTANCE;
      let dirZ = m[2] * screenX + m[5] * screenY - m[8] * CAMERA_DISTANCE;
      const dirLength = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
      dirX /= dirLength;
      dirY /= dirLength;
      dirZ /= dirLength;

      let nearest = Infinity;
      let surface = 0;

      const testDisc = (height, minRadius, maxRadius, kind) => {
        if (Math.abs(dirZ) < 1e-6) return;
        const t = (height - originZ) / dirZ;
        if (t <= 0 || t >= nearest) return;
        const x = originX + dirX * t;
        const y = originY + dirY * t;
        const radiusSq = x * x + y * y;
        if (radiusSq >= minRadius * minRadius && radiusSq <= maxRadius * maxRadius) {
          nearest = t;
          surface = kind;
        }
      };

      testDisc(RIM_HEIGHT, FACE_RADIUS, 1, SURFACE.RIM);
      testDisc(0, 0, FACE_RADIUS, SURFACE.FACE);
      testDisc(-BODY_DEPTH, 0, 1, SURFACE.BACK);

      const a = dirX * dirX + dirY * dirY;
      if (a > 1e-9) {
        const b = 2 * (originX * dirX + originY * dirY);
        const originRadiusSq = originX * originX + originY * originY;

        const outerDisc = b * b - 4 * a * (originRadiusSq - 1);
        if (outerDisc > 0) {
          const t = (-b - Math.sqrt(outerDisc)) / (2 * a);
          const z = originZ + dirZ * t;
          if (t > 0 && t < nearest && z >= -BODY_DEPTH && z <= RIM_HEIGHT) {
            nearest = t;
            surface = SURFACE.OUTER_WALL;
          }
        }

        const innerDisc = b * b - 4 * a * (originRadiusSq - FACE_RADIUS * FACE_RADIUS);
        if (innerDisc > 0) {
          const t = (-b + Math.sqrt(innerDisc)) / (2 * a);
          const z = originZ + dirZ * t;
          if (t > 0 && t < nearest && z >= 0 && z <= RIM_HEIGHT) {
            nearest = t;
            surface = SURFACE.INNER_WALL;
          }
        }
      }

      if (!surface) {
        glyphs[cell] = 0;
        continue;
      }

      const hitX = originX + dirX * nearest;
      const hitY = originY + dirY * nearest;
      const hitRadius = Math.sqrt(hitX * hitX + hitY * hitY) || 1;
      const halfX = lightX - dirX;
      const halfY = lightY - dirY;
      const halfZ = lightZ - dirZ;
      const halfLength = Math.sqrt(halfX * halfX + halfY * halfY + halfZ * halfZ);

      let light = 0;
      let green = false;

      if (surface === SURFACE.FACE) {
        // The face stays empty so the hands, marks, and their shadows stand out
        let shadow = 0;
        for (const hand of hands) {
          const shadowX = hitX + (lightX / Math.max(lightZ, 0.2)) * hand.height;
          const shadowY = hitY + (lightY / Math.max(lightZ, 0.2)) * hand.height;
          shadow = Math.max(shadow, handCoverage(shadowX, shadowY, hand, softness));
        }
        light = shadow > 0.4 ? 0.12 : 0;

        const tick = tickCoverage(hitX, hitY, hitRadius, softness);
        light += (0.88 - light) * tick;
      } else if (surface === SURFACE.RIM) {
        const diffuse = Math.max(0, lightZ);
        const specular = Math.max(0, halfZ / halfLength) ** 40;
        const sheen = ((hitX * lightX + hitY * lightY) / hitRadius + 1) / 2;
        light = 0.4 + 0.18 * diffuse + 0.42 * sheen ** 2 + 0.3 * specular;
      } else if (surface === SURFACE.OUTER_WALL || surface === SURFACE.INNER_WALL) {
        const sign = surface === SURFACE.OUTER_WALL ? 1 : -1;
        const nx = (sign * hitX) / hitRadius;
        const ny = (sign * hitY) / hitRadius;
        const diffuse = Math.max(0, nx * lightX + ny * lightY);
        const specular = Math.max(0, (nx * halfX + ny * halfY) / halfLength) ** 24;
        light = 0.12 + 0.26 * diffuse + 0.18 * specular;
      } else {
        light = 0.08;
      }

      // Hands and center cap sit above the face, painted from lowest to highest
      if (Math.abs(dirZ) > 1e-6) {
        for (const hand of hands) {
          const t = (hand.height - originZ) / dirZ;
          if (t <= 0 || t >= nearest) continue;
          const x = originX + dirX * t;
          const y = originY + dirY * t;
          const coverage = handCoverage(x, y, hand, softness);
          if (coverage > 0) {
            light += (hand.light - light) * coverage;
            if (hand.green) green = coverage > 0.2;
            else if (coverage > 0.5) green = false;
          }
        }

        const capT = (0.095 - originZ) / dirZ;
        if (capT > 0 && capT < nearest) {
          const x = originX + dirX * capT;
          const y = originY + dirY * capT;
          const coverage = clamp((0.05 + softness / 2 - Math.sqrt(x * x + y * y)) / softness, 0, 1);
          if (coverage > 0) {
            light += (1 - light) * coverage;
            if (coverage > 0.4) green = true;
          }
        }
      }

      light = clamp(light, 0, 1);
      let glyph = Math.round(light * (GLYPHS.length - 1));
      if (light > 0.035 && glyph === 0) glyph = 1;
      let tone = green
        ? GRAY_TONES.length + Math.round(clamp((light - 0.3) / 0.65, 0, 1) * (GREEN_TONES.length - 1))
        : Math.round(light * (GRAY_TONES.length - 1));

      // Cells at the edge of the reveal flicker as green noise
      if (glyph > 0 && pose.reveal < 1 && pose.reveal - threshold < 0.06) {
        glyph = 1 + Math.floor(noise[cell] * (GLYPHS.length - 1));
        tone = GRAY_TONES.length + 2;
      }

      glyphs[cell] = glyph;
      tones[cell] = tone;
    }
  }
}
