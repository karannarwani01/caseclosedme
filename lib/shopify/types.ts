export type Maybe<T> = T | null;

export type Connection<T> = {
  edges: Array<Edge<T>>;
};

export type Edge<T> = {
  node: T;
};

export type Cart = Omit<ShopifyCart, "lines"> & {
  lines: CartItem[];
};

export type CartProduct = {
  id: string;
  handle: string;
  title: string;
  featuredImage: Image;
};

export type SellingPlanPriceAdjustment = {
  adjustmentValue:
    | { adjustmentPercentage: number }
    | { adjustmentAmount: Money }
    | { price: Money }
    // Shopify can return an adjustment type we don't model; treat as "no
    // displayable discount" rather than letting the PDP throw.
    | Record<string, never>;
};

export type SellingPlan = {
  id: string;
  name: string;
  description?: string | null;
  recurringDeliveries: boolean;
  priceAdjustments: SellingPlanPriceAdjustment[];
};

export type ShopifySellingPlanGroup = {
  appName?: string | null;
  name: string;
  options: { name: string; values: string[] }[];
  sellingPlans: Connection<SellingPlan>;
};

export type SellingPlanGroup = Omit<ShopifySellingPlanGroup, "sellingPlans"> & {
  sellingPlans: SellingPlan[];
};

export type CartItem = {
  id: string | undefined;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  /** Present only on subscription lines; null/absent on one-time purchases. */
  sellingPlanAllocation?: {
    sellingPlan: { id: string; name: string; recurringDeliveries: boolean };
  } | null;
  merchandise: {
    id: string;
    title: string;
    selectedOptions: {
      name: string;
      value: string;
    }[];
    product: CartProduct;
  };
};

export type Collection = ShopifyCollection & {
  path: string;
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Menu = {
  title: string;
  path: string;
};

export type Money = {
  amount: string;
  currencyCode: string;
};

export type Page = {
  id: string;
  title: string;
  handle: string;
  body: string;
  bodySummary: string;
  seo?: SEO;
  createdAt: string;
  updatedAt: string;
};

export type Product = Omit<
  ShopifyProduct,
  "variants" | "images" | "media" | "sellingPlanGroups"
> & {
  variants: ProductVariant[];
  images: Image[];
  /** Only the PDP query fetches these; listing/recommendation nodes omit it. */
  sellingPlanGroups?: SellingPlanGroup[];
  /** URL of the product's GLB 3D model, when one is uploaded as media. */
  model3dUrl?: string;
};

export type ProductOption = {
  id: string;
  name: string;
  values: string[];
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  price: Money;
  sku?: string | null;
  quantityAvailable?: number | null;
};

export type SEO = {
  title: string;
  description: string;
};

export type ShopifyCart = {
  id: string | undefined;
  checkoutUrl: string;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
    totalTaxAmount: Money;
  };
  lines: Connection<CartItem>;
  totalQuantity: number;
};

export type ShopifyCollection = {
  handle: string;
  title: string;
  description: string;
  seo: SEO;
  updatedAt: string;
};

export type ShopifyProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  description: string;
  descriptionHtml: string;
  options: ProductOption[];
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  variants: Connection<ProductVariant>;
  featuredImage: Image;
  images: Connection<Image>;
  seo: SEO;
  tags: string[];
  productType: string;
  vendor: string;
  createdAt: string;
  compareAtPriceRange?: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  updatedAt: string;
  media?: Connection<ShopifyMedia>;
  sellingPlanGroups?: Connection<ShopifySellingPlanGroup>;
};

export type ShopifyMedia = {
  mediaContentType: string;
  sources?: {
    url: string;
    format: string;
    mimeType: string;
  }[];
};

export type ShopifyCartOperation = {
  data: {
    cart: ShopifyCart;
  };
  variables: {
    cartId: string;
  };
};

export type ShopifyCreateCartOperation = {
  data: { cartCreate: { cart: ShopifyCart } };
};

export type ShopifyAddToCartOperation = {
  data: {
    cartLinesAdd: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      merchandiseId: string;
      quantity: number;
      sellingPlanId?: string;
    }[];
  };
};

export type ShopifyRemoveFromCartOperation = {
  data: {
    cartLinesRemove: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lineIds: string[];
  };
};

export type ShopifyUpdateCartOperation = {
  data: {
    cartLinesUpdate: {
      cart: ShopifyCart;
    };
  };
  variables: {
    cartId: string;
    lines: {
      id: string;
      merchandiseId: string;
      quantity: number;
      sellingPlanId?: string;
    }[];
  };
};

export type ShopifyCollectionOperation = {
  data: {
    collection: ShopifyCollection;
  };
  variables: {
    handle: string;
  };
};

export type ShopifyCollectionProductsOperation = {
  data: {
    collection: {
      products: Connection<ShopifyProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

// Trimmed product node returned by the `productListing` fragment (listing/grid
// views). Mirrors the fields in lib/shopify/fragments/product-listing.ts.
export type ShopifyListingProduct = {
  id: string;
  handle: string;
  availableForSale: boolean;
  title: string;
  priceRange: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  compareAtPriceRange?: {
    maxVariantPrice: Money;
    minVariantPrice: Money;
  };
  featuredImage: Image;
  variants: Connection<ProductVariant>;
  tags: string[];
  productType: string;
  vendor: string;
  createdAt: string;
};

export type ShopifyCollectionListingOperation = {
  data: {
    collection: {
      products: Connection<ShopifyListingProduct>;
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
  };
};

// Cursor-paginated variant used by the collection grid's "Load more" so the
// initial fetch can be capped (first: 48) without losing products beyond it.
export type ShopifyCollectionListingPageOperation = {
  data: {
    collection?: {
      products: Connection<ShopifyListingProduct> & {
        pageInfo: { hasNextPage: boolean; endCursor: string | null };
      };
    };
  };
  variables: {
    handle: string;
    reverse?: boolean;
    sortKey?: string;
    first?: number;
    after?: string;
  };
};

// Minimal query for the mega-menu: just the featured image URLs of a
// collection's first few products (no variants/price/tags), so the navbar
// doesn't pull full product listings on every page.
export type ShopifyCollectionFeaturedImagesOperation = {
  data: {
    collection?: {
      products: Connection<{ featuredImage?: { url: string } | null }>;
    };
  };
  variables: {
    handle: string;
    first?: number;
  };
};

export type ShopifyCollectionsOperation = {
  data: {
    collections: Connection<ShopifyCollection>;
  };
};

export type ShopifyMenuOperation = {
  data: {
    menu?: {
      items: {
        title: string;
        url: string;
      }[];
    };
  };
  variables: {
    handle: string;
  };
};

export type ShopifyPageOperation = {
  data: { pageByHandle: Page };
  variables: { handle: string };
};

export type ShopifyPagesOperation = {
  data: {
    pages: Connection<Page>;
  };
};

export type ShopifyProductOperation = {
  data: { product: ShopifyProduct };
  variables: {
    handle: string;
  };
};

export type ShopifyProductRecommendationsOperation = {
  data: {
    productRecommendations: ShopifyProduct[];
  };
  variables: {
    productId: string;
  };
};

export type ShopifyProductsOperation = {
  data: {
    products: Connection<ShopifyProduct>;
  };
  variables: {
    query?: string;
    reverse?: boolean;
    sortKey?: string;
  };
};
