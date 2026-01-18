import { useQuery } from "@tanstack/react-query"
import { getCheckout } from "../../services/checkout.service"

export const useCheckout = (checkoutId: string) => {
    return useQuery({
        queryKey: ["checkout", checkoutId],
        queryFn: () => getCheckout(checkoutId),
        enabled: !!checkoutId
    })
}