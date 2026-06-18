"use client";
import React from "react";
import Link from "next/link";
import { Button, Card } from "@heroui/react";

const AboutPage = () => {
  const features = [
    {
      icon: "🛍️",
      title: "Buy & Sell Easily",
      description:
        "List your items for free and reach thousands of potential buyers in your area.",
    },
    {
      icon: "🔒",
      title: "Secure Transactions",
      description:
        "Verified users and secure payment options ensure safe and trustworthy transactions.",
    },
    {
      icon: "🌍",
      title: "Eco-Friendly",
      description:
        "Every purchase on ReSell Hub helps reduce waste and promotes sustainable consumption.",
    },
    {
      icon: "⭐",
      title: "Trusted Community",
      description:
        "Join a community of verified buyers and sellers with transparent ratings and reviews.",
    },
    {
      icon: "📱",
      title: "Easy to Use",
      description:
        "Simple and intuitive interface makes buying and selling items a breeze.",
    },
    {
      icon: "💬",
      title: "Direct Communication",
      description:
        "Chat directly with buyers or sellers to negotiate prices and arrange meetups.",
    },
  ];

  const stats = [
    { value: "15K+", label: "Active Users" },
    { value: "8K+", label: "Items Sold" },
    { value: "95%", label: "Satisfaction Rate" },
    { value: "50+", label: "Categories" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About ReSell Hub
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            Bangladesh's premier platform for buying and selling used items.
            We're on a mission to make second-hand shopping convenient, safe,
            and sustainable.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              ReSell Hub was founded with a simple yet powerful vision: to
              create a trusted marketplace where people can easily buy and sell
              used items, reducing waste and promoting a circular economy in
              Bangladesh.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We believe that every item deserves a second life. By connecting
              buyers and sellers directly, we're making sustainable consumption
              accessible to everyone.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-block bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-2xl font-bold text-emerald-600">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose ReSell Hub?
            </h2>
            <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
              Everything you need for a seamless buying and selling experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
          <p className="text-gray-500 mt-2">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Create Account",
              description:
                "Sign up for free and set up your profile. Choose to be a buyer or seller.",
              icon: "👤",
            },
            {
              step: "02",
              title: "List or Browse",
              description:
                "List your items for sale or browse through thousands of products.",
              icon: "🔍",
            },
            {
              step: "03",
              title: "Connect & Deal",
              description:
                "Connect with buyers/sellers, negotiate, and complete your transaction.",
              icon: "🤝",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="relative bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300"
            >
              <div className="text-5xl text-emerald-100 font-bold mb-2">
                {item.step}
              </div>
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm">{item.description}</p>
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-2xl text-gray-300">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Join ReSell Hub?</h2>
          <p className="text-xl text-white/90 mb-6 max-w-2xl mx-auto">
            Start buying and selling today. Join thousands of satisfied users.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
