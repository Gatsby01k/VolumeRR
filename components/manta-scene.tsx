"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useBrief } from "./providers";

export function MantaScene({ children }: { children: ReactNode }) {
  const { revealPhase, companionState, endReveal, reducedMotion } = useBrief();
  return (
    <section
      className="home-hero dark"
      data-manta-reveal={reducedMotion ? "ready" : revealPhase}
      data-manta-reaction={companionState}
      onPointerDownCapture={() => endReveal(true)}
      onKeyDownCapture={() => endReveal(true)}
    >
      {children}
    </section>
  );
}

export function MantaExploreLink({
  href,
  countryId,
  children,
}: {
  href: string;
  countryId?: string;
  children: ReactNode;
}) {
  const { signalCompanion } = useBrief();
  const explore = () => signalCompanion({ type: "market_selected", countryId });
  return (
    <Link href={href} onPointerEnter={explore} onFocus={explore}>
      {children}
    </Link>
  );
}
