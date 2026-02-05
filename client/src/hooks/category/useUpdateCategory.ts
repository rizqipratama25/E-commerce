import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategory, type UpdateCategoryPayload } from "../../services/category.service";

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, data} : {id: number, data: UpdateCategoryPayload}) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['categories']});
            queryClient.invalidateQueries({queryKey: ['admin-categories']});
            queryClient.invalidateQueries({queryKey: ['mega-menu-categories']});
        }
    })
}