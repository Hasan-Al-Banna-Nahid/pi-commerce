"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface StripePaymentFormProps {
  processing: boolean;
  setProcessing: (processing: boolean) => void;
  onSuccess: (paymentIntentId: string) => void; // Changed to void since we'll handle everything in parent
  formData: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  total: number;
  clientSecret: string;
}

export const StripePaymentForm = ({
  processing,
  setProcessing,
  onSuccess,
  formData,
  total,
  clientSecret,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent default form submission
    if (!stripe || !elements) return;

    setProcessing(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.street,
                city: formData.city,
                state: formData.state,
                postal_code: formData.postalCode,
                country: formData.country,
              },
            },
          },
        }
      );

      if (error) {
        setMessage(error.message || "An unexpected error occurred");
        throw error;
      }

      // if (paymentIntent?.status === "succeeded") {
      //   onSuccess(paymentIntent.id); // Just notify parent, don't handle redirect here
      // }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed", {
        description:
          error instanceof Error ? error.message : "Payment processing error",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border rounded-md p-4">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
                iconColor: "#666EE8",
              },
              invalid: {
                color: "#9e2146",
                iconColor: "#9e2146",
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      {message && (
        <div className="text-sm text-red-600 p-2 bg-red-50 rounded-md">
          {message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        disabled={!stripe || !elements || processing}
      >
        {processing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${total.toFixed(2)}৳`
        )}
      </Button>
    </form>
  );
};
