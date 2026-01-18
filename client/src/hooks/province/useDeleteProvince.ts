import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProvince } from "../../services/province.service";

export function useDeleteProvince() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => deleteProvince(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['provinces']});
        },
    })
}