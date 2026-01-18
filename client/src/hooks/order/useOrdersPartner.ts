import { useQuery } from "@tanstack/react-query"
import { getOrdersPartner } from "../../services/order.service"

export const useOrdersPartner = () => {
    return useQuery({
        queryKey: ['orders', 'partner'],
        queryFn: getOrdersPartner
    });
}