import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartItem, type UpdateCartItemPayload } from "../../services/cart.service";

export const useUpdateCartItem = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ cartItemId, payload }: { cartItemId: number; payload: UpdateCartItemPayload }) =>
      updateCartItem(cartItemId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["cart-mini"] });
    },
  });
};