import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface Summary {
    total_partner: number;
    product_active: number;
    order: number;
    wallet: number;
}

// Get
export const getSummaryAdmin = async (): Promise<Summary> => {
    const res = await api.get<ApiResponse<Summary>>("/admin/summary");
    return res.data.data;
};