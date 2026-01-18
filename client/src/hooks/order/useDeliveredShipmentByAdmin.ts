import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deliveredShipmentByAdmin } from "../../services/order.service";

export const useDeliveredShipmentByAdmin = () => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (shipmentId: number | string) => deliveredShipmentByAdmin(shipmentId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["orders", "admin"] });
        },
    });
};