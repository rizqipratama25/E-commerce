import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDistrict, type CreateDistrictPayload } from "../../services/district.service";

export const useCreateDistrict = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateDistrictPayload) => createDistrict(data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['districts']});
        },
    })
}