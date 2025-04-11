"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast("Subscribed! Thank you for subscribing to our newsletter.");
    setEmail("");
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
        <p className="text-lg mb-8">
          Subscribe to our newsletter for the latest products and offers
        </p>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
        >
          <Input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white text-primary"
            required
          />
          <Button type="submit" variant="secondary">
            Subscribe
          </Button>
        </form>
      </div>
    </section>
  );
}
