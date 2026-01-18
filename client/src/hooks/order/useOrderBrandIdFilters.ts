import { useMemo } from "react";
import { useSearchParams } from "react-router-dom"

export const useOrderBrandIdFilters = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedBrandId = useMemo(() => {
        const arr = searchParams.getAll("brand_id[]");
        return arr.filter(Boolean) as string[];
    }, [searchParams]);

    const setBrandId = (nextBrandId: string[]) => {
        const next = new URLSearchParams(searchParams);

        next.delete("brand_id[]"); 
        nextBrandId.forEach((b) => next.append("brand_id[]", b));
        setSearchParams(next, { replace: true });
    };

    const toogleBrandId = (brandId: string) => {
        const exists = selectedBrandId.includes(brandId);
        const next = exists ? selectedBrandId.filter((b) => b !== brandId) : [...selectedBrandId, brandId];
        setBrandId(next);
    };

    const clearBrandId = () => setBrandId([]);

    return { selectedBrandId, toogleBrandId, clearBrandId, setBrandId };
};
