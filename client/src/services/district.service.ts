import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export type District = {
    id: number;
    name: string;
    city_id: number;
    province_id: number;
    city: string;
    province: string;
}

export type CreateDistrictPayload = {
    name: string;
    city_id: number;
    province_id: number;
}

export type UpdateDistrictPayload = {
    name?: string;
    city_id?: number;
    province_id?: number;
}

// Get
export const getDistricts = async (city_id?: number): Promise<District[]> => {
  const res = await api.get<ApiResponse<District[]>>("/districts", {
    params: city_id ? { city_id } : undefined,
  });
  return res.data.data;
};

// Post
export const createDistrict = async (payload: CreateDistrictPayload): Promise<District> => {
    const res = await api.post<ApiResponse<District>>("/districts", payload);
    return res.data.data;
};

// Update
export const updateDistrict = async (id: number, payload: UpdateDistrictPayload): Promise<District> => {
    const res = await api.put<ApiResponse<District>>(`/districts/${id}`, payload);
    return res.data.data;
};

// Destroy
export const deleteDistrict = async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/districts/${id}`);
    return res.data;
};