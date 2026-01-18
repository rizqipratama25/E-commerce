import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createPartner } from "../../services/partner.service";

export const useCreatePartner = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: FormData) => createPartner(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['partners']});
        }
    });
}