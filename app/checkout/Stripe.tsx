"use client";

import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const StripeProvider = ({
  clientSecret,
  children,
}: {
  clientSecret: string;
  children: React.ReactNode;
}) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#6366f1",
          },
        },
      }}
    >
      {children}
    </Elements>
  );
};

export const StripeForm = ({
  clientSecret,
  onPaymentSuccess,
  onError,
}: {
  clientSecret: string;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  onError: (error: Error) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/complete`,
        },
        redirect: "if_required",
      });

      if (error) {
        throw error;
      }

      if (paymentIntent?.status === "succeeded") {
        await onPaymentSuccess(paymentIntent.id);
      } else {
        throw new Error("Payment not completed");
      }
    } catch (error: any) {
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <PaymentElement />
      <Button
        type="submit"
        onClick={handleSubmit}
        disabled={isProcessing}
        className="w-full mt-4"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Completing Payment...
          </>
        ) : (
          "Confirm Payment"
        )}
      </Button>
    </div>
  );
};
