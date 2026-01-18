import { useMutation } from "@tanstack/react-query";
import { checkoutFromCart } from "../../services/cart.service";

export const useCheckoutFromCart = () => {
  return useMutation({
    mutationFn: (itemIds: number[]) => checkoutFromCart(itemIds),
  });
};