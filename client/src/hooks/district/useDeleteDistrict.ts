import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteDistrict } from "../../services/district.service";

export const useDeleteDistrict = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteDistrict(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['districts']});
        },
    })
}