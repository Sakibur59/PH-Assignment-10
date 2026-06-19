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

export default function DashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState("buyer");

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

    if (session?.user?.role) {
      setUserRole(session.user.role);
    }
  }, [session, isPending, router]);


  const getNavItems = () => {
    const baseItems = [
      {
        label: "Overview",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["buyer", "seller", "admin"],
      },
    ];

    const roleSpecific = {
      buyer: [
        { label: "My Orders", href: "/dashboard/buyer/orders", icon: ShoppingBag, roles: ["buyer"] },
        { label: "Wishlist", href: "/dashboard/buyer/wishlist", icon: Heart, roles: ["buyer"] },
        { label: "Payment History", href: "/dashboard/buyer/payments", icon: CreditCard, roles: ["buyer"] },
        { label: "Profile", href: "/dashboard/buyer/profile", icon: User, roles: ["buyer"] },
      ],
      seller: [
        { label: "Add Product", href: "/dashboard/seller/add-product", icon: PlusCircle, roles: ["seller"] },
        { label: "My Products", href: "/dashboard/seller/my-products", icon: Package, roles: ["seller"] },
        { label: "Manage Orders", href: "/dashboard/seller/manage-orders", icon: ClipboardList, roles: ["seller"] },
        { label: "Sales Analytics", href: "/dashboard/seller/sales-analytics", icon: BarChart3, roles: ["seller"] },
        { label: "Profile", href: "/dashboard/seller/profile", icon: User, roles: ["seller"] },
      ],
      admin: [
        { label: "Manage Users", href: "/dashboard/admin/manage-users", icon: Users, roles: ["admin"] },
        { label: "Manage Products", href: "/dashboard/admin/manage-products", icon: Package, roles: ["admin"] },
        { label: "Manage Orders", href: "/dashboard/admin/manage-orders", icon: ClipboardList, roles: ["admin"] },
        { label: "Platform Analytics", href: "/dashboard/admin/platform-analytics", icon: TrendingUp, roles: ["admin"] },
        { label: "Profile", href: "/dashboard/admin/profile", icon: User, roles: ["admin"] },
      ],
    };

    const allItems = [...baseItems];

    if (userRole === "buyer") {
      allItems.push(...roleSpecific.buyer);
    } else if (userRole === "seller") {
      allItems.push(...roleSpecific.seller);
    } else if (userRole === "admin") {
      allItems.push(...roleSpecific.admin);
    }

    return allItems;
  };

  const navItems = getNavItems();

  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
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


  if (isPending) {
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
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-black">
          ReSell <span className="text-emerald-400">Hub</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}>
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
              <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${
                userRole === "seller" ? "bg-amber-100 text-amber-700" :
                userRole === "admin" ? "bg-purple-100 text-purple-700" :
                "bg-blue-100 text-blue-700"
              }`}>
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
                  ${active 
                    ? "bg-emerald-50 text-emerald-600 font-medium" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${active ? "text-emerald-500" : "text-gray-400"}`} />
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

      <main className={`
        min-h-screen transition-all duration-300
        lg:ml-64
        ${isMobileMenuOpen ? "blur-sm" : ""}
      `}>
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