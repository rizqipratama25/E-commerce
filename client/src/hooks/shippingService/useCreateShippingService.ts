import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createShippingService, type CreateShippingServicePayload } from "../../services/shippingService.service";

export const useCreateShippingService = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateShippingServicePayload) => createShippingService(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shippingServices']});
        },
    })
}