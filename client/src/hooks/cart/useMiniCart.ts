import { useQuery } from "@tanstack/react-query";
import { getMiniCart, type MiniCart } from "../../services/cart.service";

export const useMiniCart = (limit = 3, enabled = true) => {
  return useQuery<MiniCart>({
    queryKey: ["cart-mini", limit],
    queryFn: () => getMiniCart(limit),
    enabled,
    retry: false,
    staleTime: 10 * 1000,
  });
};