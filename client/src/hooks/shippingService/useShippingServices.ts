import { useQuery } from "@tanstack/react-query"
import { getShippingServices } from "../../services/shippingService.service"

export const useShippingServices = () => {
    return useQuery({
        queryKey: ['shippingServices'],
        queryFn: getShippingServices,
    })
}