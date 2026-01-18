import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface UrbanVillage {
    id: number;
    name: string;
    post_code: string;
    province_id: number;
    city_id: number;
    district_id: number;
    province: string;
    city: string;
    district: string;
}

export interface CreateUrbanVillagePayload {
    name: string;
    post_code: string;
    province_id: number;
    city_id: number;
    district_id: number;
}

export interface UpdateUrbanVillagePayload {
    name?: string;
    post_code?: string;
    province_id?: number;
    city_id?: number;
    district_id?: number;
}

// Get
export const getUrbanVillages = async (district_id?: number): Promise<UrbanVillage[]> => {
  const res = await api.get<ApiResponse<UrbanVillage[]>>("/urban-villages", {
    params: district_id ? { district_id } : undefined,
  });
  return res.data.data;
};


// Post
export const createUrbanVillage = async (payload: CreateUrbanVillagePayload): Promise<UrbanVillage> => {
    const res = await api.post<ApiResponse<UrbanVillage>>("/urban-villages", payload);
    return res.data.data;
}

// Update
export const updateUrbanVillage = async (id: number, payload: UpdateUrbanVillagePayload): Promise<UrbanVillage> => {
    const res = await api.put<ApiResponse<UrbanVillage>>(`/urban-villages/${id}`, payload);
    return res.data.data;
}

// Destroy
export const deleteUrbanVillage = async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/urban-villages/${id}`);
    return res.data;
}