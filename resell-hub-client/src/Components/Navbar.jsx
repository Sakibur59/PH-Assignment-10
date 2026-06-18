"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 
  const user = null;
  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* LOGO */}
        <Link href="/" className="text-2xl font-bold text-black z-10">
          ReSell Hub
        </Link>

        {/* DESKTOP NAV LINKS */}
        <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="hover:text-black transition"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* AUTH SECTION (DESKTOP) */}
        <div className="hidden md:flex items-center gap-3 z-10">
          {!user ? (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                Sign In
              </Link>

              <Button
                as={Link}
                href="/auth/signup"
                className="bg-black text-white"
              >
                Get Started
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm text-gray-700">
                Hi, {user.name}
              </span>

              <Button variant="flat">
                Sign Out
              </Button>
            </>
          )}
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 z-10"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4">
          <ul className="space-y-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-gray-700"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 border-t pt-4">
            {!user ? (
              <div className="flex flex-col gap-3">
                <Link href="/auth/signin">
                  Sign In
                </Link>

                <Button
                  as={Link}
                  href="/auth/signup"
                  className="w-full bg-black text-white"
                >
                  Get Started
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="text-sm">Hi, {user.name}</p>

                <Button>
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}