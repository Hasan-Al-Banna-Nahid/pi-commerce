"use client";

import { useAuth } from "@/app/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CreditCard, Plus, Minus, Badge } from "lucide-react";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCart } from "@/app/providers/shopping-cart";
import { Navbar } from "@/app/components/navbar/Navbar";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import api from "@/app/lib/axios";
import { Checkbox } from "@/components/ui/checkbox";
import { StripeProvider, StripeForm } from "@/app/checkout/Stripe";

export default function CheckoutPage() {
  const { cartItems, cartCount, clearCart, updateQuantity, removeFromCart } =
    useCart();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [codVerified, setCodVerified] = useState(false);
  const [clientSecret, setClientSecret] = useState("");
  const [savedPaymentMethodId, setSavedPaymentMethodId] = useState<
    string | null
  >(null);
  const [cardDetailsProvided, setCardDetailsProvided] = useState(false);
  const [isLoadingPaymentIntent, setIsLoadingPaymentIntent] = useState(false);
  const router = useRouter();

  const getMinimumQuantity = (price: number) => {
    if (price <= 20000) return 5;
    if (price > 20000 && price <= 80000) return 3;
    return 1;
  };

  const hasInvalidQuantity = cartItems.some(
    (item) => item.quantity < getMinimumQuantity(item.price)
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useGSAP(() => {
    gsap.from(".checkout-item", {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.5,
      ease: "power2.out",
    });
  }, [cartItems]);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "Dhaka",
    state: "",
    postalCode: "",
    country: "bd",
    billingSameAsShipping: true,
    billingStreet: "",
    billingCity: "Dhaka",
    billingState: "",
    billingPostalCode: "",
    billingCountry: "bd",
    useSavedCard: false,
  });

  const shippingCost = formData.city === "Dhaka" ? 60 : 100;
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const calculateTaxes = (subtotal: number) => {
    const customsDuty = subtotal > 80000 ? 0 : subtotal * 0.05;
    const supplementaryDuty = subtotal * 0.1;
    const vat = subtotal * 0.15;
    const ait = subtotal * 0.05;
    const at = subtotal * 0.05;
    return customsDuty + supplementaryDuty + vat + ait + at;
  };

  const taxAmount = calculateTaxes(subtotal);
  const total = subtotal + shippingCost + taxAmount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, city: e.target.value }));
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  const verifyCod = async () => {
    if (!formData.phone) {
      toast.error("Phone number is required for COD verification");
      return;
    }

    if (formData.phone.length < 11) {
      toast.error("Phone number must be at least 11 digits");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await api.post("/api/orders/cod/verify", {
        phone: formData.phone,
      });

      if (response.data.success && response.data.verified) {
        setCodVerified(true);
        toast.success("COD verification successful");
      } else {
        throw new Error(response.data.message || "COD verification failed");
      }
    } catch (error: any) {
      toast.error("COD verification failed", {
        description: error.response?.data?.message || error.message,
      });
      setCodVerified(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateForm = () => {
    if (hasInvalidQuantity) {
      cartItems
        .filter((item) => item.quantity < getMinimumQuantity(item.price))
        .forEach((item) => {
          toast.error(
            `Minimum order for ${item.name} (${item.price.toFixed(
              2
            )}৳) is ${getMinimumQuantity(item.price)} pieces`
          );
        });
      return false;
    }

    const requiredFields = [
      "name",
      "email",
      "phone",
      "street",
      "city",
      "state",
      "postalCode",
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        toast.error(`Please fill in ${field}`);
        return false;
      }
    }

    if (!formData.billingSameAsShipping) {
      const billingFields = [
        "billingStreet",
        "billingCity",
        "billingState",
        "billingPostalCode",
      ];

      for (const field of billingFields) {
        if (!formData[field as keyof typeof formData]) {
          toast.error(`Please fill in billing ${field.replace("billing", "")}`);
          return false;
        }
      }
    }

    if (paymentMethod === "cod" && !codVerified) {
      toast.error("Please verify COD first");
      return false;
    }

    if (
      paymentMethod === "credit" &&
      !formData.useSavedCard &&
      !cardDetailsProvided
    ) {
      toast.error("Please enter valid card details");
      return false;
    }

    return true;
  };

  const handlePaymentIntentCreation = async () => {
    setIsLoadingPaymentIntent(true);
    try {
      const paymentIntentResponse = await api.post(
        "/api/orders/stripe/create-payment-intent",
        {
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
          },
          billingAddress: formData.billingSameAsShipping
            ? undefined
            : {
                street: formData.billingStreet,
                city: formData.billingCity,
                state: formData.billingState,
                postalCode: formData.billingPostalCode,
                country: formData.billingCountry,
                phone: formData.phone,
              },
          shippingCost,
          taxAmount,
          subtotal,
          total,
          paymentMethodId: formData.useSavedCard
            ? savedPaymentMethodId
            : undefined,
        }
      );

      if (!paymentIntentResponse.data.clientSecret) {
        throw new Error("No client secret received");
      }

      console.log("Payment Intent Created:", paymentIntentResponse.data);
      return paymentIntentResponse.data;
    } catch (error: any) {
      console.error("Payment Intent Creation Error:", error);
      toast.error("Failed to initialize payment", {
        description: error.response?.data?.message || error.message,
      });
      throw error;
    } finally {
      setIsLoadingPaymentIntent(false);
    }
  };

  const handleStripePayment = async () => {
    try {
      const response = await handlePaymentIntentCreation();
      setClientSecret(response.clientSecret);

      if (formData.useSavedCard && response.paymentIntentId) {
        const paymentIntentStatus = await api.get(
          `/api/orders/stripe/payment-intent-status/${response.paymentIntentId}`
        );

        if (paymentIntentStatus.data.status === "succeeded") {
          await handlePaymentSuccess(response.paymentIntentId);
        } else if (paymentIntentStatus.data.status === "requires_action") {
          toast.info("Additional authentication required for saved card");
          setClientSecret(response.clientSecret);
        } else {
          toast.error("Payment intent not confirmed");
          setIsProcessing(false);
        }
      }
    } catch (error: any) {
      toast.error("Payment failed", {
        description: error.response?.data?.message || error.message,
      });
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      const orderResponse = await api.post("/api/orders", {
        paymentIntentId,
      });

      if (orderResponse.data.success) {
        toast.success("Order placed successfully!", {
          description: "Your order has been confirmed.",
        });
        clearCart();
        router.push("/order/success");
      } else {
        throw new Error(orderResponse.data.message || "Order creation failed");
      }
    } catch (error: any) {
      toast.error("Order creation failed", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodPayment = async () => {
    try {
      const orderResponse = await api.post("/api/orders/cod", {
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
        billingAddress: formData.billingSameAsShipping
          ? undefined
          : {
              street: formData.billingStreet,
              city: formData.billingCity,
              state: formData.billingState,
              postalCode: formData.billingPostalCode,
              country: formData.billingCountry,
              phone: formData.phone,
            },
        shippingCost,
      });

      if (orderResponse.data.success) {
        toast.success("Order placed successfully!", {
          description: "Your COD order has been confirmed.",
        });
        clearCart();
        router.push("/order/success");
      } else {
        throw new Error(orderResponse.data.message || "COD order failed");
      }
    } catch (error: any) {
      toast.error("COD order failed", {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isProcessing) return;

    setIsProcessing(true);

    try {
      if (paymentMethod === "credit") {
        await handleStripePayment();
      } else {
        await handleCodPayment();
      }
    } catch (error: any) {
      toast.error(
        paymentMethod === "credit" ? "Payment failed" : "Order failed",
        { description: error.message }
      );
      setIsProcessing(false);
    }
  };

  // Initialize clientSecret when selecting credit card payment
  useEffect(() => {
    if (
      paymentMethod === "credit" &&
      !formData.useSavedCard &&
      isAuthenticated &&
      cartItems.length > 0
    ) {
      handlePaymentIntentCreation()
        .then((response) => {
          setClientSecret(response.clientSecret);
        })
        .catch((error) => {
          console.error("Failed to initialize clientSecret:", error);
        });
    } else {
      setClientSecret("");
      setCardDetailsProvided(false);
    }
  }, [paymentMethod, formData.useSavedCard, isAuthenticated, cartItems]);

  // Fetch saved payment methods
  useEffect(() => {
    const fetchSavedPaymentMethods = async () => {
      try {
        // Mocked for demonstration; replace with actual API call
        setSavedPaymentMethodId("pm_123456789");
      } catch (error) {
        console.error("Failed to fetch saved payment methods:", error);
      }
    };

    if (isAuthenticated) {
      fetchSavedPaymentMethods();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (cartCount === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">
          Add some products to your cart before checking out
        </p>
        <Button asChild>
          <a href="/products">Browse Products</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />

      <div className="absolute inset-0 -z-10 opacity-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.jpg')] bg-repeat [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"
        >
          Checkout
        </motion.h1>

        {hasInvalidQuantity && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Some products don't meet the minimum order quantity requirements:
            </p>
            <ul className="list-disc pl-5 mt-2">
              {cartItems
                .filter(
                  (item) => item.quantity < getMinimumQuantity(item.price)
                )
                .map((item) => (
                  <li key={item.id}>
                    {item.name}: Minimum {getMinimumQuantity(item.price)} pieces
                    (currently {item.quantity})
                  </li>
                ))}
            </ul>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Shipping & Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Shipping Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="street">Street Address *</Label>
                    <Input
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <select
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleCityChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      >
                        <option value="Dhaka">Dhaka</option>
                        <option value="Chittagong">Chittagong</option>
                        <option value="Sylhet">Sylhet</option>
                        <option value="Rajshahi">Rajshahi</option>
                        <option value="Khulna">Khulna</option>
                        <option value="Barishal">Barishal</option>
                        <option value="Rangpur">Rangpur</option>
                        <option value="Mymensingh">Mymensingh</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      disabled
                    />
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="billingSameAsShipping"
                        checked={formData.billingSameAsShipping}
                        onCheckedChange={(checked) =>
                          setFormData({
                            ...formData,
                            billingSameAsShipping: Boolean(checked),
                          })
                        }
                      />
                      <Label htmlFor="billingSameAsShipping">
                        Billing address same as shipping
                      </Label>
                    </div>

                    {!formData.billingSameAsShipping && (
                      <div className="mt-4 space-y-4">
                        <h4 className="font-medium">Billing Address</h4>
                        <div className="space-y-2">
                          <Label htmlFor="billingStreet">
                            Street Address *
                          </Label>
                          <Input
                            id="billingStreet"
                            name="billingStreet"
                            value={formData.billingStreet}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="billingCity">City *</Label>
                            <Input
                              id="billingCity"
                              name="billingCity"
                              value={formData.billingCity}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingState">State *</Label>
                            <Input
                              id="billingState"
                              name="billingState"
                              value={formData.billingState}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="billingPostalCode">
                              Postal Code *
                            </Label>
                            <Input
                              id="billingPostalCode"
                              name="billingPostalCode"
                              value={formData.billingPostalCode}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-lg">Payment Method</h3>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) => {
                      setPaymentMethod(value);
                      setCodVerified(false);
                      setClientSecret("");
                      setCardDetailsProvided(false);
                    }}
                    className="grid gap-4"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label
                        htmlFor="credit"
                        className="flex items-center gap-2"
                      >
                        <CreditCard className="h-5 w-5" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex items-center gap-2">
                        <Image
                          src="/images/cod-icon.jpg"
                          alt="Cash on Delivery"
                          width={20}
                          height={20}
                          className="h-5 w-auto"
                        />
                        Cash on Delivery
                      </Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "credit" && (
                    <div className="space-y-4">
                      {savedPaymentMethodId && (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="useSavedCard"
                            checked={formData.useSavedCard}
                            onCheckedChange={(checked) => {
                              setFormData({
                                ...formData,
                                useSavedCard: Boolean(checked),
                              });
                              setClientSecret("");
                              setCardDetailsProvided(false);
                            }}
                          />
                          <Label htmlFor="useSavedCard">
                            Use saved card (ending in XXXX)
                          </Label>
                        </div>
                      )}

                      {paymentMethod === "credit" && !formData.useSavedCard ? (
                        isLoadingPaymentIntent ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span className="ml-2">
                              Loading payment form...
                            </span>
                          </div>
                        ) : clientSecret ? (
                          <StripeProvider clientSecret={clientSecret}>
                            <StripeForm
                              clientSecret={clientSecret}
                              onPaymentSuccess={handlePaymentSuccess}
                              onError={(error) => {
                                toast.error("Payment failed", {
                                  description: error.message,
                                });
                                setIsProcessing(false);
                              }}
                              onCardChange={(event) => {
                                setCardDetailsProvided(event.complete);
                              }}
                            />
                          </StripeProvider>
                        ) : (
                          <p className="text-red-500">
                            Failed to load payment form. Please try again.
                          </p>
                        )
                      ) : (
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                          disabled={isProcessing || hasInvalidQuantity}
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Preparing payment...
                            </>
                          ) : (
                            `Pay ${total.toFixed(2)}৳`
                          )}
                        </Button>
                      )}
                    </div>
                  )}

                  {paymentMethod === "cod" && (
                    <div className="pt-4 space-y-4">
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          Please verify your phone number for COD
                        </p>
                        {!codVerified ? (
                          <Button
                            type="button"
                            variant="outline"
                            className="mt-2"
                            onClick={verifyCod}
                            disabled={isProcessing || !formData.phone}
                          >
                            {isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Verify COD
                          </Button>
                        ) : (
                          <Badge className="mt-2 bg-green-100 text-green-800">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                        disabled={
                          isProcessing || !codVerified || hasInvalidQuantity
                        }
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          `Place Order ${total.toFixed(2)}৳`
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="h-fit border-0 shadow-lg bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      className="checkout-item flex items-start gap-4"
                    >
                      <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                        <img
                          src={item.image || "/placeholder-product.jpg"}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.price.toFixed(2)}৳ × {item.quantity}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity - 1)
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleQuantityChange(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="font-medium">
                        {(item.price * item.quantity).toFixed(2)}৳
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{subtotal.toFixed(2)}৳</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Shipping (
                      {formData.city === "Dhaka"
                        ? "Inside Dhaka"
                        : "Outside Dhaka"}
                      )
                    </span>
                    <span>{shippingCost.toFixed(2)}৳</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes & Fees</span>
                    <span>{taxAmount.toFixed(2)}৳</span>
                  </div>

                  <div className="flex justify-between pt-3 border-t font-medium text-lg">
                    <span>Total</span>
                    <span>{total.toFixed(2)}৳</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
