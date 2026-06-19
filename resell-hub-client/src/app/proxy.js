import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const publicRoutes = ["/", "/products", "/categories", "/about", "/contact"];
const authRoutes = ["/auth/signin", "/auth/signup"];

export async function proxy(request) {
  const path = request.nextUrl.pathname;

  console.log("🔍 Proxy path:", path);

  if (path.startsWith("/api")) {
    console.log("⏩ API route, skipping");
    return NextResponse.next();
  }

  if (
    path.startsWith("/_next") ||
    path.includes("favicon.ico") ||
    path.includes(".png") ||
    path.includes(".jpg") ||
    path.includes(".svg")
  ) {
    return NextResponse.next();
  }

  if (
    publicRoutes.some((route) => path === route || path.startsWith("/product/"))
  ) {
    return NextResponse.next();
  }

  // Auth routes
  if (authRoutes.some((route) => path === route)) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.error("Auth route error:", error);
    }
    return NextResponse.next();
  }

  if (path.startsWith("/dashboard")) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        const signInUrl = new URL("/auth/signin", request.url);
        signInUrl.searchParams.set("callbackUrl", path);
        return NextResponse.redirect(signInUrl);
      }

      const userRole = session.user?.role || "buyer";
      console.log("👤 User role:", userRole);

      if (userRole === "admin") {
        return NextResponse.next();
      }

      // Check route access
      const isBuyerRoute =
        path.startsWith("/dashboard/buyer") || path === "/dashboard";
      const isSellerRoute = path.startsWith("/dashboard/seller");
      const isAdminRoute = path.startsWith("/dashboard/admin");

      console.log(
        "🔍 Route check - isBuyer:",
        isBuyerRoute,
        "isSeller:",
        isSellerRoute,
        "isAdmin:",
        isAdminRoute,
      );

      if (userRole === "buyer" && isBuyerRoute) {
        return NextResponse.next();
      }

      if (userRole === "seller" && isSellerRoute) {
        return NextResponse.next();
      }

      if (userRole === "buyer") {
        return NextResponse.redirect(
          new URL("/dashboard/buyer/orders", request.url),
        );
      } else if (userRole === "seller") {
        return NextResponse.redirect(
          new URL("/dashboard/seller/add-product", request.url),
        );
      } else {
        return NextResponse.redirect(
          new URL("/dashboard/admin/manage-users", request.url),
        );
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
