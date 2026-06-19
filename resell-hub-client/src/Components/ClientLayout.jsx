"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";
import { Toaster } from "react-hot-toast";

export default function ClientLayout({ children }) {
  const pathname = usePathname();

  const hideFooterPaths = ["/dashboard", "/auth/signin", "/auth/signup"];
  const showFooter = !hideFooterPaths.some((path) =>
    pathname?.startsWith(path),
  );

  const isAuthPage = pathname?.startsWith("/auth");
  const showNavbar = !isAuthPage;

  return (
    <>
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      {showFooter && <Footer />}
      <Toaster />
    </>
  );
}
