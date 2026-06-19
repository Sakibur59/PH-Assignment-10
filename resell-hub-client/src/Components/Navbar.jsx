"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; 
import { useSession } from "@/lib/auth-client";
import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname(); 

  const user = session?.user;
  const userRole = user?.role || "buyer";

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Categories", href: "/categories" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const getAvatarUrl = (name) => {
    if (!name) return "https://ui-avatars.com/api/?name=User&background=0D9488&color=fff&size=100";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D9488&color=fff&size=100`;
  };

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const getUserRole = () => {
    if (!user?.role) return "User";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  };

  const getRoleColor = () => {
    if (user?.role === "seller") return "bg-amber-100 text-amber-700";
    if (user?.role === "buyer") return "bg-blue-100 text-blue-700";
    if (user?.role === "admin") return "bg-purple-100 text-purple-700";
    return "bg-gray-100 text-gray-700";
  };

 
  const getProfilePath = () => {
    if (userRole === "buyer") return "/dashboard/buyer/profile";
    if (userRole === "seller") return "/dashboard/seller/profile";

    return null;
  };

  const getDashboardPath = () => {
    return "/dashboard";
  };

  const profilePath = getProfilePath();
  const dashboardPath = getDashboardPath();


  const getDropdownItems = () => {
    const items = [];

    items.push({
      label: "Dashboard",
      href: dashboardPath,
      icon: (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    });

   
    if (userRole === "buyer" || userRole === "seller") {
      items.push({
        label: "Profile",
        href: profilePath,
        icon: (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )
      });
    }

    return items;
  };

  const dropdownItems = getDropdownItems();

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-2xl font-bold text-black z-10">
          ReSell <span className="text-emerald-400">Hub</span>
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`transition ${
                    active
                      ? "text-emerald-600 font-bold border-b-2 border-emerald-500 pb-1"
                      : "hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:flex items-center gap-3 z-10">
          {!user ? (
            <>
              <Link
                href="/auth/signin"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 hover:text-black"
              >
                Sign In
              </Link>

              <Link
                href="/auth/signup"
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                Get Started
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition group"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-200 flex-shrink-0">
                  <img
                    src={getAvatarUrl(user.name)}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>Hi, {user.name}</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-200 flex-shrink-0">
                        <img
                          src={getAvatarUrl(user.name)}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
                        <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${getRoleColor()}`}>
                          {getUserRole()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {dropdownItems.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className={`flex items-center gap-2 px-4 py-2.5 text-sm transition ${
                        isActive(item.href)
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      {item.icon}
                      {item.label}
                    </Link>
                  ))}

                  <div className="border-t border-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left"
                  >
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 z-10"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {isMenuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4">
          <ul className="space-y-3">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block transition ${
                      active
                        ? "text-emerald-600 font-bold"
                        : "text-gray-700 hover:text-black"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 border-t pt-4">
            {!user ? (
              <div className="flex flex-col gap-3">
                <Link
                  href="/auth/signin"
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg border border-gray-300 px-3 py-2.5 text-center text-sm font-medium text-gray-700 transition hover:border-gray-400 hover:bg-gray-50 hover:text-black"
                >
                  Sign In
                </Link>

                <Link
                  href="/auth/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full rounded-lg bg-black px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-gray-800"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-200 flex-shrink-0">
                    <img
                      src={getAvatarUrl(user.name)}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${getRoleColor()}`}>
                      {getUserRole()}
                    </span>
                  </div>
                </div>

         
                <Link
                  href={dashboardPath}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-4 py-2.5 text-sm transition rounded-lg ${
                    isActive(dashboardPath)
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Dashboard
                </Link>

               
                {(userRole === "buyer" || userRole === "seller") && profilePath && (
                  <Link
                    href={profilePath}
                    onClick={() => setIsMenuOpen(false)}
                    className={`px-4 py-2.5 text-sm transition rounded-lg ${
                      isActive(profilePath)
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Profile
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleSignOut();
                  }}
                  className="px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition text-left"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}