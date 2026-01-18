import { useQuery } from "@tanstack/react-query"
import { getOrdersAdmin } from "../../services/order.service"

export const useOrdersAdmin = () => {
    return useQuery({
        queryKey: ['orders', 'admin'],
        queryFn: getOrdersAdmin
    });
}