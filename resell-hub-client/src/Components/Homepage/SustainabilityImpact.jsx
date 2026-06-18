
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const SustainabilityImpact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const stats = [
    {
      id: 1,
      icon: "🌍",
      value: "45,000+",
      label: "KG Waste Reduced",
      description: "By reusing products instead of buying new",
      color: "from-emerald-500 to-teal-400"
    },
    {
      id: 2,
      icon: "💧",
      value: "2.5M+",
      label: "Liters Water Saved",
      description: "Through sustainable consumption",
      color: "from-blue-500 to-cyan-400"
    },
    {
      id: 3,
      icon: "🌳",
      value: "12,000+",
      label: "Trees Protected",
      description: "By reducing paper and wood demand",
      color: "from-green-500 to-emerald-400"
    },
    {
      id: 4,
      icon: "⚡",
      value: "8,500+",
      label: "MWh Energy Saved",
      description: "From manufacturing less products",
      color: "from-amber-500 to-orange-400"
    }
  ];

  const benefits = [
    "Extending product lifecycle",
    "Reducing carbon footprint",
    "Promoting circular economy",
    "Minimizing e-waste",
    "Conserving natural resources",
    "Building sustainable community"
  ];

  return (
    <section className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900">Sustainability Impact</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Together, we're making a difference. Every purchase on ReSell Hub helps reduce waste and protect our planet.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className={`text-4xl mb-3 bg-gradient-to-r ${stat.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto text-white`}>
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-sm font-semibold text-gray-700 mt-1">{stat.label}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Benefits List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-6">
            How We're Making an Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 bg-emerald-50 rounded-lg px-4 py-3"
              >
                <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-emerald-100 px-6 py-3 rounded-full">
            <span className="text-2xl">🌱</span>
            <span className="text-sm font-medium text-emerald-800">
              Join the movement. Every item reused is a step towards a sustainable future.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SustainabilityImpact;