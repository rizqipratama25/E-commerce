import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export type OrderItem = {
    order_item_id: number;
    qty: number;
    price: string | number;
    line_total: string | number;
    product: {
        id: number;
        name: string;
        slug: string;
        image: string | null;
        supplier: string;
    } | null;
};

export type OrderShipment = {
    shipment_id: number;
    partner_id: number;
    partner_name: string;
    status: string;
    shipping_service: string | null;
    shipping_cost: number;

    items_subtotal: number;
    items_count: number;
    shipment_total?: number;

    items: OrderItem[];
};

export interface Order {
    order_id: number;
    customer: string;
    subtotal: string | number;
    shipping_cost: string | number;
    grand_total: string | number;
    shipping_service: string;
    status: OrderStatus;
    payment_status: string;
    paid_at: string;
    completed_at: string | null;
    shipments: OrderShipment[];
}

export interface OrderFromCheckout {
    order_id: number;
    grand_total: number;
    status: string;
}

export interface CompletedOrder {
    order_id: number;
    status: string;
    completed_at: Date;
    release: string;
}

export type OrderShipmentPayload = {
    partner_id: number;
    shipping_service_id: number;
};

export interface OrderPayload {
    checkout_id: string;
    address_id: number;
    shipments: OrderShipmentPayload[];
}

export type OrderStatus = "pending" | "process" | "delivered" | "shipping" | "completed" | "cancelled";

export type OrderQuery = {
    statuses?: OrderStatus[];
    brand_id?: string[];
    start_date?: string;
    end_date?: string;
    date?: "last_30_days" | "last_90_days" | "choose_date";

    q?: string;
};

export type OrderSummary = {
    order_id: number;
    status: string;
    payment_status: string;
    subtotal: string;
    shipping_cost: string;
    grand_total: string;
};

export type BankCode = "bca" | "bni" | "bri";

// Get
export const getOrders = async (q: OrderQuery): Promise<Order[]> => {
    const params = new URLSearchParams();

    (q.statuses ?? []).forEach((s) => params.append("status[]", s));
    (q.brand_id ?? []).forEach((b) => params.append("brand_id[]", b));

    if (q.date) params.set("date", q.date);
    if (q.start_date) params.set("start_date", q.start_date);
    if (q.end_date) params.set("end_date", q.end_date);

    if (q.q) params.set("q", q.q);

    const res = await api.get<ApiResponse<Order[]>>("/orders", {
        params,
        paramsSerializer: (p) => p.toString(),
    });

    return res.data.data;
};

export const getOrdersPartner = async (): Promise<Order[]> => {
    const res = await api.get<ApiResponse<Order[]>>("/partner/orders");
    return res.data.data;
}

export const getOrdersAdmin = async (): Promise<Order[]> => {
    const res = await api.get<ApiResponse<Order[]>>("/admin/orders");
    return res.data.data;
}

export const createOrderFromCheckout = async (payload: OrderPayload): Promise<OrderFromCheckout> => {
    const res = await api.post<ApiResponse<OrderFromCheckout>>("/orders/from-checkout", payload);
    return res.data.data;
}

// GetOrderSummary
export const getOrderSummary = async (orderId: string | number): Promise<OrderSummary> => {
    const res = await api.get<ApiResponse<OrderSummary>>(`/orders/${orderId}/summary`);
    return res.data.data;
};

export const receiveOrderItemByBuyer = async (orderItemId: number | string) => {
    const res = await api.post<ApiResponse<any>>(`/order-items/${orderItemId}/receive`);
    return res.data.data;
};

export const shipOrderShipmentByPartner = async (shipmentId: number | string) => {
    const res = await api.post<ApiResponse<any>>(`/partner/shipments/${shipmentId}/ship`);
    return res.data.data;
};

export const deliveredShipmentByAdmin = async (shipmentId: number | string) => {
    const res = await api.post<ApiResponse<any>>(`/admin/shipments/${shipmentId}/delivered`);
    return res.data.data;
};

// Midtrans
export const createMidtransSnapToken = async (orderId: number | string) => {
    const res = await api.post<ApiResponse<{ order_id: number; snap_token: string }>>(`/orders/${orderId}/pay`);
    return res.data.data;
};

export const payWithVA = async (orderId: number | string, bank: BankCode) => {
  const res = await api.post<ApiResponse<any>>(`/orders/${orderId}/pay/va`, { bank });
  return res.data.data;
};

export const payWithQRIS = async (orderId: number | string) => {
  const res = await api.post<ApiResponse<any>>(`/orders/${orderId}/pay/qris`);
  return res.data.data;
};

export const getPaymentInfo = async (orderId: number | string) => {
  const res = await api.get<ApiResponse<any>>(`/orders/${orderId}/payment`);
  return res.data.data;
};