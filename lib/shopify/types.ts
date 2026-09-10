export interface ShopifyImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface MoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: MoneyV2;
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  priceRange: {
    minVariantPrice: MoneyV2;
    maxVariantPrice: MoneyV2;
  };
  variants: {
    edges: Array<{
      node: ProductVariant;
    }>;
  };
  tags: string[];
}

export interface ShopifyProductsOperation {
  data: {
    products: {
      edges: Array<{
        node: Product;
      }>;
    };
  };
  variables?: {
    first?: number;
  };
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  switchType?: string;
  caseColor?: string;
  price: number;
  currencyCode: string;
  image: string;
  quantity: number;
}
