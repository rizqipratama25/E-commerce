import { useMutation } from "@tanstack/react-query"
import { createOrderFromCheckout } from "../../services/order.service"

export const useCreateOrderFromCheckout = () => {
    return useMutation({
        mutationFn: createOrderFromCheckout
    });
}