import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProvince, type CreateUpdateProvincePayload } from "../../services/province.service"

export const useCreateProvince = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateUpdateProvincePayload) => createProvince(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['provinces']});
        },
    })
}