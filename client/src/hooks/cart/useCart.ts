import { useQuery } from "@tanstack/react-query";
import { getCart, type Cart } from "../../services/cart.service";
import { getUser } from "../../utils/authStorage";

export const useCart = () => {
  const user = getUser();

  return useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: getCart,
    enabled: !!user,
    retry: false,
    staleTime: 30 * 1000,
  });
};