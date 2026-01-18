import { useQuery } from "@tanstack/react-query"
import { getOrders, type Order, type OrderQuery } from "../../services/order.service"

export const useOrders = (params: OrderQuery) => {
    const key = [
        "orders",
        (params.statuses ?? []).join(","),
        (params.brand_id ?? []).join(","),
        params.date ?? "",
        params.start_date ?? "",
        params.end_date ?? ""
    ];

    return useQuery<Order[]>({
        queryKey: key,
        queryFn: () => getOrders(params),
        staleTime: 0,
        refetchOnWindowFocus: false,
        placeholderData: (prev) => prev
    });
}