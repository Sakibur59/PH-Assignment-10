"use client";

import Link from "next/link";
import {
  LogoFacebook,
  LogoLinkedin,
  LogoGithub,
} from "@gravity-ui/icons";

export default function Footer() {
  return (
    
    <footer className="border-t border-gray-800 bg-[#0B0F19] text-gray-300">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        
        {/* TOP SECTION */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          
          {/* LEFT - BRANDING & SOCIALS */}
          <div className="space-y-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/20">
                <span className="text-xl font-bold text-white">R</span>
              </div>

              <div className="leading-none">
                <h2 className="text-xl font-bold text-white">ReSell</h2>
                <h2 className="text-xl font-bold text-emerald-400">Hub</h2>
              </div>
            </Link>

            {/* Description */}
            <p className="max-w-xs leading-8 text-gray-400">
              Your trusted second-hand marketplace. Buy and sell pre-loved products easily, securely, and sustainably.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-2">
              <Link
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 transition hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
              >
                <LogoFacebook className="h-5 w-5" />
              </Link>

              <Link
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 transition hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
              >
                <LogoGithub className="h-5 w-5" />
              </Link>

              <Link
                href="#"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-gray-400 transition hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
              >
                <LogoLinkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* MARKETPLACE */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Marketplace
            </h3>

            <ul className="space-y-4 text-gray-400">
              <li>
                <Link href="/products" className="transition hover:text-emerald-400">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/categories" className="transition hover:text-emerald-400">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition hover:text-emerald-400">
                  Sell an Item
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="transition hover:text-emerald-400">
                  How it Works
                </Link>
              </li>
            </ul>
          </div>

          {/* SUPPORT & SAFETY */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Support & Safety
            </h3>

            <ul className="space-y-4 text-gray-400">
              <li>
                <Link href="/help-center" className="transition hover:text-emerald-400">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/safety-guidelines" className="transition hover:text-emerald-400">
                  Safety Guidelines
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition hover:text-emerald-400">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="mb-6 text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Company
            </h3>

            <ul className="space-y-4 text-gray-400">
              <li>
                <Link href="/about" className="transition hover:text-emerald-400">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blogs" className="transition hover:text-emerald-400">
                  Our Blogs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-gray-800 pt-8 text-sm text-gray-500 md:flex-row">
          <p>Copyright {new Date().getFullYear()} — ReSell Hub</p>

          <div className="flex items-center gap-6">
            <Link href="/terms" className="transition hover:text-emerald-400">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition hover:text-emerald-400">
              Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}