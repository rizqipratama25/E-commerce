import { useMutation } from "@tanstack/react-query";
import { buyNowCheckout, type BuyNowPayload } from "../../services/checkout.service";
export const useBuyNowChekout = () => {
    return useMutation({
        mutationFn: async (payload: BuyNowPayload) => buyNowCheckout(payload),
    })
}