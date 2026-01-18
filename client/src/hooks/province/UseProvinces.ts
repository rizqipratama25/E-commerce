import { useQuery } from "@tanstack/react-query"
import { getProvinces, type Province } from "../../services/province.service"

export const useProvinces = () => {
    return useQuery<Province[]>({
        queryKey: ['provinces'],
        queryFn: getProvinces,
    });
}