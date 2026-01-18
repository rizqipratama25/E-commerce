import { useQuery } from "@tanstack/react-query"
import { getSummaryPartner } from "../../../services/dashboardPartner.service";

export const useSummaryPartner = () => {
    return useQuery({
        queryKey: ['summary-partner'],
        queryFn: getSummaryPartner
    });
}