import { auth, currentUser } from "@clerk/nextjs";
import { NextResponse } from "next/server";

import { absoluteUrl } from "@/lib/utils";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

const settingsUrl = absoluteUrl("/settings");

export async function GET() {
  try {
    const { userId } = auth();
    const user = await currentUser();

    if (!userId || !user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if user has an active subscription
    const userSubscription = await prismadb.userSubscription.findUnique({
      where: {
        userId,
      },
    });

    // if there is user subscription already and if there is stripeCustomerId then we dont want to create a checkout page (for new customer) instead we want to redirect them to a billing page so that they can cancel or upgrade their active subscription
    if (userSubscription && userSubscription.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: settingsUrl,
      });
      return new NextResponse(JSON.stringify({ url: stripeSession.url }), {
        status: 200,
      });
    }

    // Create a new checkout session if there is no active subscription
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: settingsUrl,
      cancel_url: settingsUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: user?.emailAddresses[0]?.emailAddress,
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "Sage Pro",
              description: "Unlimited access to Sage Pro features",
            },
            unit_amount: 1000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId,
      },
    });

    return new NextResponse(JSON.stringify({ url: stripeSession.url }), {
      status: 200,
    });
  } catch (error) {
    console.log("Stripe error: ", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
