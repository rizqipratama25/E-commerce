import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUrbanVillage, type UpdateUrbanVillagePayload } from "../../services/urbanVillage.service";

export const useUpdateUrbanVillage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, data}: {id: number, data: UpdateUrbanVillagePayload}) => updateUrbanVillage(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['urbanVillages']});
        },
    });
}