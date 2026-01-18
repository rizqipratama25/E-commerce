import { useQuery } from "@tanstack/react-query"
import { getProductsPartner } from "../../services/product.service"

export const useProductsPartner = () => {
    return useQuery({
        queryKey: ['products', 'partner'],
        queryFn: getProductsPartner
    })
}