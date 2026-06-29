export type CartItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
};

export type CartState = {
  items: CartItem[];
};

export type AddCartItemInput = {
  productId: string;
  title: string;
  price: number;
  image?: string;
  quantity?: number;
};
