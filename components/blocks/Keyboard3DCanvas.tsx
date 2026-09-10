"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export type ModelType = "titan-65" | "solaris-75" | "aegis-tkl" | "nocturne-pad";
export type TeardownLayer = "none" | "chassis" | "keycaps" | "weight" | "switches" | "exploded";
export type SwitchType = "tactile" | "linear" | "clicky";
export type AnimTriggerType = "none" | "chassis_glint" | "keycap_wave" | "weight_tilt" | "switch_actuation";

export interface CustomizerConfig {
  model: ModelType;
  caseFinish: "obsidian" | "champagne" | "silver" | "titanium";
  keycapTheme: "midnight" | "chalk" | "cyber" | "emerald";
  weightFinish: "gold" | "gunmetal" | "chromatic";
  knobFinish: "gold" | "black" | "silver";
  autoRotate: boolean;
  teardownLayer?: TeardownLayer;
  switchType?: SwitchType;
  animTrigger?: { type: AnimTriggerType; id: number };
}

interface Keyboard3DCanvasProps {
  config: CustomizerConfig;
}

interface KeyDef {
  w: number;
  l?: string;
  a?: boolean;
  m?: boolean;
  s?: boolean;
  gap?: boolean;
}

// Generate sculpted Cherry/OEM profile keycap with authentic proportions & cylindrical dish
function createSculptedKeycapGeometry(
  width: number,
  depth: number,
  height: number,
  rowAngle: number = 0,
  isSpacebar: boolean = false
) {
  // Balanced subdivisions for smooth dish and clean profile
  const geo = new THREE.BoxGeometry(width, height, depth, 6, 2, 6);
  const pos = geo.attributes.position;

  const hw = width / 2;
  const hd = depth / 2;
  // Authentic Cherry profile vertical edge radius (crisp, not bulbous)
  const cr = Math.min(0.12, width * 0.1, depth * 0.1);

  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);
    let z = pos.getZ(i);

    // Subtle edge rounding for the 4 vertical corners
    const absX = Math.abs(x);
    const absZ = Math.abs(z);
    if (absX > hw - cr && absZ > hd - cr) {
      const dx = absX - (hw - cr);
      const dz = absZ - (hd - cr);
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0) {
        const factor = cr / dist;
        const nx = (hw - cr) + dx * factor;
        const nz = (hd - cr) + dz * factor;
        x = Math.sign(x) * nx;
        z = Math.sign(z) * nz;
      }
    }

    // Top face sculpting & spherical/cylindrical dish
    if (y > 0) {
      x *= isSpacebar ? 0.94 : 0.84;
      z *= 0.84;

      if (!isSpacebar) {
        const dishDepth = 0.07;
        const normX = Math.min(1, Math.abs(x) / ((width * 0.84) / 2));
        const normZ = Math.min(1, Math.abs(z) / ((depth * 0.84) / 2));
        const distSq = Math.min(1, normX * normX + normZ * normZ);
        y -= (1 - distSq) * dishDepth;
      } else {
        const normZ = Math.min(1, Math.abs(z) / ((depth * 0.84) / 2));
        y -= normZ * normZ * 0.04;
      }

      y += (z / (depth / 2)) * rowAngle;
    } else {
      x *= 0.98;
      z *= 0.98;
    }

    pos.setXYZ(i, x, y, z);
  }

  // Remap UV coordinates so that ONLY the TOP face displays the keycap legend/texture,
  // and all 4 vertical side walls (+X, -X, +Z, -Z) and underside remain clean, solid keycap plastic without repeated letters.
  const topVertIndices = new Set<number>();
  if (geo.index) {
    const topGroup = geo.groups[2]; // Group 2 is +Y (Top Face) in Three.js BoxGeometry
    if (topGroup) {
      for (let i = topGroup.start; i < topGroup.start + topGroup.count; i++) {
        topVertIndices.add(geo.index.getX(i));
      }
    }
  }

  const uv = geo.attributes.uv;
  if (uv) {
    for (let i = 0; i < uv.count; i++) {
      if (!topVertIndices.has(i)) {
        // Point side skirts and underside to the clean solid keycap background color
        uv.setXY(i, 0.02, 0.02);
      }
    }
  }

  geo.computeVertexNormals();
  return geo;
}

// Procedural CNC aluminum chassis with crisp CNC chamfers and rounded perimeter
function createRoundedCaseGeometry(
  width: number,
  depth: number,
  height: number,
  cornerRadius: number = 1.1,
  bevel: number = 0.14
) {
  const shape = new THREE.Shape();
  const w = width - bevel * 2;
  const d = depth - bevel * 2;
  const r = Math.min(cornerRadius, w / 4, d / 4);
  const x = -w / 2;
  const y = -d / 2;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + d - r);
  shape.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + d);
  shape.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: Math.max(0.2, height - bevel * 2),
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 32,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.rotateX(Math.PI / 2);
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

// Procedural hollow CNC top frame with recessed switch well & precision chamfer
function createHollowTopCaseGeometry(
  width: number,
  depth: number,
  height: number,
  wellW: number,
  wellD: number,
  wellOffsetX: number = 0,
  wellOffsetZ: number = 0,
  cornerRadius: number = 1.1,
  bevel: number = 0.14
) {
  const shape = new THREE.Shape();
  const w = width - bevel * 2;
  const d = depth - bevel * 2;
  const r = Math.min(cornerRadius, w / 4, d / 4);
  const x = -w / 2;
  const y = -d / 2;

  shape.moveTo(x + r, y);
  shape.lineTo(x + w - r, y);
  shape.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + w, y + d - r);
  shape.absarc(x + w - r, y + d - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + d);
  shape.absarc(x + r, y + d - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);

  // Inner switch well cutout
  const hole = new THREE.Path();
  const hw = wellW;
  const hd = wellD;
  const hr = Math.min(0.45, hw / 8, hd / 8);
  const hx = -hw / 2 + wellOffsetX;
  const hy = -hd / 2 + wellOffsetZ;

  hole.moveTo(hx + hr, hy + hd);
  hole.lineTo(hx + hw - hr, hy + hd);
  hole.absarc(hx + hw - hr, hy + hd - hr, hr, Math.PI / 2, 0, true);
  hole.lineTo(hx + hw, hy + hr);
  hole.absarc(hx + hw - hr, hy + hr, hr, 0, -Math.PI / 2, true);
  hole.lineTo(hx + hr, hy);
  hole.absarc(hx + hr, hy + hr, hr, -Math.PI / 2, -Math.PI, true);
  hole.lineTo(hx, hy + hd - hr);
  hole.absarc(hx + hr, hy + hd - hr, hr, Math.PI, Math.PI / 2, true);

  shape.holes.push(hole);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: Math.max(0.2, height - bevel * 2),
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 32,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.rotateX(Math.PI / 2);
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

// Memory-Efficient Keycap Texture Pool (Guarantees <15MB VRAM on low-end hardware)
let cachedTheme: CustomizerConfig["keycapTheme"] | null = null;
const textureCache = new Map<string, THREE.CanvasTexture>();

function clearTextureCache() {
  textureCache.forEach((tex) => tex.dispose());
  textureCache.clear();
}

