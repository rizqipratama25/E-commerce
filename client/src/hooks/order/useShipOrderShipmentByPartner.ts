import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shipOrderShipmentByPartner } from "../../services/order.service";

export const useShipOrderShipmentByPartner = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (shipmentId: number | string) => shipOrderShipmentByPartner(shipmentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders", "partner"] });
    },
  });
};