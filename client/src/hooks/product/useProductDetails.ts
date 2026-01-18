import { useQuery } from "@tanstack/react-query"
import { getProductDetail } from "../../services/product.service"

export const useProductDetail = (slug: string, enabled: boolean) => {
    return useQuery({
        queryKey: ['product-detail', slug],
        enabled: enabled && !!slug,
        queryFn: () => getProductDetail(slug),
        staleTime: 10000 * 60,
    });
}