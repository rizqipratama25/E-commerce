import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAddress, type UpdateAddressPayload } from "../../services/address.service";

export const useUpdateAddress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, data} : {id: number, data: UpdateAddressPayload}) => updateAddress(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['addresses']});
        }
    })
}