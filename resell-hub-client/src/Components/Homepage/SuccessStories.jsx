"use client";

import { Card } from "@heroui/react";

const successStories = [
  {
    id: 1,
    name: "Jannatul Ferdous",
    role: "Buyer",
    image: "https://ui-avatars.com/api/?name=Jannatul+Ferdous&background=0D9488&color=fff&size=100",
    story:
      "I found an almost new iPhone 13 Pro Max at 40% less than market price. The seller was very cooperative and the product was in excellent condition. Saved over 30,000 BDT!",
    rating: 5,
    date: "June 2026",
  },
  {
    id: 2,
    name: "Priya Das",
    role: "Seller",
    image: "https://ui-avatars.com/api/?name=Priya+Das&background=F59E0B&color=fff&size=100",
    story:
      "Sold my 2-year-old laptop within 24 hours of listing! The platform made it so easy to connect with genuine buyers. Got a fair price and quick payment.",
    rating: 5,
    date: "May 2026",
  },
  {
    id: 3,
    name: "Tanvir Hasan",
    role: "Buyer",
    image: "https://ui-avatars.com/api/?name=Tanvir+Hasan&background=0D9488&color=fff&size=100",
    story:
      "Bought a PS5 for my son's birthday. The transaction was smooth, and the seller even delivered it personally. My son was overjoyed!",
    rating: 5,
    date: "April 2026",
  },
  {
    id: 4,
    name: "Nadia Rahman",
    role: "Seller",
    image: "https://ui-avatars.com/api/?name=Nadia+Rahman&background=F59E0B&color=fff&size=100",
    story:
      "Cleared out my old furniture and made 50,000 BDT! The platform helped me find the right buyers quickly. Highly recommended for anyone looking to declutter.",
    rating: 5,
    date: "March 2026",
  },
];

export default function SuccessStories() {
  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Success Stories</h2>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Hear from our happy buyers and sellers who found their perfect match
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {successStories.map((story) => (
            <Card
              key={story.id}
              className="p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-emerald-200">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {story.name}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                          story.role === "Buyer"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-amber-100 text-amber-600"
                        }`}
                      >
                        {story.role}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {story.date}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-0.5 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className="w-4 h-4 text-yellow-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ))}
                  </div>

                  {/* Story */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    "{story.story}"
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Badge */}
        <div className="mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-6 py-3 rounded-full">
            <svg
              className="w-5 h-5 text-emerald-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            <span className="text-sm font-medium text-emerald-700">
              Join thousands of satisfied users on ReSell Hub
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}