import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCartItem } from "../../services/cart.service";

export const useDeleteCartItem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (cartItemId: number) => deleteCartItem(cartItemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["cart-mini"] });
    },
  });
};