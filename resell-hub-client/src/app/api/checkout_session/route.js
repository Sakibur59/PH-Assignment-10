
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';

export async function POST(request) {
  try {
    const { productId, productTitle, productPrice, productImage, userId, orderId } = await request.json();

    // Validate required fields
    if (!productId || !productTitle || !productPrice || !userId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const headersList = await headers();
    const origin = headersList.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: productTitle,
              images: productImage ? [productImage] : [],
              metadata: {
                productId: productId,
              },
            },
            unit_amount: Math.round(productPrice * 100), // BDT to paisa
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment/cancel`,
      metadata: {
        productId: productId,
        userId: userId,
        orderId: orderId,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error('Error creating checkout session:', err);
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    );
  }
}