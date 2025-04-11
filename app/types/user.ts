export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "vendor" | "retailer" | "wholesaler" | "customer";
  businessName?: string;
  businessAddress?: string;
  taxId?: string;
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: string;
  updatedAt: string;
}
