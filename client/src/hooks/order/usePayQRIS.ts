import { useMutation } from "@tanstack/react-query";
import { payWithQRIS } from "../../services/order.service";

export const usePayQRIS = () => {
    return useMutation({
        mutationFn: (orderId: any) => payWithQRIS(orderId)
    });
}