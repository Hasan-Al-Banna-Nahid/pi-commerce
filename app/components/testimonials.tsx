"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Print Shop Owner",
    avatar: "/avatars/sarah.jpg",
    content:
      "The digital Devices we purchased has transformed our business. The quality is exceptional and the support team is always helpful.",
    rating: 5,
  },
  {
    name: "Michael Chen",
    role: "Graphic Designer",
    avatar: "/avatars/michael.jpg",
    content:
      "I've been using their artboards for all my projects. The quality is consistent and the prices are very competitive.",
    rating: 4,
  },
  {
    name: "David Wilson",
    role: "Marketing Director",
    avatar: "/avatars/david.jpg",
    content:
      "Our wholesale order was processed quickly and delivered on time. The products have exceeded our expectations.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          What Our Customers Say
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback>
                      {testimonial.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < testimonial.rating ? "fill-primary" : "fill-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="italic">"{testimonial.content}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
