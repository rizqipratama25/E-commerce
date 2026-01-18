import { useQuery } from "@tanstack/react-query"
import { getPartners, type Partner } from "../../services/partner.service"

export const usePartners = ()  => {
    return useQuery<Partner[]>({
        queryKey: ['partners'],
        queryFn: getPartners
    })
}