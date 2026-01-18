import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUrbanVillage } from "../../services/urbanVillage.service";

export const useDeleteUrbanVillage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteUrbanVillage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['urbanVillages']});
        },
    });
}