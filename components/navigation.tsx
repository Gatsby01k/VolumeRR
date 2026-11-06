"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import navigation from "@/content/navigation.json";
import { Arrow, Chevron, Close } from "./icons";

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const closeDrawer = () => {
    drawer.current?.close();
    document.body.style.overflow = "";
    menuButton.current?.focus();
  };
  useEffect(() => {
    setOpen(null);
    drawer.current?.close();
    document.body.style.overflow = "";
  }, [path]);
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!nav.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="wordmark" href="/" aria-label="VolumeRail home">
          <img
            src="/brand/wordmark.webp"
            width="208"
            height="71"
            alt="VolumeRail"
            fetchPriority="high"
          />
        </Link>
        <nav
          className="desktop-nav"
          aria-label="Main navigation"
          ref={nav}
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) {
              triggers.current[open]?.focus();
              setOpen(null);
            }
          }}
        >
          {navigation.items.map((item) => (
            <div className="nav-group" key={item.label}>
              <div
                className={`nav-item ${path.startsWith(item.href) ? "active" : ""}`}
              >
                <Link href={item.href}>{item.label}</Link>
                {item.children && (
                  <button
                    ref={(el) => {
                      triggers.current[item.label] = el;
                    }}
                    className="nav-toggle"
                    aria-label={`Open ${item.label} menu`}
                    aria-controls={`nav-${item.label}`}
                    aria-expanded={open === item.label}
                    onClick={() =>
                      setOpen(open === item.label ? null : item.label)
                    }
                  >
                    <Chevron up={open === item.label} />
                  </button>
                )}
              </div>
              {item.children && open === item.label && (
                <div className="nav-dropdown" id={`nav-${item.label}`}>
                  <span className="eyebrow">
                    EXPLORE {item.label.toUpperCase()}
                  </span>
                  {item.children.map((child) => (
                    <Link
                      href={child.href}
                      key={child.href}
                      onClick={() => setOpen(null)}
                    >
                      {child.label}
                      <Arrow />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <Link className="header-cta link-line" href="/contact">
          Discuss your flow <Arrow />
        </Link>
        <button
          className="mobile-menu icon-button"
          ref={menuButton}
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
          onClick={() => {
            drawer.current?.showModal();
            document.body.style.overflow = "hidden";
          }}
        >
          <span />
          <span />
        </button>
        <dialog
          className="mobile-drawer"
          aria-label="Navigation"
          ref={drawer}
          onCancel={closeDrawer}
          onClose={() => {
            document.body.style.overflow = "";
          }}
        >
          <div className="drawer-head">
            <Link className="wordmark" href="/" aria-label="VolumeRail home">
              <img
                src="/brand/wordmark.webp"
                width="164"
                height="56"
                alt="VolumeRail"
              />
            </Link>
            <button
              className="icon-button"
              aria-label="Close navigation"
              onClick={closeDrawer}
            >
              <Close />
            </button>
          </div>
          <nav aria-label="Mobile navigation">
            {navigation.items.map((item, i) => (
              <div className="drawer-group" key={item.href}>
                <Link href={item.href} onClick={closeDrawer}>
                  <span className="muted small">0{i + 1}</span>
                  {item.label}
                  <Arrow />
                </Link>
                {item.children && (
                  <div className="drawer-children">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={closeDrawer}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <Link className="button" href="/contact" onClick={closeDrawer}>
            Discuss your flow <Arrow />
          </Link>
        </dialog>
      </div>
      <noscript>
        <nav className="noscript-nav" aria-label="Basic navigation">
          <a href="/payments">Payments</a>
          <a href="/markets">Markets</a>
          <a href="/developers">Developers</a>
          <a href="/contact/basic">Contact</a>
        </nav>
      </noscript>
    </header>
  );
}
