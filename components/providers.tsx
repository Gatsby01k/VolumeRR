"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type {
  BriefContext,
  CtaContext,
  CompanionState,
  EnquiryReceipt,
} from "@/contracts/content-model";
import {
  BRIEF_KEY,
  emptyBrief,
  sanitizeBrief,
  serializeBrief,
} from "@/lib/domain/brief";
import { countries, products } from "@/lib/registry";
import Link from "next/link";
import { Arrow, Chevron, Close } from "./icons";
import { MantaSprite, BriefImpulse, type MantaSlot } from "./manta-sprite";
import {
  effectiveMantaState,
  idleManta,
  reactManta,
  reactionDuration,
  revealTimeline,
  type MantaEvent,
  type MantaReaction,
  type RevealPhase,
} from "@/lib/domain/companion";

type Context = {
  initialized: boolean;
  brief: BriefContext;
  update: (patch: Partial<BriefContext>) => void;
  addContext: (cta: CtaContext) => void;
  toggleMarket: (id: string) => void;
  toggleFlow: (id: BriefContext["flowIds"][number]) => void;
  clear: () => void;
  announce: (text: string, state?: CompanionState) => void;
  mantaVisible: boolean;
  setMantaVisible: (v: boolean) => void;
  motion: string;
  setMotion: (v: string) => void;
  showcase: boolean;
  setShowcase: (v: boolean) => void;
  companionState: CompanionState;
  companionReaction: MantaReaction;
  signalCompanion: (event: MantaEvent) => void;
  confirmReceipt: (receipt: EnquiryReceipt) => void;
  reducedMotion: boolean;
  revealPhase: RevealPhase;
  beginReveal: () => void;
  endReveal: (skipFuture?: boolean) => void;
  openPreferences: (type: "cookies" | "motion") => void;
};
const Brief = createContext<Context | null>(null);
export function useBrief() {
  const value = useContext(Brief);
  if (!value) throw new Error("BriefProvider missing");
  return value;
}

