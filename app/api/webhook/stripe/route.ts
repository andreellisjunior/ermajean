import configFile from '@/config';
import { findCheckoutSession } from '@/libs/stripe';
import { SupabaseClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-08-16',
  typescript: true,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.error('STRIPE_WEBHOOK_SECRET is not set');
}

// This is where we receive Stripe webhook events
// It used to update the user data, send emails, etc...
// By default, it'll store the user in the database
// See more: https://shipfa.st/docs/features/payments
export async function POST(req: NextRequest) {
  console.log('Webhook received!');

  const body = await req.text();
  console.log('Body length:', body.length);

  const signature = headers().get('stripe-signature');
  console.log('Signature present:', !!signature);

  let eventType;
  let event;

  // Create a private supabase client using the secret service_role API key
  const supabase = new SupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // verify Stripe event is legit
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  eventType = event.type;

  try {
    console.log(`Processing webhook event: ${eventType}`);

    switch (eventType) {
      case 'checkout.session.completed': {
        // First payment is successful and a subscription is created (if mode was set to "subscription" in ButtonCheckout)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Checkout.Session = event.data
          .object as Stripe.Checkout.Session;

        const session = await findCheckoutSession(stripeObject.id);

        const customerId = session?.customer;
        const priceId = session?.line_items?.data[0]?.price.id;
        const userId = stripeObject.client_reference_id;
        const plan = configFile.stripe.plans.find((p) => p.priceId === priceId);

        console.log(
          `Processing checkout for customer: ${customerId}, priceId: ${priceId}, userId: ${userId}`
        );

        if (!customerId) {
          console.error('No customer ID found in checkout session');
          break;
        }

        const customer = (await stripe.customers.retrieve(
          customerId as string
        )) as Stripe.Customer;

        if (!plan) {
          console.error(`No plan found for priceId: ${priceId}`);
          break;
        }

        let user;
        if (!userId) {
          // check if user already exists
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', customer.email)
            .single();
          if (profile) {
            user = profile;
          } else {
            // create a new user using supabase auth admin
            const { data } = await supabase.auth.admin.createUser({
              email: customer.email,
            });

            if (data?.user) {
              // Create or get the profile for the new user
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();

              user = newProfile;
            }
          }
        } else {
          // find user by ID
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          user = profile;
        }

        if (user?.id) {
          await supabase
            .from('profiles')
            .update({
              customer_id: customerId,
              price_id: priceId,
              has_access: true,
            })
            .eq('id', user.id);
        }

        // Extra: send email with user link, product page, etc...
        // try {
        //   await sendEmail(...);
        // } catch (e) {
        //   console.error("Email issue:" + e?.message);
        // }

        break;
      }

      case 'checkout.session.expired': {
        // User didn't complete the transaction
        // You don't need to do anything here, by you can send an email to the user to remind him to complete the transaction, for instance
        break;
      }

      case 'customer.subscription.updated': {
        // The customer might have changed the plan (higher or lower plan, cancel soon etc...)
        // You don't need to do anything here, because Stripe will let us know when the subscription is canceled for good (at the end of the billing cycle) in the "customer.subscription.deleted" event
        // You can update the user data to show a "Cancel soon" badge for instance
        break;
      }

      case 'customer.subscription.deleted': {
        try {
          const stripeObject: Stripe.Subscription = event.data
            .object as Stripe.Subscription;

          const subscription = await stripe.subscriptions.retrieve(
            stripeObject.id
          );

          if (!subscription.customer) {
            console.error('No customer ID found in subscription');
            break;
          }

          // First get the profile using customer_id
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('customer_id', subscription.customer)
            .single();

          if (profile) {
            // Then update using the profile id
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ has_access: false })
              .eq('id', profile.id);
          }
        } catch (error) {
          console.error('Error in subscription.deleted webhook:', error);
        }
        break;
      }

      case 'invoice.paid': {
        // Customer just paid an invoice (for instance, a recurring payment for a subscription)
        // ✅ Grant access to the product
        const stripeObject: Stripe.Invoice = event.data
          .object as Stripe.Invoice;
        const priceId = stripeObject.lines.data[0].price.id;
        const customerId = stripeObject.customer;

        // Find profile where customer_id equals the customerId (in table called 'profiles')
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('customer_id', customerId)
          .single();

        if (!profile) {
          console.error('No profile found for customer:', customerId);
          break;
        }

        // Make sure the invoice is for the same plan (priceId) the user subscribed to
        if (profile.price_id !== priceId) break;

        // Grant the profile access to your product. It's a boolean in the database, but could be a number of credits, etc...
        await supabase
          .from('profiles')
          .update({ has_access: true })
          .eq('customer_id', customerId);

        break;
      }

      case 'invoice.payment_failed':
        // A payment failed (for instance the customer does not have a valid payment method)
        // ❌ Revoke access to the product
        // ⏳ OR wait for the customer to pay (more friendly):
        //      - Stripe will automatically email the customer (Smart Retries)
        //      - We will receive a "customer.subscription.deleted" when all retries were made and the subscription has expired

        break;

      default:
      // Unhandled event type
    }
  } catch (e) {
    console.error('Stripe webhook error:', e);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({});
}
