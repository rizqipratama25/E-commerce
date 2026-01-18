import { useQuery } from "@tanstack/react-query"
import { getSummaryAdmin } from "../../../services/dashboardAdmin.service"

export const useSummaryAdmin = () => {
    return useQuery({
        queryKey: ['summary-admin'],
        queryFn: getSummaryAdmin
    });
}