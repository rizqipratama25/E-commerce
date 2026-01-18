import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateDistrict, type UpdateDistrictPayload } from "../../services/district.service";

export const useUpdateDistrict = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: UpdateDistrictPayload}) => updateDistrict(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['districts']});
        },
    })
}