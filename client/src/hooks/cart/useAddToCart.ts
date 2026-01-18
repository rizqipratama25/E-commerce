import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addToCart, type AddToCartPayload } from "../../services/cart.service";

export const useAddToCart = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) => addToCart(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] });
      qc.invalidateQueries({ queryKey: ["cart-mini"] });
    },
  });
};