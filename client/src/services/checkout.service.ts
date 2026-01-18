import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface CheckoutItem {
    product_id: number;
    name: string;
    slug: string;
    image: string;
    qty: number;
    price: number;
    total: number;
    weight_grams: number;
    line_weight_grams: number;
}

export interface ShippingOption {
    id: number;
    courier_name: string;
    service_name: string;
    service_code: string;
    estimation?: string | null;
    shipping_cost: number;
    chargeable_kg?: number;
}

type CheckoutShipment = {
  partner_id: number;
  partner_name?: string | null;
  items: CheckoutItem[];
  subtotal: string | number;
  total_weight_grams: number;
  chargeable_kg: number;
  shipping_options: ShippingOption[];
};

export interface Checkout {
    checkout_id: number;
    type: "buy_now" | "cart";
    shipments: CheckoutShipment[];
    subtotal: string | number;
}

export interface BuyNowPayload {
    product_id: number;
    qty: number;
}

export interface BuyNow {
    checkout_id: number;
}

// Buy Now
export const buyNowCheckout = async (payload: BuyNowPayload): Promise<BuyNow> => {
    const res = await api.post<ApiResponse<BuyNow>>("/checkout/buy-now", payload);
    return res.data.data;
}

// Show
export const getCheckout = async (checkoutId: string): Promise<Checkout> => {
    const res = await api.get<ApiResponse<Checkout>>(`/checkout/${checkoutId}`);
    return res.data.data;
}