import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface ShippingService {
    id: number;
    courier_code: string;
    courier_name: string;
    service_code: string;
    service_name: string;
    estimation: string;
    base_price: number;
    price_per_kg: number;
    is_active: boolean;
}

export interface CreateShippingServicePayload {
    courier_code: string;
    courier_name: string;
    service_code: string;
    service_name: string;
    estimation: string;
    base_price: number;
    price_per_kg: number;
    is_active?: boolean;
}

export interface UpdateShippingServicePayload {
    courier_code?: string;
    courier_name?: string;
    service_code?: string;
    service_name?: string;
    estimation?: string;
    base_price?: number;
    price_per_kg?: number;
    is_active?: boolean;
}

// Get
export const getShippingServices = async (): Promise<ShippingService[]> => {
    const res = await api.get<ApiResponse<ShippingService[]>>("/shipping-services");
    return res.data.data;
};

// Show
export const getShippingService = async (id: number | null): Promise<ShippingService> => {
    const res = await api.get<ApiResponse<ShippingService>>(`/shipping-services/${id}`);
    return res.data.data;
};

// Post
export const createShippingService = async (payload: CreateShippingServicePayload): Promise<ShippingService> => {
    const res = await api.post<ApiResponse<ShippingService>>("/shipping-services", payload);
    return res.data.data;
};

// Update
export const updateShippingService = async (id: number, payload: UpdateShippingServicePayload): Promise<ShippingService> => {
    const res = await api.put<ApiResponse<ShippingService>>(`/shipping-services/${id}`, payload);
    return res.data.data;
};

// Destroy
export const deleteShippingService = async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/shipping-services/${id}`);
    return res.data;
};