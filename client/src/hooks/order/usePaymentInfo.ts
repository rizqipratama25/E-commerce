import { useQuery } from "@tanstack/react-query";
import { getPaymentInfo } from "../../services/order.service";

export const usePaymentInfo = (orderId: string) => {
    return useQuery({
        queryKey: ["payment-info", orderId],
        queryFn: () => getPaymentInfo(orderId),
        enabled: !!orderId,
        refetchInterval: 5000
    });
}