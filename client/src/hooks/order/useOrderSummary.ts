import { useQuery } from "@tanstack/react-query";
import { getOrderSummary } from "../../services/order.service";

export const useOrderSummary = (orderId: string, enabled = true) => {
    return useQuery({
        queryKey: ["order-summary", orderId],
        queryFn: () => getOrderSummary(orderId),
        enabled: !!orderId && enabled,
        staleTime: 10 * 1000,
    });
};