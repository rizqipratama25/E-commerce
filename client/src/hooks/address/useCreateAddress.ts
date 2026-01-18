import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAddress, type CreateAddressPayload } from "../../services/address.service";

export const useCreateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateAddressPayload) => createAddress(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['addresses']});
        }
    })
}