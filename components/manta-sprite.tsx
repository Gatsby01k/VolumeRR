"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CompanionState } from "@/contracts/content-model";
import type { RevealPhase } from "@/lib/domain/companion";

export type MantaSlot = "hero" | "rail" | "form" | "receipt" | "market";
let atlas: Promise<void> | undefined;
function loadPoseAtlas() {
  if (!atlas)
    atlas = new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => {
        atlas = undefined;
        reject(new Error("Manta atlas unavailable"));
      };
      image.src = "/brand/manta-poses-v2.webp";
    });
  return atlas;
}
const positions = [
  "0% 0%",
  "50% 0%",
  "100% 0%",
  "0% 100%",
  "50% 100%",
  "100% 100%",
];

export function MantaSprite({
  state,
  sequence,
  phase = "ready",
  className = "",
  slot = "hero",
  reduced,
  onPresence,
  onReveal,
}: {
  state: CompanionState;
  sequence: number;
  phase?: RevealPhase;
  className?: string;
  slot?: MantaSlot;
  reduced: boolean;
  onPresence?: (visible: boolean) => void;
  onReveal?: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const [loaded, setLoaded] = useState(false);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const visible = bounds.bottom > 0 && bounds.top < innerHeight;
    setInView(visible);
    onPresence?.(visible);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;
        setInView(visible);
        onPresence?.(visible);
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      onPresence?.(false);
    };
  }, [onPresence]);
  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  useEffect(() => {
    if (!inView || !pageVisible || reduced) return;
    let cancelled = false;
    const timer = setTimeout(
      () => {
        void loadPoseAtlas()
          .then(() => {
            if (!cancelled) setLoaded(true);
          })
          .catch(() => {});
      },
      slot === "hero" ? 80 : 0,
    );
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [inView, pageVisible, reduced, slot]);
  useEffect(() => {
    if (slot === "hero" && loaded && inView && pageVisible && !reduced)
      onReveal?.();
  }, [slot, loaded, inView, pageVisible, reduced, onReveal]);
  const active = inView && pageVisible;
  const performingReveal = slot === "hero" && phase !== "ready";
  const pose =
    performingReveal && phase !== "settle"
      ? 0
      : state === "explore"
        ? 2
        : state === "brief_added"
          ? 3
          : state === "attention"
            ? 4
            : slot === "rail" ||
                slot === "receipt" ||
                state === "enquiry_received"
              ? 5
              : 1;
  const usesAtlas = loaded && !reduced;
  return (
    <div
      ref={root}
      aria-hidden="true"
      className={`manta manta-v2 ${className}`}
      data-manta-slot={slot}
      data-manta-state={state}
      data-manta-sequence={sequence}
      data-manta-pose={pose}
      data-manta-stage={slot === "hero" ? phase : "ready"}
      data-manta-active={active}
      data-manta-source={usesAtlas ? "atlas" : "poster"}
    >
      <div key={sequence} className="manta-reaction" data-reaction={state}>
        <div className="manta-body">
          <img
            className="manta-static-poster"
            src={
              slot === "rail" ? "/brand/manta-small.webp" : "/brand/manta.webp"
            }
            width="512"
            height="512"
            alt=""
            draggable="false"
          />
          {usesAtlas && (
            <div className="manta-pose-stack">
              {positions.map((position, i) => (
                <span
                  key={position}
                  className="manta-pose-frame"
                  style={{
                    backgroundPosition: position,
                    opacity: i === pose ? 1 : 0,
                  }}
                />
              ))}
            </div>
          )}
          {usesAtlas && pose === 1 && (
            <span className="manta-eyelids">
              <i />
              <i />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function BriefImpulse({
  sequence,
  enabled,
}: {
  sequence: number;
  enabled: boolean;
}) {
  const pulse = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!enabled || document.visibilityState !== "visible" || !pulse.current)
      return;
    const character = document.querySelector<HTMLElement>(
      '.manta[data-manta-active="true"]',
    );
    const destination = document.querySelector<HTMLElement>(
      ".brief-rail .button, .brief-preview .button",
    );
    if (!character || !destination) return;
    const from = character.getBoundingClientRect();
    const to = destination.getBoundingClientRect();
    if (
      to.top < 0 ||
      to.bottom > innerHeight ||
      from.bottom < 0 ||
      from.top > innerHeight
    )
      return;
    const x = from.left + from.width * 0.78,
      y = from.top + from.height * 0.67;
    const tx = to.left + 18,
      ty = to.top + to.height * 0.5;
    const flight = pulse.current.animate(
      [
        { transform: `translate(${x}px,${y}px) scale(.7)`, opacity: 0 },
        {
          transform: `translate(${x + (tx - x) * 0.36}px,${Math.min(y, ty) - 24}px) scale(1)`,
          opacity: 1,
          offset: 0.4,
        },
        { transform: `translate(${tx}px,${ty}px) scale(.3)`, opacity: 0 },
      ],
      { duration: 320, easing: "cubic-bezier(.16,1,.3,1)", fill: "both" },
    );
    return () => flight.cancel();
  }, [sequence, enabled]);
  return (
    <span ref={pulse} className="manta-brief-impulse" aria-hidden="true" />
  );
}
