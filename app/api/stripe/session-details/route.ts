import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
  typescript: true,
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.customer) {
      return NextResponse.json(
        { error: 'No customer found in session' },
        { status: 400 }
      );
    }

    // Get customer details
    const customer = (await stripe.customers.retrieve(
      session.customer as string
    )) as Stripe.Customer;

    return NextResponse.json({
      customer_email: customer.email,
      session_id: sessionId,
    });
  } catch (error) {
    console.error('Session details error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session details' },
      { status: 500 }
    );
  }
}
