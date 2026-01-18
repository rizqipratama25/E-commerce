import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface Address {
    id: number;
    user: string;
    user_id: number;
    label: string;
    receiver: string;
    phone: string;
    province_id: number;
    city_id: number;
    district_id: number;
    urban_village_id: number;
    province: string;
    city: string;
    district: string;
    urban_village: string;
    post_code: string;
    detail: string;
}

export interface CreateAddressPayload {
    label: string;
    receiver: string;
    phone: string;
    province_id: number;
    city_id: number;
    district_id: number;
    urban_village_id: number;
    detail: string;
}

export interface UpdateAddressPayload {
    label?: string;
    receiver?: string;
    phone?: string;
    province_id?: number;
    city_id?: number;
    district_id?: number;
    urban_village_id?: number;
    detail?: string;
}

// Get
export const getAddresses = async (): Promise<Address[]> => {
    const res = await api.get<ApiResponse<Address[]>>(`/addresses`);
    return res.data.data;
};

// Post
export const createAddress = async (payload: CreateAddressPayload): Promise<Address> => {
    const res = await api.post<ApiResponse<Address>>("/addresses", payload);
    return res.data.data;
}

// Update
export const updateAddress = async (id: number, payload: UpdateAddressPayload): Promise<Address> => {
    const res = await api.put<ApiResponse<Address>>(`/addresses/${id}`, payload);
    return res.data.data;
}

// Destroy
export const deleteAddress = async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/addresses/${id}`);
    return res.data;
}