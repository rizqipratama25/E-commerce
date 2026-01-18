import { useQuery } from "@tanstack/react-query";
import { getShippingService } from "../../services/shippingService.service";

export const useShippingServiceDetail = (id: number | null, enabled: boolean) => {
    return useQuery({
        queryKey: ['shipping-service-detail', id],
        enabled: enabled && !!id,
        queryFn: () => getShippingService(id),
        staleTime: 1000 * 60,
    })
}