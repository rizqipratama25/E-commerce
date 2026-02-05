import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCategory } from "../../services/category.service";

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteCategory(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['categories']});
            queryClient.invalidateQueries({queryKey: ['admin-categories']});
            queryClient.invalidateQueries({queryKey: ['mega-menu-categories']});
        },
    })
}