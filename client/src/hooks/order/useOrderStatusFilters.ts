import { useMemo } from "react";
import { useSearchParams } from "react-router-dom"
import type { OrderStatus } from "../../services/order.service";

export const useOrderStatusFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedStatuses = useMemo(() => {
        const arr = searchParams.getAll("status[]");
        return arr.filter(Boolean) as OrderStatus[];
    }, [searchParams]);

    const setStatuses = (nextStatuses: OrderStatus[]) => {
        const next = new URLSearchParams(searchParams);

        next.delete("status[]");

        nextStatuses.forEach((s) => next.append("status[]", s));
        setSearchParams(next, { replace: true });
    }

    const toggleStatus = (status: OrderStatus) => {
        const exists = selectedStatuses.includes(status);
        const next = exists ? selectedStatuses.filter((s) => s !== status) : [...selectedStatuses, status];

        setStatuses(next);
    }

    const clearStatuses = () => setStatuses([]);

    return { selectedStatuses, toggleStatus, clearStatuses, setStatuses };
}