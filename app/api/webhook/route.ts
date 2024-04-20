// creating a webhook for stripe

import { headers } from "next/headers";
import Stripe from "stripe";

import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse(`Webhook Error: ${error}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  // If the user has successfully completed the checkout session
  if (event.type === "checkout.session.completed") {
    console.log(`Payment successful: ${session.payment_intent}`);
    // Retrieve the subscription
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    if (!session?.metadata?.userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prismadb.userSubscription.create({
      data: {
        // So that's how we are going to match the user with the subscription using webhook  because in this webhook we cannot use Clerk because this webhook is gonna be running independently from our application. And we are also gonna have to add this webhook to public routes as well.  because it's gonna be accessed by Stripe in a different way.
        userId: session?.metadata?.userId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }

  // If the user has successfully completed the payment or has just upgraded their subscription
  if ((event.type = "invoice.payment_succeeded")) {
    console.log("Session: ", session);
    console.log("Session.subscription: ", session.subscription);
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await prismadb.userSubscription.update({
      where: {
        stripeSubscriptionId: subscription.id,
      },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      },
    });
  }

  return new NextResponse("Webhook received", { status: 200 });
}
