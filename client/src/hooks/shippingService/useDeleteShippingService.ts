import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteShippingService } from "../../services/shippingService.service";

export const useDeleteShippingService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: number) => deleteShippingService(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shippingServices']});
        },
    })
}