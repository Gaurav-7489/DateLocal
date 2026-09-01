export const SHOP_PRODUCTS = {
  extra_likes_5: { label: "+5 Likes", description: "Five extra likes added to your wallet.", amountPaise: 1900, quantity: 5, kind: "likes" },
  extra_likes_15: { label: "+15 Likes", description: "Fifteen extra likes added to your wallet.", amountPaise: 4900, quantity: 15, kind: "likes" },
  extra_likes_30: { label: "+30 Likes", description: "Thirty extra likes added to your wallet.", amountPaise: 7900, quantity: 30, kind: "likes" },
  superlike_1: { label: "1 Super Like", description: "Stand out with one higher-intent like.", amountPaise: 1900, quantity: 1, kind: "superlike" },
  superlike_5: { label: "5 Super Likes", description: "Five Super Likes for your next discoveries.", amountPaise: 5900, quantity: 5, kind: "superlike" },
  superchat_credit_1: { label: "1 SuperChat", description: "One direct message credit for a Discover profile.", amountPaise: 2900, quantity: 1, kind: "superchat" },
  superchat_credit_3: { label: "3 SuperChats", description: "Three direct message credits for Discover.", amountPaise: 6900, quantity: 3, kind: "superchat" },
  superchat: { label: "SuperChat", description: "Send one direct message to a Discover profile before matching.", amountPaise: 2900, quantity: 0, kind: "direct_superchat" },
} as const;

export type ShopProduct = keyof typeof SHOP_PRODUCTS;

export function getShopProduct(product: string) {
  return SHOP_PRODUCTS[product as ShopProduct] ?? null;
}
