"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation"; 
import { Card, Button, Input } from "@heroui/react";
import { updateUser, getUserById } from "@/lib/api/user";
import toast from "react-hot-toast";

export default function BuyerProfile() {
  const { data: session, refetch } = useSession(); 
  const router = useRouter(); 
  const user = session?.user;

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });
  const [isFetching, setIsFetching] = useState(true);

  // Fetch latest user data from database
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.id) {
          const data = await getUserById(user.id);
          if (data.success) {
            const userData = data.data;
            setFormData({
              name: userData.name || "",
              phone: userData.phone || "",
              address: userData.address || "",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchUserData();
  }, [user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await updateUser(user?.id, {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      if (response.success) {
    
        await refetch();

        toast.success("Profile updated successfully!");
        setIsEditing(false);
        router.refresh(); 
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <p className="text-gray-500 mt-1">Manage your personal information</p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="p-6 border border-gray-100 text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-200 mx-auto">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name || "User")}&background=0D9488&color=fff&size=100`}
                alt={formData.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mt-3">{formData.name || user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block text-sm font-medium px-3 py-1 rounded-full mt-2 bg-blue-100 text-blue-700">
              Buyer
            </span>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Member since</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
            {formData.phone && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-sm font-medium text-gray-700">{formData.phone}</p>
              </div>
            )}
            {formData.address && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-sm font-medium text-gray-700">{formData.address}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Edit Profile Form */}
        <div className="lg:col-span-2">
          <Card className="p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              {!isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                  size="sm"
                >
                  Edit Profile
                </Button>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Your full name"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    value={user?.email}
                    disabled
                    className="w-full bg-gray-50"
                  />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="+880 1234 567890"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full"
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      className="bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="bordered"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || "",
                          phone: user?.phone || "",
                          address: user?.address || "",
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}