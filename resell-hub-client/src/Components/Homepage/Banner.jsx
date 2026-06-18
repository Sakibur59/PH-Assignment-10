"use client";

import Link from "next/link";
import { Hashtag, ShoppingCart, ArrowRight } from "@gravity-ui/icons";
import bannerImage from "@/assets/ResellHub.png";
import Image from "next/image";

export default function Banner() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* BANNER GRID */}
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* LEFT: TEXT CONTENT */}
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <Hashtag className="h-4 w-4" />
              <span>Best Pre-loved Goods Marketplace</span>
            </div>

            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-black sm:text-5xl md:text-6xl">
              Buy. Sell. Reuse. <br /> Find Your{" "}
              <span className="text-emerald-500">Next Treasure</span> at ReSell
              Hub.
            </h1>

            <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg leading-relaxed text-gray-600">
              Discover verified second-hand gems. From electronics to fashion,
              give products a second life and save big. Sustainable shopping
              made easy, secure, and fun.
            </p>

            {/* BUTTONS */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/products"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600 active:scale-95"
              >
                <ShoppingCart className="h-5 w-5" />
                Shop Pre-loved
              </Link>

              <Link
                href="/dashboard"
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-black transition hover:border-black hover:bg-gray-50 active:scale-95"
              >
                Sell an Item
                <ArrowRight className="h-5 w-5 text-gray-500" />
              </Link>
            </div>
          </div>

          {/* RIGHT: VISUAL PLACEHOLDER */}
          <div className="relative aspect-[16/10] w-full max-w-xl mx-auto lg:max-w-none rounded-3xl border border-gray-200 bg-gray-50 shadow-xl overflow-hidden flex items-center justify-center p-6 text-center">
            <Image
              src={bannerImage}
              alt="Marketplace Preview"
              width={700}
              height={400}
              className="mx-auto rounded-lg object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
