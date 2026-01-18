import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProductWithImages, type CreateProductWithImagesPayload } from "../../services/product.service";

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateProductWithImagesPayload) => createProductWithImages(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['products', "partner"]});
        }
    })
}