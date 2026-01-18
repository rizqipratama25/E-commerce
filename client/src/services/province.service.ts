import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface Province {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface CreateUpdateProvincePayload {
    name: string;
}

// Get
export const getProvinces = async (): Promise<Province[]> => {
    const res = await api.get<ApiResponse<Province[]>>("/provinces");
    return res.data.data;
};

// Post
export const createProvince = async (payload: CreateUpdateProvincePayload): Promise<Province> => {
    const res = await api.post<ApiResponse<Province>>("/provinces", payload);
    return res.data.data;
};

// Update
export const updateProvince = async (id: number, payload: CreateUpdateProvincePayload): Promise<Province> => {
    const res = await api.put<ApiResponse<Province>>(`/provinces/${id}`, payload);
    return res.data.data;
};

// Destroy
export const deleteProvince = async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/provinces/${id}`);
    return res.data;
};