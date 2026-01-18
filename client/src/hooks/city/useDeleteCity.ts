import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCity } from "../../services/city.service";

export const useDeleteCity = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: async (id: number) => deleteCity(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['cities']});
        },
    })
}