export function Providers({ children }: { children: ReactNode }) {
  const [brief, setBrief] = useState<BriefContext>(emptyBrief);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [companionReaction, setCompanionReaction] =
    useState<MantaReaction>(idleManta);
  const [reveal, setReveal] = useState<{
    phase: RevealPhase;
    startedAt: number;
  }>({ phase: "ready", startedAt: 0 });
  const [systemReduced, setSystemReduced] = useState(false);
  const [mantaVisible, setManta] = useState(true);
  const [motion, setMotionState] = useState("system");
  const [showcase, setShowcase] = useState(false);
  const [preferences, setPreferences] = useState<"cookies" | "motion" | null>(
    null,
  );
  const [analytics, setAnalytics] = useState(false);
  const path = usePathname();
  const eventTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const revealed = useRef(false);
  const previousBrief = useRef<BriefContext | null>(null);
  const observedBrief = useRef(false);
  const confirmedReceipt = useRef<string | null>(null);
  const reducedMotion = motion === "reduced" || systemReduced;
  const revealing = reveal.phase !== "ready";
  const companionState = effectiveMantaState(
    companionReaction.state,
    mantaVisible,
    reducedMotion,
  );
  const signalCompanion = useCallback((event: MantaEvent) => {
    if (document.visibilityState !== "visible") return;
    setCompanionReaction((current) => reactManta(current, event));
  }, []);
  const confirmReceipt = useCallback(
    (receipt: EnquiryReceipt) => {
      if (
        receipt.kind !== "accepted" ||
        !receipt.receiptId ||
        confirmedReceipt.current === receipt.receiptId
      )
        return;
      confirmedReceipt.current = receipt.receiptId;
      signalCompanion({ type: "enquiry_accepted", receiptAccepted: true });
    },
    [signalCompanion],
  );
  const endReveal = useCallback((skipFuture = false) => {
    if (skipFuture) revealed.current = true;
    setReveal((current) =>
      current.phase === "ready" ? current : { ...current, phase: "ready" },
    );
  }, []);
  const beginReveal = useCallback(() => {
    if (revealed.current || reducedMotion || !mantaVisible) return;
    revealed.current = true;
    setReveal({ phase: "peek", startedAt: performance.now() });
  }, [reducedMotion, mantaVisible]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    change();
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (!revealing) return;
    if (reducedMotion || !mantaVisible) {
      endReveal();
      return;
    }
    const elapsed = performance.now() - reveal.startedAt;
    if (elapsed >= 800) {
      endReveal();
      return;
    }
    const timers = revealTimeline
      .filter((mark) => mark.at > elapsed)
      .map((mark) =>
        setTimeout(
          () =>
            setReveal((current) =>
              current.phase === "ready"
                ? current
                : { ...current, phase: mark.phase },
            ),
          mark.at - elapsed,
        ),
      );
    return () => timers.forEach(clearTimeout);
  }, [reveal.startedAt, revealing, reducedMotion, mantaVisible, endReveal]);
  useEffect(() => {
    const duration = reactionDuration[companionReaction.state];
    if (!duration) return;
    const timer = setTimeout(
      () =>
        setCompanionReaction((current) =>
          current.sequence === companionReaction.sequence
            ? { ...current, state: "ready" }
            : current,
        ),
      duration,
    );
    return () => clearTimeout(timer);
  }, [companionReaction.state, companionReaction.sequence]);
  useEffect(() => {
    if (!ready || !observedBrief.current) {
      previousBrief.current = brief;
      observedBrief.current = ready;
      return;
    }
    const previous = previousBrief.current;
    previousBrief.current = brief;
    if (
      previous &&
      brief.marketIds.length + brief.flowIds.length > 0 &&
      (previous.marketIds.join() !== brief.marketIds.join() ||
        previous.flowIds.join() !== brief.flowIds.join())
    )
      signalCompanion({ type: "brief_updated" });
  }, [brief, ready, signalCompanion]);
  useEffect(() => {
    endReveal();
    if (path !== "/contact/confirmation")
      setCompanionReaction((current) =>
        current.state === "ready" ? current : { ...current, state: "ready" },
      );
  }, [path, endReveal]);
  useEffect(() => {
    const visibility = () => {
      if (document.visibilityState !== "visible") {
        endReveal();
        setCompanionReaction((current) => ({ ...current, state: "ready" }));
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => document.removeEventListener("visibilitychange", visibility);
  }, [endReveal]);

  const announce = useCallback(
    (text: string, state?: CompanionState) => {
      setNotice(text);
      if (state === "attention") signalCompanion({ type: "validation_failed" });
      if (state === "explore") signalCompanion({ type: "market_selected" });
      if (eventTimer.current) clearTimeout(eventTimer.current);
      eventTimer.current = setTimeout(() => {
        setNotice("");
      }, 2800);
    },
    [signalCompanion],
  );
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(BRIEF_KEY);
      if (raw) {
        const result = sanitizeBrief(JSON.parse(raw));
        setBrief(result.brief);
        if (result.changed)
          announce(
            "Some saved choices are no longer available. Please review your brief.",
          );
      }
      const prefs = JSON.parse(
        localStorage.getItem("volumerail.preferences.v1") || "{}",
      );
      setManta(prefs.manta !== false);
      setMotionState(prefs.motion === "reduced" ? "reduced" : "system");
      setAnalytics(prefs.analytics === true);
    } catch {
      /* Storage unavailable: the in-memory brief remains usable. */
    }
    setReady(true);
    return () => {
      if (eventTimer.current) clearTimeout(eventTimer.current);
    };
  }, [announce]);
  useEffect(() => {
    if (ready) {
      try {
        sessionStorage.setItem(BRIEF_KEY, serializeBrief(brief));
      } catch {}
    }
  }, [brief, ready]);
  useEffect(() => {
    document.documentElement.dataset.motion = motion;
    if (ready) {
      try {
        localStorage.setItem(
          "volumerail.preferences.v1",
          JSON.stringify({ manta: mantaVisible, motion, analytics }),
        );
      } catch {}
    }
  }, [motion, mantaVisible, analytics, ready]);
  useEffect(() => {
    if (preferences) dialog.current?.showModal();
    else dialog.current?.close();
  }, [preferences]);
  const update = useCallback(
    (patch: Partial<BriefContext>) =>
      setBrief((b) => ({
        ...b,
        ...patch,
        updatedAt: new Date().toISOString(),
      })),
    [],
  );
  const addContext = (cta: CtaContext) => {
    setBrief((b) => ({
      ...b,
      marketIds: [...new Set([...b.marketIds, ...(cta.marketIds || [])])].slice(
        0,
        10,
      ),
      flowIds: [...new Set([...b.flowIds, ...(cta.flowIds || [])])],
      purpose: cta.purpose || b.purpose,
      industryId: cta.industryId || b.industryId,
      sourceRoute: path,
      updatedAt: new Date().toISOString(),
    }));
  };
  const toggleMarket = (id: string) => {
    if (!countries.some((c) => c.id === id)) return;
    const selected = brief.marketIds.includes(id);
    update({
      marketIds: selected
        ? brief.marketIds.filter((i) => i !== id)
        : [...brief.marketIds, id],
      sourceRoute: path,
    });
    announce(
      `${countries.find((c) => c.id === id)?.name} ${selected ? "removed from" : "added to"} your brief.`,
    );
  };
  const toggleFlow = (id: BriefContext["flowIds"][number]) => {
    const selected = brief.flowIds.includes(id);
    update({
      flowIds: selected
        ? brief.flowIds.filter((i) => i !== id)
        : [...brief.flowIds, id],
      sourceRoute: path,
    });
    announce(
      `${products.find((p) => p.id === id)?.title} ${selected ? "removed from" : "added to"} your brief.`,
    );
  };
  return (
    <Brief.Provider
      value={{
        initialized: ready,
        brief,
        update,
        addContext,
        toggleMarket,
        toggleFlow,
        clear: () => {
          setBrief({ ...emptyBrief });
          try {
            sessionStorage.removeItem(BRIEF_KEY);
          } catch {}
        },
        announce,
        mantaVisible,
        setMantaVisible: setManta,
        motion,
        setMotion: setMotionState,
        showcase,
        setShowcase,
        companionState,
        companionReaction,
        signalCompanion,
        confirmReceipt,
        reducedMotion,
        revealPhase: reveal.phase,
        beginReveal,
        endReveal,
        openPreferences: setPreferences,
      }}
    >
      {children}
      <BriefRail />
      {companionReaction.state === "brief_added" && (
        <BriefImpulse
          key={companionReaction.sequence}
          sequence={companionReaction.sequence}
          enabled={mantaVisible && !reducedMotion}
        />
      )}
      <div className="sr-only" role="status" aria-live="polite">
        {notice}
      </div>
      {notice && (
        <div className="toast">
          <span className="status-dot" />
          {notice}
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <Close />
          </button>
        </div>
      )}
      <dialog
        ref={dialog}
        aria-labelledby="preferences-title"
        className="preferences-dialog paper"
        onCancel={() => setPreferences(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setPreferences(null);
        }}
      >
        <div className="dialog-top">
          <span className="eyebrow">YOUR PREFERENCES</span>
          <button
            className="icon-button"
            aria-label="Close preferences"
            onClick={() => setPreferences(null)}
          >
            <Close />
          </button>
        </div>
        <h2 id="preferences-title">
          {preferences === "cookies"
            ? "Your choice. Always."
            : "Set your own pace."}
        </h2>
        {preferences === "cookies" ? (
          <>
            <p>
              Essential storage keeps your payment brief for this session and
              remembers your display preferences. Contact details are never
              saved in browser storage.
            </p>
            <label className="checkline">
              <input type="checkbox" checked disabled /> Essential website
              functions
            </label>
            <label className="checkline">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
              />{" "}
              Allow optional analytics
            </label>
            <p className="muted small">
              No analytics provider is connected. This preference alone does not
              send any data.
            </p>
            <Link href="/legal/cookies">
              Read cookie information <Arrow />
            </Link>
          </>
        ) : (
          <>
            <p>
              Reduce decorative movement while keeping every part of the website
              available.
            </p>
            <label className="checkline">
              <input
                type="radio"
                name="motion"
                checked={motion === "system"}
                onChange={() => setMotionState("system")}
              />{" "}
              Follow system preference
            </label>
            <label className="checkline">
              <input
                type="radio"
                name="motion"
                checked={motion === "reduced"}
                onChange={() => setMotionState("reduced")}
              />{" "}
              Reduced motion
            </label>
            <label className="checkline">
              <input
                type="checkbox"
                checked={mantaVisible}
                onChange={(e) => setManta(e.target.checked)}
              />{" "}
              Show Manta
            </label>
          </>
        )}
        <button className="button" onClick={() => setPreferences(null)}>
          Save preferences <Arrow />
        </button>
      </dialog>
    </Brief.Provider>
  );
}

