// app/dashboard/buyer/payments/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { getUserPayments } from "@/lib/api/payments";
import { Spinner, Card } from "@heroui/react";
import Link from "next/link";
import { CreditCard, CheckCircle, Clock } from "lucide-react";

export default function BuyerPayments() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await getUserPayments(session?.user?.id);
        if (data.success) {
          setPayments(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchPayments();
    }
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
      <p className="text-gray-500 mt-1">View all your payment transactions</p>

      {payments.length === 0 ? (
        <div className="mt-6 bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-100">
          <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium">No payment history</p>
          <p className="text-sm">Your payment transactions will appear here</p>
          <Link href="/products" className="mt-4 inline-block bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {payments.map((payment) => (
            <Card key={payment._id} className="p-6 border border-gray-100">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {payment.productImage ? (
                    <img
                      src={payment.productImage}
                      alt={payment.productTitle}
                      className="w-14 h-14 rounded object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {payment.productTitle || "Product"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Order #{payment.orderId}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-600">
                    BDT {payment.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    {payment.paymentStatus === "paid" ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">Paid</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs text-yellow-600 font-medium">Pending</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {payment.paymentMethod || "Stripe"}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}