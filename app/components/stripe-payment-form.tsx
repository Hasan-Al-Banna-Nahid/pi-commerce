"use client";

import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface StripePaymentFormProps {
  processing: boolean;
  setProcessing: (value: boolean) => void;
  onSuccess: (orderId: string) => Promise<void>;
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
  clearCart: () => void;
}

export const StripePaymentForm = ({
  processing,
  setProcessing,
  onSuccess,
  formData,
  total,
  clientSecret,
  clearCart,
}: StripePaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const timeout = setTimeout(() => {
      toast.error("Payment is taking longer than expected. Please wait...");
    }, 10000);
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
        throw new Error(error.message || "Payment failed");
      }

      if (paymentIntent.status === "succeeded") {
        const orderId = clientSecret.split("_secret")[0].split("_").pop();
        if (orderId) {
          await onSuccess(orderId);
        } else {
          throw new Error("Order ID not found");
        }
      }
    } catch (error) {
      toast.error("Payment failed", {
        description:
          error instanceof Error ? error.message : "Payment processing error",
      });
    } finally {
      setProcessing(false);
      clearTimeout(timeout);
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
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
        disabled={!stripe || processing}
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
