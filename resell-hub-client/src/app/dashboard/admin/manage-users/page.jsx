"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Spinner, Card, Button, Input } from "@heroui/react";
import toast from "react-hot-toast";
import { Search, UserCheck, UserX, Trash2, Shield } from "lucide-react";
import { deleteUser, getAdminUsers, updateUserStatus } from "@/lib/api/admin";

export default function ManageUsers() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getAdminUsers();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openActionModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedUser(null);
    setActionType("");
  };

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      if (actionType === "Delete") {
        await deleteUser(selectedUser._id);
      } else if (actionType === "Block") {
        await updateUserStatus(selectedUser._id, true);
      } else if (actionType === "Unblock") {
        await updateUserStatus(selectedUser._id, false);
      } else if (actionType === "Make Admin") {
        await updateUserStatus(selectedUser._id, false, "admin");
      } else if (actionType === "Make Buyer") {
        await updateUserStatus(selectedUser._id, false, "buyer");
      } else if (actionType === "Make Seller") {
        await updateUserStatus(selectedUser._id, false, "seller");
      }
      toast.success(`User ${actionType.toLowerCase()} successfully`);
      fetchUsers();
      closeActionModal();
    } catch (error) {
      console.error("Action error:", error);
      toast.error(error?.message || "Failed to perform action");
    } finally {
      setIsProcessing(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage platform users
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Total Users:{" "}
          <span className="font-semibold text-gray-900">{users.length}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md pl-9"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold text-sm">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.name || "Unknown"}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : user.role === "seller"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {user.role || "buyer"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isBlocked
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                     
                      {user._id !== session?.user?.id ? (
                        <>
                      
                          <select
                            onChange={(e) => {
                              const action = e.target.value;
                              if (action) {
                                openActionModal(user, action);
                              }
                              e.target.value = "";
                            }}
                            className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 bg-white hover:border-gray-300 transition-colors cursor-pointer"
                            defaultValue=""
                          >
                            <option value="" disabled>
                              Role
                            </option>
                            <option value="Make Admin">👑 Admin</option>
                            <option value="Make Seller">🛒 Seller</option>
                            <option value="Make Buyer">🛍️ Buyer</option>
                          </select>

                          {/* Block/Unblock Button */}
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            onClick={() =>
                              openActionModal(
                                user,
                                user.isBlocked ? "Unblock" : "Block",
                              )
                            }
                            className={`min-w-8 h-8 ${
                              user.isBlocked
                                ? "text-green-600 hover:bg-green-50"
                                : "text-amber-600 hover:bg-amber-50"
                            }`}
                          >
                            {user.isBlocked ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </Button>

                          {/* Delete Button */}
                          <Button
                            size="sm"
                            variant="light"
                            isIconOnly
                            color="danger"
                            onClick={() => openActionModal(user, "Delete")}
                            className="min-w-8 h-8 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Your Account
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {isActionModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  actionType === "Delete"
                    ? "bg-red-100"
                    : actionType === "Block"
                      ? "bg-amber-100"
                      : actionType === "Unblock"
                        ? "bg-green-100"
                        : actionType.includes("Make")
                          ? "bg-purple-100"
                          : "bg-gray-100"
                }`}
              >
                {actionType === "Delete" ? (
                  <Trash2 className="w-6 h-6 text-red-500" />
                ) : actionType === "Block" ? (
                  <UserX className="w-6 h-6 text-amber-500" />
                ) : actionType === "Unblock" ? (
                  <UserCheck className="w-6 h-6 text-green-500" />
                ) : actionType.includes("Make") ? (
                  <Shield className="w-6 h-6 text-purple-500" />
                ) : null}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {actionType}
                </h3>
                <p className="text-sm text-gray-500">
                  {actionType.includes("Make")
                    ? `Change role to ${actionType.replace("Make ", "")}?`
                    : `${actionType} this user?`}
                </p>
              </div>
            </div>

            <div className="py-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-semibold">
                  {selectedUser.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedUser.name}
                  </p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <p className="text-xs text-gray-400">
                    Current role: {selectedUser.role || "buyer"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-red-400 mt-3">
                ⚠️ This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="light"
                onClick={closeActionModal}
                className="flex-1 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                isLoading={isProcessing}
                className={`flex-1 ${
                  actionType === "Delete" || actionType === "Block"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : actionType === "Unblock"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-purple-500 text-white hover:bg-purple-600"
                }`}
              >
                Yes, {actionType}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
