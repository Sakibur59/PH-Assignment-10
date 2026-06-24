"use client";

const StatCard = ({ icon, label, value, color }) => {
  return (
    <div className={`bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-300 border-l-4 ${color}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-gray-900">{value}</div>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
};

export default function MarketplaceStats() {

  const stats = {
    totalProducts: 1547,
    totalSellers: 892,
    totalBuyers: 2156,
    completedOrders: 428
  };

  const statItems = [
    {
      id: 1,
      icon: "📦",
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      color: "border-emerald-500",
    },
    {
      id: 2,
      icon: "👤",
      label: "Total Sellers",
      value: stats.totalSellers.toLocaleString(),
      color: "border-amber-500",
    },
    {
      id: 3,
      icon: "🛍️",
      label: "Total Buyers",
      value: stats.totalBuyers.toLocaleString(),
      color: "border-blue-500",
    },
    {
      id: 4,
      icon: "✅",
      label: "Completed Orders",
      value: stats.completedOrders.toLocaleString(),
      color: "border-purple-500",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Marketplace Statistics</h2>
        <p className="text-gray-500 mt-2">
          Our platform at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat) => (
          <StatCard
            key={stat.id}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
          />
        ))}
      </div>

      {/* Animated Counter*/}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Products Growth</span>
            <span className="font-semibold text-emerald-600">+12%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full w-3/4"></div>
          </div>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Seller Growth</span>
            <span className="font-semibold text-amber-600">+8%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-amber-500 h-2 rounded-full w-2/3"></div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Buyer Growth</span>
            <span className="font-semibold text-blue-600">+15%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full w-4/5"></div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Order Completion</span>
            <span className="font-semibold text-purple-600">95%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full w-[95%]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}