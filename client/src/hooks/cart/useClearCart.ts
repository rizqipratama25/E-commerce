import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clearCart } from "../../services/cart.service";

export const useClearCart = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: clearCart,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["cart-mini"] });
    },
  });
};