import { User } from "./user";

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  category: string;
  subCategory?: string;
  brand?: string;
  model?: string;
  sku?: string;
  quantity: number;
  images: string[];
  specifications?: Record<string, string>;
  tags?: string[];
  vendor: string | User;
  isActive: boolean;
  discount: number;
  rating: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
  stock: number;
  isFeatured: boolean;
  isDeleted: boolean;
  isOutOfStock: boolean;
  isOnSale: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isRecommended: boolean;
  isPopular: boolean;
  isLimitedEdition: boolean;
  isExclusive: boolean;
  isPreOrder: boolean;
  isBackOrder: boolean;
  isSubscription: boolean;
  isGiftCard: boolean;
  isBundle: boolean;
  isFlashSale: boolean;
  isDealOfTheDay: boolean;
  isLimitedTimeOffer: boolean;
  isClearance: boolean;
  isLiquidation: boolean;
  isAuction: boolean;
  isCrowdfunding: boolean;
  isDonation: boolean;
  isCharity: boolean;
  isFundraiser: boolean;
  isMembership: boolean;
  isLoyalty: boolean;
  isReferral: boolean;
  isAffiliate: boolean;
  isPartnership: boolean;
  isCollaboration: boolean;
  isSponsorship: boolean;
  isInfluencer: boolean;
  isAmbassador: boolean;
  isBrand: boolean;
  isFranchise: boolean;
  isLicensing: boolean;
  isMerchandising: boolean;
  isCoBranding: boolean;
  isPrivateLabel: boolean;
  isWhiteLabel: boolean;
  isOEM: boolean;
  isODM: boolean;
  isCMO: boolean;
  isCPO: boolean;
  isCFO: boolean;
  isCOO: boolean;
  isCTO: boolean;
  isCIO: boolean;
  isCSO: boolean;
  isCRO: boolean;
  isCDO: boolean;
  isCLO: boolean;
  isCHRO: boolean;
}

export interface Review {
  _id: string;
  user: string | User;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}
export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
}
