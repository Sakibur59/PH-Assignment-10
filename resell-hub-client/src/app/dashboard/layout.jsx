"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  LayoutDashboard,
  ShoppingBag,
  Heart,
  CreditCard,
  User,
  PlusCircle,
  Package,
  ClipboardList,
  BarChart3,
  Users,
  LogOut,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import toast from "react-hot-toast";
import { signOut } from "@/lib/auth-client";

function UnauthorizedAccess() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. This area is restricted
          to
          <span className="font-semibold text-gray-800">
            {" "}
            specific user roles
          </span>
          .
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.back()}
            className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300 px-4 py-2.5 rounded-lg transition"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2.5 rounded-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("buyer");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    console.log("isPending:", isPending, "Session:", session);

    if (isPending) {
      return;
    }

    if (!session?.user) {
      console.log("No user, redirecting to signin");
      router.replace("/auth/signin");
      return;
    }

    const role = session.user?.role || "buyer";
    setUserRole(role);

    const path = pathname || "";

    if (path === "/dashboard") {
      if (role === "buyer") {
        router.replace("/dashboard/buyer");
        return;
      } else if (role === "seller") {
        router.replace("/dashboard/seller");
        return;
      } else if (role === "admin") {
        router.replace("/dashboard/admin");
        return;
      }
    }

    let authorized = false;

    if (role === "admin") {
      authorized = path === "/dashboard" || path.startsWith("/dashboard/admin");
    } else if (role === "buyer") {
      authorized = path === "/dashboard" || path.startsWith("/dashboard/buyer");
    } else if (role === "seller") {
      authorized =
        path === "/dashboard" || path.startsWith("/dashboard/seller");
    }

    if (authorized) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }

    setIsLoading(false);
  }, [session, isPending, router, pathname]);

  if (!isAuthorized && !isLoading) {
    return <UnauthorizedAccess />;
  }

  const getNavItems = () => {
    const roleItems = {
      buyer: [
        { label: "Overview", href: "/dashboard/buyer", icon: LayoutDashboard },
        {
          label: "My Orders",
          href: "/dashboard/buyer/orders",
          icon: ShoppingBag,
        },
        { label: "Wishlist", href: "/dashboard/buyer/wishlist", icon: Heart },
        {
          label: "Payment History",
          href: "/dashboard/buyer/payments",
          icon: CreditCard,
        },
        { label: "Profile", href: "/dashboard/buyer/profile", icon: User },
      ],
      seller: [
        { label: "Overview", href: "/dashboard/seller", icon: LayoutDashboard },
        {
          label: "Add Product",
          href: "/dashboard/seller/add-product",
          icon: PlusCircle,
        },
        {
          label: "My Products",
          href: "/dashboard/seller/my-products",
          icon: Package,
        },
        {
          label: "Manage Orders",
          href: "/dashboard/seller/manage-orders",
          icon: ClipboardList,
        },
        {
          label: "Sales Analytics",
          href: "/dashboard/seller/sales-analytics",
          icon: BarChart3,
        },
        { label: "Profile", href: "/dashboard/seller/profile", icon: User },
      ],
      admin: [
        { label: "Overview", href: "/dashboard/admin", icon: LayoutDashboard },
        {
          label: "Manage Users",
          href: "/dashboard/admin/manage-users",
          icon: Users,
        },
        {
          label: "Manage Products",
          href: "/dashboard/admin/manage-products",
          icon: Package,
        },
        {
          label: "Manage Orders",
          href: "/dashboard/admin/manage-orders",
          icon: ClipboardList,
        },
        {
          label: "Platform Analytics",
          href: "/dashboard/admin/platform-analytics",
          icon: TrendingUp,
        },
      ],
    };

    return roleItems[userRole] || roleItems.buyer;
  };

  const navItems = getNavItems();

  const isActive = (href) => {
    if (
      href === "/dashboard/buyer" ||
      href === "/dashboard/seller" ||
      href === "/dashboard/admin"
    ) {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };
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

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-black">
          ReSell <span className="text-emerald-400">Hub</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      <aside
        className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="hidden lg:flex items-center h-16 px-6 border-b border-gray-200">
          <Link href="/" className="text-xl font-bold text-black">
            ReSell <span className="text-emerald-400">Hub</span>
          </Link>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-200 flex-shrink-0">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || "User")}&background=0D9488&color=fff&size=100`}
                alt={session.user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">
                {session.user.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {session.user.email}
              </p>
              <span
                className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${
                  userRole === "seller"
                    ? "bg-amber-100 text-amber-700"
                    : userRole === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                }`}
              >
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-200px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200
                  ${
                    active
                      ? "bg-emerald-50 text-emerald-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <Icon
                  className={`w-5 h-5 ${active ? "text-emerald-500" : "text-gray-400"}`}
                />
                <span className="text-sm">{item.label}</span>
                {active && (
                  <div className="ml-auto w-1 h-8 bg-emerald-500 rounded-full" />
                )}
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </nav>
      </aside>

      <main
        className={`
        min-h-screen transition-all duration-300
        lg:ml-64
        ${isMobileMenuOpen ? "blur-sm" : ""}
      `}
      >
        <div className="h-16 lg:hidden" />
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
