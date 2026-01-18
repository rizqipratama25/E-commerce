import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProvince } from "../../services/province.service";

export function useUpdateProvince() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({id, data} : {id: number, data: any}) => updateProvince(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['provinces']});
        },
    })

}