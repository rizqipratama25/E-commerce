import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export type CartProduct = {
  id: number;
  name: string;
  slug: string;
  stock: number;
  is_active: boolean;
  thumbnail: { id: number; image: string } | null;
};

export type CartItem = {
  id: number; // cart_item_id
  qty: number;
  price: string; // "20000.00"
  note: string;
  line_total: string; // "40000.00"
  product: CartProduct | null;
};

export type Cart = {
  id: number;
  status: "active" | "checked_out";
  items: CartItem[];
  subtotal: string; // "123000.00"
};

export type MiniCart = {
  cart_id: number;
  total_qty: number;
  items: Array<{
    id: number;
    qty: number;
    price: string;
    line_total: string;
    product: {
      id: number;
      name: string;
      slug: string;
      thumbnail: { id: number; image: string } | null;
    } | null;
  }>;
  subtotal: string;
};

export type AddToCartPayload = {
  product_id: number;
  qty: number;
};

export type UpdateCartItemPayload = {
  qty?: number;
  note?: string;
};

/** GET /cart */
export const getCart = async (): Promise<Cart> => {
  const res = await api.get<ApiResponse<Cart>>("/cart");
  return res.data.data;
};

/** GET /cart/mini?limit=3 */
export const getMiniCart = async (limit = 3): Promise<MiniCart> => {
  const res = await api.get<ApiResponse<MiniCart>>("/cart/mini", {
    params: { limit },
  });
  return res.data.data;
};

/** POST /cart */
export const addToCart = async (payload: AddToCartPayload): Promise<Cart> => {
  const res = await api.post<ApiResponse<Cart>>("/cart/items", payload);
  return res.data.data;
};

/** PUT /cart-items/{cartItemId} */
export const updateCartItem = async (
  cartItemId: number,
  payload: UpdateCartItemPayload
): Promise<Cart> => {
  const res = await api.put<ApiResponse<Cart>>(`/cart/items/${cartItemId}`, payload);
  return res.data.data;
};

/** DELETE /cart-items/{cartItemId} */
export const deleteCartItem = async (cartItemId: number): Promise<Cart> => {
  const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${cartItemId}`);
  return res.data.data;
};

/** DELETE /cart/clear */
export const clearCart = async (): Promise<Cart> => {
  const res = await api.delete<ApiResponse<Cart>>("/cart/clear");
  return res.data.data;
};

/** POST /checkout/from-cart  body: { item_ids: number[] } */
export const checkoutFromCart = async (itemIds: number[]): Promise<{ checkout_id: string }> => {
  const res = await api.post<ApiResponse<{ checkout_id: string }>>("/checkout/from-cart", {
    item_ids: itemIds,
  });
  return res.data.data;
};