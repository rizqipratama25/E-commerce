import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUrbanVillage, type CreateUrbanVillagePayload } from "../../services/urbanVillage.service";

export const useCreateUrbanVillage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: CreateUrbanVillagePayload) => createUrbanVillage(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['urban-villages']});
        },
    });
}