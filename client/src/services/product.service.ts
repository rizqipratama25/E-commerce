import api from "../lib/axios";
import { addProductImage, UploadProductImages } from "./productImage.service";

interface DataThumbnail {
  id: number;
  image: string;
}

export interface Data {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  is_active: boolean;
  category: {
    id: number;
    name: string;
    path: string;
  }
  thumbnail: DataThumbnail;
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  path: string;
  level: string;
}

interface PartnerData {
  id: number;
  fullname: string;
  photo_profile: string;
}

export interface DataDetail {
  id: number;
  name: string;
  slug: string;
  price: number;
  stock: number;
  product_specification: string;
  product_information: string;
  is_active: boolean;
  category: CategoryData;
  category_breadcrumb: CategoryData[];
  partner: PartnerData;
  images: DataThumbnail[];
  height: number;
  width: number;
  length: number;
  weight: number;
}

interface Product {
  success: boolean;
  message: string;
  data: Data[];
}

interface ProductDetail {
  success: boolean;
  message: string;
  data: DataDetail;
}

export interface CreateProductPayload {
  name: string;
  price: number;
  stock: number;
  product_specification: string;
  product_information: string;
  category_id: number;
  height: number;
  width: number;
  length: number;
  weight: number;
  is_active?: boolean;
}

export interface CreateProductWithImagesPayload {
  product: CreateProductPayload;
  images: File[];
}

export type ProductQueryParams = {
  name?: string;
  min_price?: number;
  max_price?: number;
};

// Get
export const getProducts = async (params?: ProductQueryParams): Promise<Product> => {
  const cleanParams: Record<string, any> = {};

  if (params?.name) cleanParams.name = params.name;
  if (typeof params?.min_price === "number") cleanParams.min_price = params.min_price;
  if (typeof params?.max_price === "number") cleanParams.max_price = params.max_price;

  const res = await api.get<Product>("/products", { params: cleanParams });
  return res.data;
};

// Get Product Partner
export const getProductsPartner = async (): Promise<Product> => {
  const res = await api.get<Product>("/partner/products");
  return res.data;
};

// Show
export const getProductDetail = async (slug: string): Promise<ProductDetail> => {
  const res = await api.get<ProductDetail>(`/products/${slug}`);
  return res.data;
};

// Post
export const createProduct = async (payload: CreateProductPayload): Promise<DataDetail> => {
  const res = await api.post<ProductDetail>("/products", payload);
  return res.data.data;
};

export const createProductWithImages = async (payload: CreateProductWithImagesPayload): Promise<DataDetail> => {
  const created = await createProduct(payload.product);

  try {
    await UploadProductImages({
      productId: created.id,
      images: payload.images,
    });
  } catch (e: any) {
    const err = new Error(e?.message ?? "Sebagian gambar gagal diupload");
    (err as any).created = created;
    (err as any).failed = e?.failed;
    throw err;
  }

  return created;
};

// Update
export const updateProduct = async (slug: string, payload: CreateProductPayload): Promise<DataDetail> => {
  const res = await api.put<ProductDetail>(`/products/${slug}`, payload);
  return res.data.data;
}

export const updateProductWithImages = async (slug: string, payload: CreateProductPayload, images: File[]): Promise<DataDetail> => {
  const updated = await updateProduct(slug, payload);
  await addProductImage(updated.id, images);
  return updated;
}

// Destroy
export const deleteProduct = async (slug: string) => {
  const res = await api.delete(`/products/${slug}`);
  return res.data;
}