function BriefRail() {
  const { brief, toggleMarket, clear, mantaVisible, showcase, companionState } =
    useBrief();
  const [collapsed, setCollapsed] = useState(false);
  const path = usePathname();
  const hasBrief = brief.marketIds.length + brief.flowIds.length > 0;
  useEffect(() => {
    document.body.classList.toggle(
      "has-brief",
      hasBrief && !path.startsWith("/contact"),
    );
    return () => document.body.classList.remove("has-brief");
  }, [hasBrief, path]);
  if (!hasBrief || path.startsWith("/contact")) return null;
  return (
    <aside
      className={`brief-rail ${collapsed ? "collapsed" : ""}`}
      aria-label="Your payment brief"
      data-manta-reaction={companionState}
    >
      <div className="rail-inner">
        <div className="rail-title">
          <span className="eyebrow">YOUR PAYMENT BRIEF</span>
          <span>
            {brief.marketIds.length}{" "}
            {brief.marketIds.length === 1 ? "market" : "markets"}{" "}
            <span className="muted">/</span> {brief.flowIds.length}{" "}
            {brief.flowIds.length === 1 ? "product" : "products"}
          </span>
        </div>
        {!collapsed && (
          <div className="rail-choices">
            {brief.marketIds.map((id) => (
              <button
                className="chip"
                key={id}
                aria-label={`Remove ${countries.find((c) => c.id === id)?.name} from brief`}
                onClick={() => toggleMarket(id)}
              >
                {countries.find((c) => c.id === id)?.name}
                <Close />
              </button>
            ))}
            <button className="text-button small" onClick={clear}>
              Clear brief
            </button>
          </div>
        )}
        {mantaVisible &&
          !showcase &&
          !path.startsWith("/legal") &&
          !path.startsWith("/developers/") &&
          path !== "/support" && <Manta className="rail-manta" slot="rail" />}
        <Link className="button" href="/contact">
          Review brief <Arrow />
        </Link>
        <button
          className="icon-button"
          aria-label={collapsed ? "Expand brief" : "Collapse brief"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed(!collapsed)}
        >
          <Chevron up={!collapsed} />
        </button>
      </div>
    </aside>
  );
}

