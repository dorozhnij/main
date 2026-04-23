"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Ядро «фонарика»: диаметр 60px → радиус 30px; дальше — мягкий переход. */
const HOLE_RADIUS_PX = 30;
const FEATHER_OUTER_PX = 60;
const FEATHER_MID_PX = HOLE_RADIUS_PX + 16;

/** Курсор «фонарик»: SVG data-URI, hotspot по центру (20, 20). */
const FLASHLIGHT_CURSOR = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">' +
    '<circle cx="20" cy="20" r="14" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.95"/>' +
    '<circle cx="20" cy="20" r="5" fill="#ffffff" opacity="0.45"/>' +
    "</svg>"
)}") 20 20, crosshair`;

function buildMask(x: number, y: number): string {
  return `radial-gradient(circle 150vmax at ${x}px ${y}px, rgba(255,255,255,0) 0, rgba(255,255,255,0) ${HOLE_RADIUS_PX}px, rgba(255,255,255,0.55) ${FEATHER_MID_PX}px, rgba(255,255,255,1) ${FEATHER_OUTER_PX}px, rgba(255,255,255,1) 100%)`;
}

export function HeroFlashlightOverlay() {
  const [maskStyle, setMaskStyle] = useState<CSSProperties>({});
  const [reducedMotion, setReducedMotion] = useState(false);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const applyMask = useCallback((x: number, y: number) => {
    const m = buildMask(x, y);
    setMaskStyle({
      WebkitMaskImage: m,
      maskImage: m,
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat"
    });
  }, []);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const p = pendingRef.current;
      if (p) applyMask(p.x, p.y);
    });
  }, [applyMask]);

  const clearMask = useCallback(() => {
    pendingRef.current = null;
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setMaskStyle({});
  }, []);

  const onMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const el = e.currentTarget;
      const rect = el.getBoundingClientRect();
      pendingRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      scheduleUpdate();
    },
    [scheduleUpdate, reducedMotion]
  );

  const onMouseLeave = useCallback(() => {
    clearMask();
  }, [clearMask]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-[1] bg-gradient-to-b from-black/55 via-black/45 to-black/60"
      style={{
        ...maskStyle,
        cursor: reducedMotion ? undefined : FLASHLIGHT_CURSOR
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      aria-hidden
    />
  );
}
