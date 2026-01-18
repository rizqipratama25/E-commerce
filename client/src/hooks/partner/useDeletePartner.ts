import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deletePartner } from "../../services/partner.service";

export const useDeletePartner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deletePartner(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['partners']})
        }
    });
}