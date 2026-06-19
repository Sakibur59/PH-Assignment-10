
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { Spinner, Card } from "@heroui/react";

export default function BuyerPayments() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch payment history from API
    setLoading(false);
  }, [session]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner color="success" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
      <p className="text-gray-500 mt-1">View all your payments</p>

      {payments.length === 0 ? (
        <div className="mt-6 bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <div className="text-5xl mb-4">💳</div>
          <p className="text-lg font-medium">No payment history</p>
          <p className="text-sm">Your payment transactions will appear here</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {payments.map((payment) => (
            <Card key={payment._id} className="p-6 border border-gray-100">
              {/* Payment details */}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}