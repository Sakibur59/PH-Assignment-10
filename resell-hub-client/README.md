# 🛍️ ReSell Hub - Full Stack Marketplace Platform

## 📋 Project Overview

ReSell Hub is a complete full-stack marketplace platform where users can buy and sell used items. It features role-based access control (Buyer, Seller, Admin), secure authentication, payment processing with Stripe, real-time order management, and a beautiful responsive UI.

### 🎯 Key Features

#### 👤 Authentication & Authorization
- Email/Password authentication with Better Auth
- Google OAuth integration
- Role-based access control (Buyer, Seller, Admin)
- JWT session management (7 days expiration)
- Protected routes and API endpoints

#### 👥 User Roles

**Buyer Dashboard:**
- Browse products with advanced filters (search, category, condition, sort)
- View product details with multiple images
- Add products to wishlist
- Place orders with Stripe payment
- Track order status
- View payment history
- Manage personal profile
- Write reviews for purchased products
- Cancel orders before shipment

**Seller Dashboard:**
- Add new products with image upload
- Manage product listings (Edit/Delete)
- View product statistics (Total, Approved, Pending, Rejected, Stock)
- Manage incoming orders
- Update order status (Pending → Confirmed → Processing → Shipped → Delivered)
- Track sales analytics
- View sales performance charts

**Admin Dashboard:**
- Full platform overview with statistics
- Manage users (Block/Unblock/Delete/Update Role)
- Manage products (Approve/Reject/Delete)
- Manage all orders across platform
- Platform analytics
- User growth, category performance, revenue tracking

#### 🛒 Core Features
- Product listing with stock management
- Real-time order tracking
- Wishlist functionality
- Rating & review system
- Stripe payment integration
- Admin approval system for products
- Advanced search and filters
- Pagination for products
- Responsive design

## 🚀 Tech Stack

### Frontend