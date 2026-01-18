import api from "../lib/axios";
import type { ApiResponse } from "./apiResponse.type";

export interface Category {
  id: number;
  name: string;
  slug: string;
  path: string;
  parent_id: number | null;
  level: number;
  sort_order: number;
  is_active: boolean;
  show_in_menu: boolean;
  children?: Category[];
}

export type CategoryResolve = {
  category: Category;
  children: Category[];
  breadcrumb: Array<{
    id: number;
    name: string;
    slug: string;
    path: string;
    level: number;
  }>;
};

export interface CreateCategoryPayload {
  name: string;
  parent_id?: number | null;
  is_active?: boolean;
  show_in_menu?: boolean;
}

export interface UpdateCategoryPayload {
  name?: string;
  parent_id?: number | null;
  is_active?: boolean;
  show_in_menu?: boolean;
}

// Get
export const getMegaMenuCategories = async (): Promise<Category[]> => {
  const res = await api.get<ApiResponse<Category[]>>("/categories");
  return res.data.data;
};

// Get Admin
export const getAdminCategories = async (): Promise<Category[]> => {
  const res = await api.get<ApiResponse<Category[]>>("/admin/categories");
  return res.data.data;
};

// Resolve Category
export const resolveCategory = async (path: string): Promise<CategoryResolve> => {
  const res = await api.get<ApiResponse<CategoryResolve>>(`/categories/resolve/${path}`);
  return res.data.data;
};

// Post
export const createCategory = async (payload: CreateCategoryPayload): Promise<Category> => {
  const res = await api.post<ApiResponse<Category>>("/categories", payload);
  return res.data.data;
}

// Update
export const updateCategory = async (id: number, payload: UpdateCategoryPayload): Promise<Category> => {
  const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  return res.data.data;
}

// Destroy
export const deleteCategory = async (id: number) => {
  const res = await api.delete<ApiResponse<null>>(`/categories/${id}`);
  return res.data;
}