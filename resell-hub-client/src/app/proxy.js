import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';


export async function proxy(request) {
  const path = request.nextUrl.pathname;


  if (path.startsWith('/api')) {
    return NextResponse.next();
  }

  if (path.startsWith('/_next') || path.includes('favicon.ico') || path.includes('.png') || path.includes('.jpg') || path.includes('.svg') || path.includes('.webp')) {
    return NextResponse.next();
  }


  const publicRoutes = ['/', '/products', '/categories', '/about', '/contact'];
  if (publicRoutes.some(route => path === route || path.startsWith('/product/'))) {
    return NextResponse.next();
  }


  if (path === '/auth/signin' || path === '/auth/signup') {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error('Auth route error:', error);
    }
    return NextResponse.next();
  }

  if (path === '/blocked') {
    return NextResponse.next();
  }

  if (path.startsWith('/dashboard')) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
      }

      const userRole = session.user?.role || 'buyer';
      const userId = session.user?.id;
      let client = null;
      try {
        const { MongoClient } = require('mongodb');
        client = new MongoClient(process.env.MONGO_DB_URI);
        await client.connect();
        const db = client.db(process.env.AUTH_DB_NAME);
        const usersCollection = db.collection('user');
        
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });

        if (user?.isBlocked === true) {
          return NextResponse.redirect(new URL('/blocked', request.url));
        }
      } catch (dbError) {
      } finally {
        if (client) {
          await client.close();
        }
      }

      if (userRole === 'admin') {
        return NextResponse.next();
      }

      // Check route access
      const isBuyerRoute = path.startsWith('/dashboard/buyer') || path === '/dashboard';
      const isSellerRoute = path.startsWith('/dashboard/seller');
      const isAdminRoute = path.startsWith('/dashboard/admin');

      // Buyer access
      if (userRole === 'buyer' && isBuyerRoute) {
        return NextResponse.next();
      }

      // Seller access
      if (userRole === 'seller' && isSellerRoute) {
        return NextResponse.next();
      }
      
      if (userRole === 'buyer') {
        return NextResponse.redirect(new URL('/dashboard/buyer/orders', request.url));
      } else if (userRole === 'seller') {
        return NextResponse.redirect(new URL('/dashboard/seller/add-product', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};