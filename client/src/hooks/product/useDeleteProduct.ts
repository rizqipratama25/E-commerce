import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../../services/product.service";

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (slug: string) => deleteProduct(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["products", "partner"]});
            queryClient.invalidateQueries({queryKey: ['products']});
        },
    });
};