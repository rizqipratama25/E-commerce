import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";
import type { Address } from "./address.service";

export type PartnerAddressPayload = {
  province_id: number;
  city_id: number;
  district_id: number;
  urban_village_id: number;
  detail: string;
};

export const getPartnerAddress = async (): Promise<Address | null> => {
  const res = await api.get<ApiResponse<Address | null>>("/partner/address");
  return res.data.data;
};

export const updatePartnerAddress = async (payload: PartnerAddressPayload): Promise<Address> => {
  const res = await api.put<ApiResponse<Address>>("/partner/address", payload);
  return res.data.data;
};