export function Manta({
  className = "",
  showcase = false,
  slot = "hero",
}: {
  className?: string;
  showcase?: boolean;
  slot?: MantaSlot;
}) {
  const {
    mantaVisible,
    companionState,
    companionReaction,
    setShowcase,
    reducedMotion,
    revealPhase,
    beginReveal,
  } = useBrief();
  if (!mantaVisible) return null;
  return (
    <MantaSprite
      className={className}
      state={companionState}
      sequence={companionReaction.sequence}
      slot={slot}
      reduced={reducedMotion}
      phase={revealPhase}
      onPresence={showcase ? setShowcase : undefined}
      onReveal={slot === "hero" ? beginReveal : undefined}
    />
  );
}

export function ContextLink({
  cta,
  className = "button",
}: {
  cta: CtaContext;
  className?: string;
}) {
  const { addContext } = useBrief();
  return (
    <Link
      href={
        cta.href +
        (cta.purpose && cta.href === "/contact"
          ? `?purpose=${cta.purpose}`
          : "")
      }
      className={className}
      onClick={() => addContext(cta)}
    >
      {cta.label}
      <Arrow />
    </Link>
  );
}
export function AddButton({
  marketId,
  flowId,
  label,
}: {
  marketId?: string;
  flowId?: BriefContext["flowIds"][number];
  label?: string;
}) {
  const { brief, toggleMarket, toggleFlow } = useBrief();
  const selected = marketId
    ? brief.marketIds.includes(marketId)
    : flowId
      ? brief.flowIds.includes(flowId)
      : false;
  return (
    <button
      className={`button ${selected ? "is-added" : ""}`}
      aria-pressed={selected}
      onClick={() =>
        marketId ? toggleMarket(marketId) : flowId && toggleFlow(flowId)
      }
    >
      {selected ? "Added to your brief" : label || "Add to brief"}
      {selected ? <span aria-hidden="true">✓</span> : <Arrow />}
    </button>
  );
}
export function PreferencesButtons() {
  const { openPreferences, mantaVisible, setMantaVisible } = useBrief();
  return (
    <>
      <button onClick={() => openPreferences("cookies")}>
        Cookie preferences
      </button>
      <button onClick={() => openPreferences("motion")}>
        Motion preferences
      </button>
      <button onClick={() => setMantaVisible(!mantaVisible)}>
        {mantaVisible ? "Hide" : "Show"} Manta
      </button>
    </>
  );
}