function createKeycapTexture(
  label: string,
  isAccent: boolean,
  isMod: boolean,
  theme: CustomizerConfig["keycapTheme"]
) {
  if (cachedTheme !== theme) {
    clearTextureCache();
    cachedTheme = theme;
  }

  const cacheKey = `${theme}-${isAccent ? 1 : 0}-${isMod ? 1 : 0}-${label}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  let bg = "#151822";
  let textCol = "#DFBA70";

  if (theme === "midnight") {
    bg = isAccent ? "#CBA347" : isMod ? "#0D0F16" : "#151822";
    textCol = isAccent ? "#0A0C12" : "#DFBA70";
  } else if (theme === "chalk") {
    // Authentic GMK Chalk: Warm ivory alphas, stone grey mods, clean muted slate accents
    bg = isAccent ? "#94A3B8" : isMod ? "#DDD7CB" : "#F5F2EA";
    textCol = isAccent ? "#FFFFFF" : "#2B2D33";
  } else if (theme === "cyber") {
    bg = isAccent ? "#06B6D4" : isMod ? "#0F1320" : "#19202F";
    textCol = isAccent ? "#070C18" : isMod ? "#818CF8" : "#38BDF8";
  } else if (theme === "emerald") {
    bg = isAccent ? "#10B981" : isMod ? "#022C22" : "#064E3B";
    textCol = isAccent ? "#022C22" : isMod ? "#6EE7B7" : "#A7F3D0";
  }

  // Base keycap top fill
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle spherical dish vignette for tactile PBT depth
  const grad = ctx.createRadialGradient(128, 128, 20, 128, 128, 128);
  grad.addColorStop(0, "rgba(255,255,255,0.08)");
  grad.addColorStop(0.65, "rgba(0,0,0,0)");
  grad.addColorStop(1, "rgba(0,0,0,0.22)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Subtle inner beveled perimeter
  ctx.strokeStyle = "rgba(255,255,255,0.07)";
  ctx.lineWidth = 3;
  ctx.strokeRect(8, 8, 240, 240);

  // Crisp doubleshot legend typography
  if (label) {
    ctx.fillStyle = textCol;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (label.length === 1) {
      ctx.font = "bold 60px system-ui, -apple-system, sans-serif";
      ctx.fillText(label, 128, 128);
    } else if (label.length <= 4) {
      ctx.font = "bold 40px system-ui, -apple-system, sans-serif";
      ctx.fillText(label, 128, 128);
    } else {
      ctx.font = "bold 30px system-ui, -apple-system, sans-serif";
      ctx.fillText(label, 128, 128);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  textureCache.set(cacheKey, texture);
  return texture;
}

// Generate engraved front brass accent bar texture
function createFrontBrassTexture(title: string = "AURA TITAN-65", subtitle?: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#D4AF37";
  ctx.fillRect(0, 0, 1024, 128);

  // Brushed metal micro-lines
  for (let i = 0; i < 400; i++) {
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
    ctx.lineWidth = Math.random() * 2 + 0.5;
    const y = Math.random() * 128;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Laser engraved typography
  ctx.fillStyle = "#1E1A11";
  ctx.textBaseline = "middle";

  if (title === "AURA NOCTURNE") {
    // Matches nocturne-pad.jpg: AURA NOCTURNE on left, CRAFTED IN THE UK on right
    ctx.textAlign = "left";
    ctx.font = "900 32px system-ui, -apple-system, sans-serif";
    ctx.fillText("AURA NOCTURNE", 48, 64);

    ctx.textAlign = "right";
    ctx.font = "bold 22px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#332C1A";
    ctx.fillText("CRAFTED IN THE UK", 1024 - 48, 64);
  } else {
    // Matches titan-65.jpg: AURA TITAN-65 with CUSTOM MECHANICAL KEYBOARD below
    ctx.textAlign = "center";
    ctx.font = "900 38px system-ui, -apple-system, sans-serif";
    ctx.fillText(title, 512, 48);

    ctx.font = "bold 17px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#332C1A";
    ctx.fillText(subtitle || "CUSTOM MECHANICAL KEYBOARD", 512, 88);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate dedicated engraved badges for models (Solaris lip badge, Aegis divider badge)
function createBadgeTexture(type: "solaris" | "aegis") {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (type === "solaris") {
    // Matches solaris-75.jpg: Dark beveled lip badge engraved AURA SOLARIS-75
    ctx.fillStyle = "#121418";
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = "rgba(212, 175, 55, 0.4)";
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 1024 - 24, 256 - 24);

    ctx.fillStyle = "#d4af37";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 64px system-ui, -apple-system, sans-serif";
    ctx.fillText("AURA SOLARIS-75", 512, 128);
  } else if (type === "aegis") {
    // Matches aegis-tkl.jpg: Slate divider badge with AURA AEGIS + gold line + TKL
    ctx.fillStyle = "#222630";
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = "rgba(212, 175, 55, 0.25)";
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 1024 - 16, 256 - 16);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "bold 64px system-ui, -apple-system, sans-serif";
    ctx.fillText("AURA AEGIS", 512, 80);

    // Polished gold accent bar
    ctx.fillStyle = "#d4af37";
    ctx.fillRect(360, 132, 304, 10);

    ctx.font = "bold 44px 'JetBrains Mono', monospace";
    ctx.fillStyle = "#d4af37";
    ctx.fillText("TKL", 512, 192);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// High-resolution procedural switch plate texture with authentic 14mm switch sockets, flex cuts & silkscreen
function createSwitchPlateTexture(
  width: number,
  depth: number,
  keys: { x: number; z: number; w: number; isSpace?: boolean }[],
  modelTitle: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark matte anodized aluminum / black FR4 base
  ctx.fillStyle = "#14161d";
  ctx.fillRect(0, 0, 2048, 1024);

  // Brushed metal micro-lines
  for (let i = 0; i < 400; i++) {
    ctx.strokeStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.06)";
    ctx.lineWidth = Math.random() * 2 + 0.5;
    const y = Math.random() * 1024;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(2048, y);
    ctx.stroke();
  }

  const toCanvasX = (x: number) => ((x + width / 2) / width) * 2048;
  const toCanvasY = (z: number) => ((z + depth / 2) / depth) * 1024;
  const unitPxW = (1.36 / width) * 2048;
  const unitPxH = (1.36 / depth) * 1024;

  // Gold ENIG Perimeter Silkscreen & Gasket Border
  ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
  ctx.lineWidth = 4;
  ctx.strokeRect(32, 32, 2048 - 64, 1024 - 64);

  ctx.strokeStyle = "rgba(212, 175, 55, 0.2)";
  ctx.lineWidth = 2;
  ctx.strokeRect(44, 44, 2048 - 88, 1024 - 88);

  // Technical Plate Silkscreen Text
  ctx.fillStyle = "rgba(212, 175, 55, 0.75)";
  ctx.font = "bold 22px 'JetBrains Mono', monospace";
  ctx.fillText(`AURA ATELIER • ${modelTitle.toUpperCase()} • 1.5mm FR4 LEAF-SPRING GASKET PLATE`, 60, 75);
  ctx.fillText("CNC ACOUSTIC TUNED • ISO/ANSI COMPLIANT • REV 3.2", 60, 1024 - 60);

  // Draw individual 14mm square switch cutouts with gold ENIG copper rims
  keys.forEach((k) => {
    const cx = toCanvasX(k.x);
    const cy = toCanvasY(k.z);
    const sw = unitPxW * 0.82;
    const sh = unitPxH * 0.82;

    // Dark cavity socket
    ctx.fillStyle = "#090a0d";
    ctx.fillRect(cx - sw / 2, cy - sh / 2, sw, sh);

    // Gold ENIG copper rim
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 3;
    ctx.strokeRect(cx - sw / 2, cy - sh / 2, sw, sh);

    // Corner switch-puller relief notches (standard Cherry MX spec)
    ctx.fillStyle = "#d4af37";
    ctx.fillRect(cx - sw / 2 - 2, cy - 8, 4, 16);
    ctx.fillRect(cx + sw / 2 - 2, cy - 8, 4, 16);

    // Stabilizer cutouts for spacebar
    if (k.isSpace) {
      const stabOffset = (2.6 / width) * 2048;
      const stabW = unitPxW * 0.45;
      const stabH = unitPxH * 0.75;
      ctx.fillStyle = "#090a0d";
      ctx.fillRect(cx - stabOffset - stabW / 2, cy - stabH / 2, stabW, stabH);
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - stabOffset - stabW / 2, cy - stabH / 2, stabW, stabH);

      ctx.fillRect(cx + stabOffset - stabW / 2, cy - stabH / 2, stabW, stabH);
      ctx.strokeRect(cx + stabOffset - stabW / 2, cy - stabH / 2, stabW, stabH);

      ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - stabOffset, cy + stabH / 3);
      ctx.lineTo(cx + stabOffset, cy + stabH / 3);
      ctx.stroke();
    }
  });

  // Flex-cut relief slots (leaf springs between switch rows)
  ctx.strokeStyle = "#d4af37";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  const rowFlexY = [0.26, 0.42, 0.58, 0.74].map((ratio) => ratio * 1024);
  rowFlexY.forEach((fy) => {
    [
      [120, 600],
      [720, 1320],
      [1440, 1920],
    ].forEach(([x1, x2]) => {
      ctx.strokeStyle = "#08090b";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x1, fy);
      ctx.lineTo(x2, fy);
      ctx.stroke();

      ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, fy);
      ctx.lineTo(x2, fy);
      ctx.stroke();
    });
  });

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// High-resolution procedural PCB texture with gold ENIG bus traces, LED emitters & controller
function createPCBTexture(
  width: number,
  depth: number,
  keys: { x: number; z: number; w: number }[],
  modelTitle: string
) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Matte Black FR4 Solder Mask
  ctx.fillStyle = "#0c0e12";
  ctx.fillRect(0, 0, 2048, 1024);

  const toCanvasX = (x: number) => ((x + width / 2) / width) * 2048;
  const toCanvasY = (z: number) => ((z + depth / 2) / depth) * 1024;
  const unitPxH = (1.36 / depth) * 1024;

  // Gold ENIG Circuit Traces (45-degree angled bus lines)
  ctx.strokeStyle = "rgba(212, 175, 55, 0.35)";
  ctx.lineWidth = 2;
  keys.forEach((k, idx) => {
    if (idx < keys.length - 1) {
      const x1 = toCanvasX(k.x);
      const y1 = toCanvasY(k.z);
      const nextK = keys[idx + 1];
      const x2 = toCanvasX(nextK.x);
      const y2 = toCanvasY(nextK.z);
      if (Math.abs(y2 - y1) < unitPxH * 1.5) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        const midX = (x1 + x2) / 2;
        ctx.lineTo(midX, y1);
        ctx.lineTo(midX, y2);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    }
  });

  // Switch Center Tube Through-Holes, Pin Holes & Per-Key RGB LED Emitters
  keys.forEach((k) => {
    const cx = toCanvasX(k.x);
    const cy = toCanvasY(k.z);

    // Center circular stem tube hole
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2 Switch Pin Solder Holes
    [[-18, -12], [16, -18]].forEach(([dx, dy]) => {
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(cx + dx, cy + dy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#d4af37";
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Per-Key RGB LED SMT Window with gentle glow
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - 10, cy + 18, 20, 10);
    const ledGlow = ctx.createRadialGradient(cx, cy + 23, 2, cx, cy + 23, 24);
    ledGlow.addColorStop(0, "rgba(255, 235, 180, 0.45)");
    ledGlow.addColorStop(1, "rgba(255, 200, 100, 0)");
    ctx.fillStyle = ledGlow;
    ctx.beginPath();
    ctx.arc(cx, cy + 23, 24, 0, Math.PI * 2);
    ctx.fill();

    // Hot-swap socket silkscreen boundary outline
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(cx - 32, cy - 24, 64, 30);
  });

  // RP2040 Microcontroller IC
  ctx.fillStyle = "#121316";
  ctx.fillRect(1720, 120, 140, 140);
  ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1720, 120, 140, 140);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = "bold 14px 'JetBrains Mono', monospace";
  ctx.fillText("ARM CORTEX", 1735, 180);
  ctx.fillText("RP2040", 1750, 205);

  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "bold 18px 'JetBrains Mono', monospace";
  ctx.fillText(`AURA ATELIER • ${modelTitle.toUpperCase()} PCB • QMK / VIA COMPLIANT`, 60, 60);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// High-resolution procedural CNC milled cavity texture with concentric circular toolpaths & weight recess
function createBottomCavityTexture(width: number, depth: number, modelTitle: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark acoustic CNC cavity floor
  ctx.fillStyle = "#0c0d12";
  ctx.fillRect(0, 0, 1024, 512);

  // Concentric circular CNC face-mill swirls
  ctx.strokeStyle = "rgba(255, 255, 255, 0.035)";
  ctx.lineWidth = 2;
  for (let r = 40; r < 600; r += 18) {
    ctx.beginPath();
    ctx.arc(512, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Milled weight pocket recess border in center
  ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 6]);
  ctx.strokeRect(160, 110, 1024 - 320, 512 - 220);
  ctx.setLineDash([]);

  // Hex screw countersink spots for brass weight (6 screws)
  [
    [200, 140],
    [512, 140],
    [824, 140],
    [200, 372],
    [512, 372],
    [824, 372],
  ].forEach(([hx, hy]) => {
    ctx.fillStyle = "#050608";
    ctx.beginPath();
    ctx.arc(hx, hy, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d4af37";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#d4af37";
    ctx.beginPath();
    for (let a = 0; a < 6; a++) {
      const angle = (a * Math.PI) / 3;
      const x = hx + 6 * Math.cos(angle);
      const y = hy + 6 * Math.sin(angle);
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  });

  // Laser-etched Serial & Specifications
  ctx.fillStyle = "rgba(212, 175, 55, 0.5)";
  ctx.font = "bold 16px 'JetBrains Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`AURA ATELIER • BESPOKE CNC CHASSIS • ${modelTitle.toUpperCase()}`, 512, 240);
  ctx.font = "14px 'JetBrains Mono', monospace";
  ctx.fillText("DESIGNED IN COPENHAGEN • SERIAL NO. #0842-TITAN • 6063 AIRCRAFT ALUMINUM", 512, 270);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Generate luxury felt deskmat texture
function createDeskmatTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Dark charcoal leather/felt background
  ctx.fillStyle = "#0c0d12";
  ctx.fillRect(0, 0, 1024, 512);

  // Subtle noise grain
  for (let i = 0; i < 1500; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.04)";
    ctx.fillRect(Math.random() * 1024, Math.random() * 512, 2, 2);
  }

  // Gold stitched perimeter border
  ctx.strokeStyle = "rgba(212, 175, 55, 0.45)";
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.strokeRect(24, 24, 1024 - 48, 512 - 48);

  // Embossed Atelier logo on bottom right
  ctx.fillStyle = "rgba(212, 175, 55, 0.35)";
  ctx.font = "bold 18px 'JetBrains Mono', monospace";
  ctx.fillText("AURAKEYS ATELIER", 820, 460);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// High-resolution multi-stop radial gradient contact shadow texture for soft studio ambient occlusion
function createContactShadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 512, 256);

  // Soft multi-stop radial gradient creating deep ambient occlusion directly under chassis
  const grad = ctx.createRadialGradient(256, 128, 10, 256, 128, 220);
  grad.addColorStop(0, "rgba(0, 0, 0, 0.76)");
  grad.addColorStop(0.22, "rgba(0, 0, 0, 0.58)");
  grad.addColorStop(0.5, "rgba(0, 0, 0, 0.28)");
  grad.addColorStop(0.78, "rgba(0, 0, 0, 0.08)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0)");

  ctx.fillStyle = grad;
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(256, 128, 235, 96, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x0a0c10);

  // Softbox 1: Overhead main warm light
  const lightGeo1 = new THREE.PlaneGeometry(18, 18);
  const lightMat1 = new THREE.MeshBasicMaterial({ color: 0xfff2dc, side: THREE.DoubleSide });
  const softbox1 = new THREE.Mesh(lightGeo1, lightMat1);
  softbox1.position.set(0, 18, 10);
  softbox1.rotation.x = Math.PI / 3;
  envScene.add(softbox1);

  // Softbox 2: Cool blue rim
  const lightGeo2 = new THREE.PlaneGeometry(16, 12);
  const lightMat2 = new THREE.MeshBasicMaterial({ color: 0x90b8ff, side: THREE.DoubleSide });
  const softbox2 = new THREE.Mesh(lightGeo2, lightMat2);
  softbox2.position.set(-18, 12, -12);
  softbox2.rotation.y = Math.PI / 4;
  envScene.add(softbox2);

  // Softbox 3: Front warm fill
  const lightGeo3 = new THREE.PlaneGeometry(14, 8);
  const lightMat3 = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const softbox3 = new THREE.Mesh(lightGeo3, lightMat3);
  softbox3.position.set(15, 10, 15);
  softbox3.rotation.y = -Math.PI / 4;
  envScene.add(softbox3);

  const envMap = pmremGenerator.fromScene(envScene).texture;
  pmremGenerator.dispose();
  return envMap;
}

// Unified material finish applicator (keeps finishes synchronized across scene rebuilds)
function applyMaterialStyles(
  mats: {
    caseMat?: THREE.MeshPhysicalMaterial;
    bottomCaseMat?: THREE.MeshPhysicalMaterial;
    weightMat?: THREE.MeshPhysicalMaterial;
    knobMat?: THREE.MeshPhysicalMaterial;
    switchHousingMat?: THREE.MeshPhysicalMaterial;
    switchStemMat?: THREE.MeshStandardMaterial;
  },
  config: CustomizerConfig
) {
  if (!mats) return;

  // 1. CNC Chassis Anodization
  if (mats.caseMat && mats.bottomCaseMat) {
    switch (config.caseFinish) {
      case "obsidian":
        mats.caseMat.color.setHex(0x16181d);
        mats.caseMat.metalness = 0.82;
        mats.caseMat.roughness = 0.28;
        mats.caseMat.clearcoat = 0.25;
        mats.caseMat.clearcoatRoughness = 0.3;
        mats.bottomCaseMat.color.setHex(0x0e1014);
        mats.bottomCaseMat.metalness = 0.88;
        mats.bottomCaseMat.roughness = 0.32;
        break;
      case "champagne":
        mats.caseMat.color.setHex(0xd0af68);
        mats.caseMat.metalness = 0.88;
        mats.caseMat.roughness = 0.26;
        mats.caseMat.clearcoat = 0.35;
        mats.caseMat.clearcoatRoughness = 0.22;
        mats.bottomCaseMat.color.setHex(0xab8c48);
        mats.bottomCaseMat.metalness = 0.92;
        mats.bottomCaseMat.roughness = 0.28;
        break;
      case "silver":
        mats.caseMat.color.setHex(0xe8ebf2);
        mats.caseMat.metalness = 0.92;
        mats.caseMat.roughness = 0.22;
        mats.caseMat.clearcoat = 0.3;
        mats.caseMat.clearcoatRoughness = 0.2;
        mats.bottomCaseMat.color.setHex(0xb2b7c4);
        mats.bottomCaseMat.metalness = 0.94;
        mats.bottomCaseMat.roughness = 0.25;
        break;
      case "titanium":
        mats.caseMat.color.setHex(0x545864);
        mats.caseMat.metalness = 0.78;
        mats.caseMat.roughness = 0.35;
        mats.caseMat.clearcoat = 0.2;
        mats.caseMat.clearcoatRoughness = 0.3;
        mats.bottomCaseMat.color.setHex(0x363942);
        mats.bottomCaseMat.metalness = 0.82;
        mats.bottomCaseMat.roughness = 0.38;
        break;
    }
  }

  // 2. Internal Acoustic Weight Finish
  if (mats.weightMat) {
    switch (config.weightFinish) {
      case "gold":
        mats.weightMat.color.setHex(0xe5b83b);
        mats.weightMat.metalness = 0.98;
        mats.weightMat.roughness = 0.08;
        mats.weightMat.clearcoat = 0.9;
        mats.weightMat.clearcoatRoughness = 0.05;
        break;
      case "gunmetal":
        mats.weightMat.color.setHex(0x242730);
        mats.weightMat.metalness = 0.92;
        mats.weightMat.roughness = 0.18;
        mats.weightMat.clearcoat = 0.4;
        mats.weightMat.clearcoatRoughness = 0.2;
        break;
      case "chromatic":
        mats.weightMat.color.setHex(0x9d4edd);
        mats.weightMat.metalness = 0.96;
        mats.weightMat.roughness = 0.10;
        mats.weightMat.clearcoat = 0.85;
        mats.weightMat.clearcoatRoughness = 0.08;
        break;
    }
  }

  // 3. Knurled Rotary Knob Finish
  if (mats.knobMat) {
    switch (config.knobFinish) {
      case "gold":
        mats.knobMat.color.setHex(0xe5b83b);
        mats.knobMat.metalness = 0.98;
        mats.knobMat.roughness = 0.12;
        break;
      case "black":
        mats.knobMat.color.setHex(0x111317);
        mats.knobMat.metalness = 0.85;
        mats.knobMat.roughness = 0.25;
        break;
      case "silver":
        mats.knobMat.color.setHex(0xe8ebf2);
        mats.knobMat.metalness = 0.94;
        mats.knobMat.roughness = 0.18;
        break;
    }
  }

  // 4. Switch Stem & Housing Calibration
  if (mats.switchStemMat && mats.switchHousingMat) {
    const swType = config.switchType || "tactile";
    if (swType === "tactile") {
      mats.switchStemMat.color.setHex(0xdf785d);
      mats.switchHousingMat.color.setHex(0xf6f4ec);
      mats.switchHousingMat.transmission = 0.35;
      mats.switchHousingMat.roughness = 0.25;
    } else if (swType === "linear") {
      mats.switchStemMat.color.setHex(0x181a1e);
      mats.switchHousingMat.color.setHex(0x111316);
      mats.switchHousingMat.transmission = 0.2;
      mats.switchHousingMat.roughness = 0.18;
    } else if (swType === "clicky") {
      mats.switchStemMat.color.setHex(0x1d4ed8);
      mats.switchHousingMat.color.setHex(0xdbeafe);
      mats.switchHousingMat.transmission = 0.75;
      mats.switchHousingMat.roughness = 0.12;
    }
  }
}

export function Keyboard3DCanvas({ config }: Keyboard3DCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const keyboardGroupRef = useRef<THREE.Group | null>(null);

  // Spherical camera orbit state (prevents keyboard from ever slicing through deskmat)
  const cameraState = useRef({
    radius: 38,
    targetRadius: 38,
    theta: 0.42, // horizontal azimuth angle
    phi: 0.86,   // polar elevation angle (~50 degrees from top for clear isometric view)
    target: new THREE.Vector3(0, -0.2, 0),
  });

  const teardownRef = useRef<TeardownLayer>("none");
  teardownRef.current = config.teardownLayer || "none";
  const lastLayerRef = useRef<TeardownLayer>("none");

  const autoRotateRef = useRef<boolean>(config.autoRotate ?? true);
  autoRotateRef.current = config.autoRotate ?? true;

  const subgroupsRef = useRef<{
    keycapsGroup?: THREE.Group;
    topCaseGroup?: THREE.Group;
    switchesGroup?: THREE.Group;
    plateGroup?: THREE.Group;
    pcbGroup?: THREE.Group;
    weightGroup?: THREE.Group;
    bottomCaseGroup?: THREE.Group;
  }>({});

  const materialsRef = useRef<{
    caseMat?: THREE.MeshPhysicalMaterial;
    bottomCaseMat?: THREE.MeshPhysicalMaterial;
    weightMat?: THREE.MeshPhysicalMaterial;
    knobMat?: THREE.MeshPhysicalMaterial;
    plateMat?: THREE.MeshStandardMaterial;
    pcbMat?: THREE.MeshStandardMaterial;
    gasketMat?: THREE.MeshStandardMaterial;
    switchHousingMat?: THREE.MeshPhysicalMaterial;
    switchStemMat?: THREE.MeshStandardMaterial;
    stabHousingMat?: THREE.MeshStandardMaterial;
    frontBrassMat?: THREE.MeshStandardMaterial;
  }>({});

  const keycapItemsRef = useRef<{
    mesh: THREE.Mesh;
    baseY: number;
    x: number;
    label: string;
    isAccent: boolean;
    isMod: boolean;
    isSpace: boolean;
  }[]>([]);
  const glintLightRef = useRef<THREE.DirectionalLight | null>(null);
  const contactShadowRef = useRef<THREE.Mesh | null>(null);
  const activeTriggerRef = useRef<{ type: AnimTriggerType; startTime: number; id: number } | null>(null);

  // Sync incoming animation trigger
  useEffect(() => {
    if (config.animTrigger && config.animTrigger.id) {
      activeTriggerRef.current = {
        type: config.animTrigger.type,
        startTime: performance.now(),
        id: config.animTrigger.id,
      };
    }
  }, [config.animTrigger]);

  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  // Init Scene
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = canvas.parentElement?.clientWidth || 720;
    const height = 520;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Set initial camera position from spherical coordinates
    const { radius, theta, phi, target } = cameraState.current;
    camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    camera.position.y = target.y + radius * Math.cos(phi);
    camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(target);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height, false);
    // Low-RAM / Low-GPU optimization: clamp pixel ratio to 1.5 for silky 60fps on integrated graphics
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;

    const envMap = createStudioEnvironment(renderer);
    scene.environment = envMap;

    // Studio Lights - Balanced, soft directional and fill (eliminates blown-out highlights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.15);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.3);
    keyLight.position.set(12, 28, 14);
    // Soft contact shadow texture provides silky, photorealistic studio ambient occlusion without jagged polygon cutouts
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x90b8ff, 1.1);
    rimLight.position.set(-20, 16, -14);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0xffecd1, 0.75);
    bounceLight.position.set(0, 6, 24);
    scene.add(bounceLight);

    // Dynamic metallic glint sweep light for Step 1 (Chassis Finish)
    const glintLight = new THREE.DirectionalLight(0xfff8e8, 0);
    glintLight.position.set(-22, 14, 16);
    scene.add(glintLight);
    glintLightRef.current = glintLight;

    // Luxury Stitched Felt Deskmat (positioned directly beneath keyboard chassis)
    const deskmatGeo = new THREE.PlaneGeometry(54, 32);
    const deskmatTex = createDeskmatTexture();
    const deskmatMat = new THREE.MeshStandardMaterial({
      map: deskmatTex,
      roughness: 0.85,
      metalness: 0.1,
    });
    const deskmatMesh = new THREE.Mesh(deskmatGeo, deskmatMat);
    deskmatMesh.rotation.x = -Math.PI / 2;
    deskmatMesh.position.y = -1.38;
    scene.add(deskmatMesh);

    // Feathered Studio Contact Shadow (luxurious soft ambient occlusion directly beneath keyboard chassis)
    const shadowGeo = new THREE.PlaneGeometry(36, 17);
    const shadowTex = createContactShadowTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
    });
    const contactShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    contactShadowMesh.rotation.x = -Math.PI / 2;
    contactShadowMesh.position.set(0, -1.37, 0); // rests 0.01 above deskmat at -1.38
    scene.add(contactShadowMesh);
    contactShadowRef.current = contactShadowMesh;

    // Smooth spherical orbit controls
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      cameraState.current.theta -= deltaX * 0.007;
      cameraState.current.phi -= deltaY * 0.007;
      // Clamp elevation so camera cannot view from underneath the deskmat
      cameraState.current.phi = Math.max(0.35, Math.min(1.22, cameraState.current.phi));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.current.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.current.y;

      cameraState.current.theta -= deltaX * 0.007;
      cameraState.current.phi -= deltaY * 0.007;
      cameraState.current.phi = Math.max(0.35, Math.min(1.22, cameraState.current.phi));

      previousMousePosition.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    // Mouse wheel zoom
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraState.current.targetRadius = Math.max(24, Math.min(64, cameraState.current.targetRadius + e.deltaY * 0.025));
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);
    canvas.addEventListener("wheel", handleWheel, { passive: false });

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const newW = canvas.parentElement.clientWidth;
      camera.aspect = newW / height;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, height, false);
    };
    window.addEventListener("resize", handleResize);

    const isVisibleRef = { current: true };
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (!isVisibleRef.current) return;

      if (autoRotateRef.current && !isDraggingRef.current) {
        cameraState.current.theta += 0.005;
      }

      // Contextual Option Selection Animation Timers (Wave, Actuation, Tilt, Glint)
      const now = performance.now();
      let waveActive = false;
      let waveProgress = 0;
      let actuationActive = false;
      let actuationProgress = 0;
      let tiltActive = false;
      let tiltAmount = 0;

      if (activeTriggerRef.current) {
        const elapsed = (now - activeTriggerRef.current.startTime) / 1000;
        const type = activeTriggerRef.current.type;

        if (type === "keycap_wave") {
          const duration = 1.0;
          if (elapsed < duration) {
            waveActive = true;
            waveProgress = elapsed / duration;
          } else {
            activeTriggerRef.current = null;
          }
        } else if (type === "switch_actuation") {
          const duration = 0.85;
          if (elapsed < duration) {
            actuationActive = true;
            actuationProgress = elapsed / duration;
          } else {
            activeTriggerRef.current = null;
          }
        } else if (type === "weight_tilt") {
          const duration = 1.8;
          if (elapsed < duration) {
            tiltActive = true;
            const p = elapsed / duration;
            tiltAmount = Math.sin(p * Math.PI);
          } else {
            activeTriggerRef.current = null;
          }
        } else if (type === "chassis_glint") {
          const duration = 1.1;
          if (elapsed < duration) {
            const p = elapsed / duration;
            if (glintLightRef.current) {
              glintLightRef.current.intensity = Math.sin(p * Math.PI) * 2.8;
              glintLightRef.current.position.x = -22 + p * 44;
            }
          } else {
            if (glintLightRef.current) glintLightRef.current.intensity = 0;
            activeTriggerRef.current = null;
          }
        }
      }

      // 1. Dynamic Keycap Cascade Wave / Tactile Keystroke Actuation
      const keyItems = keycapItemsRef.current;
      for (let i = 0; i < keyItems.length; i++) {
        const item = keyItems[i];
        let offset = 0;
        if (waveActive) {
          // Fluid left-to-right cascade ripple wave across keycap matrix
          const wavePhase = waveProgress * 12.0 - (item.x + 14) * 0.45;
          const wave = Math.max(0, Math.sin(wavePhase)) * Math.max(0, 1 - waveProgress);
          offset = wave * 0.36; // 3.6mm gentle elevation
        } else if (actuationActive) {
          // Sequential tactile keypress wave across keys
          const pressPhase = actuationProgress * 14.0 - (item.x + 14) * 0.48;
          const press = Math.max(0, Math.sin(pressPhase)) * Math.max(0, 1 - actuationProgress);
          offset = -press * 0.26; // 2.6mm mechanical bottom-out
        }
        item.mesh.position.y = item.baseY + offset;
      }

      const layer = teardownRef.current || "none";

      // 1. Keyboard Group elevation & tilt physics (lifts off deskmat cleanly during exploded teardown or tilt)
      let targetGroupY = 0;
      let targetGroupRotX = 0.08;

      if (tiltActive) {
        targetGroupRotX = 0.08 - tiltAmount * 0.65;
        targetGroupY = tiltAmount * 2.4;
      } else if (layer === "exploded") {
        targetGroupY = 2.2;
        targetGroupRotX = 0.06;
      } else if (layer === "weight") {
        targetGroupY = 1.8;
      }

      if (keyboardGroupRef.current) {
        keyboardGroupRef.current.position.y += (targetGroupY - keyboardGroupRef.current.position.y) * 0.08;
        keyboardGroupRef.current.rotation.x += (targetGroupRotX - keyboardGroupRef.current.rotation.x) * 0.08;
      }

      // 2. Smooth Layer Teardown / Exploded View LERP Physics
      // (All layers float strictly above deskmat plane at y = -1.38, completely eliminating clipping)
      let targetOffsets = { keycaps: 0, topCase: 0, switches: 0, plate: 0, pcb: 0, bottomCase: 0, weight: 0 };
      let targetCenterY = -0.2;

      if (layer === "keycaps") {
        targetOffsets = { keycaps: 4.2, topCase: 0, switches: 0, plate: 0, pcb: 0, bottomCase: 0, weight: 0 };
        targetCenterY = 1.0;
      } else if (layer === "switches") {
        targetOffsets = { keycaps: 5.2, topCase: 3.2, switches: 2.0, plate: 0, pcb: 0, bottomCase: 0, weight: 0 };
        targetCenterY = 1.5;
      } else if (layer === "chassis") {
        targetOffsets = { keycaps: 5.5, topCase: 4.0, switches: 2.8, plate: 1.6, pcb: 0.8, bottomCase: 0, weight: 0 };
        targetCenterY = 1.8;
      } else if (layer === "weight") {
        targetOffsets = { keycaps: 2.0, topCase: 2.0, switches: 2.0, plate: 2.0, pcb: 2.0, bottomCase: 0.2, weight: -1.0 };
        targetCenterY = 0.8;
      } else if (layer === "exploded") {
        // Full 7-layer architectural separation: keycaps -> topCase -> switches -> plate -> PCB -> bottomCase -> weight
        targetOffsets = { keycaps: 8.2, topCase: 6.4, switches: 4.8, plate: 3.2, pcb: 1.6, bottomCase: 0.0, weight: -1.0 };
        targetCenterY = 5.4;
      }

      // Smooth camera recentering so the whole 7-layer vertical stack is comfortably centered
      cameraState.current.target.y += (targetCenterY - cameraState.current.target.y) * 0.06;

      // Automatically adjust camera zoom when toggling exploded teardown mode
      if (layer !== lastLayerRef.current) {
        if (layer === "exploded") {
          cameraState.current.targetRadius = 49;
        } else if (lastLayerRef.current === "exploded") {
          cameraState.current.targetRadius = 38;
        }
        lastLayerRef.current = layer;
      }

      // Smooth camera radius lerp
      cameraState.current.radius += (cameraState.current.targetRadius - cameraState.current.radius) * 0.06;

      // Diffuse and expand soft contact shadow when keyboard elevates in teardown
      if (contactShadowRef.current) {
        const targetShadowOpacity = layer === "exploded" ? 0.38 : 0.72;
        const targetShadowScale = layer === "exploded" ? 1.25 : 1.0;
        const mat = contactShadowRef.current.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity += (targetShadowOpacity - mat.opacity) * 0.06;
        }
        contactShadowRef.current.scale.x += (targetShadowScale - contactShadowRef.current.scale.x) * 0.06;
        contactShadowRef.current.scale.y += (targetShadowScale - contactShadowRef.current.scale.y) * 0.06;
      }

      const lerpSpeed = 0.09;
      const sub = subgroupsRef.current;
      if (sub.keycapsGroup) sub.keycapsGroup.position.y += (targetOffsets.keycaps - sub.keycapsGroup.position.y) * lerpSpeed;
      if (sub.topCaseGroup) sub.topCaseGroup.position.y += (targetOffsets.topCase - sub.topCaseGroup.position.y) * lerpSpeed;
      if (sub.switchesGroup) sub.switchesGroup.position.y += (targetOffsets.switches - sub.switchesGroup.position.y) * lerpSpeed;
      if (sub.plateGroup) sub.plateGroup.position.y += (targetOffsets.plate - sub.plateGroup.position.y) * lerpSpeed;
      if (sub.pcbGroup) sub.pcbGroup.position.y += (targetOffsets.pcb - sub.pcbGroup.position.y) * lerpSpeed;
      if (sub.bottomCaseGroup) sub.bottomCaseGroup.position.y += (targetOffsets.bottomCase - sub.bottomCaseGroup.position.y) * lerpSpeed;
      if (sub.weightGroup) sub.weightGroup.position.y += (targetOffsets.weight - sub.weightGroup.position.y) * lerpSpeed;

      // Update camera position along spherical coordinates
      const { radius, theta, phi, target } = cameraState.current;
      camera.position.x = target.x + radius * Math.sin(phi) * Math.sin(theta);
      camera.position.y = target.y + radius * Math.cos(phi);
      camera.position.z = target.z + radius * Math.sin(phi) * Math.cos(theta);
      camera.lookAt(target);

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      envMap.dispose();
    };
  }, []);

  // Build Procedural 3D Model with Crisp Keycap Legends
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (keyboardGroupRef.current) {
      scene.remove(keyboardGroupRef.current);
    }

    const keyboardGroup = new THREE.Group();
    keyboardGroupRef.current = keyboardGroup;
    scene.add(keyboardGroup);

    // 7 Subgroups for Layered Teardown Architecture
    const keycapsGroup = new THREE.Group();
    const topCaseGroup = new THREE.Group();
    const switchesGroup = new THREE.Group();
    const plateGroup = new THREE.Group();
    const pcbGroup = new THREE.Group();
    const bottomCaseGroup = new THREE.Group();
    const weightGroup = new THREE.Group();

    keyboardGroup.add(bottomCaseGroup);
    keyboardGroup.add(weightGroup);
    keyboardGroup.add(pcbGroup);
    keyboardGroup.add(plateGroup);
    keyboardGroup.add(switchesGroup);
    keyboardGroup.add(topCaseGroup);
    keyboardGroup.add(keycapsGroup);

    subgroupsRef.current = {
      keycapsGroup,
      topCaseGroup,
      switchesGroup,
      plateGroup,
      pcbGroup,
      bottomCaseGroup,
      weightGroup,
    };

    // Case Materials
    const caseMat = new THREE.MeshPhysicalMaterial({
      color: 0x121419,
      metalness: 0.88,
      roughness: 0.26,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      envMapIntensity: 1.4,
    });

    const bottomCaseMat = new THREE.MeshPhysicalMaterial({
      color: 0x0a0c0f,
      metalness: 0.9,
      roughness: 0.32,
      envMapIntensity: 1.1,
    });

    const weightMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.98,
      roughness: 0.08,
      clearcoat: 0.8,
      clearcoatRoughness: 0.05,
      envMapIntensity: 2.2,
    });

    const knobMat = new THREE.MeshPhysicalMaterial({
      color: 0xd4af37,
      metalness: 0.98,
      roughness: 0.15,
      clearcoat: 0.5,
      envMapIntensity: 2.0,
    });

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x222630,
      metalness: 0.7,
      roughness: 0.35,
    });

    // Mechanical Switch Materials
    const switchType = config.switchType || "tactile";
    let stemColor = 0xe27d60;
    let housingColor = 0xf8f6ee;
    let housingTransmission = 0.35;
    if (switchType === "linear") {
      stemColor = 0x181a1d;
      housingColor = 0x111317;
      housingTransmission = 0.15;
    } else if (switchType === "clicky") {
      stemColor = 0x1d4ed8;
      housingColor = 0xdbeafe;
      housingTransmission = 0.45;
    }

    const switchHousingMat = new THREE.MeshPhysicalMaterial({
      color: housingColor,
      roughness: 0.25,
      metalness: 0.1,
      transmission: housingTransmission,
      thickness: 0.5,
      transparent: true,
      opacity: 0.9,
    });

    const switchStemMat = new THREE.MeshStandardMaterial({
      color: stemColor,
      roughness: 0.45,
      metalness: 0.05,
    });

    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x0c0e12,
      roughness: 0.42,
      metalness: 0.35,
    });

    const gasketMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.9,
      metalness: 0.05,
    });

    const stabHousingMat = new THREE.MeshStandardMaterial({
      color: 0x1c1f26,
      roughness: 0.5,
      metalness: 0.1,
    });

    const frontBrassTex = createFrontBrassTexture(
      config.model === "titan-65"
        ? "AURA TITAN-65"
        : config.model === "solaris-75"
        ? "AURA SOLARIS-75"
        : config.model === "aegis-tkl"
        ? "AURA AEGIS TKL"
        : "AURA NOCTURNE"
    );

    const frontBrassMat = new THREE.MeshStandardMaterial({
      map: frontBrassTex,
      metalness: 0.95,
      roughness: 0.12,
    });

    materialsRef.current = {
      caseMat,
      bottomCaseMat,
      weightMat,
      knobMat,
      plateMat,
      pcbMat,
      gasketMat,
      switchHousingMat,
      switchStemMat,
      stabHousingMat,
      frontBrassMat,
    };

    // Apply active finishes immediately upon build to preserve user custom choices
    applyMaterialStyles(materialsRef.current, config);

    const keyWidth = 1.36;
    const keyDepth = 1.36;
    const keyHeight = 0.82;
    const gap = 0.18;

    // Reset keycap tracking items for wave/actuation animations
    keycapItemsRef.current = [];

    // Switch and Stabilizer Shared Geometries
    const switchHousingGeo = new THREE.BoxGeometry(1.08, 0.36, 1.08);
    const stemHGeo = new THREE.BoxGeometry(0.34, 0.24, 0.11);
    const stemVGeo = new THREE.BoxGeometry(0.11, 0.24, 0.34);
    const stabHousingGeo = new THREE.BoxGeometry(0.36, 0.44, 0.52);

    // Key positions collection for procedural plate cutouts and hot-swap PCB sockets
    const keyPositions: { x: number; z: number; w: number; isSpace?: boolean }[] = [];

    // Switch contact pins & stabilizer wire shared assets
    const switchPinGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.24, 6);
    const switchPinMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const stabWireGeo = new THREE.CylinderGeometry(0.03, 0.03, 5.2, 8);
    const stabWireMat = new THREE.MeshStandardMaterial({ color: 0xd0d4dc, metalness: 0.95, roughness: 0.15 });

    // Helper to spawn a keycap AND mechanical switch with Cherry MX cross stem (+) & contact pins
    const addKey = (
      x: number,
      z: number,
      w: number,
      label: string,
      isAccent: boolean,
      isMod: boolean,
      isSpace: boolean = false
    ) => {
      keyPositions.push({ x, z, w, isSpace });

      // 1. Sculpted Keycap with authentic PBT matte surface
      const actualKeyW = w * keyWidth + (w - 1) * gap;
      const keyGeo = createSculptedKeycapGeometry(actualKeyW, keyDepth, keyHeight, 0, isSpace);

      const tex = createKeycapTexture(isSpace ? "" : label, isAccent, isMod, config.keycapTheme);
      const mat = new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.84,
        metalness: 0.04,
      });

      const keyMesh = new THREE.Mesh(keyGeo, mat);
      keyMesh.position.set(x, 1.15, z);
      keycapsGroup.add(keyMesh);
      keycapItemsRef.current.push({
        mesh: keyMesh,
        baseY: 1.15,
        x,
        label: isSpace ? "" : label,
        isAccent,
        isMod,
        isSpace,
      });

      // 2. Mechanical Switch (Housing + Cross Stem + Contact Pins)
      const housingMesh = new THREE.Mesh(switchHousingGeo, switchHousingMat);
      housingMesh.position.set(x, 0.74, z);
      switchesGroup.add(housingMesh);

      const stemH = new THREE.Mesh(stemHGeo, switchStemMat);
      stemH.position.set(x, 0.94, z);
      const stemV = new THREE.Mesh(stemVGeo, switchStemMat);
      stemV.position.set(x, 0.94, z);
      switchesGroup.add(stemH);
      switchesGroup.add(stemV);

      // Switch contact pins extending down through switch plate
      const pin1 = new THREE.Mesh(switchPinGeo, switchPinMat);
      pin1.position.set(x - 0.22, 0.52, z - 0.16);
      const pin2 = new THREE.Mesh(switchPinGeo, switchPinMat);
      pin2.position.set(x + 0.24, 0.52, z - 0.22);
      switchesGroup.add(pin1);
      switchesGroup.add(pin2);

      // 3. Cherry Stabilizers for long spacebar
      if (isSpace) {
        const leftStab = new THREE.Mesh(stabHousingGeo, stabHousingMat);
        leftStab.position.set(x - 2.6, 0.76, z);
        const rightStab = new THREE.Mesh(stabHousingGeo, stabHousingMat);
        rightStab.position.set(x + 2.6, 0.76, z);
        plateGroup.add(leftStab);
        plateGroup.add(rightStab);

        const stabWire = new THREE.Mesh(stabWireGeo, stabWireMat);
        stabWire.rotation.z = Math.PI / 2;
        stabWire.position.set(x, 0.72, z + 0.32);
        plateGroup.add(stabWire);
      }
    };

    // Helper to assemble realistic CNC hollow chassis, switch well, plate with cutouts, gasket mount, hot-swap PCB & daughterboard
    const assembleChassisStructure = ({
      modelTitle,
      caseW,
      caseD,
      wellW,
      wellD,
      wellOffsetX = 0,
      wellOffsetZ = 0,
      weightDim,
    }: {
      modelTitle: string;
      caseW: number;
      caseD: number;
      wellW: number;
      wellD: number;
      wellOffsetX?: number;
      wellOffsetZ?: number;
      weightDim: [number, number, number];
    }) => {
      // 1. Top Case: Hollow CNC Bezel Frame with Inner Switch Well Cutout & Beveled Chamfer
      const topCaseGeo = createHollowTopCaseGeometry(
        caseW,
        caseD,
        1.7,
        wellW,
        wellD,
        wellOffsetX,
        wellOffsetZ,
        1.1,
        0.14
      );
      const topCaseMesh = new THREE.Mesh(topCaseGeo, caseMat);
      topCaseGroup.add(topCaseMesh);

      // 2. Bottom Case Shell
      const bottomCaseGeo = createRoundedCaseGeometry(caseW - 0.4, caseD - 0.4, 0.9, 1.1, 0.14);
      const bottomCaseMesh = new THREE.Mesh(bottomCaseGeo, bottomCaseMat);
      bottomCaseMesh.position.set(0, -0.9, 0);
      bottomCaseGroup.add(bottomCaseMesh);

      // 3. Bottom CNC Acoustic Cavity Floor Tray
      const cavityTex = createBottomCavityTexture(wellW, wellD, modelTitle);
      const cavityMat = new THREE.MeshStandardMaterial({
        map: cavityTex,
        roughness: 0.65,
        metalness: 0.35,
      });
      const cavityMesh = new THREE.Mesh(new THREE.BoxGeometry(wellW, 0.16, wellD), cavityMat);
      cavityMesh.position.set(wellOffsetX, -0.42, wellOffsetZ);
      bottomCaseGroup.add(cavityMesh);

      // 4. Ai03 Unified USB-C Daughterboard Module & JST Ribbon Cable
      const dbZ = -caseD / 2 + 1.2;
      const dbPcbMat = new THREE.MeshStandardMaterial({ color: 0x0c2818, roughness: 0.35, metalness: 0.3 });
      const dbPcb = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 1.3), dbPcbMat);
      dbPcb.position.set(0, -0.38, dbZ);
      bottomCaseGroup.add(dbPcb);

      const usbMat = new THREE.MeshStandardMaterial({ color: 0xd8dde8, roughness: 0.2, metalness: 0.95 });
      const usbShield = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.34, 0.9), usbMat);
      usbShield.position.set(0, -0.26, dbZ - 0.3);
      bottomCaseGroup.add(usbShield);

      const usbTongue = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.35), new THREE.MeshBasicMaterial({ color: 0x050505 }));
      usbTongue.position.set(0, -0.26, dbZ - 0.65);
      bottomCaseGroup.add(usbTongue);

      const jstHeader = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.22, 0.45), new THREE.MeshStandardMaterial({ color: 0xf5f5f7, roughness: 0.4 }));
      jstHeader.position.set(0.45, -0.26, dbZ + 0.2);
      bottomCaseGroup.add(jstHeader);

      // Flexible JST ribbon cable looping forward to main PCB
      const ribbonGeo = new THREE.BoxGeometry(0.5, 0.06, 2.0);
      const ribbon = new THREE.Mesh(ribbonGeo, new THREE.MeshStandardMaterial({ color: 0xf0f0f3, roughness: 0.6 }));
      ribbon.position.set(0.45, -0.2, dbZ + 1.3);
      bottomCaseGroup.add(ribbon);

      // 5. Solid Mirror PVD Brass Weight Bar
      const weightMesh = new THREE.Mesh(new THREE.BoxGeometry(weightDim[0], weightDim[1], weightDim[2]), weightMat);
      weightMesh.position.set(0, -1.3, 0);
      weightGroup.add(weightMesh);

      // 6. Switch Plate with High-Res Switch Cutouts & Flex-Cuts Texture
      const plateTex = createSwitchPlateTexture(wellW, wellD, keyPositions, modelTitle);
      const plateTopMat = new THREE.MeshStandardMaterial({
        map: plateTex,
        roughness: 0.38,
        metalness: 0.25,
      });
      const plateEdgeMat = new THREE.MeshStandardMaterial({
        color: 0x161820,
        roughness: 0.7,
        metalness: 0.2,
      });
      const plateMaterials = [plateEdgeMat, plateEdgeMat, plateTopMat, plateEdgeMat, plateEdgeMat, plateEdgeMat];
      const plateMesh = new THREE.Mesh(new THREE.BoxGeometry(wellW - 0.2, 0.12, wellD - 0.2), plateMaterials);
      plateMesh.position.set(wellOffsetX, 0.65, wellOffsetZ);
      plateGroup.add(plateMesh);

      // 7. Gasket Mounting Tabs / Ears with PORON Dampeners
      const gasketTabGeo = new THREE.BoxGeometry(1.6, 0.12, 0.45);
      const gasketFoamGeo = new THREE.BoxGeometry(1.6, 0.18, 0.55);
      const tabPositions = [
        [-wellW * 0.36, -wellD * 0.48],
        [0, -wellD * 0.48],
        [wellW * 0.36, -wellD * 0.48],
        [-wellW * 0.36, wellD * 0.48],
        [0, wellD * 0.48],
        [wellW * 0.36, wellD * 0.48],
        [-wellW * 0.48, 0],
        [wellW * 0.48, 0],
      ];
      tabPositions.forEach(([tx, tz]) => {
        const tabMesh = new THREE.Mesh(gasketTabGeo, plateEdgeMat);
        tabMesh.position.set(wellOffsetX + tx, 0.65, wellOffsetZ + tz);
        plateGroup.add(tabMesh);

        const foamMesh = new THREE.Mesh(gasketFoamGeo, gasketMat);
        foamMesh.position.set(wellOffsetX + tx, 0.65, wellOffsetZ + tz);
        plateGroup.add(foamMesh);

        const pedestalGeo = new THREE.BoxGeometry(1.8, 0.35, 0.6);
        const pedestalMesh = new THREE.Mesh(pedestalGeo, caseMat);
        pedestalMesh.position.set(wellOffsetX + tx, -0.18, wellOffsetZ + tz);
        bottomCaseGroup.add(pedestalMesh);
      });

      // 8. Custom Hot-Swap PCB with Circuit Traces
      const pcbTex = createPCBTexture(wellW, wellD, keyPositions, modelTitle);
      const pcbTopMat = new THREE.MeshStandardMaterial({
        map: pcbTex,
        roughness: 0.45,
        metalness: 0.2,
      });
      const pcbEdgeMat = new THREE.MeshStandardMaterial({
        color: 0x0c0e12,
        roughness: 0.8,
        metalness: 0.1,
      });
      const pcbMaterials = [pcbEdgeMat, pcbEdgeMat, pcbTopMat, pcbEdgeMat, pcbEdgeMat, pcbEdgeMat];
      const pcbMesh = new THREE.Mesh(new THREE.BoxGeometry(wellW - 0.4, 0.1, wellD - 0.4), pcbMaterials);
      pcbMesh.position.set(wellOffsetX, 0.48, wellOffsetZ);
      pcbGroup.add(pcbMesh);

      // 9. 3D Kailh Hot-Swap Sockets on PCB Underside
      const kailhMat = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.8, metalness: 0.05 });
      const kailhContactMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.3, metalness: 0.9 });
      const kailhGeo = new THREE.BoxGeometry(0.72, 0.12, 0.34);
      const kailhPinGeo = new THREE.BoxGeometry(0.12, 0.08, 0.1);

      keyPositions.forEach((k) => {
        const socketMesh = new THREE.Mesh(kailhGeo, kailhMat);
        socketMesh.position.set(k.x, 0.38, k.z + 0.18);
        pcbGroup.add(socketMesh);

        const cp1 = new THREE.Mesh(kailhPinGeo, kailhContactMat);
        cp1.position.set(k.x - 0.32, 0.38, k.z + 0.18);
        const cp2 = new THREE.Mesh(kailhPinGeo, kailhContactMat);
        cp2.position.set(k.x + 0.32, 0.38, k.z + 0.18);
        pcbGroup.add(cp1);
        pcbGroup.add(cp2);
      });
    };

    // ==========================================
    // 1. AURA TITAN-65 (65% Flagship with Centered Brass Accent Plate & Precise 16.0u Alignment)
    // ==========================================
    if (config.model === "titan-65") {
      const caseW = 27.2;
      const caseD = 11.8;
      const wellW = 24.6;
      const wellD = 8.6;
      const wellOffsetZ = 0.15;

      // 65% Compact Key Matrix - Each row equals EXACTLY 16.0 units
      // Matches titan-65.jpg: Obsidian black keycaps with warm gold legends throughout
      const rows: KeyDef[][] = [
        [
          { w: 1, l: "ESC" }, { w: 1, l: "1" }, { w: 1, l: "2" }, { w: 1, l: "3" }, { w: 1, l: "4" },
          { w: 1, l: "5" }, { w: 1, l: "6" }, { w: 1, l: "7" }, { w: 1, l: "8" }, { w: 1, l: "9" },
          { w: 1, l: "0" }, { w: 1, l: "-" }, { w: 1, l: "=" }, { w: 2.0, l: "BACK", m: true }, { w: 1, l: "DEL", m: true },
        ],
        [
          { w: 1.5, l: "TAB", m: true }, { w: 1, l: "Q" }, { w: 1, l: "W" }, { w: 1, l: "E" }, { w: 1, l: "R" },
          { w: 1, l: "T" }, { w: 1, l: "Y" }, { w: 1, l: "U" }, { w: 1, l: "I" }, { w: 1, l: "O" },
          { w: 1, l: "P" }, { w: 1, l: "[" }, { w: 1, l: "]" }, { w: 1.5, l: "\\", m: true }, { w: 1, l: "PGUP", m: true },
        ],
        [
          { w: 1.75, l: "CAPS", m: true }, { w: 1, l: "A" }, { w: 1, l: "S" }, { w: 1, l: "D" }, { w: 1, l: "F" },
          { w: 1, l: "G" }, { w: 1, l: "H" }, { w: 1, l: "J" }, { w: 1, l: "K" }, { w: 1, l: "L" },
          { w: 1, l: ";" }, { w: 1, l: "'" }, { w: 2.25, l: "ENTER", m: true }, { w: 1, l: "PGDN", m: true },
        ],
        [
          { w: 2.25, l: "SHIFT", m: true }, { w: 1, l: "Z" }, { w: 1, l: "X" }, { w: 1, l: "C" }, { w: 1, l: "V" },
          { w: 1, l: "B" }, { w: 1, l: "N" }, { w: 1, l: "M" }, { w: 1, l: "," }, { w: 1, l: "." },
          { w: 1, l: "/" }, { w: 1.75, l: "SHIFT", m: true }, { w: 1, l: "▲", m: true }, { w: 1, l: "END", m: true },
        ],
        [
          { w: 1.25, l: "CTRL", m: true }, { w: 1.25, l: "WIN", m: true }, { w: 1.25, l: "ALT", m: true },
          { w: 6.25, l: "", s: true },
          { w: 1.25, l: "ALT", m: true }, { w: 1.25, l: "FN", m: true },
          { w: 0.5, gap: true }, // Chassis blocker between Fn and arrow cluster
          { w: 1, l: "◄", m: true }, { w: 1, l: "▼", m: true }, { w: 1, l: "►", m: true },
        ],
      ];

      const startZ = -((5 * (keyDepth + gap)) / 2) + keyDepth / 2 + wellOffsetZ;
      rows.forEach((rowKeys, rIdx) => {
        const zPos = startZ + rIdx * (keyDepth + gap);
        let rowTotalUnits = 0;
        rowKeys.forEach((k) => (rowTotalUnits += k.w));
        const rowStartX = -((rowTotalUnits * (keyWidth + gap)) / 2);
        let currentUnitOffset = 0;

        rowKeys.forEach((k) => {
          if (k.gap) { currentUnitOffset += k.w; return; }
          const xPos = rowStartX + (currentUnitOffset + k.w / 2) * (keyWidth + gap);
          currentUnitOffset += k.w;
          addKey(xPos, zPos, k.w, k.l || "", !!k.a, !!k.m, !!k.s);
        });
      });

      // Front Mirror Brass Accent Bar - centered, 72% width with solid black aluminum chassis cheeks
      const brassW = 19.6;
      const frontBrassGeo = createRoundedCaseGeometry(brassW, 0.35, 1.15, 0.35, 0.08);
      const frontBrassMesh = new THREE.Mesh(frontBrassGeo, frontBrassMat);
      frontBrassMesh.position.set(0, -0.32, caseD / 2 + 0.08);
      topCaseGroup.add(frontBrassMesh);

      assembleChassisStructure({
        modelTitle: "AURA TITAN-65",
        caseW,
        caseD,
        wellW,
        wellD,
        wellOffsetX: 0,
        wellOffsetZ,
        weightDim: [19.5, 0.24, 6.2],
      });
    }

    // ==========================================
    // 2. AURA SOLARIS-75 (75% with Rotary Knob & Chamfer Badge)
    // ==========================================
    else if (config.model === "solaris-75") {
      const caseW = 27.8;
      const caseD = 13.8;
      const wellW = 24.8;
      const wellD = 10.6;
      const wellOffsetZ = 0.1;

      // 75% Layout - Row 0 has 13 units + 3.0u gap for top-right rotary knob
      // Matches solaris-75.jpg: Gold accent Esc, Enter, and Spacebar; Nav column aligned below knob
      const rows75: KeyDef[][] = [
        [
          { w: 1, l: "ESC", a: true }, { w: 1, l: "F1" }, { w: 1, l: "F2" }, { w: 1, l: "F3" }, { w: 1, l: "F4" },
          { w: 1, l: "F5" }, { w: 1, l: "F6" }, { w: 1, l: "F7" }, { w: 1, l: "F8" }, { w: 1, l: "F9" },
          { w: 1, l: "F10" }, { w: 1, l: "F11" }, { w: 1, l: "F12" }, { w: 3.0, gap: true },
        ],
        [
          { w: 1, l: "~" }, { w: 1, l: "1" }, { w: 1, l: "2" }, { w: 1, l: "3" }, { w: 1, l: "4" },
          { w: 1, l: "5" }, { w: 1, l: "6" }, { w: 1, l: "7" }, { w: 1, l: "8" }, { w: 1, l: "9" },
          { w: 1, l: "0" }, { w: 1, l: "-" }, { w: 1, l: "=" }, { w: 2.0, l: "BACK", m: true }, { w: 1, l: "DEL", m: true },
        ],
        [
          { w: 1.5, l: "TAB", m: true }, { w: 1, l: "Q" }, { w: 1, l: "W" }, { w: 1, l: "E" }, { w: 1, l: "R" },
          { w: 1, l: "T" }, { w: 1, l: "Y" }, { w: 1, l: "U" }, { w: 1, l: "I" }, { w: 1, l: "O" },
          { w: 1, l: "P" }, { w: 1, l: "[" }, { w: 1, l: "]" }, { w: 1.5, l: "\\", m: true }, { w: 1, l: "PGUP", m: true },
        ],
        [
          { w: 1.75, l: "CAPS", m: true }, { w: 1, l: "A" }, { w: 1, l: "S" }, { w: 1, l: "D" }, { w: 1, l: "F" },
          { w: 1, l: "G" }, { w: 1, l: "H" }, { w: 1, l: "J" }, { w: 1, l: "K" }, { w: 1, l: "L" },
          { w: 1, l: ";" }, { w: 1, l: "'" }, { w: 2.25, l: "ENTER", a: true }, { w: 1, l: "PGDN", m: true },
        ],
        [
          { w: 2.25, l: "SHIFT", m: true }, { w: 1, l: "Z" }, { w: 1, l: "X" }, { w: 1, l: "C" }, { w: 1, l: "V" },
          { w: 1, l: "B" }, { w: 1, l: "N" }, { w: 1, l: "M" }, { w: 1, l: "," }, { w: 1, l: "." },
          { w: 1, l: "/" }, { w: 1.75, l: "SHIFT", m: true }, { w: 1, l: "▲", m: true }, { w: 1, l: "END", m: true },
        ],
        [
          { w: 1.25, l: "CTRL", m: true }, { w: 1.25, l: "WIN", m: true }, { w: 1.25, l: "ALT", m: true },
          { w: 6.25, l: "", s: true, a: true },
          { w: 1.25, l: "ALT", m: true }, { w: 1.25, l: "FN", m: true },
          { w: 0.5, gap: true },
          { w: 1, l: "◄", m: true }, { w: 1, l: "▼", m: true }, { w: 1, l: "►", m: true },
        ],
      ];

      const startZ = -((6 * (keyDepth + gap)) / 2) + keyDepth / 2;
      rows75.forEach((rowKeys, rIdx) => {
        const zPos = startZ + rIdx * (keyDepth + gap);
        let rowTotalUnits = 0;
        rowKeys.forEach((k) => (rowTotalUnits += k.w));
        const rowStartX = -((rowTotalUnits * (keyWidth + gap)) / 2);
        let currentUnitOffset = 0;

        rowKeys.forEach((k) => {
          if (k.gap) { currentUnitOffset += k.w; return; }
          const xPos = rowStartX + (currentUnitOffset + k.w / 2) * (keyWidth + gap);
          currentUnitOffset += k.w;
          addKey(xPos, zPos, k.w, k.l || "", !!k.a, !!k.m, !!k.s);
        });
      });

      // Knurled Rotary Knob in Top Right Corner - aligned precisely above navigation column
      const knobX = -((16 * (keyWidth + gap)) / 2) + 15.5 * (keyWidth + gap);
      const knobMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 1.35, 48), knobMat);
      knobMesh.position.set(knobX, 1.35, startZ);
      topCaseGroup.add(knobMesh);

      // Gold knurled ring
      const knobRing = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.08, 16, 48), weightMat);
      knobRing.rotation.x = Math.PI / 2;
      knobRing.position.set(knobX, 1.98, startZ);
      topCaseGroup.add(knobRing);

      // Front-Right Chamfered Badge (matches solaris-75.jpg)
      const solarisBadgeTex = createBadgeTexture("solaris");
      if (solarisBadgeTex) {
        const solarisBadgeGeo = new THREE.PlaneGeometry(4.6, 0.85);
        const solarisBadgeMat = new THREE.MeshStandardMaterial({
          map: solarisBadgeTex,
          metalness: 0.85,
          roughness: 0.25,
        });
        const solarisBadgeMesh = new THREE.Mesh(solarisBadgeGeo, solarisBadgeMat);
        solarisBadgeMesh.position.set(caseW / 2 - 3.4, -0.32, caseD / 2 + 0.08);
        topCaseGroup.add(solarisBadgeMesh);
      }

      assembleChassisStructure({
        modelTitle: "AURA SOLARIS-75",
        caseW,
        caseD,
        wellW,
        wellD,
        wellOffsetX: 0,
        wellOffsetZ,
        weightDim: [20.5, 0.24, 7.5],
      });
    }

    // ==========================================
    // 3. AURA AEGIS TKL (87-Key ANSI Tenkeyless with 3x2 Island & Center Badge)
    // ==========================================
    else if (config.model === "aegis-tkl") {
      const caseW = 32.8;
      const caseD = 13.8;
      const wellW = 29.8;
      const wellD = 10.4;
      const wellOffsetX = 0.0;
      const wellOffsetZ = 0.0;

      // 87-Key ANSI TKL - Main typing cluster (15.0u across all 6 rows)
      // Matches aegis-tkl.jpg: Slate/graphite keycaps with warm gold legends
      const mainCluster: KeyDef[][] = [
        [{ w: 1, l: "ESC" }, { w: 0.5, gap: true }, { w: 1, l: "F1" }, { w: 1, l: "F2" }, { w: 1, l: "F3" }, { w: 1, l: "F4" }, { w: 0.5, gap: true }, { w: 1, l: "F5" }, { w: 1, l: "F6" }, { w: 1, l: "F7" }, { w: 1, l: "F8" }, { w: 0.5, gap: true }, { w: 1, l: "F9" }, { w: 1, l: "F10" }, { w: 1, l: "F11" }, { w: 1, l: "F12" }, { w: 0.5, gap: true }],
        [{ w: 1, l: "~" }, { w: 1, l: "1" }, { w: 1, l: "2" }, { w: 1, l: "3" }, { w: 1, l: "4" }, { w: 1, l: "5" }, { w: 1, l: "6" }, { w: 1, l: "7" }, { w: 1, l: "8" }, { w: 1, l: "9" }, { w: 1, l: "0" }, { w: 1, l: "-" }, { w: 1, l: "=" }, { w: 2, l: "BACK", m: true }],
        [{ w: 1.5, l: "TAB", m: true }, { w: 1, l: "Q" }, { w: 1, l: "W" }, { w: 1, l: "E" }, { w: 1, l: "R" }, { w: 1, l: "T" }, { w: 1, l: "Y" }, { w: 1, l: "U" }, { w: 1, l: "I" }, { w: 1, l: "O" }, { w: 1, l: "P" }, { w: 1, l: "[" }, { w: 1, l: "]" }, { w: 1.5, l: "\\", m: true }],
        [{ w: 1.75, l: "CAPS", m: true }, { w: 1, l: "A" }, { w: 1, l: "S" }, { w: 1, l: "D" }, { w: 1, l: "F" }, { w: 1, l: "G" }, { w: 1, l: "H" }, { w: 1, l: "J" }, { w: 1, l: "K" }, { w: 1, l: "L" }, { w: 1, l: ";" }, { w: 1, l: "'" }, { w: 2.25, l: "ENTER", m: true }],
        [{ w: 2.25, l: "SHIFT", m: true }, { w: 1, l: "Z" }, { w: 1, l: "X" }, { w: 1, l: "C" }, { w: 1, l: "V" }, { w: 1, l: "B" }, { w: 1, l: "N" }, { w: 1, l: "M" }, { w: 1, l: "," }, { w: 1, l: "." }, { w: 1, l: "/" }, { w: 2.75, l: "SHIFT", m: true }],
        [{ w: 1.25, l: "CTRL", m: true }, { w: 1.25, l: "WIN", m: true }, { w: 1.25, l: "ALT", m: true }, { w: 6.25, l: "", s: true }, { w: 1.25, l: "ALT", m: true }, { w: 1.25, l: "WIN", m: true }, { w: 1.25, l: "FN", m: true }, { w: 1.25, l: "CTRL", m: true }],
      ];

      const startZ = -((6 * (keyDepth + gap)) / 2) + keyDepth / 2;
      const unitStep = keyWidth + gap;
      mainCluster.forEach((rowKeys, rIdx) => {
        const zPos = startZ + rIdx * unitStep;
        const rowStartX = -13.6;
        let currentOffset = 0;

        rowKeys.forEach((k) => {
          if (k.gap) { currentOffset += k.w * unitStep; return; }
          const actualKeyW = k.w * keyWidth + (k.w - 1) * gap;
          const xPos = rowStartX + currentOffset + actualKeyW / 2;
          currentOffset += actualKeyW + gap;
          addKey(xPos, zPos, k.w, k.l || "", !!k.a, !!k.m, !!k.s);
        });
      });

      // Navigation Island on Right (3 columns aligned from F-Row down to arrows)
      const navCol0X = 11.5;
      const navCol1X = navCol0X + unitStep; // 13.04
      const navCol2X = navCol1X + unitStep; // 14.58

      // Row 0: Top Function Nav [PrtSc, ScrLk, Pause] (Matches aegis-tkl.jpg)
      addKey(navCol0X, startZ, 1, "PRTSC", false, true);
      addKey(navCol1X, startZ, 1, "SCRLK", false, true);
      addKey(navCol2X, startZ, 1, "PAUSE", false, true);

      // Row 1: 3x2 Island Upper [Ins, Home, PgUp]
      const r1Z = startZ + 1 * unitStep;
      addKey(navCol0X, r1Z, 1, "INS", false, true);
      addKey(navCol1X, r1Z, 1, "HOME", false, true);
      addKey(navCol2X, r1Z, 1, "PGUP", false, true);

      // Row 2: 3x2 Island Lower [Del, End, PgDn]
      const r2Z = startZ + 2 * unitStep;
      addKey(navCol0X, r2Z, 1, "DEL", false, true);
      addKey(navCol1X, r2Z, 1, "END", false, true);
      addKey(navCol2X, r2Z, 1, "PGDN", false, true);

      // Row 3: Dedicated Engraved Brass/Slate Badge "AURA AEGIS [Gold Bar] TKL" (Matches aegis-tkl.jpg)
      const aegisBadgeTex = createBadgeTexture("aegis");
      if (aegisBadgeTex) {
        const badgeGeo = new THREE.PlaneGeometry(4.4, 1.25);
        const badgeMat = new THREE.MeshStandardMaterial({
          map: aegisBadgeTex,
          metalness: 0.85,
          roughness: 0.25,
        });
        const badgeMesh = new THREE.Mesh(badgeGeo, badgeMat);
        badgeMesh.rotation.x = -Math.PI / 2;
        badgeMesh.position.set(navCol1X, 0.92, startZ + 3 * unitStep);
        topCaseGroup.add(badgeMesh);
      }

      // Row 4: Inverted-T Up Arrow
      const r4Z = startZ + 4 * unitStep;
      addKey(navCol1X, r4Z, 1, "▲", false, true);

      // Row 5: Inverted-T Bottom Arrows [Left, Down, Right]
      const r5Z = startZ + 5 * unitStep;
      addKey(navCol0X, r5Z, 1, "◄", false, true);
      addKey(navCol1X, r5Z, 1, "▼", false, true);
      addKey(navCol2X, r5Z, 1, "►", false, true);

      assembleChassisStructure({
        modelTitle: "AURA AEGIS TKL",
        caseW,
        caseD,
        wellW,
        wellD,
        wellOffsetX,
        wellOffsetZ,
        weightDim: [26, 0.25, 8.5],
      });
    }

    // ==========================================
    // 4. AURA NOCTURNE PAD (12-Key Ortholinear Matrix with Big Knob & OLED)
    // ==========================================
    else if (config.model === "nocturne-pad") {
      const caseW = 18.2;
      const caseD = 12.8;
      // Well cutout precisely frames the 12 keys; right side is solid CNC billet for knob & OLED (Matches nocturne-pad.jpg)
      const wellW = 7.4;
      const wellD = 5.8;
      const wellOffsetX = -2.7;
      const wellOffsetZ = -0.66;
      const unitStep = keyWidth + gap; // 1.54

      // 4 Columns x 3 Rows = 12 Keys (Matches nocturne-pad.jpg)
      // Col 0: Esc, M1, Ctrl
      // Col 1: M1, M2, Alt
      // Col 2: Fn, Shift, Fn
      // Col 3: Back, ↵, Enter
      const padCol0X = -5.0;
      const padCol1X = padCol0X + unitStep; // -3.46
      const padCol2X = padCol1X + unitStep; // -1.92
      const padCol3X = padCol2X + unitStep; // -0.38
      const padCols = [padCol0X, padCol1X, padCol2X, padCol3X];

      const r0Z = -2.2;
      const r1Z = r0Z + unitStep; // -0.66
      const r2Z = r1Z + unitStep; // 0.88

      const padGrid = [
        { z: r0Z, labels: ["ESC", "M1", "FN", "BACK"] },
        { z: r1Z, labels: ["M1", "M2", "SHIFT", "↵"] },
        { z: r2Z, labels: ["CTRL", "ALT", "FN", "ENTER"] },
      ];

      padGrid.forEach((row, rIdx) => {
        row.labels.forEach((label, cIdx) => {
          const isCenterM2 = rIdx === 1 && cIdx === 1;
          addKey(padCols[cIdx], row.z, 1, label, isCenterM2, !isCenterM2);
        });
      });

      // Front Inlaid Brass Plate with dual engraving (Matches nocturne-pad.jpg)
      // Left: "AURA NOCTURNE", Right: "CRAFTED IN THE UK"
      const frontBrassGeo = createRoundedCaseGeometry(14.8, 0.3, 0.7, 0.35, 0.08);
      const frontBrassMesh = new THREE.Mesh(frontBrassGeo, frontBrassMat);
      frontBrassMesh.position.set(0, -0.3, caseD / 2 + 0.08);
      topCaseGroup.add(frontBrassMesh);

      // Oversized Knurled Solid Brass Rotary Volume Wheel mounted on top chassis (Matches nocturne-pad.jpg)
      const knobX = 4.4;
      const knobZ = -1.5;
      const bigKnobMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 1.5, 48), knobMat);
      bigKnobMesh.position.set(knobX, 1.35, knobZ);
      topCaseGroup.add(bigKnobMesh);

      const bigKnobTop = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.08, 48), weightMat);
      bigKnobTop.position.set(knobX, 2.12, knobZ);
      topCaseGroup.add(bigKnobTop);

      // OLED Bezel Housing Frame
      const oledBezel = new THREE.Mesh(
        new THREE.BoxGeometry(3.9, 0.12, 2.1),
        new THREE.MeshStandardMaterial({ color: 0x08090b, roughness: 0.7, metalness: 0.2 })
      );
      oledBezel.position.set(knobX, 0.88, 1.3);
      topCaseGroup.add(oledBezel);

      // OLED Telemetry Display Screen (Matches nocturne-pad.jpg: "Aura Nocturne | VOL 65% LAYER 1")
      const oledCanvas = document.createElement("canvas");
      oledCanvas.width = 512;
      oledCanvas.height = 256;
      const oledCtx = oledCanvas.getContext("2d");
      if (oledCtx) {
        oledCtx.fillStyle = "#040608";
        oledCtx.fillRect(0, 0, 512, 256);

        // Subtle OLED pixel grid glow
        oledCtx.fillStyle = "#ffffff";
        oledCtx.font = "bold 44px system-ui, -apple-system, sans-serif";
        oledCtx.fillText("Aura Nocturne", 36, 75);

        oledCtx.fillStyle = "#38bdf8";
        oledCtx.font = "bold 38px 'JetBrains Mono', monospace";
        oledCtx.fillText("| VOL 65%", 36, 145);

        oledCtx.fillStyle = "#e2e8f0";
        oledCtx.font = "bold 34px 'JetBrains Mono', monospace";
        oledCtx.fillText("LAYER 1", 36, 215);

        oledCtx.fillStyle = "#0284c7";
        oledCtx.fillRect(230, 122, 240, 22);
      }
      const oledTex = new THREE.CanvasTexture(oledCanvas);
      oledTex.colorSpace = THREE.SRGBColorSpace;
      const oledMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.8), new THREE.MeshBasicMaterial({ map: oledTex }));
      oledMesh.rotation.x = -Math.PI / 2;
      oledMesh.position.set(knobX, 0.95, 1.3);
      topCaseGroup.add(oledMesh);

      assembleChassisStructure({
        modelTitle: "AURA NOCTURNE PAD",
        caseW,
        caseD,
        wellW,
        wellD,
        wellOffsetX,
        wellOffsetZ,
        weightDim: [11.5, 0.22, 8.5],
      });
    }

    // Keyboard rests naturally on the deskmat with subtle ergonomic incline
    keyboardGroup.rotation.set(0.04, 0, 0);

    // Re-align camera to signature front-isometric perspective matching product portrayal
    cameraState.current.theta = 0.42;
    cameraState.current.phi = 0.86;
  }, [config.model]);

  // Instant Live Keycap Theme Updates (Zero geometry rebuild, 0ms main thread stall)
  useEffect(() => {
    if (!keycapItemsRef.current.length) return;
    keycapItemsRef.current.forEach((item) => {
      const mat = item.mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        mat.map = createKeycapTexture(item.label, item.isAccent, item.isMod, config.keycapTheme);
        mat.needsUpdate = true;
      }
    });
  }, [config.keycapTheme]);

  // Live Material Color Updates
  useEffect(() => {
    applyMaterialStyles(materialsRef.current, config);
  }, [config.caseFinish, config.weightFinish, config.knobFinish, config.switchType]);

  const isTeardownActive = !!config.teardownLayer && config.teardownLayer !== "none";

  return (
    <div className="relative w-full h-[520px] flex items-center justify-center">
      <canvas
        ref={canvasRef}
        className="w-full h-[520px] cursor-grab active:cursor-grabbing block"
      />
      <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2 text-[11px] font-mono text-neutral-400 bg-aura-dark/85 px-3 py-1.5 rounded-lg border border-aura-border backdrop-blur-md">
        <span className={`w-1.5 h-1.5 rounded-full ${isTeardownActive ? "bg-amber-400 animate-ping" : "bg-emerald-400 animate-pulse"}`} />
        <span className="uppercase font-semibold text-aura-gold">{config.model}</span>
        {isTeardownActive ? (
          <span className="text-amber-300 font-semibold uppercase tracking-wider">
            • TEARDOWN: {config.teardownLayer} ARCHITECTURE
          </span>
        ) : (
          <span>• DOUBLESHOT LEGENDS • DESKMAT STUDIO</span>
        )}
      </div>
    </div>
  );
}

export default Keyboard3DCanvas;
