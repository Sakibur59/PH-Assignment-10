import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@heroui/react';
import { stripe } from '@/lib/stripe';
import { MongoClient, ObjectId } from 'mongodb';
import { CheckCircle, Package, Home } from 'lucide-react';

const client = new MongoClient(process.env.MONGO_DB_URI);
const db = client.db(process.env.AUTH_DB_NAME);
const ordersCollection = db.collection('orders');
const paymentsCollection = db.collection('payments');

async function getSessionData(sessionId) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent'],
    });
    return { session, error: null };
  } catch (error) {
    return { session: null, error };
  }
}

async function processPayment(session, orderId, sessionId) {
  try {
    await client.connect();
    
    const { customer_details, payment_intent, amount_total } = session;
    const customerEmail = customer_details?.email;
    const customerName = customer_details?.name;

    
    await ordersCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paymentStatus: 'paid',
          paymentId: payment_intent?.id || sessionId,
          customerEmail: customerEmail,
          customerName: customerName,
          updatedAt: new Date().toISOString(),
        },
      }
    );
    const paymentData = {
      orderId: orderId,
      transactionId: payment_intent?.id || sessionId,
      amount: amount_total / 100,
      paymentMethod: 'stripe',
      paymentStatus: 'success',
      customerEmail: customerEmail,
      customerName: customerName,
      stripeSessionId: sessionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await paymentsCollection.insertOne(paymentData);
    
    return { success: true };
  } catch (error) {
    console.error('Database error:', error);
    return { success: false, error };
  }
}

export default async function Success({ searchParams }) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center border-0 shadow-2xl shadow-emerald-100/50">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Session</h1>
          <p className="text-gray-600 mb-6">No session ID provided.</p>
          <Link href="/">
            <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600">
              Go Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { session, error } = await getSessionData(session_id);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center border-0 shadow-2xl shadow-emerald-100/50">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Link href="/">
            <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600">
              Try Again
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const { status, customer_details, metadata, payment_intent } = session;
  const customerEmail = customer_details?.email;
  const customerName = customer_details?.name;

  if (status === 'open') {
    redirect('/');
  }

  if (status === 'complete') {
    const orderId = metadata?.orderId;

    if (orderId) {
      await processPayment(session, orderId, session_id);
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full p-8 text-center border-0 shadow-2xl shadow-emerald-100/50 bg-white/80 backdrop-blur-sm">
          <div className="mb-6">
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-14 h-14 text-emerald-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">
            Thank you for your purchase. Your order has been confirmed and will be processed shortly.
          </p>

  
          <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Customer</span>
              <span className="text-sm font-medium text-gray-700">
                {customerName || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm text-gray-700">
                {customerEmail || 'N/A'}
              </span>
            </div>
          </div>


          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Transaction ID</span>
              <span className="text-xs font-mono text-gray-700 truncate max-w-[150px]">
                {payment_intent?.id || session_id}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="font-bold text-emerald-600">
                BDT {((session.amount_total || 0) / 100).toLocaleString()}
              </span>
            </div>
          </div>

     
          <div className="space-y-3">
            <Link href="/dashboard/buyer/orders">
              <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600 h-12 text-base">
                <Package className="w-5 h-5 mr-2" />
                View My Orders
              </Button>
            </Link>
            <Link href="/">
              <Button variant="bordered" className="w-full border-emerald-200 text-gray-700 hover:bg-emerald-50 h-12 text-base">
                <Home className="w-5 h-5 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center border-0 shadow-2xl shadow-emerald-100/50">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Status Unknown</h1>
        <p className="text-gray-600 mb-6">
          Payment status: <span className="font-semibold">{status}</span>
        </p>
        <Link href="/">
          <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600">
            Go Home
          </Button>
        </Link>
      </Card>
    </div>
  );
}