import { useMutation } from "@tanstack/react-query";
import { createMidtransSnapToken } from "../../services/order.service";

export const useMidtransSnapToken = () => {
    return useMutation({
        mutationFn: (orderId: number | string) => createMidtransSnapToken(orderId),
    });
};