import { useMutation } from "@tanstack/react-query";
import { payWithVA } from "../../services/order.service";

export const usePayVA = () => {
    return useMutation(
        {
            mutationFn: ({ orderId, bank }: { orderId: any, bank: any }) => payWithVA(orderId, bank)
        }
    );
}