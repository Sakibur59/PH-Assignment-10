import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button, Card } from '@heroui/react';
import { stripe } from '@/lib/stripe';
import { MongoClient, ObjectId } from 'mongodb';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <Link href="/">
            <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600">
              Go Home
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-2">
            Thank you for your purchase! A confirmation email has been sent to{' '}
            <span className="font-semibold">{customerEmail}</span>.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Transaction ID: <span className="font-mono">{payment_intent?.id || session_id}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard/orders">
              <Button className="w-full bg-emerald-500 text-white hover:bg-emerald-600">
                View My Orders
              </Button>
            </Link>
            <Link href="/">
              <Button variant="bordered" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

 
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">❓</div>
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