import { createCheckout } from '@/libs/stripe';
import { createClient } from '@/libs/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// This function is used to create a Stripe Checkout Session (one-time payment or subscription)
// It's called by the <ButtonCheckout /> component
// Users must be authenticated. It will prefill the Checkout data with their email and/or credit card (if any)
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.priceId || body.priceId.trim() === '') {
    return NextResponse.json(
      { error: 'Price ID is required' },
      { status: 400 }
    );
  } else if (!body.successUrl || !body.cancelUrl) {
    return NextResponse.json(
      { error: 'Success and cancel URLs are required' },
      { status: 400 }
    );
  } else if (!body.mode) {
    return NextResponse.json(
      {
        error:
          "Mode is required (either 'payment' for one-time payments or 'subscription' for recurring subscription)",
      },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Require authentication before checkout
    if (!user?.id) {
      return NextResponse.json(
        {
          error:
            'Authentication required. Please sign in or create an account first.',
        },
        { status: 401 }
      );
    }

    const { priceId, mode, successUrl, cancelUrl } = body;

    // Get user profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileData) {
      return NextResponse.json(
        {
          error: 'User profile not found. Please complete your account setup.',
        },
        { status: 400 }
      );
    }

    const stripeSessionURL = await createCheckout({
      priceId,
      mode,
      successUrl,
      cancelUrl,
      // Pass the authenticated user ID to Stripe
      clientReferenceId: user.id,
      user: {
        email: profileData.email,
        // If the user has already purchased, prefill their credit card
        customerId: profileData.customer_id || null,
      },
      // If you send coupons from the frontend, you can pass it here
      // couponId: body.couponId,
    });

    return NextResponse.json({ url: stripeSessionURL });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
