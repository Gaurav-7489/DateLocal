export const SHOP_PRODUCTS = {
  extra_likes_5: { label: "+5 Likes", description: "Five extra likes after your normal allowance.", amountPaise: 1900, quantity: 5 },
  extra_likes_15: { label: "+15 Likes", description: "Fifteen extra likes for your next discovery session.", amountPaise: 4900, quantity: 15 },
  extra_likes_30: { label: "+30 Likes", description: "Thirty extra likes for serious discovery.", amountPaise: 7900, quantity: 30 },
  superchat: { label: "SuperChat", description: "Send one direct message to a Discover profile before matching.", amountPaise: 2900, quantity: 0 },
} as const;

export type ShopProduct = keyof typeof SHOP_PRODUCTS;

export function getShopProduct(product: string) {
  return SHOP_PRODUCTS[product as ShopProduct] ?? null;
}
