"use client";

import {
  CardElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { loadStripe } from "@stripe/stripe-js";

interface StripeFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface StripeFormProps {
  formData: StripeFormData;
  clientSecret: string;
  total: number;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  onPaymentSuccess: (paymentIntentId: string) => Promise<void>;
  onError: (error: Error) => void;
  onCreatePaymentIntent: () => Promise<string>;
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);
export const StripeForm = ({
  formData,
  clientSecret,
  total,
  isProcessing,
  setIsProcessing,
  onPaymentSuccess,
  onError,
  onCreatePaymentIntent,
}: StripeFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cardElement = elements?.getElement(CardElement);

    if (!stripe || !cardElement) return;

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
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
        throw error;
      }

      if (paymentIntent?.status === "succeeded") {
        await onPaymentSuccess(paymentIntent.id);
        toast.success("Payment successful!");
      }
    } catch (error) {
      toast.error("Payment failed", {
        description:
          error instanceof Error ? error.message : "Payment processing error",
      });
      onError(error as Error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
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

      <Button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay ${total.toFixed(2)}৳`
        )}
      </Button>
    </div>
  );
};

interface StripeProviderProps {
  clientSecret: string;
  children: React.ReactNode;
}

export const StripeProvider = ({
  clientSecret,
  children,
}: StripeProviderProps) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "night",
          variables: {
            colorPrimary: "#6366f1",
            colorBackground: "#ffffff",
          },
        },
      }}
    >
      {children}
    </Elements>
  );
};
