"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cart = useStore((s) => s.cart);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const links = [
    { href: "/", label: "HOME" },
    { href: "/about", label: "ABOUT" },
    { href: "/contact", label: "CONTACT" },
    { href: "/favorite", label: "FAVORITE" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled || open
            ? "bg-white/80 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo */}
          <Link href="/" onClick={() => setOpen(false)}>
            <Image src="/imges/anubix.png" width={46} height={46} alt="Anubix" className="drop-shadow-sm" />
          </Link>

          {/* Desktop nav — centered */}
          <ul className="hidden lg:flex gap-10 absolute left-1/2 -translate-x-1/2">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`nav-underline uppercase text-black text-sm font-semibold tracking-widest pb-1 ${
                    pathname === l.href ? "active" : ""
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {/* Cart */}
            <Link href="/shop" className="relative text-black text-2xl">
              <i className="ri-shopping-cart-2-line" />
              {mounted && cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Admin icon */}
            <Link href="/admin" className="text-black/30 hover:text-black transition-colors text-xl">
              <i className="ri-settings-3-line" />
            </Link>

            {/* Hamburger — mobile only */}
            <button
              className="lg:hidden text-black focus:outline-none w-8 h-8 flex flex-col justify-center gap-[5px]"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <span className={`block h-[2px] bg-black transition-all duration-300 origin-center ${open ? "rotate-45 translate-y-[7px]" : ""}`} />
              <span className={`block h-[2px] bg-black transition-all duration-300 ${open ? "opacity-0 scale-x-0" : ""}`} />
              <span className={`block h-[2px] bg-black transition-all duration-300 origin-center ${open ? "-rotate-45 -translate-y-[7px]" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile overlay — z-50 so it covers tab bar */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col justify-center items-center gap-10 transition-all duration-500 lg:hidden ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ backdropFilter: "blur(24px)", backgroundColor: "rgba(240,240,240,0.85)" }}
      >
        {links.map((l, i) => (
          <Link
            key={l.href}
            href={l.href}
            onClick={() => setOpen(false)}
            className={`uppercase text-black font-semibold tracking-[0.3em] text-2xl transition-all duration-300 nav-underline pb-1 ${
              pathname === l.href ? "active" : ""
            }`}
            style={{ transitionDelay: open ? `${i * 60}ms` : "0ms" }}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </>
  );
}
