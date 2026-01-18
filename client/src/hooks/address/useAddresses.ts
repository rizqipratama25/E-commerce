import { useQuery } from "@tanstack/react-query"
import { getAddresses, type Address } from "../../services/address.service"

export const useAddresses = () => {
    return useQuery<Address[]>({
        queryKey: ['addresses'],
        queryFn: getAddresses,
    })
}