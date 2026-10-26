export interface Envelope<T> {
  success: boolean;
  data: T;
  meta?: PageMeta;
  message?: string;
  summary?: unknown;
}

export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore?: boolean;
}

export interface ApiErrorShape {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export interface ProductImage {
  url: string;
  alt?: string;
}

export interface ProductOptionPrice {
  category: string;
  ageFrom?: number;
  ageTo?: number;
  buyingPrice: number;
  serviceCharge: number;
  tax: number;
  price?: number;
  computedPrice: number;
}

export interface ProductOption {
  index: number;
  name: string;
  details?: string;
  type?: string;
  capacity?: number;
  active: boolean;
  startDate?: string;
  endDate?: string;
  repeat: string[];
  startTime: string[];
  duration?: string;
  cutoff?: string;
  languages: string[];
  lastDays: { days: number; percent: number };
  prices: ProductOptionPrice[];
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  sku?: string;
  status: string;
  type?: string;
  shortDescription?: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  onSale?: boolean;
  currency: string;
  image: string;
  images: ProductImage[];
  gallery: string[];
  categoryIds: string[];
  tagIds: string[];
  activityTypeIds: string[];
  rating: { average: number; count: number; counts: Record<string, number> };
  bookingCount?: number;
  isFeatured?: boolean;
  passportRequirement?: string;
  createdAt?: string;
}

export interface ProductFull extends Product {
  description?: string;
  content?: string;
  keyPoints?: Record<string, string[] | string>;
  importantInformation?: Record<string, string[] | string>;
  liveTourGuide?: Record<string, unknown>;
  highlightedText?: string;
  highlightedQuantityText?: string;
  productOptions: ProductOption[];
  seo?: Record<string, unknown>;
  related: Product[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description?: string;
  categoryType?: string;
  categoryPageLink?: string;
  topExperience?: boolean;
  topAttraction?: boolean;
  image?: string;
  icon?: string;
  productCount: number;
  order?: number;
  children?: Category[];
}

export interface Taxonomy {
  id: string;
  name: string;
  slug: string;
  kind: string;
}

export interface ShowcaseEntry {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  link?: string;
  pageTitle?: string;
  productId?: string | null;
  order?: number;
}

export interface Showcase {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description?: string;
  kind: 'destination' | 'attraction';
  status?: string;
  items: ShowcaseEntry[];
}

export interface PageDoc {
  id: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  image?: string;
  template?: string;
  gallery?: string[];
  whyVisitUs?: { title?: string; cards?: { title: string; description: string }[] };
  seo?: { title?: string; description?: string };
}

export interface PostDoc {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  createdAt?: string;
  viewCount?: number;
  related?: PostDoc[];
  relatedProducts?: Product[];
}

export interface Faq {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryIds?: string[];
  order?: number;
  status?: string;
}

export interface FaqCategory {
  id: string;
  name: string;
  slug: string;
  order?: number;
}

export interface Travelers {
  Adult?: number;
  Child?: number;
  Infant?: number;
  Youth?: number;
  Senior?: number;
}

export interface PriceQuote {
  travelers: Travelers;
  travelerCount: number;
  breakdown: {
    category: string;
    count: number;
    unitPrice: number;
    subtotal: number;
    taxAmount: number;
  }[];
  subtotal: number;
  serviceChargeTotal: number;
  taxTotal: number;
  surchargePercent: number;
  surcharge: number;
  total: number;
  perPerson: number;
  currency: string;
  lastMinuteApplied: boolean;
  daysUntilTravel: number;
}

export interface CartItem {
  key: string;
  productId: string;
  productTitle: string;
  productSlug: string;
  productImage: string;
  optionIndex: number;
  optionName: string;
  details?: string;
  duration?: string;
  date: string;
  time?: string;
  language?: string;
  travelers: Travelers;
  travelerCount: number;
  unitPrice: number;
  total: number;
  available: boolean;
  unavailableReason?: string;
}

export interface CartView {
  sessionId: string;
  items: CartItem[];
  extras: { id: string; label: string; price: number }[];
  couponCode: string;
  travelerCount: number;
  subtotal: number;
  discountTotal: number;
  feeTotal: number;
  taxTotal: number;
  total: number;
  expiresAt: string;
  reservationExpiresIn: number;
}

export interface CheckoutOptions {
  extras: { id: string; label: string; price: number }[];
  pickupOptions: string[];
  departureOptions: string[];
  requiresCompanyField: boolean;
  minTravelers: number;
  maxTravelers: number;
  turnstile?: { mode: 'managed' | 'invisible'; siteKey: string } | null;
}

export interface Address {
  label?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface PublicUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  role?: string;
  marketingOptIn?: boolean;
  createdAt?: string;
  addresses?: Address[];
  billingAddress?: Address;
  shippingAddress?: Address;
  orderCount?: number;
  totalSpent?: number;
  siteCurrency?: string;
}

export interface AccountOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
  firstItemTitle: string;
  firstItemImage: string;
}

export interface AccountOrder extends AccountOrderSummary {
  ticketFiles?: string[];
  ticketSentAt?: string;
  items: {
    productTitle: string;
    productImage?: string;
    optionName?: string;
    date?: string;
    time?: string;
    travelerCount?: number;
    total?: number;
  }[];
  billing?: Record<string, string>;
  cancellation?: { allowed: boolean; reason?: string; travelDate?: string | null };
  cancelRequested?: boolean;
  paymentMethod?: string;
}

export interface TrackResult {
  orderNumber: string;
  status: string;
  stage: string;
  stageIndex: number;
  stages: string[];
  label: string;
  message: string;
  createdAt: string;
  total: number;
  currency: string;
  customerName: string;
  items: {
    productTitle: string;
    productImage?: string;
    optionName?: string;
    date?: string;
    time?: string;
    travelerCount?: number;
    total?: number;
  }[];
  needsReview: boolean;
}

export interface PromoPublic {
  showBanner?: boolean;
  title?: string;
  offerText?: string;
  buttonText?: string;
  buttonLink?: string;
  bgImage?: string;
  productType?: 'category' | 'tag' | 'products';
  category?: string[];
  tag?: string[];
  productIds?: string[];
  products?: Product[];
}

export interface FomoPublicEntry {
  person: string;
  country: string;
  product: { title: string; image: string; slug: string };
}

export interface PublicSettings {
  siteName: string;
  currency: string;
  currencySymbol: string;
  socials?: { label: string; url: string; icon?: string }[];
  analytics?: Record<string, string>;
  seo?: Record<string, string>;
  booking?: Record<string, unknown>;
  promo?: PromoPublic | null;
  fomoEnabled?: boolean;
  fomo?: { enabled: boolean; entries: FomoPublicEntry[] };
}

export interface ReviewItem {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  title?: string;
  content: string;
  verifiedBooking?: boolean;
  images?: string[];
  createdAt?: string;
}

export interface ReviewsResponse {
  reviews: ReviewItem[];
  summary: { total: number; rated: number; average: number; counts: Record<string, number> };
}

export interface FaqDoc extends Faq {
  status?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  href: string;
  image?: string;
  count?: number;
}

export interface MenuSection {
  label: string;
  href: string;
  items: MenuItem[];
  children: Record<string, MenuItem[]>;
}

export interface MenuData {
  places: MenuSection;
  things: MenuSection;
  blog: MenuSection;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  image?: string;
  postCount: number;
}

export interface SearchPayload {
  products: Product[];
  categories: Category[];
  posts: PostDoc[];
}
