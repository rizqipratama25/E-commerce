import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface City {
  id: number;
  name: string;
  province_id: number;
  province: string;
}

export interface CreateCityPayload {
  name: string;
  province_id: number;
}

export interface UpdateCityPayload {
  name?: string;
  province_id?: number;
}

// Get
export const getCities = async (province_id?: number): Promise<City[]> => {
  const res = await api.get<ApiResponse<City[]>>("/cities", {
    params: province_id ? { province_id } : undefined,
  });
  return res.data.data;
};


// Post
export const createCity = async (payload: CreateCityPayload): Promise<City> => {
  const res = await api.post<ApiResponse<City>>("/cities", payload);
  return res.data.data;
};

// Update
export const updateCity = async (id: number, payload: UpdateCityPayload): Promise<City> => {
  const res = await api.put<ApiResponse<City>>(`/cities/${id}`, payload);
  return res.data.data;
};

// Destroy
export const deleteCity = async (id: number) => {
  const res = await api.delete<ApiResponse<null>>(`/cities/${id}`);
  return res.data;
};