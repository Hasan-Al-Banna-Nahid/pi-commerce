import { Product } from "./product";
import { User } from "./user";

export interface Order {
  _id: string;
  user: string | User;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  shippingMethod: string;
  shippingCost: number;
  taxAmount: number;
  subtotal: number;
  total: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  notes?: string;
  vendor?: string | User;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

interface OrderItem {
  product: string | Product;
  quantity: number;
  price: number;
  variant?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone?: string;
}
