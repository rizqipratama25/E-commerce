import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCity, type UpdateCityPayload } from "../../services/city.service";

export const useUpdateCity = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({id, data} : {id: number, data: UpdateCityPayload}) => updateCity(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['cities']});
        },
    })
}