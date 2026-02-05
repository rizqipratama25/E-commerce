import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCategory, type CreateCategoryPayload } from "../../services/category.service";

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['categories']});
            queryClient.invalidateQueries({queryKey: ['admin-categories']});
            queryClient.invalidateQueries({queryKey: ['mega-menu-categories']});
        },
    })
}