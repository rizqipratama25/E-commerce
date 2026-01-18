import { useQuery } from "@tanstack/react-query";
import { getCategoryProducts, type CategoryProductsParams } from "../../services/categoryProduct.service";

export const useCategoryProducts = (path: string, params: CategoryProductsParams) => {
  return useQuery({
    queryKey: ["category-products", path, params],
    queryFn: () => getCategoryProducts(path, params),
    enabled: !!path,
    staleTime: 30 * 1000,
  });
};
