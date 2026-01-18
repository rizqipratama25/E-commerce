import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCity, type CreateCityPayload } from "../../services/city.service";

export const useCreateCity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: CreateCityPayload) => createCity(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['cities']});
        },
    })
}