import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export type ProductListItem = {
  id: number;
  name: string;
  slug: string;
  price: string;
  stock: number;
  category_id: number;
  is_active: boolean;
  created_at: string;

  images?: Array<{ id: number; image: string }>;

  thumbnail?: { id: number; image: string } | null;

  category?: { id: number; name: string; path: string };
};

export type Paginated<T> = {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
};

export type CategoryProductsResponse = {
  category: { id: number; name: string; path: string };
  filters?: { min_price?: number; max_price?: number; sort?: string; per_page?: number };
  products: Paginated<ProductListItem>;
};

export type CategoryProductsParams = {
  page?: number;
  per_page?: number;
  sort?: "newest" | "price_asc" | "price_desc";
  min_price?: number;
  max_price?: number;
};

export const getCategoryProducts = async (
  path: string,
  params: CategoryProductsParams
): Promise<CategoryProductsResponse> => {
  const res = await api.get<ApiResponse<CategoryProductsResponse>>(`/c/products/${path}`, { params });
  return res.data.data;
};
