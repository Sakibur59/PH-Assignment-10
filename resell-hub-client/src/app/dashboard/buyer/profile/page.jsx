
"use client";

import { useSession } from "@/lib/auth-client";
import { Card } from "@heroui/react";

export default function BuyerProfile() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="text-gray-500 mt-1">Manage your profile information</p>

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
            <span className="inline-block text-sm font-medium px-3 py-1 rounded-full mt-1 bg-blue-100 text-blue-700">
              Buyer
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">Profile details will be available soon</p>
        </div>
      </div>
    </div>
  );
}