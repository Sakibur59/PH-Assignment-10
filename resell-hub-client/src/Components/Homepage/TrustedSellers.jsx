"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const TrustedSellers = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const sellers = [
    {
      id: 1,
      name: "TechGuru BD",
      category: "Electronics",
      rating: 4.9,
      sales: 342,
      image: "https://ui-avatars.com/api/?name=TechGuru+BD&background=0D9488&color=fff&size=100",
      badge: "Top Seller",
      verified: true,
      description: "Quality electronics at best prices"
    },
    {
      id: 2,
      name: "FurnitureHub",
      category: "Furniture",
      rating: 4.8,
      sales: 287,
      image: "https://ui-avatars.com/api/?name=FurnitureHub&background=F59E0B&color=fff&size=100",
      badge: "Trusted Partner",
      verified: true,
      description: "Premium furniture for every home"
    },
    {
      id: 3,
      name: "MobileMania",
      category: "Mobile Phones",
      rating: 4.9,
      sales: 456,
      image: "https://ui-avatars.com/api/?name=MobileMania&background=3B82F6&color=fff&size=100",
      badge: "Top Seller",
      verified: true,
      description: "Genuine phones with warranty"
    },
    {
      id: 4,
      name: "FashionFusion",
      category: "Fashion",
      rating: 4.7,
      sales: 198,
      image: "https://ui-avatars.com/api/?name=FashionFusion&background=8B5CF6&color=fff&size=100",
      badge: "Trendsetter",
      verified: true,
      description: "Style meets sustainability"
    },
    {
      id: 5,
      name: "AutoDeals BD",
      category: "Vehicles",
      rating: 4.8,
      sales: 156,
      image: "https://ui-avatars.com/api/?name=AutoDeals+BD&background=EF4444&color=fff&size=100",
      badge: "Verified",
      verified: true,
      description: "Trusted vehicle marketplace"
    },
    {
      id: 6,
      name: "HomeAppliance",
      category: "Appliances",
      rating: 4.6,
      sales: 234,
      image: "https://ui-avatars.com/api/?name=HomeAppliance&background=14B8A6&color=fff&size=100",
      badge: "Trusted Partner",
      verified: true,
      description: "Quality appliances at great value"
    }
  ];

  return (
    <section className="w-full bg-white py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900">Trusted Sellers Showcase</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Connect with our verified top-rated sellers for a secure and reliable shopping experience
          </p>
        </motion.div>

        {/* Sellers Grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sellers.map((seller, index) => (
            <motion.div
              key={seller.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-gray-50 rounded-xl p-6 border border-gray-100 hover:border-emerald-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex-shrink-0"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-200">
                    <img
                      src={seller.image}
                      alt={seller.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{seller.name}</h3>
                    {seller.verified && (
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{seller.category}</p>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center gap-0.5">
                      <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-700">{seller.rating}</span>
                    </div>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{seller.sales} sales</span>
                  </div>

                  <p className="text-xs text-gray-600 mt-1">{seller.description}</p>

                  {/* Badge */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="mt-2 inline-block"
                  >
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      {seller.badge}
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedSellers;