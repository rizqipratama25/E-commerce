import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProductWithImages, type CreateProductPayload, type DataDetail } from "../../services/product.service";

interface UpdateArgs {
    slug: string;
    product: CreateProductPayload;
    images: File[];
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation<DataDetail, unknown, UpdateArgs>({
        mutationFn: ({ slug, product, images }) => updateProductWithImages(slug, product, images),
        onSuccess: (data) => {
            queryClient.invalidateQueries({queryKey: ['products', 'partner']});
            queryClient.invalidateQueries({queryKey: ['product-detail', data.slug]});
        },
    });
}