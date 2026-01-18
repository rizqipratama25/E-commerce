import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateShippingService, type UpdateShippingServicePayload } from "../../services/shippingService.service";

export const useUpdateShippingService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: UpdateShippingServicePayload}) => updateShippingService(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['shippingServices']});
        },
    })
}