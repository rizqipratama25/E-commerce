import { useQuery } from "@tanstack/react-query";
import { getProducts, type ProductQueryParams } from "../../services/product.service";

export const useProducts = (params?: ProductQueryParams) => {
  const key = {
    name: (params?.name ?? "").trim() || undefined,
    min_price: params?.min_price ?? undefined,
    max_price: params?.max_price ?? undefined,
  };

  return useQuery({
    queryKey: ["products", key],
    queryFn: () => getProducts(key),
    enabled: true,
    staleTime: 1000 * 30,
  });
};
