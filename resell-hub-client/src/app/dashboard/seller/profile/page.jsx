
"use client";

import { useSession } from "@/lib/auth-client";

export default function SellerProfile() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="text-gray-500 mt-1">Manage your profile</p>
      <div className="mt-6 bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-200">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "User")}&background=0D9488&color=fff&size=100`}
              alt={user?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-500">{user?.email}</p>
            <span className="inline-block text-sm font-medium px-3 py-1 rounded-full mt-1 bg-amber-100 text-amber-700">
              Seller
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}