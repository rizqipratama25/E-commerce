import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface Partner {
    id: number;
    username: string;
    fullname: string;
    photo_profile: string;
    phone: string;
    email: string;
    address: string;
}

export interface CreatePartnerPayload {
    username: string;
    fullname: string;
    photo_profile: File;
    phone: string;
    role: string;
    email: string;
    password: string;

    address_province_id: number;
    address_city_id: number;
    address_district_id: number;
    address_urban_village_id: number;
    address_detail: string;
}

// Get
export const getPartners = async (): Promise<Partner[]> => {
    const res = await api.get<ApiResponse<Partner[]>>("/partners");
    return res.data.data;
}

// Store
export const createPartner = async (payload: FormData): Promise<Partner> => {
    const res = await api.post<ApiResponse<Partner>>("/partners", payload, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
};

// Destroy
export const deletePartner = async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/partners/${id}`);
    return res.data
}