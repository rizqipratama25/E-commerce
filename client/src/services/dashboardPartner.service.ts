import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface Summary {
    order_today: number;
    order: number;
    product_active: number;
    wallet: number;
}

// Get
export const getSummaryPartner = async (): Promise<Summary> => {
    const res = await api.get<ApiResponse<Summary>>("/partner/summary");
    return res.data.data;
};