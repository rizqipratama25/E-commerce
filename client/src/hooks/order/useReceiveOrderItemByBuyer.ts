import { useMutation, useQueryClient } from "@tanstack/react-query";
import { receiveOrderItemByBuyer } from "../../services/order.service";

export const useReceiveOrderItemByBuyer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: receiveOrderItemByBuyer,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["orders"] });
        },
    });
};